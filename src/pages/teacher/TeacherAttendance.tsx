import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { TeacherLayout } from "@/components/layouts/TeacherLayout";
import { formatDate } from "@/lib/format";
import { CardSkeleton } from "@/components/ui/CardSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ClipboardCheck } from "lucide-react";
import { DEMO_DATA } from "@/lib/demoData";

export default function TeacherAttendance() {
  const { user, roleOverride } = useAuth();
  const [tutorId, setTutorId] = useState<string | null>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const isDemo = import.meta.env.DEV && roleOverride === "teacher";

  useEffect(() => {
    if (!user) return;

    if (isDemo) {
      setLoading(true);
      setLoadError(null);
      setTutorId("demo_tutor");
      setRecords(DEMO_DATA.teacher.attendance.records);
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
          setLoadError(
            "No tutor record was found for this account. Ask an admin to create a row in tutors for your user."
          );
          setTutorId(null);
          setRecords([]);
          return;
        }

        setTutorId(tutor.id);
        const { data, error } = await supabase
          .from("attendance")
          .select("*, students(full_name)")
          .eq("tutor_id", tutor.id)
          .order("lesson_date", { ascending: false });

        if (error) throw error;
        setRecords(data ?? []);
      } catch (err) {
        console.error("TeacherAttendance load failed", err);
        setLoadError("We couldn't load your attendance records.");
        setTutorId(null);
        setRecords([]);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [user, isDemo]);

  const updateStatus = async (id: string, status: string) => {
    if (isDemo) {
      setRecords((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
      return;
    }

    await supabase.from("attendance").update({ status }).eq("id", id);
    setRecords((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  };

  const statusStyles = useMemo(
    () => ({
      present: "bg-secondary text-primary-foreground",
      absent: "bg-destructive text-destructive-foreground",
      excused: "bg-muted text-muted-foreground",
    }),
    []
  );

  return (
    <TeacherLayout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground">Attendance</h2>

        {loadError && !loading && (
          <EmptyState title="Account setup needed" description={loadError} icon={ClipboardCheck} />
        )}

        {loading ? (
          <CardSkeleton count={4} />
        ) : loadError ? null : records.length === 0 ? (
          <EmptyState
            title="No attendance records"
            description="Attendance data will appear once sessions are logged."
            icon={ClipboardCheck}
          />
        ) : (
          <div className="space-y-3">
            {records.map((r) => (
              <div
                key={r.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-border bg-card p-4"
              >
                <div>
                  <p className="font-medium text-foreground">{r.students?.full_name}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(r.lesson_date)}</p>
                </div>
                <div className="flex gap-1">
                  {(["present", "absent", "excused"] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => updateStatus(r.id, s)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                        r.status === s
                          ? statusStyles[s]
                          : "bg-muted/50 text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </TeacherLayout>
  );
}
