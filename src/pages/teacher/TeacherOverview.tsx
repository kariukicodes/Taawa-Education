import { useEffect, useState } from "react";
import { FileText, ListTodo, Users, Video } from "lucide-react";

import { TeacherLayout } from "@/components/layouts/TeacherLayout";
import { KpiSkeleton } from "@/components/ui/KpiSkeleton";
import { CardSkeleton } from "@/components/ui/CardSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAuth } from "@/contexts/AuthContext";
import { DEMO_DATA } from "@/lib/demoData";
import { formatDate } from "@/lib/format";
import { invokeSupabaseFunction } from "@/lib/invokeSupabaseFunction";
import { reportClientError } from "@/lib/reportClientError";
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
            activeMeetingLinks: 0,
            reportsThisWeek: DEMO_DATA.teacher.reports.reports.length,
          },
          students: [],
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
        const message = err instanceof Error ? err.message : String(err);
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

  return (
    <TeacherLayout>
      {loadError && !loading ? (
        <EmptyState title="Dashboard unavailable" description={loadError} icon={Users} />
      ) : (
        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-foreground">
            Welcome back, {dashboard?.tutor.full_name.split(" ")[0] ?? "Tutor"}
          </h2>

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
            ) : dashboard?.tasks.length ? (
              <div className="space-y-3">
                {dashboard.tasks.map((task) => (
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
        </div>
      )}
    </TeacherLayout>
  );
}
