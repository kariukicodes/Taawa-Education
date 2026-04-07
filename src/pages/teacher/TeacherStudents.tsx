import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { TeacherLayout } from "@/components/layouts/TeacherLayout";
import { Users } from "lucide-react";
import { CardSkeleton } from "@/components/ui/CardSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { DEMO_DATA } from "@/lib/demoData";

export default function TeacherStudents() {
  const { user, roleOverride } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const isDemo = import.meta.env.DEV && roleOverride === "teacher";

  useEffect(() => {
    if (!user) return;

    if (isDemo) {
      setLoading(true);
      setLoadError(null);
      setStudents(DEMO_DATA.teacher.students);
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
          setStudents([]);
          return;
        }

        const { data, error } = await supabase
          .from("tutor_assignments")
          .select("*, students(full_name, grade, subjects, age, curriculum)")
          .eq("tutor_id", tutor.id);

        if (error) throw error;
        setStudents(data?.map((a) => a.students).filter(Boolean) ?? []);
      } catch (err) {
        console.error("TeacherStudents load failed", err);
        setLoadError("We couldn't load your assigned students.");
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [user, isDemo]);

  return (
    <TeacherLayout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground">My Students</h2>

        {loadError && !loading && (
          <EmptyState title="Account setup needed" description={loadError} icon={Users} />
        )}

        {loading ? <CardSkeleton count={3} /> : loadError ? null : students.length === 0 ? (
          <EmptyState title="No students assigned" description="Students will appear here once assigned by admin." icon={Users} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {students.map((s: any) => (
              <div key={s.full_name} className="card-hover-glow rounded-xl border border-border bg-card p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary">
                    {s.full_name?.split(" ").map((n: string) => n[0]).join("")}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{s.full_name}</p>
                    <p className="text-xs text-muted-foreground">Age {s.age} • Grade {s.grade}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs text-primary">{s.curriculum}</span>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {s.subjects?.map((sub: string) => (<span key={sub} className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">{sub}</span>))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </TeacherLayout>
  );
}
