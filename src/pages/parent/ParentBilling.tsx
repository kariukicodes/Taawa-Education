import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ParentLayout } from "@/components/layouts/ParentLayout";
import { formatKES, formatDate } from "@/lib/format";
import { TableSkeleton } from "@/components/ui/TableSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { CreditCard } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { DEMO_DATA } from "@/lib/demoData";

export default function ParentBilling() {
  const { user, roleOverride } = useAuth();
  const [payments, setPayments] = useState<any[]>([]);
  const [outstanding, setOutstanding] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const isDemo = import.meta.env.DEV && roleOverride === "parent";

  useEffect(() => {
    if (!user) return;

    if (isDemo) {
      setLoading(true);
      setLoadError(null);
      const demoPayments = DEMO_DATA.parent.billing.payments;
      setPayments(demoPayments);
      const total = demoPayments.filter((p: any) => p.status !== "Paid").reduce((s: number, p: any) => s + p.amount_kes, 0);
      setOutstanding(total);
      setLoading(false);
      return;
    }

    const fetch = async () => {
      setLoading(true);
      setLoadError(null);

      try {
        const { data: parent, error: parentError } = await supabase
          .from("parents")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (parentError) throw parentError;

        if (!parent) {
          setLoadError("No parent record was found for this account. Ask an admin to create a row in parents for your user.");
          setPayments([]);
          setOutstanding(0);
          return;
        }

        const { data: students, error: studentsError } = await supabase
          .from("students")
          .select("id")
          .eq("parent_id", parent.id);

        if (studentsError) throw studentsError;

        const ids = students?.map((s) => s.id) ?? [];
        if (ids.length === 0) {
          setPayments([]);
          setOutstanding(0);
          return;
        }

        const { data, error } = await supabase
          .from("payments")
          .select("*, students(full_name)")
          .in("student_id", ids)
          .order("date", { ascending: false });

        if (error) throw error;

        setPayments(data ?? []);
        const total = data?.filter((p) => p.status !== "Paid").reduce((s, p) => s + p.amount_kes, 0) ?? 0;
        setOutstanding(total);
      } catch (err) {
        console.error("ParentBilling load failed", err);
        setLoadError("We couldn't load your billing details.");
        setPayments([]);
        setOutstanding(0);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [user, isDemo]);

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
          <div className="rounded-xl border border-border bg-card p-5 space-y-2"><Skeleton className="h-3 w-32" /><Skeleton className="h-8 w-40" /></div>
        ) : loadError ? null : (
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">Outstanding Balance</p>
            <p className="mt-1 text-3xl font-bold text-foreground">{formatKES(outstanding)}</p>
          </div>
        )}

        {loading ? <TableSkeleton columns={5} /> : loadError ? null : payments.length === 0 ? (
          <EmptyState title="No payment records" description="Payment history will appear here." icon={CreditCard} />
        ) : (
          <div className="rounded-xl border border-border bg-card overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border">
                {["Student", "Description", "Amount", "Date", "Status"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 text-foreground">{p.students?.full_name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.description}</td>
                    <td className="px-4 py-3 text-foreground">{formatKES(p.amount_kes)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(p.date)}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[p.status] ?? ""}`}>{p.status}</span>
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
