import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ParentLayout } from "@/components/layouts/ParentLayout";

export default function ParentChildren() {
  const { user } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data: parent } = await supabase.from("parents").select("id").eq("user_id", user.id).single();
      if (!parent) return;
      const { data } = await supabase.from("students").select("*, tutor_assignments(tutors(full_name))").eq("parent_id", parent.id);
      setStudents(data ?? []);
    };
    fetch();
  }, [user]);

  const s = students[selected];

  return (
    <ParentLayout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground">My Children</h2>

        {students.length > 1 && (
          <div className="flex gap-2">
            {students.map((st, i) => (
              <button key={st.id} onClick={() => setSelected(i)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${selected === i ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
                {st.full_name}
              </button>
            ))}
          </div>
        )}

        {s && (
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 text-xl font-bold text-primary">
                {s.full_name?.split(" ").map((n: string) => n[0]).join("")}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground">{s.full_name}</h3>
                <p className="text-muted-foreground">Age {s.age} • Grade {s.grade}</p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Curriculum</p>
                <span className="mt-1 inline-block rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">{s.curriculum}</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Assigned Tutor</p>
                <p className="mt-1 text-foreground">{s.tutor_assignments?.[0]?.tutors?.full_name ?? "Unassigned"}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-sm text-muted-foreground">Subjects</p>
                <div className="mt-1 flex flex-wrap gap-2">
                  {s.subjects?.map((sub: string) => (
                    <span key={sub} className="rounded-lg bg-muted px-3 py-1 text-sm text-muted-foreground">{sub}</span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Start Date</p>
                <p className="mt-1 text-foreground">{s.start_date ? new Date(s.start_date).toLocaleDateString("en-GB") : "—"}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </ParentLayout>
  );
}
