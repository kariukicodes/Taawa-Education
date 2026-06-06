import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { CreditCard } from "lucide-react";
import { formatKES, formatDate } from "@/lib/format";
import { TableSkeleton } from "@/components/ui/TableSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAuth } from "@/contexts/AuthContext";
import { DEMO_DATA } from "@/lib/demoData";
import { toast } from "@/hooks/use-toast";
import { invokeSupabaseFunction } from "@/lib/invokeSupabaseFunction";

export default function AdminPayments() {
  const { roleOverride, loading: authLoading, user } = useAuth();
  const [tab, setTab] = useState<"payments" | "earnings">("payments");
  const [payments, setPayments] = useState<any[]>([]);
  const [earnings, setEarnings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const isDemo =
    import.meta.env.DEV &&
    import.meta.env.VITE_ENABLE_DEMO_MODE === "true" &&
    roleOverride === "admin";

  useEffect(() => {
    if (authLoading) return;
    if (!isDemo && !user) return;

    if (isDemo) {
      setLoading(true);
      setPayments(DEMO_DATA.admin.payments.payments);
      setEarnings(DEMO_DATA.admin.payments.earnings);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const { payments, earnings } = await invokeSupabaseFunction<{
          payments: any[];
          earnings: any[];
        }>("list-payments-admin", undefined);

        setPayments(payments ?? []);
        setEarnings(earnings ?? []);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        toast({
          title: "Failed to load payments",
          description: message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, [isDemo, authLoading, user?.id]);

  const statusColors: Record<string, string> = {
    Paid: "bg-secondary/20 text-secondary",
    Pending: "bg-primary/20 text-primary",
    Overdue: "bg-destructive/20 text-destructive",
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground">Payments</h2>

        <div className="flex gap-2">
          {(["payments", "earnings"] as const).map((currentTab) => (
            <button
              key={currentTab}
              onClick={() => setTab(currentTab)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                tab === currentTab
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {currentTab === "payments" ? "Student Payments" : "Tutor Earnings"}
            </button>
          ))}
        </div>

        {tab === "payments" &&
          (loading ? (
            <TableSkeleton columns={5} />
          ) : payments.length === 0 ? (
            <EmptyState
              title="No payments recorded"
              description="Payment records will appear here."
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
                    <tr
                      key={payment.id}
                      className="border-b border-border last:border-0 hover:bg-muted/50"
                    >
                      <td className="px-4 py-3 text-foreground">{payment.students?.full_name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{payment.description}</td>
                      <td className="px-4 py-3 text-foreground">{formatKES(payment.amount_kes)}</td>
                      <td className="px-4 py-3 text-muted-foreground">{formatDate(payment.date)}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            statusColors[payment.status] ?? ""
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
          ))}

        {tab === "earnings" &&
          (loading ? (
            <TableSkeleton columns={4} />
          ) : earnings.length === 0 ? (
            <EmptyState
              title="No earnings recorded"
              description="Tutor earnings will appear here."
              icon={CreditCard}
            />
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border bg-card">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    {["Tutor", "Description", "Amount", "Date"].map((heading) => (
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
                  {earnings.map((earning) => (
                    <tr
                      key={earning.id}
                      className="border-b border-border last:border-0 hover:bg-muted/50"
                    >
                      <td className="px-4 py-3 text-foreground">{earning.tutors?.full_name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{earning.description}</td>
                      <td className="px-4 py-3 text-foreground">{formatKES(earning.amount_kes)}</td>
                      <td className="px-4 py-3 text-muted-foreground">{formatDate(earning.date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
      </div>
    </AdminLayout>
  );
}
