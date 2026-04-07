import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { Plus, X, GraduationCap } from "lucide-react";
import { formatDate } from "@/lib/format";
import { CardSkeleton } from "@/components/ui/CardSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAuth } from "@/contexts/AuthContext";
import { DEMO_DATA } from "@/lib/demoData";

export default function AdminStudents() {
  const { roleOverride } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [parents, setParents] = useState<any[]>([]);
  const [tutors, setTutors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ full_name: "", age: "", grade: "", curriculum: "CBC", parent_id: "", tutor_id: "", subjects: "", start_date: "" });

  const isDemo = import.meta.env.DEV && roleOverride === "admin";

  const fetchData = async () => {
    if (isDemo) {
      setLoading(true);
      setStudents(DEMO_DATA.admin.students.students);
      setParents(DEMO_DATA.admin.students.parents);
      setTutors(DEMO_DATA.admin.students.tutors);
      setLoading(false);
      return;
    }

    const [s, p, t] = await Promise.all([
      supabase.from("students").select("*, parents(full_name), tutor_assignments(tutors(full_name))"),
      supabase.from("parents").select("id, full_name"),
      supabase.from("tutors").select("id, full_name"),
    ]);
    setStudents(s.data ?? []);
    setParents(p.data ?? []);
    setTutors(t.data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [isDemo]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const subjects = form.subjects.split(",").map((s) => s.trim()).filter(Boolean);

    if (isDemo) {
      const parentName = parents.find((p) => p.id === form.parent_id)?.full_name;
      const tutorName = tutors.find((t) => t.id === form.tutor_id)?.full_name;
      const demoStudent = {
        id: `demo_student_${Date.now()}`,
        full_name: form.full_name,
        age: parseInt(form.age) || 0,
        grade: form.grade,
        curriculum: form.curriculum,
        parent_id: form.parent_id,
        parents: parentName ? { full_name: parentName } : null,
        subjects,
        start_date: form.start_date || null,
        tutor_assignments: tutorName ? [{ tutors: { full_name: tutorName } }] : [],
      };
      setStudents((prev) => [demoStudent, ...prev]);
      setShowModal(false);
      setForm({ full_name: "", age: "", grade: "", curriculum: "CBC", parent_id: "", tutor_id: "", subjects: "", start_date: "" });
      return;
    }

    const { data: student } = await supabase.from("students").insert({
      full_name: form.full_name, age: parseInt(form.age), grade: form.grade,
      curriculum: form.curriculum as any, parent_id: form.parent_id, subjects, start_date: form.start_date || undefined,
    }).select().single();
    if (student && form.tutor_id) {
      await supabase.from("tutor_assignments").insert({ tutor_id: form.tutor_id, student_id: student.id });
    }
    setShowModal(false);
    setForm({ full_name: "", age: "", grade: "", curriculum: "CBC", parent_id: "", tutor_id: "", subjects: "", start_date: "" });
    fetchData();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Students</h2>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
            <Plus size={16} />Add Student
          </button>
        </div>

        {loading ? <CardSkeleton count={6} /> : students.length === 0 ? (
          <EmptyState title="No students enrolled" description="Add your first student to get started." icon={GraduationCap} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {students.map((s) => {
              const tutorName = s.tutor_assignments?.[0]?.tutors?.full_name;
              return (
                <div key={s.id} className="card-hover-glow rounded-xl border border-border bg-card p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary">
                      {s.full_name?.split(" ").map((n: string) => n[0]).join("")}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{s.full_name}</p>
                      <p className="text-xs text-muted-foreground">Grade {s.grade}</p>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Curriculum</span><span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs text-primary">{s.curriculum}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Tutor</span><span className="text-foreground">{tutorName ?? "Unassigned"}</span></div>
                    {s.start_date && <div className="flex justify-between"><span className="text-muted-foreground">Started</span><span className="text-foreground">{formatDate(s.start_date)}</span></div>}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {s.subjects?.map((sub: string) => (<span key={sub} className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">{sub}</span>))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showModal && (
        <>
          <div className="fixed inset-0 z-40 bg-background/60" onClick={() => setShowModal(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-lg rounded-xl border border-border bg-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Add New Student</h3>
                <button onClick={() => setShowModal(false)}><X className="h-5 w-5 text-muted-foreground" /></button>
              </div>
              <form onSubmit={handleAdd} className="space-y-4">
                <input placeholder="Full Name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required className="w-full rounded-lg border border-border bg-muted px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none" />
                <div className="grid grid-cols-2 gap-4">
                  <input type="number" placeholder="Age" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} required className="rounded-lg border border-border bg-muted px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none" />
                  <input placeholder="Grade" value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })} required className="rounded-lg border border-border bg-muted px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none" />
                </div>
                <select value={form.curriculum} onChange={(e) => setForm({ ...form, curriculum: e.target.value })} className="w-full rounded-lg border border-border bg-muted px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none">
                  {["CBC", "British", "Montessori", "Custom"].map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <select value={form.parent_id} onChange={(e) => setForm({ ...form, parent_id: e.target.value })} required className="w-full rounded-lg border border-border bg-muted px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none">
                  <option value="">Select Parent</option>
                  {parents.map((p) => <option key={p.id} value={p.id}>{p.full_name}</option>)}
                </select>
                <select value={form.tutor_id} onChange={(e) => setForm({ ...form, tutor_id: e.target.value })} className="w-full rounded-lg border border-border bg-muted px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none">
                  <option value="">Assign Tutor (optional)</option>
                  {tutors.map((t) => <option key={t.id} value={t.id}>{t.full_name}</option>)}
                </select>
                <input placeholder="Subjects (comma separated)" value={form.subjects} onChange={(e) => setForm({ ...form, subjects: e.target.value })} className="w-full rounded-lg border border-border bg-muted px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none" />
                <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} className="w-full rounded-lg border border-border bg-muted px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none" />
                <button type="submit" className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">Add Student</button>
              </form>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
