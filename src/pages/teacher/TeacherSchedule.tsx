import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { TeacherLayout } from "@/components/layouts/TeacherLayout";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const times = ["08:00", "09:00", "10:00", "11:00", "12:00", "14:00", "15:00"];

export default function TeacherSchedule() {
  const { user } = useAuth();
  const [students, setStudents] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data: tutor } = await supabase.from("tutors").select("id").eq("user_id", user.id).single();
      if (!tutor) return;
      const { data } = await supabase.from("tutor_assignments").select("students(full_name, subjects)").eq("tutor_id", tutor.id);
      setStudents(data?.map((a) => a.students).filter(Boolean) ?? []);
    };
    fetch();
  }, [user]);

  const schedule: Record<string, Array<{ time: string; subject: string; student: string }>> = {};
  days.forEach((d) => (schedule[d] = []));
  students.forEach((s: any, si: number) => {
    s.subjects?.forEach((sub: string, subIdx: number) => {
      const dayIdx = (si * 2 + subIdx) % 5;
      const timeIdx = (subIdx + si) % times.length;
      schedule[days[dayIdx]].push({ time: times[timeIdx], subject: sub, student: s.full_name });
    });
  });

  return (
    <TeacherLayout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground">Weekly Schedule</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {days.map((day) => (
            <div key={day} className="rounded-xl border border-border bg-card p-4">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">{day}</h3>
              <div className="space-y-2">
                {schedule[day].sort((a, b) => a.time.localeCompare(b.time)).map((slot, i) => (
                  <div key={i} className="rounded-lg bg-muted p-3">
                    <p className="text-xs text-muted-foreground">{slot.time}</p>
                    <p className="text-sm font-medium text-foreground">{slot.subject}</p>
                    <p className="text-xs text-muted-foreground">{slot.student}</p>
                  </div>
                ))}
                {schedule[day].length === 0 && <p className="text-xs text-muted-foreground">No sessions</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </TeacherLayout>
  );
}
