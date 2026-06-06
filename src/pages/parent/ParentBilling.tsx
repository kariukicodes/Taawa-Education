import { useEffect, useState } from "react";
import { CreditCard } from "lucide-react";

import { ParentLayout } from "@/components/layouts/ParentLayout";
import { formatKES, formatDate } from "@/lib/format";
import { TableSkeleton } from "@/components/ui/TableSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { DEMO_DATA } from "@/lib/demoData";
import { invokeSupabaseFunction } from "@/lib/invokeSupabaseFunction";
import { reportClientError } from "@/lib/reportClientError";
import { toast } from "@/hooks/use-toast";

type PaymentRecord = {
  id: string;
  description: string | null;
  amount_kes: number;
  date: string;
  status: string;
  students: { full_name: string };
};

type ParentWorkspaceResponse = {
  payments: PaymentRecord[];
};

export default function ParentBilling() {
  const { user, roleOverride, loading: authLoading } = useAuth();
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [outstanding, setOutstanding] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const isDemo =
    import.meta.env.DEV &&
    import.meta.env.VITE_ENABLE_DEMO_MODE === "true" &&
    roleOverride === "parent";

  useEffect(() => {
    if (authLoading) return;
    if (!isDemo && !user) return;

    const fetchBilling = async () => {
      setLoading(true);
      setLoadError(null);

      try {
        const data = isDemo
          ? { payments: DEMO_DATA.parent.billing.payments as PaymentRecord[] }
          : await invokeSupabaseFunction<ParentWorkspaceResponse>(
              "get-parent-workspace",
              undefined,
            );

        const nextPayments = data.payments ?? [];
        setPayments(nextPayments);
        setOutstanding(
          nextPayments
            .filter((payment) => payment.status !== "Paid")
            .reduce((sum, payment) => sum + payment.amount_kes, 0),
        );
      } catch (err) {
        reportClientError("ParentBilling.fetchBilling", err);
        const message = err instanceof Error ? err.message : String(err);
        setLoadError(message);
        setPayments([]);
        setOutstanding(0);
        toast({
          title: "Failed to load billing",
          description: message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    void fetchBilling();
  }, [authLoading, isDemo, user?.id]);

  const statusColors: Record<string, string> = {
    Paid: "bg-secondary/20 text-secondary",
    Pending: "bg-primary/20 text-primary",
    Overdue: "bg-destructive/20 text-destructive",
  };

  return (
    <ParentLayout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground">Billing</h2>

        {loadError && !loading && (
          <EmptyState title="Account setup needed" description={loadError} icon={CreditCard} />
        )}

        {loading ? (
          <div className="space-y-2 rounded-xl border border-border bg-card p-5">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-8 w-40" />
          </div>
        ) : loadError ? null : (
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">Outstanding Balance</p>
            <p className="mt-1 text-3xl font-bold text-foreground">{formatKES(outstanding)}</p>
          </div>
        )}

        {loading ? (
          <TableSkeleton columns={5} />
        ) : loadError ? null : payments.length === 0 ? (
          <EmptyState
            title="No payment records"
            description="Payment history will appear here."
            icon={CreditCard}
          />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {["Student", "Description", "Amount", "Date", "Status"].map((heading) => (
                    <th
                      key={heading}
                      className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 text-foreground">{payment.students?.full_name}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {payment.description || "Tuition"}
                    </td>
                    <td className="px-4 py-3 text-foreground">{formatKES(payment.amount_kes)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(payment.date)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          statusColors[payment.status] ?? "bg-muted text-muted-foreground"
                        }`}
                      >
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </ParentLayout>
  );
}
