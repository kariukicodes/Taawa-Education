import { useEffect, useState } from "react";
import { ListTodo, Plus, Search, X } from "lucide-react";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { formatDate } from "@/lib/format";
import { CardSkeleton } from "@/components/ui/CardSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmActionDialog } from "@/components/ui/ConfirmActionDialog";
import { useAuth } from "@/contexts/AuthContext";
import { DEMO_DATA } from "@/lib/demoData";
import { toast } from "@/hooks/use-toast";
import { invokeSupabaseFunction } from "@/lib/invokeSupabaseFunction";
import { includesSearchTerm, sortByKey } from "@/lib/adminFilters";
import { reportClientError } from "@/lib/reportClientError";

type TaskRecord = {
  id: string;
  tutor_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  status: string;
  created_at?: string;
  tutors: { full_name: string } | null;
};

type TutorOption = {
  id: string;
  full_name: string;
};

export default function AdminTasks() {
  const { roleOverride, loading: authLoading, user } = useAuth();
  const [tasks, setTasks] = useState<TaskRecord[]>([]);
  const [tutors, setTutors] = useState<TutorOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskRecord | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [formError, setFormError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("due-asc");
  const [pendingDeleteTask, setPendingDeleteTask] = useState<TaskRecord | null>(null);
  const [form, setForm] = useState({
    tutor_id: "",
    title: "",
    description: "",
    due_date: "",
  });

  const isDemo =
    import.meta.env.DEV &&
    import.meta.env.VITE_ENABLE_DEMO_MODE === "true" &&
    roleOverride === "admin";

  const closeModal = () => {
    setShowModal(false);
    setEditingTask(null);
    setForm({ tutor_id: "", title: "", description: "", due_date: "" });
    setFormError("");
  };

  const fetchData = async (showLoader = true) => {
    if (showLoader) setLoading(true);

    if (isDemo) {
      setTasks(DEMO_DATA.admin.tasks.tasks as TaskRecord[]);
      setTutors(
        (DEMO_DATA.admin.students.tutors as any[]).map((tutor) => ({
          id: tutor.id,
          full_name: tutor.full_name,
        })),
      );
      if (showLoader) setLoading(false);
      return;
    }

    try {
      const { tasks, tutors } = await invokeSupabaseFunction<{
        tasks: TaskRecord[];
        tutors: TutorOption[];
      }>("list-tasks-admin", undefined);

      setTasks(tasks ?? []);
      setTutors(tutors ?? []);
    } catch (err) {
      reportClientError("AdminTasks.fetchData", err);
      const message = err instanceof Error ? err.message : String(err);
      toast({
        title: "Failed to load tasks",
        description: message,
        variant: "destructive",
      });
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!isDemo && !user) return;
    void fetchData();
  }, [isDemo, authLoading, user?.id]);

  const filteredTasks = sortByKey(
    tasks.filter((task) => {
      const matchesSearch = includesSearchTerm(
        [task.title, task.description, task.tutors?.full_name, task.status],
        search,
      );
      const matchesStatus = statusFilter === "all" || task.status === statusFilter;
      return matchesSearch && matchesStatus;
    }),
    (task) => {
      switch (sortBy) {
        case "title-asc":
          return task.title;
        case "status-asc":
          return task.status;
        case "tutor-asc":
          return task.tutors?.full_name ?? "";
        case "recent-desc":
          return task.created_at ?? "";
        case "due-asc":
        default:
          return task.due_date ?? "9999-12-31";
      }
    },
    sortBy === "recent-desc" ? "desc" : "asc",
  );

  const upsertTask = (task: TaskRecord) => {
    setTasks((prev) => {
      const exists = prev.some((item) => item.id === task.id);
      if (!exists) return [task, ...prev];
      return prev.map((item) => (item.id === task.id ? task : item));
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!form.tutor_id) {
      setFormError("Tutor selection is required.");
      return;
    }

    if (!form.title.trim()) {
      setFormError("Task title is required.");
      return;
    }

    try {
      if (isDemo) {
        const tutorName = tutors.find((tutor) => tutor.id === form.tutor_id)?.full_name;
        upsertTask({
          id: editingTask?.id ?? `demo_task_${Date.now()}`,
          tutor_id: form.tutor_id,
          title: form.title,
          description: form.description || null,
          due_date: form.due_date || null,
          status: editingTask?.status ?? "pending",
          tutors: tutorName ? { full_name: tutorName } : null,
        });
      } else {
        const { task } = await invokeSupabaseFunction<{ task: TaskRecord }>("manage-task-admin", {
          action: editingTask ? "update" : "create",
          task_id: editingTask?.id,
          tutor_id: form.tutor_id,
          title: form.title,
          description: form.description || null,
          due_date: form.due_date || null,
        });

        upsertTask(task);
      }

      toast({
        title: editingTask ? "Task updated" : "Task assigned",
        description: editingTask
          ? "Task details saved successfully."
          : "The task has been assigned to the tutor.",
      });
      closeModal();
      void fetchData(false);
    } catch (err) {
      reportClientError("AdminTasks.handleSubmit", err, {
        taskId: editingTask?.id,
      });
      const message = err instanceof Error ? err.message : String(err);
      setFormError(message);
      toast({
        title: editingTask ? "Failed to update task" : "Failed to assign task",
        description: message,
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async (task: TaskRecord, action: "mark_done" | "mark_pending") => {
    setSavingId(task.id);

    try {
      if (isDemo) {
        upsertTask({
          ...task,
          status: action === "mark_done" ? "done" : "pending",
        });
      } else {
        const { task: updatedTask } = await invokeSupabaseFunction<{ task: TaskRecord }>(
          "manage-task-admin",
          {
            action,
            task_id: task.id,
          },
        );

        upsertTask(updatedTask);
      }

      toast({
        title: action === "mark_done" ? "Task completed" : "Task reopened",
        description: `${task.title} is now ${action === "mark_done" ? "done" : "pending"}.`,
      });
    } catch (err) {
      reportClientError("AdminTasks.handleStatusChange", err, {
        taskId: task.id,
        action,
      });
      const message = err instanceof Error ? err.message : String(err);
      toast({
        title: "Failed to update task status",
        description: message,
        variant: "destructive",
      });
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (task: TaskRecord) => {
    setSavingId(task.id);

    try {
      if (isDemo) {
        setTasks((prev) => prev.filter((item) => item.id !== task.id));
      } else {
        await invokeSupabaseFunction("manage-task-admin", {
          action: "delete",
          task_id: task.id,
        });
        setTasks((prev) => prev.filter((item) => item.id !== task.id));
      }

      toast({
        title: "Task deleted",
        description: "The task has been removed.",
      });
    } catch (err) {
      reportClientError("AdminTasks.handleDelete", err, {
        taskId: task.id,
      });
      const message = err instanceof Error ? err.message : String(err);
      toast({
        title: "Failed to delete task",
        description: message,
        variant: "destructive",
      });
    } finally {
      setSavingId(null);
      setPendingDeleteTask(null);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Tasks</h2>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            <Plus size={16} />
            Assign Task
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, tutor, or status..."
              className="w-full rounded-lg border border-border bg-muted py-2 pl-10 pr-4 text-sm text-foreground focus:border-primary focus:outline-none"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-border bg-muted px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="done">Done</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-lg border border-border bg-muted px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
          >
            <option value="due-asc">Sort by Due Date</option>
            <option value="recent-desc">Sort by Newest</option>
            <option value="title-asc">Sort by Title</option>
            <option value="tutor-asc">Sort by Tutor</option>
            <option value="status-asc">Sort by Status</option>
          </select>
        </div>

        {loading ? (
          <CardSkeleton count={4} />
        ) : filteredTasks.length === 0 ? (
          <EmptyState
            title="No tasks assigned"
            description="Create a task to assign to a tutor."
            icon={ListTodo}
          />
        ) : (
          <div className="space-y-3">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className={`rounded-xl border border-border bg-card p-4 ${
                  task.status === "done" ? "opacity-70" : ""
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className={`font-medium text-foreground ${task.status === "done" ? "line-through" : ""}`}>
                      {task.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {task.tutors?.full_name} | Due: {task.due_date ? formatDate(task.due_date) : "No date"}
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

                {task.description && <p className="mt-2 text-sm text-muted-foreground">{task.description}</p>}

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingTask(task);
                      setForm({
                        tutor_id: task.tutor_id,
                        title: task.title,
                        description: task.description ?? "",
                        due_date: task.due_date ?? "",
                      });
                      setFormError("");
                      setShowModal(true);
                    }}
                    className="rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground hover:bg-muted"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    disabled={savingId === task.id}
                    onClick={() => void handleStatusChange(task, task.status === "done" ? "mark_pending" : "mark_done")}
                    className="rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground hover:bg-muted disabled:opacity-50"
                  >
                    {task.status === "done" ? "Mark Pending" : "Mark Done"}
                  </button>
                  <button
                    type="button"
                    disabled={savingId === task.id}
                    onClick={() => setPendingDeleteTask(task)}
                    className="rounded-lg border border-destructive/30 px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmActionDialog
        open={Boolean(pendingDeleteTask)}
        onOpenChange={(open) => {
          if (!open) setPendingDeleteTask(null);
        }}
        title="Delete task?"
        description={
          pendingDeleteTask
            ? `This removes the task "${pendingDeleteTask.title}" from the tutor workflow.`
            : ""
        }
        confirmLabel="Delete Task"
        onConfirm={() => pendingDeleteTask && handleDelete(pendingDeleteTask)}
      />

      {showModal && (
        <>
          <div className="fixed inset-0 z-40 bg-background/60" onClick={closeModal} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-lg rounded-xl border border-border bg-card p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">
                  {editingTask ? "Edit Task" : "Assign New Task"}
                </h3>
                <button onClick={closeModal}>
                  <X className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {formError && (
                  <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                    {formError}
                  </div>
                )}

                <select
                  value={form.tutor_id}
                  onChange={(e) => setForm({ ...form, tutor_id: e.target.value })}
                  required
                  className="w-full rounded-lg border border-border bg-muted px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                >
                  <option value="">Select Tutor</option>
                  {tutors.map((tutor) => (
                    <option key={tutor.id} value={tutor.id}>
                      {tutor.full_name}
                    </option>
                  ))}
                </select>

                <input
                  placeholder="Task Title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                  className="w-full rounded-lg border border-border bg-muted px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                />

                <textarea
                  placeholder="Description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full rounded-lg border border-border bg-muted px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                />

                <input
                  type="date"
                  value={form.due_date}
                  onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                  className="w-full rounded-lg border border-border bg-muted px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                />

                <button
                  type="submit"
                  className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  {editingTask ? "Save Task" : "Assign Task"}
                </button>
              </form>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
