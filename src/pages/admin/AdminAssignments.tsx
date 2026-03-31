import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { X } from "lucide-react";

export default function AdminAssignments() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [tutors, setTutors] = useState<any[]>([]);
  const [showReassign, setShowReassign] = useState<any>(null);
  const [newTutorId, setNewTutorId] = useState("");

  const fetchData = async () => {
    const [a, t] = await Promise.all([
      supabase.from("tutor_assignments").select("*, tutors(full_name), students(full_name, grade, subjects)"),
      supabase.from("tutors").select("id, full_name"),
    ]);
    setAssignments(a.data ?? []);
    setTutors(t.data ?? []);
  };

  useEffect(() => { fetchData(); }, []);

  const handleReassign = async () => {
    if (!showReassign || !newTutorId) return;
    await supabase.from("tutor_assignments").update({ tutor_id: newTutorId }).eq("id", showReassign.id);
    setShowReassign(null);
    setNewTutorId("");
    fetchData();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground">Tutor Assignments</h2>
        <div className="rounded-xl border border-border bg-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border">
              {["Student", "Grade", "Assigned Tutor", "Subjects", "Start Date", ""].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {assignments.map((a) => (
                <tr key={a.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                  <td className="px-4 py-3 text-foreground">{a.students?.full_name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{a.students?.grade}</td>
                  <td className="px-4 py-3 text-foreground">{a.tutors?.full_name}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {a.students?.subjects?.map((s: string) => (
                        <span key={s} className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">{s}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{a.start_date ? new Date(a.start_date).toLocaleDateString("en-GB") : "—"}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => { setShowReassign(a); setNewTutorId(a.tutor_id); }} className="text-xs text-primary hover:underline">Reassign</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showReassign && (
        <>
          <div className="fixed inset-0 z-40 bg-background/60" onClick={() => setShowReassign(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Reassign Tutor</h3>
                <button onClick={() => setShowReassign(null)}><X className="h-5 w-5 text-muted-foreground" /></button>
              </div>
              <p className="mb-4 text-sm text-muted-foreground">Student: {showReassign.students?.full_name}</p>
              <select value={newTutorId} onChange={(e) => setNewTutorId(e.target.value)}
                className="w-full rounded-lg border border-border bg-muted px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none mb-4">
                {tutors.map((t) => <option key={t.id} value={t.id}>{t.full_name}</option>)}
              </select>
              <button onClick={handleReassign} className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">Save Assignment</button>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
