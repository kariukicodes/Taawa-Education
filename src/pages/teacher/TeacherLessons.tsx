import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { TeacherLayout } from "@/components/layouts/TeacherLayout";
import { formatDate } from "@/lib/format";
import { CardSkeleton } from "@/components/ui/CardSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { PenTool } from "lucide-react";

export default function TeacherLessons() {
  const { user } = useAuth();
  const [tutorId, setTutorId] = useState<string | null>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ student_id: "", subject: "", date: "", topics_covered: "", homework: "", performance_rating: "", comments: "" });

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data: tutor } = await supabase.from("tutors").select("id").eq("user_id", user.id).single();
      if (!tutor) { setLoading(false); return; }
      setTutorId(tutor.id);
      const { data: assignments } = await supabase.from("tutor_assignments").select("students(id, full_name, subjects)").eq("tutor_id", tutor.id);
      setStudents(assignments?.map((a) => a.students).filter(Boolean) ?? []);
      const { data: l } = await supabase.from("lessons").select("*, students(full_name)").eq("tutor_id", tutor.id).order("date", { ascending: false });
      setLessons(l ?? []);
      setLoading(false);
    };
    fetch();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tutorId) return;
    setSubmitting(true);
    await supabase.from("lessons").insert({
      tutor_id: tutorId, student_id: form.student_id, subject: form.subject, date: form.date,
      topics_covered: form.topics_covered, homework: form.homework,
      performance_rating: form.performance_rating || null, comments: form.comments || null,
    });
    setForm({ student_id: "", subject: "", date: "", topics_covered: "", homework: "", performance_rating: "", comments: "" });
    setSubmitting(false);
    const { data } = await supabase.from("lessons").select("*, students(full_name)").eq("tutor_id", tutorId).order("date", { ascending: false });
    setLessons(data ?? []);
  };

  const selectedStudent = students.find((s: any) => s.id === form.student_id) as any;

  const ratingColors: Record<string, string> = {
    Excellent: "bg-secondary/20 text-secondary",
    Good: "bg-primary/20 text-primary",
    "Needs Improvement": "bg-destructive/20 text-destructive",
  };

  return (
    <TeacherLayout>
      <div className="space-y-8">
        <h2 className="text-2xl font-bold text-foreground">Lesson Log</h2>

        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="mb-4 text-lg font-semibold text-foreground">Submit Lesson Report</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <select value={form.student_id} onChange={(e) => setForm({ ...form, student_id: e.target.value, subject: "" })} required className="rounded-lg border border-border bg-muted px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none">
                <option value="">Select Student</option>
                {students.map((s: any) => <option key={s.id} value={s.id}>{s.full_name}</option>)}
              </select>
              <select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required className="rounded-lg border border-border bg-muted px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none">
                <option value="">Subject</option>
                {selectedStudent?.subjects?.map((sub: string) => <option key={sub} value={sub}>{sub}</option>)}
              </select>
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required className="rounded-lg border border-border bg-muted px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none" />
            </div>
            <textarea placeholder="Topics Covered" value={form.topics_covered} onChange={(e) => setForm({ ...form, topics_covered: e.target.value })} rows={2} required className="w-full rounded-lg border border-border bg-muted px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none" />
            <textarea placeholder="Homework Given" value={form.homework} onChange={(e) => setForm({ ...form, homework: e.target.value })} rows={2} className="w-full rounded-lg border border-border bg-muted px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none" />
            <div>
              <p className="mb-2 text-sm font-medium text-foreground">Performance Rating</p>
              <div className="flex flex-wrap gap-2">
                {["Excellent", "Good", "Needs Improvement"].map((r) => (
                  <button key={r} type="button" onClick={() => setForm({ ...form, performance_rating: r })}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${form.performance_rating === r ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <textarea placeholder="Tutor Comments (optional)" value={form.comments} onChange={(e) => setForm({ ...form, comments: e.target.value })} rows={2} className="w-full rounded-lg border border-border bg-muted px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none" />
            <button type="submit" disabled={submitting} className="rounded-lg bg-primary px-8 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
              {submitting ? "Submitting..." : "Submit Report"}
            </button>
          </form>
        </div>

        <div>
          <h3 className="mb-4 text-lg font-semibold text-foreground">Report History</h3>
          {loading ? <CardSkeleton count={4} /> : lessons.length === 0 ? (
            <EmptyState title="No reports submitted" description="Your lesson reports will appear here." icon={PenTool} />
          ) : (
            <div className="space-y-3">
              {lessons.map((l) => (
                <div key={l.id} className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">{l.students?.full_name} — {l.subject}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(l.date)}</p>
                    </div>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${ratingColors[l.performance_rating] ?? "bg-muted text-muted-foreground"}`}>
                      {l.performance_rating}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{l.topics_covered}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </TeacherLayout>
  );
}
