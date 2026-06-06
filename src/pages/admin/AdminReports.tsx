import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { FileText } from "lucide-react";
import { formatDate } from "@/lib/format";
import { CardSkeleton } from "@/components/ui/CardSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAuth } from "@/contexts/AuthContext";
import { DEMO_DATA } from "@/lib/demoData";
import { toast } from "@/hooks/use-toast";
import { invokeSupabaseFunction } from "@/lib/invokeSupabaseFunction";

export default function AdminReports() {
  const { roleOverride, loading: authLoading, user } = useAuth();
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const isDemo =
    import.meta.env.DEV &&
    import.meta.env.VITE_ENABLE_DEMO_MODE === "true" &&
    roleOverride === "admin";

  useEffect(() => {
    if (authLoading) return;
    if (!isDemo && !user) return;

    if (isDemo) {
      setLoading(true);
      setLessons(DEMO_DATA.admin.reports.lessons);
      setLoading(false);
      return;
    }

    void invokeSupabaseFunction<{ lessons: any[] }>("list-reports-admin", undefined)
      .then(({ lessons }) => {
        setLessons(lessons ?? []);
      })
      .catch((err) => {
        const message = err instanceof Error ? err.message : String(err);
        toast({
          title: "Failed to load reports",
          description: message,
          variant: "destructive",
        });
      })
      .finally(() => {
        setLoading(false);
      });
  }, [isDemo, authLoading, user?.id]);

  const ratingColors: Record<string, string> = {
    Excellent: "bg-secondary/20 text-secondary",
    Good: "bg-primary/20 text-primary",
    "Needs Improvement": "bg-destructive/20 text-destructive",
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground">Reports</h2>

        {loading ? (
          <CardSkeleton count={4} />
        ) : lessons.length === 0 ? (
          <EmptyState
            title="No reports yet"
            description="Lesson reports will appear here once tutors submit them."
            icon={FileText}
          />
        ) : (
          <div className="space-y-4">
            {lessons.map((lesson) => (
              <div key={lesson.id} className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-foreground">
                      {lesson.students?.full_name} - {lesson.subject}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(lesson.date)} | Tutor: {lesson.tutors?.full_name}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      ratingColors[lesson.performance_rating] ?? "bg-muted text-muted-foreground"
                    }`}
                  >
                    {lesson.performance_rating}
                  </span>
                </div>

                <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                  <p><span className="text-foreground">Topics:</span> {lesson.topics_covered}</p>
                  <p><span className="text-foreground">Homework:</span> {lesson.homework}</p>
                  {lesson.comments && (
                    <p><span className="text-foreground">Comments:</span> {lesson.comments}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
