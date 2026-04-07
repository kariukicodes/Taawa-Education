import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { TeacherLayout } from "@/components/layouts/TeacherLayout";
import { formatDate } from "@/lib/format";
import { CardSkeleton } from "@/components/ui/CardSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { PenTool } from "lucide-react";
import { DEMO_DATA } from "@/lib/demoData";

export default function TeacherLessons() {
  const { user, roleOverride } = useAuth();
  const [tutorId, setTutorId] = useState<string | null>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ student_id: "", subject: "", date: "", topics_covered: "", homework: "", performance_rating: "", comments: "" });

  const isDemo = import.meta.env.DEV && roleOverride === "teacher";

  useEffect(() => {
    if (!user) return;

    if (isDemo) {
      setLoading(true);
      setLoadError(null);
      setTutorId("demo_tutor");
      setStudents(DEMO_DATA.teacher.students);
      setLessons(DEMO_DATA.teacher.lessons.lessons);
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
          setTutorId(null);
          setStudents([]);
          setLessons([]);
          return;
        }

        setTutorId(tutor.id);
        const { data: assignments, error: assignmentsError } = await supabase
          .from("tutor_assignments")
          .select("students(id, full_name, subjects)")
          .eq("tutor_id", tutor.id);

        if (assignmentsError) throw assignmentsError;
        setStudents(assignments?.map((a) => a.students).filter(Boolean) ?? []);

        const { data: l, error: lessonsError } = await supabase
          .from("lessons")
          .select("*, students(full_name)")
          .eq("tutor_id", tutor.id)
          .order("date", { ascending: false });

        if (lessonsError) throw lessonsError;
        setLessons(l ?? []);
      } catch (err) {
        console.error("TeacherLessons load failed", err);
        setLoadError("We couldn't load your lesson log.");
        setTutorId(null);
        setStudents([]);
        setLessons([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [user, isDemo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tutorId) return;
    setSubmitting(true);

    if (isDemo) {
      const student = students.find((s: any) => s.id === form.student_id);
      const demoLesson = {
        id: `demo_lesson_${Date.now()}`,
        tutor_id: tutorId,
        student_id: form.student_id,
        subject: form.subject,
        date: form.date,
        topics_covered: form.topics_covered,
        homework: form.homework || null,
        performance_rating: form.performance_rating || null,
        comments: form.comments || null,
        students: student ? { full_name: student.full_name } : null,
      };
      setLessons((prev) => [demoLesson, ...prev]);
      setForm({ student_id: "", subject: "", date: "", topics_covered: "", homework: "", performance_rating: "", comments: "" });
      setSubmitting(false);
      return;
    }

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
      {loadError ? (
        <EmptyState title="Account setup needed" description={loadError} icon={PenTool} />
      ) : (
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
      )}
    </TeacherLayout>
  );
}
