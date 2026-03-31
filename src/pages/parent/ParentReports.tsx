import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ParentLayout } from "@/components/layouts/ParentLayout";

export default function ParentReports() {
  const { user } = useAuth();
  const [lessons, setLessons] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data: parent } = await supabase.from("parents").select("id").eq("user_id", user.id).single();
      if (!parent) return;
      const { data: students } = await supabase.from("students").select("id").eq("parent_id", parent.id);
      const ids = students?.map((s) => s.id) ?? [];
      if (ids.length === 0) return;
      const { data } = await supabase.from("lessons").select("*, students(full_name), tutors(full_name)").in("student_id", ids).order("date", { ascending: false });
      setLessons(data ?? []);
    };
    fetch();
  }, [user]);

  const ratingColors: Record<string, string> = {
    Excellent: "bg-secondary/20 text-secondary",
    Good: "bg-primary/20 text-primary",
    "Needs Improvement": "bg-destructive/20 text-destructive",
  };

  return (
    <ParentLayout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground">Progress & Reports</h2>
        <div className="space-y-4">
          {lessons.map((l) => (
            <div key={l.id} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-foreground">{l.students?.full_name} — {l.subject}</p>
                  <p className="text-xs text-muted-foreground">{new Date(l.date).toLocaleDateString("en-GB")} • Tutor: {l.tutors?.full_name}</p>
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
          {lessons.length === 0 && <p className="text-muted-foreground">No reports yet.</p>}
        </div>
      </div>
    </ParentLayout>
  );
}
