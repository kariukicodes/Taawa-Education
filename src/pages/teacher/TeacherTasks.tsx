import { useEffect, useState } from "react";
import { ListTodo } from "lucide-react";

import { TeacherLayout } from "@/components/layouts/TeacherLayout";
import { formatDate } from "@/lib/format";
import { CardSkeleton } from "@/components/ui/CardSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAuth } from "@/contexts/AuthContext";
import { DEMO_DATA } from "@/lib/demoData";
import { invokeSupabaseFunction } from "@/lib/invokeSupabaseFunction";
import { reportClientError } from "@/lib/reportClientError";
import { toast } from "@/hooks/use-toast";

type TaskRecord = {
  id: string;
  tutor_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  status: string;
  created_at?: string;
};

type TeacherWorkspaceResponse = {
  tasks: TaskRecord[];
};

export default function TeacherTasks() {
  const { user, roleOverride, loading: authLoading } = useAuth();
  const [tasks, setTasks] = useState<TaskRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const isDemo =
    import.meta.env.DEV &&
    import.meta.env.VITE_ENABLE_DEMO_MODE === "true" &&
    roleOverride === "teacher";

  const fetchTasks = async () => {
    setLoading(true);
    setLoadError(null);

    if (isDemo) {
      setTasks(DEMO_DATA.teacher.tasks.tasks);
      setLoading(false);
      return;
    }

    try {
      const data = await invokeSupabaseFunction<TeacherWorkspaceResponse>(
        "get-teacher-workspace",
        undefined,
      );
      setTasks(data.tasks ?? []);
    } catch (err) {
      reportClientError("TeacherTasks.fetchTasks", err);
      const message = err instanceof Error ? err.message : String(err);
      setLoadError(message);
      setTasks([]);
      toast({
        title: "Failed to load tasks",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!isDemo && !user) return;
    void fetchTasks();
  }, [authLoading, isDemo, user?.id]);

  const toggleStatus = async (task: TaskRecord) => {
    const action = task.status === "pending" ? "mark_done" : "mark_pending";

    if (isDemo) {
      setTasks((prev) =>
        prev.map((item) =>
          item.id === task.id
            ? { ...item, status: action === "mark_done" ? "done" : "pending" }
            : item,
        ),
      );
      return;
    }

    try {
      const { task: updatedTask } = await invokeSupabaseFunction<{ task: TaskRecord }>(
        "manage-teacher-task",
        {
          action,
          task_id: task.id,
        },
      );

      setTasks((prev) => prev.map((item) => (item.id === task.id ? updatedTask : item)));
    } catch (err) {
      reportClientError("TeacherTasks.toggleStatus", err, {
        taskId: task.id,
        action,
      });
      const message = err instanceof Error ? err.message : String(err);
      toast({
        title: "Failed to update task",
        description: message,
        variant: "destructive",
      });
    }
  };

  return (
    <TeacherLayout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground">Tasks</h2>

        {loadError && !loading && (
          <EmptyState title="Account setup needed" description={loadError} icon={ListTodo} />
        )}

        {loading ? (
          <CardSkeleton count={4} />
        ) : loadError ? null : tasks.length === 0 ? (
          <EmptyState
            title="No tasks assigned"
            description="Tasks from admin will appear here."
            icon={ListTodo}
          />
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`rounded-xl border border-border bg-card p-4 ${
                  task.status === "done" ? "opacity-60" : ""
                }`}
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p
                      className={`font-medium text-foreground ${
                        task.status === "done" ? "line-through" : ""
                      }`}
                    >
                      {task.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Due: {task.due_date ? formatDate(task.due_date) : "No date"}
                    </p>
                  </div>

                  <button
                    onClick={() => void toggleStatus(task)}
                    className={`rounded-lg px-4 py-1.5 text-xs font-medium transition-colors ${
                      task.status === "done"
                        ? "bg-secondary/20 text-secondary"
                        : "bg-primary text-primary-foreground hover:bg-primary/90"
                    }`}
                  >
                    {task.status === "done" ? "Done" : "Mark Done"}
                  </button>
                </div>

                {task.description && (
                  <p className="mt-2 text-sm text-muted-foreground">{task.description}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </TeacherLayout>
  );
}
