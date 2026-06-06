import { useEffect, useState } from "react";
import { TrendingUp } from "lucide-react";

import { ParentLayout } from "@/components/layouts/ParentLayout";
import { formatDate } from "@/lib/format";
import { CardSkeleton } from "@/components/ui/CardSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAuth } from "@/contexts/AuthContext";
import { DEMO_DATA } from "@/lib/demoData";
import { invokeSupabaseFunction } from "@/lib/invokeSupabaseFunction";
import { reportClientError } from "@/lib/reportClientError";
import { toast } from "@/hooks/use-toast";

type LessonRecord = {
  id: string;
  subject: string;
  date: string;
  topics_covered: string | null;
  homework: string | null;
  performance_rating: string | null;
  comments: string | null;
  students: { full_name: string };
  tutors: { full_name: string };
};

type ParentWorkspaceResponse = {
  lessons: LessonRecord[];
};

export default function ParentReports() {
  const { user, roleOverride, loading: authLoading } = useAuth();
  const [lessons, setLessons] = useState<LessonRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const isDemo =
    import.meta.env.DEV &&
    import.meta.env.VITE_ENABLE_DEMO_MODE === "true" &&
    roleOverride === "parent";

  useEffect(() => {
    if (authLoading) return;
    if (!isDemo && !user) return;

    const fetchReports = async () => {
      setLoading(true);
      setLoadError(null);

      try {
        const data = isDemo
          ? { lessons: DEMO_DATA.parent.reports.lessons as LessonRecord[] }
          : await invokeSupabaseFunction<ParentWorkspaceResponse>(
              "get-parent-workspace",
              undefined,
            );

        setLessons(data.lessons ?? []);
      } catch (err) {
        reportClientError("ParentReports.fetchReports", err);
        const message = err instanceof Error ? err.message : String(err);
        setLoadError(message);
        setLessons([]);
        toast({
          title: "Failed to load progress reports",
          description: message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    void fetchReports();
  }, [authLoading, isDemo, user?.id]);

  const ratingColors: Record<string, string> = {
    Excellent: "bg-secondary/20 text-secondary",
    Good: "bg-primary/20 text-primary",
    "Needs Improvement": "bg-destructive/20 text-destructive",
  };

  return (
    <ParentLayout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground">Progress & Reports</h2>

        {loadError && !loading && (
          <EmptyState title="Account setup needed" description={loadError} icon={TrendingUp} />
        )}

        {loading ? (
          <CardSkeleton count={4} />
        ) : loadError ? null : lessons.length === 0 ? (
          <EmptyState
            title="No reports yet"
            description="Lesson reports from tutors will appear here."
            icon={TrendingUp}
          />
        ) : (
          <div className="space-y-4">
            {lessons.map((lesson) => (
              <div key={lesson.id} className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-foreground">
                      {lesson.students?.full_name} — {lesson.subject}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(lesson.date)} • Tutor: {lesson.tutors?.full_name}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      ratingColors[lesson.performance_rating ?? ""] ?? "bg-muted text-muted-foreground"
                    }`}
                  >
                    {lesson.performance_rating ?? "Unrated"}
                  </span>
                </div>
                <div className="mt-3 space-y-1 text-sm">
                  <p>
                    <span className="text-muted-foreground">Topics:</span>{" "}
                    <span className="text-foreground">{lesson.topics_covered || "-"}</span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">Homework:</span>{" "}
                    <span className="text-foreground">{lesson.homework || "-"}</span>
                  </p>
                  {lesson.comments && (
                    <p>
                      <span className="text-muted-foreground">Comments:</span>{" "}
                      <span className="text-foreground">{lesson.comments}</span>
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ParentLayout>
  );
}
