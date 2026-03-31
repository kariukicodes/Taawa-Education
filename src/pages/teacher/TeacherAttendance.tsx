import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { TeacherLayout } from "@/components/layouts/TeacherLayout";

export default function TeacherAttendance() {
  const { user } = useAuth();
  const [tutorId, setTutorId] = useState<string | null>(null);
  const [records, setRecords] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data: tutor } = await supabase.from("tutors").select("id").eq("user_id", user.id).single();
      if (!tutor) return;
      setTutorId(tutor.id);
      const { data } = await supabase.from("attendance").select("*, students(full_name)").eq("tutor_id", tutor.id).order("lesson_date", { ascending: false });
      setRecords(data ?? []);
    };
    fetch();
  }, [user]);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("attendance").update({ status }).eq("id", id);
    setRecords((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  };

  const statusStyles: Record<string, string> = {
    present: "bg-secondary text-primary-foreground",
    absent: "bg-destructive text-destructive-foreground",
    excused: "bg-muted text-muted-foreground",
  };

  return (
    <TeacherLayout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground">Attendance</h2>
        <div className="space-y-3">
          {records.map((r) => (
            <div key={r.id} className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
              <div>
                <p className="font-medium text-foreground">{r.students?.full_name}</p>
                <p className="text-xs text-muted-foreground">{new Date(r.lesson_date).toLocaleDateString("en-GB")}</p>
              </div>
              <div className="flex gap-1">
                {["present", "absent", "excused"].map((s) => (
                  <button key={s} onClick={() => updateStatus(r.id, s)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors ${r.status === s ? statusStyles[s] : "bg-muted/50 text-muted-foreground hover:bg-muted"}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ))}
          {records.length === 0 && <p className="text-muted-foreground">No attendance records.</p>}
        </div>
      </div>
    </TeacherLayout>
  );
}
