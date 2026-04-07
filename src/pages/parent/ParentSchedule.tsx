import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ParentLayout } from "@/components/layouts/ParentLayout";
import { DEMO_DATA } from "@/lib/demoData";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const times = ["08:00", "09:00", "10:00", "11:00", "12:00", "14:00", "15:00"];

export default function ParentSchedule() {
  const { user, roleOverride } = useAuth();
  const [students, setStudents] = useState<any[]>([]);

  const isDemo = import.meta.env.DEV && roleOverride === "parent";

  useEffect(() => {
    if (!user) return;

    if (isDemo) {
      setStudents(DEMO_DATA.parent.students);
      return;
    }

    const fetch = async () => {
      const { data: parent } = await supabase.from("parents").select("id").eq("user_id", user.id).single();
      if (!parent) return;
      const { data } = await supabase.from("students").select("full_name, subjects, tutor_assignments(tutors(full_name))").eq("parent_id", parent.id);
      setStudents(data ?? []);
    };
    fetch();
  }, [user, isDemo]);

  // Generate a mock weekly schedule from student subjects
  const schedule: Record<string, Array<{ time: string; subject: string; student: string; tutor: string }>> = {};
  days.forEach((d) => (schedule[d] = []));

  students.forEach((s, si) => {
    const tutor = s.tutor_assignments?.[0]?.tutors?.full_name ?? "TBA";
    s.subjects?.forEach((sub: string, subIdx: number) => {
      const dayIdx = (si * 2 + subIdx) % 5;
      const timeIdx = (subIdx + si) % times.length;
      schedule[days[dayIdx]].push({ time: times[timeIdx], subject: sub, student: s.full_name, tutor });
    });
  });

  return (
    <ParentLayout>
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
                    <p className="text-xs text-muted-foreground">{slot.student} • {slot.tutor}</p>
                    <button className="mt-2 text-xs text-primary hover:underline">Join Session</button>
                  </div>
                ))}
                {schedule[day].length === 0 && <p className="text-xs text-muted-foreground">No sessions</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </ParentLayout>
  );
}
