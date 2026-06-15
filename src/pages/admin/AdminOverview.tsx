import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  CreditCard,
  GraduationCap,
  Link2,
  Sparkles,
  TrendingUp,
  UserCheck,
  Users,
  Wallet,
} from "lucide-react";

import { AdminLayout } from "@/components/layouts/AdminLayout";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/EmptyState";
import { KpiSkeleton } from "@/components/ui/KpiSkeleton";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TableSkeleton } from "@/components/ui/TableSkeleton";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { DEMO_DATA } from "@/lib/demoData";
import { formatDate, formatKES } from "@/lib/format";
import { invokeSupabaseFunction } from "@/lib/invokeSupabaseFunction";
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

type LeadRecord = {
  id: string;
  parent_name: string;
  email: string;
  status: string;
  created_at: string;
};

type ActivityRecord = {
  id: string;
  type: string;
  title: string;
  description: string;
  created_at: string;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function getLeadStatusClasses(status: string) {
  const map: Record<string, string> = {
    New: "border-primary/30 bg-primary/10 text-primary",
    Contacted: "border-sky-500/30 bg-sky-500/10 text-sky-300",
    "Consultation Booked": "border-violet-500/30 bg-violet-500/10 text-violet-300",
    Enrolled: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    Inactive: "border-border bg-muted text-muted-foreground",
  };

  return map[status] ?? "border-border bg-muted text-muted-foreground";
}

function ActivityBadge({ type }: { type: string }) {
  const normalized = type.toLowerCase();

  if (normalized.includes("payment")) {
    return (
      <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
        Payments
      </Badge>
    );
  }

  if (normalized.includes("lead")) {
    return (
      <Badge variant="outline" className="border-sky-500/30 bg-sky-500/10 text-sky-300">
        Leads
      </Badge>
    );
  }

  if (normalized.includes("assignment")) {
    return (
      <Badge variant="outline" className="border-violet-500/30 bg-violet-500/10 text-violet-300">
        Assignments
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="border-border bg-muted text-muted-foreground">
      Activity
    </Badge>
  );
}

function MetricCard({
  label,
  value,
  icon: Icon,
  hint,
}: {
  label: string;
  value: string | number;
  icon: typeof Users;
  hint: string;
}) {
  return (
    <Card className="border-border/70 bg-card/80 shadow-none">
      <CardContent className="p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">{value}</p>
          </div>
          <div className="rounded-2xl border border-primary/20 bg-primary/10 p-3 text-primary">
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <p className="mt-4 text-xs uppercase tracking-[0.16em] text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}

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
  const [recentLeads, setRecentLeads] = useState<LeadRecord[]>([]);
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
        const data = await invokeSupabaseFunction<{
          stats: OverviewStats;
          recentLeads: LeadRecord[];
          recentActivities: ActivityRecord[];
        }>("get-admin-overview", undefined);

        setStats(data.stats);
        setRecentLeads(data.recentLeads ?? []);
        setRecentActivities(data.recentActivities ?? []);
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
    {
      label: "Students",
      value: stats.students,
      icon: GraduationCap,
      hint: "active learners",
    },
    {
      label: "Parents",
      value: stats.parents,
      icon: Users,
      hint: "linked households",
    },
    {
      label: "Tutors",
      value: stats.tutors,
      icon: UserCheck,
      hint: "active tutor pool",
    },
    {
      label: "Assignments",
      value: stats.activeAssignments,
      icon: Link2,
      hint: "student-tutor matches",
    },
    {
      label: "Open leads",
      value: stats.leads,
      icon: Activity,
      hint: "awaiting action",
    },
    {
      label: "Payments due",
      value: formatKES(stats.paymentsDue),
      icon: CreditCard,
      hint: "outstanding invoices",
    },
    {
      label: "Collected",
      value: formatKES(stats.paymentsCollected),
      icon: Wallet,
      hint: "received this cycle",
    },
  ] as const;

  const leadStatusCounts = useMemo(() => {
    return recentLeads.reduce<Record<string, number>>((acc, lead) => {
      acc[lead.status] = (acc[lead.status] ?? 0) + 1;
      return acc;
    }, {});
  }, [recentLeads]);

  const totalLeads = recentLeads.length || 1;
  const enrolledRate = Math.round(((leadStatusCounts.Enrolled ?? 0) / totalLeads) * 100);
  const collectionTotal = stats.paymentsCollected + stats.paymentsDue;
  const collectionRate =
    collectionTotal > 0 ? Math.round((stats.paymentsCollected / collectionTotal) * 100) : 0;

  const quickActions = [
    {
      title: "Review leads",
      description: "Qualify new enquiries and move them into consultation.",
      to: "/admin/leads",
    },
    {
      title: "Manage assignments",
      description: "Confirm tutor availability and link the right students.",
      to: "/admin/assignments",
    },
    {
      title: "Check payments",
      description: "Follow up outstanding invoices and verify collections.",
      to: "/admin/payments",
    },
  ] as const;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <Card className="overflow-hidden border-primary/15 bg-gradient-to-br from-card via-card to-primary/5 shadow-none">
          <CardContent className="p-6 md:p-8">
            <div className="grid gap-8 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.9fr)]">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-primary">
                  <Sparkles className="h-3.5 w-3.5" />
                  Dashboard overview
                </div>

                <h2 className="max-w-2xl text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                  Keep the whole tutoring operation moving from one place.
                </h2>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
                  Monitor enrolment, payments, tutor allocation, and day-to-day activity across
                  the platform without switching views.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Button asChild>
                    <Link to="/admin/leads">
                      Review leads
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link to="/admin/reports">Open reports</Link>
                  </Button>
                </div>

                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-border/70 bg-background/50 p-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                      Lead conversion
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-foreground">{enrolledRate}%</p>
                    <p className="mt-1 text-sm text-muted-foreground">recent leads enrolled</p>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-background/50 p-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                      Collection rate
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-foreground">{collectionRate}%</p>
                    <p className="mt-1 text-sm text-muted-foreground">cash collected vs due</p>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-background/50 p-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                      Assignment load
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-foreground">
                      {stats.activeAssignments}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">active student-tutor links</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                {quickActions.map((action) => (
                  <Card key={action.title} className="border-border/70 bg-background/55 shadow-none">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-medium text-foreground">{action.title}</p>
                          <p className="mt-1 text-sm leading-6 text-muted-foreground">
                            {action.description}
                          </p>
                        </div>
                        <Button asChild size="icon" variant="ghost" className="shrink-0 rounded-full">
                          <Link to={action.to}>
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <KpiSkeleton />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {kpis.map((kpi) => (
              <MetricCard
                key={kpi.label}
                label={kpi.label}
                value={kpi.value}
                icon={kpi.icon}
                hint={kpi.hint}
              />
            ))}
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(340px,0.95fr)]">
          <Card className="border-border/70 shadow-none">
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div>
                <CardTitle className="text-xl">Recent leads</CardTitle>
                <CardDescription>Latest enquiries coming through the website and referrals.</CardDescription>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link to="/admin/leads">View all</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <TableSkeleton columns={4} rows={5} />
              ) : recentLeads.length === 0 ? (
                <EmptyState
                  title="No leads yet"
                  description="Leads will appear here when families submit the contact form."
                  icon={Users}
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Parent</TableHead>
                      <TableHead className="hidden sm:table-cell">Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden md:table-cell">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentLeads.map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 border border-border/70">
                              <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                                {getInitials(lead.parent_name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-foreground">{lead.parent_name}</p>
                              <p className="text-xs text-muted-foreground sm:hidden">{lead.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden text-muted-foreground sm:table-cell">
                          {lead.email}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={getLeadStatusClasses(lead.status)}
                          >
                            {lead.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden text-muted-foreground md:table-cell">
                          {formatDate(lead.created_at)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-border/70 shadow-none">
              <CardHeader>
                <CardTitle className="text-xl">Lead pipeline</CardTitle>
                <CardDescription>See how recent enquiries are moving through the funnel.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {[
                  "New",
                  "Contacted",
                  "Consultation Booked",
                  "Enrolled",
                ].map((status) => {
                  const value = leadStatusCounts[status] ?? 0;
                  const percentage = Math.round((value / totalLeads) * 100);

                  return (
                    <div key={status} className="space-y-2">
                      <div className="flex items-center justify-between gap-3">
                        <Badge variant="outline" className={getLeadStatusClasses(status)}>
                          {status}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {value} · {percentage}%
                        </span>
                      </div>
                      <Progress value={percentage} className="h-2 bg-muted" />
                    </div>
                  );
                })}

                <Separator />

                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Enrolment momentum</p>
                    <p className="mt-1 text-2xl font-semibold text-foreground">{enrolledRate}%</p>
                  </div>
                  <div className="rounded-2xl border border-primary/20 bg-primary/10 p-3 text-primary">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/70 shadow-none">
              <CardHeader>
                <CardTitle className="text-xl">Cash position</CardTitle>
                <CardDescription>Collections compared with the outstanding amount.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Collected</p>
                    <p className="mt-1 text-xl font-semibold text-foreground">
                      {formatKES(stats.paymentsCollected)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Outstanding</p>
                    <p className="mt-1 text-xl font-semibold text-foreground">
                      {formatKES(stats.paymentsDue)}
                    </p>
                  </div>
                </div>
                <Progress value={collectionRate} className="h-2 bg-muted" />
                <p className="text-sm text-muted-foreground">
                  {collectionRate}% of tracked invoice value has already been collected.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/70 shadow-none">
              <CardHeader>
                <CardTitle className="text-xl">Recent activity</CardTitle>
                <CardDescription>Operational actions happening across the portal.</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <TableSkeleton columns={1} rows={5} />
                ) : recentActivities.length === 0 ? (
                  <EmptyState
                    title="No recent activity"
                    description="New activity will appear here as the team works inside the portal."
                    icon={Activity}
                  />
                ) : (
                  <div className="space-y-4">
                    {recentActivities.map((activity, index) => (
                      <div key={activity.id}>
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <div className="mb-2">
                              <ActivityBadge type={activity.type} />
                            </div>
                            <p className="font-medium text-foreground">{activity.title}</p>
                            <p className="mt-1 text-sm leading-6 text-muted-foreground">
                              {activity.description}
                            </p>
                          </div>
                          <span className="whitespace-nowrap text-xs text-muted-foreground">
                            {formatDate(activity.created_at)}
                          </span>
                        </div>
                        {index < recentActivities.length - 1 && <Separator className="mt-4" />}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
