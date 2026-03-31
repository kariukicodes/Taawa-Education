import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { TeacherLayout } from "@/components/layouts/TeacherLayout";
import { formatKES, formatDate } from "@/lib/format";
import { TableSkeleton } from "@/components/ui/TableSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { DollarSign } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function TeacherEarnings() {
  const { user } = useAuth();
  const [earnings, setEarnings] = useState<any[]>([]);
  const [thisMonth, setThisMonth] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data: tutor } = await supabase.from("tutors").select("id").eq("user_id", user.id).single();
      if (!tutor) { setLoading(false); return; }
      const { data } = await supabase.from("earnings").select("*").eq("tutor_id", tutor.id).order("date", { ascending: false });
      setEarnings(data ?? []);
      const t = data?.reduce((s, e) => s + e.amount_kes, 0) ?? 0;
      setTotal(t);
      const now = new Date();
      const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
      const m = data?.filter((e) => e.date >= monthStart).reduce((s, e) => s + e.amount_kes, 0) ?? 0;
      setThisMonth(m);
      setLoading(false);
    };
    fetch();
  }, [user]);

  return (
    <TeacherLayout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground">Earnings</h2>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {[1, 2].map((i) => <div key={i} className="rounded-xl border border-border bg-card p-5 space-y-2"><Skeleton className="h-3 w-32" /><Skeleton className="h-8 w-40" /></div>)}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-5">
              <p className="text-sm text-muted-foreground">Earned This Month</p>
              <p className="mt-1 text-3xl font-bold text-foreground">{formatKES(thisMonth)}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <p className="text-sm text-muted-foreground">Total to Date</p>
              <p className="mt-1 text-3xl font-bold text-foreground">{formatKES(total)}</p>
            </div>
          </div>
        )}

        {loading ? <TableSkeleton columns={3} /> : earnings.length === 0 ? (
          <EmptyState title="No earnings yet" description="Your earnings will be recorded here." icon={DollarSign} />
        ) : (
          <div className="rounded-xl border border-border bg-card overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border">
                {["Date", "Description", "Amount"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {earnings.map((e) => (
                  <tr key={e.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 text-foreground">{formatDate(e.date)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{e.description}</td>
                    <td className="px-4 py-3 text-foreground">{formatKES(e.amount_kes)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </TeacherLayout>
  );
}
