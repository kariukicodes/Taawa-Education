import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FileText, ListTodo, Mail, MessageCircle, Users, Video } from "lucide-react";

import { TeacherLayout } from "@/components/layouts/TeacherLayout";
import { KpiSkeleton } from "@/components/ui/KpiSkeleton";
import { CardSkeleton } from "@/components/ui/CardSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
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
    { label: "Assigned Students", value: stats.assignedStudents, icon: Users },
    { label: "Pending Tasks", value: stats.pendingTasks, icon: ListTodo },
    { label: "Live Meeting Links", value: stats.activeMeetingLinks, icon: Video },
    { label: "Reports This Week", value: stats.reportsThisWeek, icon: FileText },
  ];

  const recentStudents = useMemo(() => (dashboard?.students ?? []).slice(0, 3), [dashboard?.students]);
  const latestTasks = dashboard?.tasks ?? [];

  return (
    <TeacherLayout>
      {loadError && !loading ? (
        <EmptyState title="Tutor overview unavailable" description={loadError} icon={Users} />
      ) : (
        <div className="space-y-8">
          <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                Welcome back, {dashboard?.tutor.full_name.split(" ")[0] ?? "Tutor"}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Track your assigned learners, upcoming sessions, and current tasks from one place.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  dashboard?.tutor.status === "active"
                    ? "bg-secondary/20 text-secondary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {dashboard?.tutor.status === "active" ? "Active Tutor" : "Inactive Tutor"}
              </span>
              <Link
                to="/teacher/students"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                <Users className="h-4 w-4" />
                View Students
              </Link>
            </div>
          </div>

          {loading ? (
            <KpiSkeleton />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {cards.map((card) => (
                <div key={card.label} className="rounded-xl border border-border bg-card p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">{card.label}</p>
                    <card.icon className="h-5 w-5 text-primary" />
                  </div>
                  <p className="mt-2 text-2xl font-bold text-foreground">{card.value}</p>
                </div>
              ))}
            </div>
          )}

          <div>
            <h3 className="mb-4 text-lg font-semibold text-foreground">Latest Tasks</h3>
            {loading ? (
              <CardSkeleton count={3} />
            ) : latestTasks.length ? (
              <div className="space-y-3">
                {latestTasks.map((task) => (
                  <div key={task.id} className="rounded-xl border border-border bg-card p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-medium text-foreground">{task.title}</p>
                        <p className="text-xs text-muted-foreground">
                          Due: {task.due_date ? formatDate(task.due_date) : "No date"}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          task.status === "done"
                            ? "bg-secondary/20 text-secondary"
                            : "bg-primary/20 text-primary"
                        }`}
                      >
                        {task.status}
                      </span>
                    </div>
                    {task.description && (
                      <p className="mt-2 text-sm text-muted-foreground">{task.description}</p>
                    )}
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
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold text-foreground">Assigned Students Snapshot</h3>
            {loading ? (
              <CardSkeleton count={3} />
            ) : recentStudents.length ? (
              <div className="grid gap-4 xl:grid-cols-3">
                {recentStudents.map((student) => (
                  <div key={student.id} className="rounded-xl border border-border bg-card p-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary">
                        {student.full_name
                          .split(" ")
                          .map((name) => name[0])
                          .join("")}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{student.full_name}</p>
                        <p className="text-xs text-muted-foreground">
                          Age {student.age ?? "-"} | Grade {student.grade ?? "-"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2 text-sm">
                      <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground">Curriculum</span>
                        <span className="text-right text-foreground">{student.curriculum ?? "-"}</span>
                      </div>
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
                      <Link
                        to={`/teacher/messages?student=${student.student_id}`}
                        className="inline-flex items-center gap-1 rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-xs font-medium text-primary hover:bg-primary/15"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                        In-App Chat
                      </Link>
                      {student.parent?.phone && (
                        <a
                          href={buildWhatsAppLink(
                            student.parent.phone,
                            `Hello ${student.parent.full_name}, I'm reaching out about ${student.full_name}'s tutoring session.`,
                          )}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground hover:bg-muted"
                        >
                          <MessageCircle className="h-3.5 w-3.5" />
                          WhatsApp
                        </a>
                      )}
                      {student.parent?.email && (
                        <a
                          href={buildMailtoLink(
                            student.parent.email,
                            `${student.full_name} tutoring update`,
                          )}
                          className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground hover:bg-muted"
                        >
                          <Mail className="h-3.5 w-3.5" />
                          Email
                        </a>
                      )}
                      {student.meeting_link && (
                        <a
                          href={student.meeting_link}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90"
                        >
                          <Video className="h-3.5 w-3.5" />
                          Join Session
                        </a>
                      )}
                    </div>
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
          </div>
        </div>
      )}
    </TeacherLayout>
  );
}
