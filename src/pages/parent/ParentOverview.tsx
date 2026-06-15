import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  ClipboardCheck,
  CreditCard,
  Sparkles,
  Users,
  Video,
} from "lucide-react";

import { ParentLayout } from "@/components/layouts/ParentLayout";
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
import { CardSkeleton } from "@/components/ui/CardSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { KpiSkeleton } from "@/components/ui/KpiSkeleton";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { DEMO_DATA } from "@/lib/demoData";
import { formatDate, formatKES } from "@/lib/format";
import { invokeSupabaseFunction } from "@/lib/invokeSupabaseFunction";
import { reportClientError } from "@/lib/reportClientError";

type ParentDashboardResponse = {
  parent: {
    id: string;
    full_name: string;
    phone: string | null;
    status: string;
  };
  stats: {
    childrenCount: number;
    lessonsThisWeek: number;
    attendanceRate: number;
    pendingPayments: number;
    activeMeetingLinks: number;
  };
  children: Array<{
    id: string;
    full_name: string;
    age: number | null;
    grade: string | null;
    curriculum: string | null;
    status: string;
    start_date: string | null;
    meeting_provider: string | null;
    meeting_link: string | null;
    tutor: {
      full_name: string;
      phone: string | null;
      email: string | null;
    } | null;
  }>;
  recentLessons: Array<{
    id: string;
    subject: string;
    date: string;
    comments: string | null;
    performance_rating: string | null;
    students: { full_name: string };
    tutors: { full_name: string };
  }>;
};

function getInitials(value: string) {
  return value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function getRatingClasses(rating?: string | null) {
  const map: Record<string, string> = {
    Excellent: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    Good: "border-primary/30 bg-primary/10 text-primary",
    "Needs Improvement": "border-destructive/30 bg-destructive/10 text-destructive",
  };

  return map[rating ?? ""] ?? "border-border bg-muted text-muted-foreground";
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

export default function ParentOverview() {
  const { user, roleOverride, loading: authLoading } = useAuth();
  const [dashboard, setDashboard] = useState<ParentDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const isDemo =
    import.meta.env.DEV &&
    import.meta.env.VITE_ENABLE_DEMO_MODE === "true" &&
    roleOverride === "parent";

  useEffect(() => {
    if (authLoading) return;
    if (!isDemo && !user) return;

    const fetchDashboard = async () => {
      setLoading(true);
      setLoadError(null);

      if (isDemo) {
        setDashboard({
          parent: {
            id: "demo-parent",
            full_name: DEMO_DATA.parent.profile.firstName,
            phone: "+254700000000",
            status: "active",
          },
          stats: {
            childrenCount: DEMO_DATA.parent.students.length,
            lessonsThisWeek: DEMO_DATA.parent.overview.stats.lessonsThisWeek,
            attendanceRate: DEMO_DATA.parent.overview.stats.attendanceRate,
            pendingPayments: DEMO_DATA.parent.overview.stats.pendingPayments,
            activeMeetingLinks: 0,
          },
          children: DEMO_DATA.parent.students.map((student) => ({
            id: student.id,
            full_name: student.full_name,
            age: student.age,
            grade: student.grade,
            curriculum: student.curriculum,
            status: "active",
            start_date: student.start_date ?? null,
            meeting_provider: null,
            meeting_link: null,
            tutor: {
              full_name: student.tutor_assignments?.[0]?.tutors?.full_name ?? "Tutor pending",
              phone: null,
              email: null,
            },
          })),
          recentLessons: DEMO_DATA.parent.overview.recentLessons,
        });
        setLoading(false);
        return;
      }

      try {
        const data = await invokeSupabaseFunction<ParentDashboardResponse>(
          "get-parent-dashboard",
          undefined,
        );
        setDashboard(data);
      } catch (err) {
        reportClientError("ParentOverview.fetchDashboard", err);
        const message = err instanceof Error ? err.message : String(err);
        setLoadError(message);
        toast({
          title: "Failed to load parent dashboard",
          description: message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    void fetchDashboard();
  }, [authLoading, isDemo, user?.id]);

  const stats = dashboard?.stats ?? {
    childrenCount: 0,
    lessonsThisWeek: 0,
    attendanceRate: 0,
    pendingPayments: 0,
    activeMeetingLinks: 0,
  };

  const cards = [
    { label: "Children linked", value: stats.childrenCount, icon: Users, hint: "active learners" },
    { label: "Lessons this week", value: stats.lessonsThisWeek, icon: BookOpen, hint: "upcoming and recent" },
    { label: "Attendance rate", value: `${stats.attendanceRate}%`, icon: ClipboardCheck, hint: "session consistency" },
    { label: "Pending payments", value: formatKES(stats.pendingPayments), icon: CreditCard, hint: "outstanding balance" },
    { label: "Live session links", value: stats.activeMeetingLinks, icon: Video, hint: "ready to join" },
  ] as const;

  const quickActions = [
    {
      title: "Check progress reports",
      description: "Review lesson notes, tutor feedback, and subject momentum.",
      to: "/parent/reports",
    },
    {
      title: "Open billing",
      description: "See invoices, confirm pending balances, and track payments.",
      to: "/parent/billing",
    },
  ] as const;

  const latestReports = dashboard?.recentLessons ?? [];
  const linkedChildren = dashboard?.children ?? [];
  const activeChildrenCount = linkedChildren.filter((child) => child.status === "active").length;
  const attendanceGoalProgress = Math.min(100, Math.max(0, stats.attendanceRate));
  const householdReadiness =
    stats.childrenCount > 0
      ? Math.round(((stats.activeMeetingLinks + activeChildrenCount) / (stats.childrenCount * 2)) * 100)
      : 0;

  const reportSummary = useMemo(() => {
    const excellent = latestReports.filter((report) => report.performance_rating === "Excellent").length;
    const needsAttention = latestReports.filter(
      (report) => report.performance_rating === "Needs Improvement",
    ).length;

    return { excellent, needsAttention };
  }, [latestReports]);

  return (
    <ParentLayout>
      {loadError && !loading ? (
        <EmptyState title="Dashboard unavailable" description={loadError} icon={Users} />
      ) : (
        <div className="space-y-6">
          <Card className="overflow-hidden border-primary/15 bg-gradient-to-br from-card via-card to-primary/5 shadow-none">
            <CardContent className="p-6 md:p-8">
              <div className="grid gap-8 xl:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.95fr)]">
                <div>
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-primary">
                    <Sparkles className="h-3.5 w-3.5" />
                    Parent overview
                  </div>

                  <h2 className="max-w-2xl text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                    Welcome back, {dashboard?.parent.full_name.split(" ")[0] ?? "Parent"}.
                  </h2>

                  <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
                    Keep an eye on your children&apos;s lessons, attendance, reports, and
                    billing from one calm, organised view.
                  </p>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <Button asChild>
                      <Link to="/parent/reports">
                        View reports
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button asChild variant="outline">
                      <Link to="/parent/messages">Message tutors</Link>
                    </Button>
                  </div>

                  <div className="mt-8 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-border/70 bg-background/50 p-4">
                      <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                        Attendance
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-foreground">
                        {stats.attendanceRate}%
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">overall session consistency</p>
                    </div>
                    <div className="rounded-2xl border border-border/70 bg-background/50 p-4">
                      <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                        Strong reports
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-foreground">
                        {reportSummary.excellent}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">excellent recent lesson ratings</p>
                    </div>
                    <div className="rounded-2xl border border-border/70 bg-background/50 p-4">
                      <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                        Billing status
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-foreground">
                        {stats.pendingPayments > 0 ? "Action" : "Clear"}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">current household payment position</p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
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
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              {cards.map((card) => (
                <MetricCard
                  key={card.label}
                  label={card.label}
                  value={card.value}
                  icon={card.icon}
                  hint={card.hint}
                />
              ))}
            </div>
          )}

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.95fr)]">
            <Card className="border-border/70 shadow-none">
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-xl">Recent tutor reports</CardTitle>
                  <CardDescription>
                    Quick readouts from recent sessions across your children.
                  </CardDescription>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link to="/parent/reports">View all</Link>
                </Button>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <CardSkeleton count={3} />
                ) : latestReports.length ? (
                  <div className="space-y-4">
                    {latestReports.map((lesson, index) => (
                      <div key={lesson.id}>
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                          <div className="min-w-0">
                            <div className="mb-2 flex flex-wrap items-center gap-2">
                              <Badge
                                variant="outline"
                                className={getRatingClasses(lesson.performance_rating)}
                              >
                                {lesson.performance_rating ?? "Unrated"}
                              </Badge>
                              <span className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                                {lesson.subject}
                              </span>
                            </div>
                            <p className="font-medium text-foreground">
                              {lesson.students.full_name} with {lesson.tutors.full_name}
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {formatDate(lesson.date)}
                            </p>
                            {lesson.comments && (
                              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                                {lesson.comments}
                              </p>
                            )}
                          </div>
                        </div>
                        {index < latestReports.length - 1 && <Separator className="mt-4" />}
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title="No reports yet"
                    description="Tutor lesson reports will appear here."
                    icon={BookOpen}
                  />
                )}
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="border-border/70 shadow-none">
                <CardHeader>
                  <CardTitle className="text-xl">Family pulse</CardTitle>
                  <CardDescription>A quick health check across attendance, sessions, and readiness.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm text-muted-foreground">Attendance goal</p>
                      <span className="text-sm text-foreground">{stats.attendanceRate}%</span>
                    </div>
                    <Progress value={attendanceGoalProgress} className="h-2 bg-muted" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm text-muted-foreground">Household readiness</p>
                      <span className="text-sm text-foreground">{householdReadiness}%</span>
                    </div>
                    <Progress value={householdReadiness} className="h-2 bg-muted" />
                  </div>

                  <Separator />

                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                    <div>
                      <p className="text-sm text-muted-foreground">Children active</p>
                      <p className="mt-1 text-xl font-semibold text-foreground">{activeChildrenCount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Reports needing attention</p>
                      <p className="mt-1 text-xl font-semibold text-foreground">
                        {reportSummary.needsAttention}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/70 shadow-none">
                <CardHeader>
                  <CardTitle className="text-xl">Children snapshot</CardTitle>
                  <CardDescription>Your linked learners and the tutors currently supporting them.</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <CardSkeleton count={2} />
                  ) : linkedChildren.length ? (
                    <div className="space-y-4">
                      {linkedChildren.map((child, index) => (
                        <div key={child.id}>
                          <div className="flex items-start gap-3">
                            <Avatar className="h-11 w-11 border border-border/70">
                              <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                                {getInitials(child.full_name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="font-medium text-foreground">{child.full_name}</p>
                                <Badge variant="outline" className="border-border bg-muted text-muted-foreground">
                                  {child.grade ?? "No grade"}
                                </Badge>
                              </div>
                              <p className="mt-1 text-sm text-muted-foreground">
                                {child.curriculum ?? "Curriculum pending"}
                              </p>
                              <p className="mt-2 text-sm text-muted-foreground">
                                Tutor: {child.tutor?.full_name ?? "Not linked"}
                              </p>
                            </div>
                          </div>
                          {index < linkedChildren.length - 1 && <Separator className="mt-4" />}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      title="No linked children yet"
                      description="Your children will appear here once the team links them to your account."
                      icon={Users}
                    />
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </ParentLayout>
  );
}
