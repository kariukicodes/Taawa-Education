import { useEffect, useState } from "react";
import {
  Activity,
  CreditCard,
  GraduationCap,
  Link2,
  UserCheck,
  Users,
  Wallet,
} from "lucide-react";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { formatKES, formatDate } from "@/lib/format";
import { KpiSkeleton } from "@/components/ui/KpiSkeleton";
import { TableSkeleton } from "@/components/ui/TableSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAuth } from "@/contexts/AuthContext";
import { DEMO_DATA } from "@/lib/demoData";
import { invokeSupabaseFunction } from "@/lib/invokeSupabaseFunction";
import { toast } from "@/hooks/use-toast";
import { reportClientError } from "@/lib/reportClientError";

type OverviewStats = {
  students: number;
  parents: number;
  tutors: number;
  activeAssignments: number;
  leads: number;
  paymentsDue: number;
  paymentsCollected: number;
};

type ActivityRecord = {
  id: string;
  type: string;
  title: string;
  description: string;
  created_at: string;
};

export default function AdminOverview() {
  const { roleOverride, loading: authLoading, user } = useAuth();
  const [stats, setStats] = useState<OverviewStats>({
    students: 0,
    parents: 0,
    tutors: 0,
    activeAssignments: 0,
    leads: 0,
    paymentsDue: 0,
    paymentsCollected: 0,
  });
  const [recentLeads, setRecentLeads] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<ActivityRecord[]>([]);
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
      setStats({
        students: DEMO_DATA.admin.overview.stats.students,
        parents: DEMO_DATA.admin.parents.parents.length,
        tutors: DEMO_DATA.admin.overview.stats.tutors,
        activeAssignments: DEMO_DATA.admin.assignments.assignments.length,
        leads: DEMO_DATA.admin.overview.stats.leads,
        paymentsDue: DEMO_DATA.admin.payments.payments
          .filter((payment) => payment.status !== "Paid")
          .reduce((sum, payment) => sum + payment.amount_kes, 0),
        paymentsCollected: DEMO_DATA.admin.payments.payments
          .filter((payment) => payment.status === "Paid")
          .reduce((sum, payment) => sum + payment.amount_kes, 0),
      });
      setRecentLeads(DEMO_DATA.admin.overview.recentLeads);
      setRecentActivities([]);
      setLoading(false);
      return;
    }

    const fetchAll = async () => {
      setLoading(true);
      try {
        const { stats, recentLeads, recentActivities } = await invokeSupabaseFunction<{
          stats: OverviewStats;
          recentLeads: any[];
          recentActivities: ActivityRecord[];
        }>("get-admin-overview", undefined);

        setStats(stats);
        setRecentLeads(recentLeads ?? []);
        setRecentActivities(recentActivities ?? []);
      } catch (err) {
        reportClientError("AdminOverview.fetchAll", err);
        const message = err instanceof Error ? err.message : String(err);
        toast({
          title: "Failed to load dashboard overview",
          description: message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    void fetchAll();
  }, [isDemo, authLoading, user?.id]);

  const kpis = [
    { label: "Total Students", value: stats.students, icon: GraduationCap },
    { label: "Total Parents", value: stats.parents, icon: Users },
    { label: "Active Tutors", value: stats.tutors, icon: UserCheck },
    { label: "Active Assignments", value: stats.activeAssignments, icon: Link2 },
    { label: "Open Leads", value: stats.leads, icon: Activity },
    { label: "Payments Due", value: formatKES(stats.paymentsDue), icon: CreditCard },
    { label: "Payments Collected", value: formatKES(stats.paymentsCollected), icon: Wallet },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        <h2 className="text-2xl font-bold text-foreground">Overview</h2>

        {loading ? (
          <KpiSkeleton />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {kpis.map((kpi) => (
              <div
                key={kpi.label}
                className="card-hover-glow rounded-xl border border-border bg-card p-5"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">{kpi.label}</p>
                  <kpi.icon className="h-5 w-5 text-primary" />
                </div>
                <p className="mt-2 text-2xl font-bold text-foreground">{kpi.value}</p>
              </div>
            ))}
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div>
            <h3 className="mb-4 text-lg font-semibold text-foreground">Recent Leads</h3>
            {loading ? (
              <TableSkeleton columns={4} rows={5} />
            ) : recentLeads.length === 0 ? (
              <EmptyState
                title="No leads yet"
                description="Leads will appear here when visitors submit the contact form."
                icon={Users}
              />
            ) : (
              <div className="overflow-hidden rounded-xl border border-border bg-card">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">
                        Name
                      </th>
                      <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground sm:table-cell">
                        Email
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">
                        Status
                      </th>
                      <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground md:table-cell">
                        Date
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {recentLeads.map((lead) => (
                      <tr key={lead.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                        <td className="px-4 py-3 text-foreground">{lead.parent_name}</td>
                        <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                          {lead.email}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={lead.status} />
                        </td>
                        <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                          {formatDate(lead.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold text-foreground">Recent Activity</h3>
            {loading ? (
              <TableSkeleton columns={1} rows={6} />
            ) : recentActivities.length === 0 ? (
              <EmptyState
                title="No recent activity"
                description="New activity will appear here as admins work in the portal."
                icon={Activity}
              />
            ) : (
              <div className="space-y-3">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="rounded-xl border border-border bg-card p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-foreground">{activity.title}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{activity.description}</p>
                      </div>
                      <span className="whitespace-nowrap text-xs text-muted-foreground">
                        {formatDate(activity.created_at)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    New: "bg-primary/20 text-primary",
    Contacted: "bg-blue-500/20 text-blue-400",
    "Consultation Booked": "bg-purple-500/20 text-purple-400",
    Enrolled: "bg-secondary/20 text-secondary",
    Inactive: "bg-muted text-muted-foreground",
  };

  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
        colors[status] ?? "bg-muted text-muted-foreground"
      }`}
    >
      {status}
    </span>
  );
}
