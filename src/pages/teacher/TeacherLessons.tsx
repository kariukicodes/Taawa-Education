import { useEffect, useState } from "react";
import { PenTool } from "lucide-react";

import { TeacherLayout } from "@/components/layouts/TeacherLayout";
import { formatDate } from "@/lib/format";
import { CardSkeleton } from "@/components/ui/CardSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAuth } from "@/contexts/AuthContext";
import { DEMO_DATA } from "@/lib/demoData";
import { invokeSupabaseFunction } from "@/lib/invokeSupabaseFunction";
import { reportClientError } from "@/lib/reportClientError";
import { toast } from "@/hooks/use-toast";

type StudentOption = {
  id: string;
  full_name: string;
  subjects?: string[] | null;
};

type LessonRecord = {
  id: string;
  student_id: string;
  tutor_id: string;
  subject: string;
  date: string;
  topics_covered: string | null;
  homework: string | null;
  performance_rating: string | null;
  comments: string | null;
  created_at?: string;
  students: { full_name: string };
};

type TeacherWorkspaceResponse = {
  students: StudentOption[];
  lessons: LessonRecord[];
};

export default function TeacherLessons() {
  const today = new Date().toISOString().slice(0, 10);
  const { user, roleOverride, loading: authLoading } = useAuth();
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [lessons, setLessons] = useState<LessonRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    student_id: "",
    subject: "",
    date: today,
    topics_covered: "",
    homework: "",
    performance_rating: "",
    comments: "",
  });

  const isDemo =
    import.meta.env.DEV &&
    import.meta.env.VITE_ENABLE_DEMO_MODE === "true" &&
    roleOverride === "teacher";

  const fetchLessons = async () => {
    setLoading(true);
    setLoadError(null);

    if (isDemo) {
      setStudents(DEMO_DATA.teacher.students);
      setLessons(DEMO_DATA.teacher.lessons.lessons);
      setLoading(false);
      return;
    }

    try {
      const data = await invokeSupabaseFunction<TeacherWorkspaceResponse>(
        "get-teacher-workspace",
        undefined,
      );
      setStudents(data.students ?? []);
      setLessons(data.lessons ?? []);
    } catch (err) {
      reportClientError("TeacherLessons.fetchLessons", err);
      const message = err instanceof Error ? err.message : String(err);
      setLoadError(message);
      setStudents([]);
      setLessons([]);
      toast({
        title: "Failed to load lesson log",
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
    void fetchLessons();
  }, [authLoading, isDemo, user?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (isDemo) {
        const student = students.find((item) => item.id === form.student_id);
        const lesson: LessonRecord = {
          id: `demo_lesson_${Date.now()}`,
          student_id: form.student_id,
          tutor_id: "demo_tutor",
          subject: form.subject,
          date: form.date,
          topics_covered: form.topics_covered,
          homework: form.homework || null,
          performance_rating: form.performance_rating || null,
          comments: form.comments || null,
          students: { full_name: student?.full_name ?? "Student" },
        };
        setLessons((prev) => [lesson, ...prev]);
      } else {
        const { lesson } = await invokeSupabaseFunction<{ lesson: LessonRecord }>(
          "create-teacher-lesson",
          {
            student_id: form.student_id,
            subject: form.subject,
            date: form.date,
            topics_covered: form.topics_covered,
            homework: form.homework || null,
            performance_rating: form.performance_rating || null,
            comments: form.comments || null,
          },
        );

        setLessons((prev) => [lesson, ...prev]);
      }

      setForm({
        student_id: "",
        subject: "",
        date: today,
        topics_covered: "",
        homework: "",
        performance_rating: "",
        comments: "",
      });

      toast({
        title: "Lesson report submitted",
        description: "The lesson report was saved successfully.",
      });
    } catch (err) {
      reportClientError("TeacherLessons.handleSubmit", err);
      const message = err instanceof Error ? err.message : String(err);
      toast({
        title: "Failed to submit report",
        description: message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const selectedStudent = students.find((student) => student.id === form.student_id);

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
                <select
                  value={form.student_id}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      student_id: e.target.value,
                      subject: "",
                    }))
                  }
                  required
                  className="rounded-lg border border-border bg-muted px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                >
                  <option value="">Select Student</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.full_name}
                    </option>
                  ))}
                </select>

                <input
                  value={form.subject}
                  onChange={(e) => setForm((prev) => ({ ...prev, subject: e.target.value }))}
                  required
                  list="teacher-lesson-subjects"
                  placeholder="Subject"
                  className="rounded-lg border border-border bg-muted px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                />
                <datalist id="teacher-lesson-subjects">
                  {selectedStudent?.subjects?.map((subject) => (
                    <option key={subject} value={subject} />
                  ))}
                </datalist>

                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
                  required
                  className="rounded-lg border border-border bg-muted px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <textarea
                placeholder="Topics Covered"
                value={form.topics_covered}
                onChange={(e) => setForm((prev) => ({ ...prev, topics_covered: e.target.value }))}
                rows={2}
                required
                className="w-full rounded-lg border border-border bg-muted px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
              />

              <textarea
                placeholder="Homework Given"
                value={form.homework}
                onChange={(e) => setForm((prev) => ({ ...prev, homework: e.target.value }))}
                rows={2}
                className="w-full rounded-lg border border-border bg-muted px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
              />

              <div>
                <p className="mb-2 text-sm font-medium text-foreground">Performance Rating</p>
                <div className="flex flex-wrap gap-2">
                  {["Excellent", "Good", "Needs Improvement"].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() =>
                        setForm((prev) => ({ ...prev, performance_rating: rating }))
                      }
                      className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                        form.performance_rating === rating
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {rating}
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                placeholder="Tutor Comments (optional)"
                value={form.comments}
                onChange={(e) => setForm((prev) => ({ ...prev, comments: e.target.value }))}
                rows={2}
                className="w-full rounded-lg border border-border bg-muted px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
              />

              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-primary px-8 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Submit Report"}
              </button>
            </form>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold text-foreground">Report History</h3>
            {loading ? (
              <CardSkeleton count={4} />
            ) : lessons.length === 0 ? (
              <EmptyState
                title="No reports submitted"
                description="Your lesson reports will appear here."
                icon={PenTool}
              />
            ) : (
              <div className="space-y-3">
                {lessons.map((lesson) => (
                  <div key={lesson.id} className="rounded-xl border border-border bg-card p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">
                          {lesson.students?.full_name} — {lesson.subject}
                        </p>
                        <p className="text-xs text-muted-foreground">{formatDate(lesson.date)}</p>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          ratingColors[lesson.performance_rating ?? ""] ??
                          "bg-muted text-muted-foreground"
                        }`}
                      >
                        {lesson.performance_rating ?? "Unrated"}
                      </span>
                    </div>
                    {lesson.topics_covered && (
                      <p className="mt-2 text-sm text-muted-foreground">{lesson.topics_covered}</p>
                    )}
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
