import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/layouts/AdminLayout";

export default function AdminReports() {
  const [lessons, setLessons] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("lessons").select("*, students(full_name), tutors(full_name)")
      .order("date", { ascending: false }).then(({ data }) => setLessons(data ?? []));
  }, []);

  const ratingColors: Record<string, string> = {
    Excellent: "bg-secondary/20 text-secondary",
    Good: "bg-primary/20 text-primary",
    "Needs Improvement": "bg-destructive/20 text-destructive",
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground">Reports</h2>
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
              <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                <p><span className="text-foreground">Topics:</span> {l.topics_covered}</p>
                <p><span className="text-foreground">Homework:</span> {l.homework}</p>
                {l.comments && <p><span className="text-foreground">Comments:</span> {l.comments}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
