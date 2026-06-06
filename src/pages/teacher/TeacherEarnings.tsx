import { useEffect, useState } from "react";
import { DollarSign } from "lucide-react";

import { TeacherLayout } from "@/components/layouts/TeacherLayout";
import { formatDate, formatKES } from "@/lib/format";
import { TableSkeleton } from "@/components/ui/TableSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { DEMO_DATA } from "@/lib/demoData";
import { invokeSupabaseFunction } from "@/lib/invokeSupabaseFunction";
import { reportClientError } from "@/lib/reportClientError";
import { toast } from "@/hooks/use-toast";

type EarningRecord = {
  id: string;
  tutor_id: string;
  description: string | null;
  amount_kes: number;
  date: string;
  created_at?: string;
};

type TeacherWorkspaceResponse = {
  earnings: EarningRecord[];
};

export default function TeacherEarnings() {
  const { user, roleOverride, loading: authLoading } = useAuth();
  const [earnings, setEarnings] = useState<EarningRecord[]>([]);
  const [thisMonth, setThisMonth] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const isDemo =
    import.meta.env.DEV &&
    import.meta.env.VITE_ENABLE_DEMO_MODE === "true" &&
    roleOverride === "teacher";

  useEffect(() => {
    if (authLoading) return;
    if (!isDemo && !user) return;

    const fetchEarnings = async () => {
      setLoading(true);
      setLoadError(null);

      try {
        const data = isDemo
          ? { earnings: DEMO_DATA.teacher.earnings.earnings as EarningRecord[] }
          : await invokeSupabaseFunction<TeacherWorkspaceResponse>(
              "get-teacher-workspace",
              undefined,
            );

        const nextEarnings = data.earnings ?? [];
        setEarnings(nextEarnings);

        const nextTotal = nextEarnings.reduce((sum, item) => sum + item.amount_kes, 0);
        setTotal(nextTotal);

        const now = new Date();
        const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
        const nextThisMonth = nextEarnings
          .filter((item) => item.date >= monthStart)
          .reduce((sum, item) => sum + item.amount_kes, 0);
        setThisMonth(nextThisMonth);
      } catch (err) {
        reportClientError("TeacherEarnings.fetchEarnings", err);
        const message = err instanceof Error ? err.message : String(err);
        setLoadError(message);
        setEarnings([]);
        setThisMonth(0);
        setTotal(0);
        toast({
          title: "Failed to load earnings",
          description: message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    void fetchEarnings();
  }, [authLoading, isDemo, user?.id]);

  return (
    <TeacherLayout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground">Earnings</h2>

        {loadError && !loading && (
          <EmptyState title="Account setup needed" description={loadError} icon={DollarSign} />
        )}

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {[1, 2].map((index) => (
              <div
                key={index}
                className="space-y-2 rounded-xl border border-border bg-card p-5"
              >
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-8 w-40" />
              </div>
            ))}
          </div>
        ) : loadError ? null : (
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

        {loading ? (
          <TableSkeleton columns={3} />
        ) : loadError ? null : earnings.length === 0 ? (
          <EmptyState
            title="No earnings yet"
            description="Your earnings will be recorded here."
            icon={DollarSign}
          />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {["Date", "Description", "Amount"].map((heading) => (
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
                  <tr key={earning.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 text-foreground">{formatDate(earning.date)}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {earning.description || "Tuition payout"}
                    </td>
                    <td className="px-4 py-3 text-foreground">
                      {formatKES(earning.amount_kes)}
                    </td>
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
