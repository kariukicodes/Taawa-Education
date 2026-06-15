import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  FileText,
  ListTodo,
  Mail,
  MessageCircle,
  Sparkles,
  Users,
  Video,
} from "lucide-react";

import { TeacherLayout } from "@/components/layouts/TeacherLayout";
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
import { buildMailtoLink, buildWhatsAppLink } from "@/lib/contactLinks";
import { useAuth } from "@/contexts/AuthContext";
import { DEMO_DATA } from "@/lib/demoData";
import { getDemoTeacherAssignedStudents } from "@/lib/demoPortalData";
import { formatDate } from "@/lib/format";
import { invokeSupabaseFunction } from "@/lib/invokeSupabaseFunction";
import { reportClientError } from "@/lib/reportClientError";
import { formatSessionReminder, formatSessionSchedule } from "@/lib/sessionSchedule";
import { describeClientError } from "@/lib/describeClientError";
import { toast } from "@/hooks/use-toast";

type TeacherDashboardResponse = {
  tutor: {
    id: string;
    full_name: string;
    phone: string | null;
    status: string;
  };
  stats: {
    assignedStudents: number;
    pendingTasks: number;
    completedTasks: number;
    activeMeetingLinks: number;
    reportsThisWeek: number;
  };
  students: Array<{
    id: string;
    student_id: string;
    full_name: string;
    age: number | null;
    grade: string | null;
    curriculum: string | null;
    status: string;
    start_date: string | null;
    meeting_provider: string | null;
    meeting_link: string | null;
    session_day_of_week?: number | null;
    session_start_time?: string | null;
    session_end_time?: string | null;
    session_frequency?: "weekly" | "biweekly" | null;
    session_timezone?: string | null;
    session_end_date?: string | null;
    reminder_enabled?: boolean | null;
    reminder_offset_minutes?: number | null;
    parent: {
      full_name: string;
      phone: string | null;
      email: string | null;
    } | null;
  }>;
  tasks: Array<{
    id: string;
    title: string;
    description: string | null;
    due_date: string | null;
    status: string;
    created_at?: string;
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

function getTaskClasses(status: string) {
  return status === "done"
    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
    : "border-primary/30 bg-primary/10 text-primary";
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

export default function TeacherOverview() {
  const { user, roleOverride, loading: authLoading } = useAuth();
  const [dashboard, setDashboard] = useState<TeacherDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const isDemo =
    import.meta.env.DEV &&
    import.meta.env.VITE_ENABLE_DEMO_MODE === "true" &&
    roleOverride === "teacher";

  useEffect(() => {
    if (authLoading) return;
    if (!isDemo && !user) return;

    const fetchDashboard = async () => {
      setLoading(true);
      setLoadError(null);

      if (isDemo) {
        const demoStudents = getDemoTeacherAssignedStudents();

        setDashboard({
          tutor: {
            id: "demo-tutor",
            full_name: "Demo Tutor",
            phone: "+254700000000",
            status: "active",
          },
          stats: {
            assignedStudents: DEMO_DATA.teacher.students.length,
            pendingTasks: DEMO_DATA.teacher.tasks.tasks.filter((task) => task.status === "pending").length,
            completedTasks: DEMO_DATA.teacher.tasks.tasks.filter((task) => task.status === "done").length,
            activeMeetingLinks: demoStudents.filter((student) => !!student.meeting_link).length,
            reportsThisWeek: DEMO_DATA.teacher.lessons.lessons.length,
          },
          students: demoStudents,
          tasks: DEMO_DATA.teacher.tasks.tasks.slice(0, 5),
        });
        setLoading(false);
        return;
      }

      try {
        const data = await invokeSupabaseFunction<TeacherDashboardResponse>(
          "get-teacher-dashboard",
          undefined,
        );
        setDashboard(data);
      } catch (err) {
        reportClientError("TeacherOverview.fetchDashboard", err);
        const message = describeClientError(err);
        setLoadError(message);
        toast({
          title: "Failed to load tutor dashboard",
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
    assignedStudents: 0,
    pendingTasks: 0,
    completedTasks: 0,
    activeMeetingLinks: 0,
    reportsThisWeek: 0,
  };

  const cards = [
    { label: "Assigned students", value: stats.assignedStudents, icon: Users, hint: "active learners" },
    { label: "Pending tasks", value: stats.pendingTasks, icon: ListTodo, hint: "needs attention" },
    { label: "Live meeting links", value: stats.activeMeetingLinks, icon: Video, hint: "joinable sessions" },
    { label: "Reports this week", value: stats.reportsThisWeek, icon: FileText, hint: "submitted lesson logs" },
  ] as const;

  const quickActions = [
    {
      title: "Open students",
      description: "See assigned learners, schedules, and parent contact details.",
      to: "/teacher/students",
    },
    {
      title: "Write lesson logs",
      description: "Jump into reports and keep families updated after each session.",
      to: "/teacher/lessons",
    },
  ] as const;

  const recentStudents = useMemo(() => (dashboard?.students ?? []).slice(0, 3), [dashboard?.students]);
  const latestTasks = dashboard?.tasks ?? [];
  const completedTasks = latestTasks.filter((task) => task.status === "done").length;
  const taskCompletionRate =
    latestTasks.length > 0 ? Math.round((completedTasks / latestTasks.length) * 100) : 0;
  const meetingCoverage =
    stats.assignedStudents > 0
      ? Math.round((stats.activeMeetingLinks / stats.assignedStudents) * 100)
      : 0;

  return (
    <TeacherLayout>
      {loadError && !loading ? (
        <EmptyState title="Tutor overview unavailable" description={loadError} icon={Users} />
      ) : (
        <div className="space-y-6">
          <Card className="overflow-hidden border-primary/15 bg-gradient-to-br from-card via-card to-primary/5 shadow-none">
            <CardContent className="p-6 md:p-8">
              <div className="grid gap-8 xl:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.95fr)]">
                <div>
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-primary">
                    <Sparkles className="h-3.5 w-3.5" />
                    Tutor overview
                  </div>

                  <h2 className="max-w-2xl text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                    Welcome back, {dashboard?.tutor.full_name.split(" ")[0] ?? "Tutor"}.
                  </h2>

                  <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
                    Stay on top of students, tasks, session links, and reporting from one focused workspace.
                  </p>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <Button asChild>
                      <Link to="/teacher/students">
                        View students
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button asChild variant="outline">
                      <Link to="/teacher/tasks">Open tasks</Link>
                    </Button>
                  </div>

                  <div className="mt-8 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-border/70 bg-background/50 p-4">
                      <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                        Status
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-foreground">
                        {dashboard?.tutor.status === "active" ? "Active" : "Inactive"}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">current teaching status</p>
                    </div>
                    <div className="rounded-2xl border border-border/70 bg-background/50 p-4">
                      <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                        Task completion
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-foreground">{taskCompletionRate}%</p>
                      <p className="mt-1 text-sm text-muted-foreground">latest task completion rate</p>
                    </div>
                    <div className="rounded-2xl border border-border/70 bg-background/50 p-4">
                      <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                        Session coverage
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-foreground">{meetingCoverage}%</p>
                      <p className="mt-1 text-sm text-muted-foreground">students with live meeting links</p>
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
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
                  <CardTitle className="text-xl">Latest tasks</CardTitle>
                  <CardDescription>
                    Admin requests and follow-ups that need your attention.
                  </CardDescription>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link to="/teacher/tasks">View all</Link>
                </Button>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <CardSkeleton count={3} />
                ) : latestTasks.length ? (
                  <div className="space-y-4">
                    {latestTasks.map((task, index) => (
                      <div key={task.id}>
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                          <div className="min-w-0">
                            <div className="mb-2">
                              <Badge variant="outline" className={getTaskClasses(task.status)}>
                                {task.status}
                              </Badge>
                            </div>
                            <p className="font-medium text-foreground">{task.title}</p>
                            <p className="mt-1 text-sm text-muted-foreground">
                              Due: {task.due_date ? formatDate(task.due_date) : "No due date"}
                            </p>
                            {task.description && (
                              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                                {task.description}
                              </p>
                            )}
                          </div>
                        </div>
                        {index < latestTasks.length - 1 && <Separator className="mt-4" />}
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title="No tasks assigned"
                    description="Tasks from admin will appear here."
                    icon={ListTodo}
                  />
                )}
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="border-border/70 shadow-none">
                <CardHeader>
                  <CardTitle className="text-xl">Teaching pulse</CardTitle>
                  <CardDescription>
                    A quick view of workflow health across tasks, students, and live sessions.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm text-muted-foreground">Task completion</p>
                      <span className="text-sm text-foreground">{taskCompletionRate}%</span>
                    </div>
                    <Progress value={taskCompletionRate} className="h-2 bg-muted" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm text-muted-foreground">Session coverage</p>
                      <span className="text-sm text-foreground">{meetingCoverage}%</span>
                    </div>
                    <Progress value={meetingCoverage} className="h-2 bg-muted" />
                  </div>

                  <Separator />

                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                    <div>
                      <p className="text-sm text-muted-foreground">Completed tasks</p>
                      <p className="mt-1 text-xl font-semibold text-foreground">{completedTasks}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Pending tasks</p>
                      <p className="mt-1 text-xl font-semibold text-foreground">{stats.pendingTasks}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/70 shadow-none">
                <CardHeader>
                  <CardTitle className="text-xl">Assigned students</CardTitle>
                  <CardDescription>
                    Snapshot of your current learners, schedules, and parent contact options.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <CardSkeleton count={3} />
                  ) : recentStudents.length ? (
                    <div className="space-y-4">
                      {recentStudents.map((student, index) => (
                        <div key={student.id}>
                          <div className="rounded-2xl border border-border/70 bg-background/50 p-4">
                            <div className="flex items-start gap-3">
                              <Avatar className="h-11 w-11 border border-border/70">
                                <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                                  {getInitials(student.full_name)}
                                </AvatarFallback>
                              </Avatar>

                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="font-medium text-foreground">{student.full_name}</p>
                                  <Badge variant="outline" className="border-border bg-muted text-muted-foreground">
                                    {student.grade ?? "No grade"}
                                  </Badge>
                                </div>
                                <p className="mt-1 text-sm text-muted-foreground">
                                  {student.curriculum ?? "Curriculum pending"}
                                </p>

                                <div className="mt-3 space-y-2 text-sm">
                                  <div className="flex justify-between gap-4">
                                    <span className="text-muted-foreground">Parent</span>
                                    <span className="text-right text-foreground">
                                      {student.parent?.full_name ?? "Not linked"}
                                    </span>
                                  </div>
                                  <div className="flex justify-between gap-4">
                                    <span className="text-muted-foreground">Schedule</span>
                                    <span className="text-right text-foreground">
                                      {formatSessionSchedule(student)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between gap-4">
                                    <span className="text-muted-foreground">Reminder</span>
                                    <span className="text-right text-foreground">
                                      {formatSessionReminder(student)}
                                    </span>
                                  </div>
                                </div>

                                <div className="mt-4 flex flex-wrap gap-2">
                                  <Button asChild size="sm" variant="outline">
                                    <Link to={`/teacher/messages?student=${student.student_id}`}>
                                      <MessageCircle className="h-3.5 w-3.5" />
                                      In-app chat
                                    </Link>
                                  </Button>

                                  {student.parent?.phone && (
                                    <Button asChild size="sm" variant="outline">
                                      <a
                                        href={buildWhatsAppLink(
                                          student.parent.phone,
                                          `Hello ${student.parent.full_name}, I'm reaching out about ${student.full_name}'s tutoring session.`,
                                        )}
                                        target="_blank"
                                        rel="noreferrer"
                                      >
                                        <MessageCircle className="h-3.5 w-3.5" />
                                        WhatsApp
                                      </a>
                                    </Button>
                                  )}

                                  {student.parent?.email && (
                                    <Button asChild size="sm" variant="outline">
                                      <a
                                        href={buildMailtoLink(
                                          student.parent.email,
                                          `${student.full_name} tutoring update`,
                                        )}
                                      >
                                        <Mail className="h-3.5 w-3.5" />
                                        Email
                                      </a>
                                    </Button>
                                  )}

                                  {student.meeting_link && (
                                    <Button asChild size="sm">
                                      <a href={student.meeting_link} target="_blank" rel="noreferrer">
                                        <Video className="h-3.5 w-3.5" />
                                        Join session
                                      </a>
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          {index < recentStudents.length - 1 && <Separator className="mt-4" />}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      title="No students assigned"
                      description="Students will appear here once admin links them to your tutor profile."
                      icon={Users}
                    />
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </TeacherLayout>
  );
}
