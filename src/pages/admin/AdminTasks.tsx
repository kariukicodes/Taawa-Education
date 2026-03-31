import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { Plus, X, ListTodo } from "lucide-react";
import { formatDate } from "@/lib/format";
import { CardSkeleton } from "@/components/ui/CardSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";

export default function AdminTasks() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [tutors, setTutors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ tutor_id: "", title: "", description: "", due_date: "" });

  const fetchData = async () => {
    const [t, tu] = await Promise.all([
      supabase.from("tasks").select("*, tutors(full_name)").order("due_date"),
      supabase.from("tutors").select("id, full_name"),
    ]);
    setTasks(t.data ?? []);
    setTutors(tu.data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.from("tasks").insert({ tutor_id: form.tutor_id, title: form.title, description: form.description, due_date: form.due_date || null });
    setShowModal(false);
    setForm({ tutor_id: "", title: "", description: "", due_date: "" });
    fetchData();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Tasks</h2>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
            <Plus size={16} />Assign Task
          </button>
        </div>

        {loading ? <CardSkeleton count={4} /> : tasks.length === 0 ? (
          <EmptyState title="No tasks assigned" description="Create a task to assign to a tutor." icon={ListTodo} />
        ) : (
          <div className="space-y-3">
            {tasks.map((t) => (
              <div key={t.id} className={`rounded-xl border border-border bg-card p-4 ${t.status === "done" ? "opacity-60" : ""}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`font-medium text-foreground ${t.status === "done" ? "line-through" : ""}`}>{t.title}</p>
                    <p className="text-xs text-muted-foreground">{t.tutors?.full_name} • Due: {t.due_date ? formatDate(t.due_date) : "No date"}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${t.status === "done" ? "bg-secondary/20 text-secondary" : "bg-primary/20 text-primary"}`}>
                    {t.status}
                  </span>
                </div>
                {t.description && <p className="mt-2 text-sm text-muted-foreground">{t.description}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <>
          <div className="fixed inset-0 z-40 bg-background/60" onClick={() => setShowModal(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-lg rounded-xl border border-border bg-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Assign New Task</h3>
                <button onClick={() => setShowModal(false)}><X className="h-5 w-5 text-muted-foreground" /></button>
              </div>
              <form onSubmit={handleAdd} className="space-y-4">
                <select value={form.tutor_id} onChange={(e) => setForm({ ...form, tutor_id: e.target.value })} required className="w-full rounded-lg border border-border bg-muted px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none">
                  <option value="">Select Tutor</option>
                  {tutors.map((t) => <option key={t.id} value={t.id}>{t.full_name}</option>)}
                </select>
                <input placeholder="Task Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className="w-full rounded-lg border border-border bg-muted px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none" />
                <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full rounded-lg border border-border bg-muted px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none" />
                <input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} className="w-full rounded-lg border border-border bg-muted px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none" />
                <button type="submit" className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">Assign Task</button>
              </form>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
