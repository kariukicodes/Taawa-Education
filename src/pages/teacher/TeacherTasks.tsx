import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { TeacherLayout } from "@/components/layouts/TeacherLayout";
import { formatDate } from "@/lib/format";
import { CardSkeleton } from "@/components/ui/CardSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ListTodo } from "lucide-react";
import { DEMO_DATA } from "@/lib/demoData";

export default function TeacherTasks() {
  const { user, roleOverride } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const isDemo = import.meta.env.DEV && roleOverride === "teacher";

  useEffect(() => {
    if (!user) return;

    if (isDemo) {
      setLoading(true);
      setLoadError(null);
      setTasks(DEMO_DATA.teacher.tasks.tasks);
      setLoading(false);
      return;
    }

    const fetch = async () => {
      setLoading(true);
      setLoadError(null);

      try {
        const { data: tutor, error: tutorError } = await supabase
          .from("tutors")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (tutorError) throw tutorError;

        if (!tutor) {
          setLoadError("No tutor record was found for this account. Ask an admin to create a row in tutors for your user.");
          setTasks([]);
          return;
        }

        const { data, error } = await supabase
          .from("tasks")
          .select("*")
          .eq("tutor_id", tutor.id)
          .order("due_date");

        if (error) throw error;
        setTasks(data ?? []);
      } catch (err) {
        console.error("TeacherTasks load failed", err);
        setLoadError("We couldn't load your tasks.");
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [user, isDemo]);

  const toggleStatus = async (id: string, current: string) => {
    const next = current === "pending" ? "done" : "pending";
    if (!isDemo) {
      await supabase.from("tasks").update({ status: next }).eq("id", id);
    }
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: next } : t)));
  };

  return (
    <TeacherLayout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground">Tasks</h2>

        {loadError && !loading && (
          <EmptyState title="Account setup needed" description={loadError} icon={ListTodo} />
        )}

        {loading ? <CardSkeleton count={4} /> : loadError ? null : tasks.length === 0 ? (
          <EmptyState title="No tasks assigned" description="Tasks from admin will appear here." icon={ListTodo} />
        ) : (
          <div className="space-y-3">
            {tasks.map((t) => (
              <div key={t.id} className={`rounded-xl border border-border bg-card p-4 ${t.status === "done" ? "opacity-60" : ""}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <p className={`font-medium text-foreground ${t.status === "done" ? "line-through" : ""}`}>{t.title}</p>
                    <p className="text-xs text-muted-foreground">Due: {t.due_date ? formatDate(t.due_date) : "No date"}</p>
                  </div>
                  <button onClick={() => toggleStatus(t.id, t.status)}
                    className={`rounded-lg px-4 py-1.5 text-xs font-medium transition-colors ${t.status === "done" ? "bg-secondary/20 text-secondary" : "bg-primary text-primary-foreground hover:bg-primary/90"}`}>
                    {t.status === "done" ? "Done ✓" : "Mark Done"}
                  </button>
                </div>
                {t.description && <p className="mt-2 text-sm text-muted-foreground">{t.description}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </TeacherLayout>
  );
}
