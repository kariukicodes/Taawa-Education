import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ParentLayout } from "@/components/layouts/ParentLayout";
import { formatDate } from "@/lib/format";
import { CardSkeleton } from "@/components/ui/CardSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { TrendingUp } from "lucide-react";
import { DEMO_DATA } from "@/lib/demoData";

export default function ParentReports() {
  const { user, roleOverride } = useAuth();
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const isDemo = import.meta.env.DEV && roleOverride === "parent";

  useEffect(() => {
    if (!user) return;

    if (isDemo) {
      setLoading(true);
      setLoadError(null);
      setLessons(DEMO_DATA.parent.reports.lessons);
      setLoading(false);
      return;
    }

    const fetch = async () => {
      setLoading(true);
      setLoadError(null);

      try {
        const { data: parent, error: parentError } = await supabase
          .from("parents")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (parentError) throw parentError;

        if (!parent) {
          setLoadError("No parent record was found for this account. Ask an admin to create a row in parents for your user.");
          setLessons([]);
          return;
        }

        const { data: students, error: studentsError } = await supabase
          .from("students")
          .select("id")
          .eq("parent_id", parent.id);

        if (studentsError) throw studentsError;

        const ids = students?.map((s) => s.id) ?? [];
        if (ids.length === 0) {
          setLessons([]);
          return;
        }

        const { data, error } = await supabase
          .from("lessons")
          .select("*, students(full_name), tutors(full_name)")
          .in("student_id", ids)
          .order("date", { ascending: false });

        if (error) throw error;
        setLessons(data ?? []);
      } catch (err) {
        console.error("ParentReports load failed", err);
        setLoadError("We couldn't load your progress reports.");
        setLessons([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [user, isDemo]);

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

        {loading ? <CardSkeleton count={4} /> : loadError ? null : lessons.length === 0 ? (
          <EmptyState title="No reports yet" description="Lesson reports from tutors will appear here." icon={TrendingUp} />
        ) : (
          <div className="space-y-4">
            {lessons.map((l) => (
              <div key={l.id} className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-foreground">{l.students?.full_name} — {l.subject}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(l.date)} • Tutor: {l.tutors?.full_name}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${ratingColors[l.performance_rating] ?? "bg-muted text-muted-foreground"}`}>
                    {l.performance_rating}
                  </span>
                </div>
                <div className="mt-3 space-y-1 text-sm">
                  <p><span className="text-muted-foreground">Topics:</span> <span className="text-foreground">{l.topics_covered}</span></p>
                  <p><span className="text-muted-foreground">Homework:</span> <span className="text-foreground">{l.homework}</span></p>
                  {l.comments && <p><span className="text-muted-foreground">Comments:</span> <span className="text-foreground">{l.comments}</span></p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ParentLayout>
  );
}
