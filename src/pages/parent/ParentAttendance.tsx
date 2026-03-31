import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ParentLayout } from "@/components/layouts/ParentLayout";
import { formatDate } from "@/lib/format";
import { TableSkeleton } from "@/components/ui/TableSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ClipboardCheck } from "lucide-react";

export default function ParentAttendance() {
  const { user } = useAuth();
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data: parent } = await supabase.from("parents").select("id").eq("user_id", user.id).single();
      if (!parent) { setLoading(false); return; }
      const { data: students } = await supabase.from("students").select("id").eq("parent_id", parent.id);
      const ids = students?.map((s) => s.id) ?? [];
      if (ids.length === 0) { setLoading(false); return; }
      const { data } = await supabase.from("attendance").select("*, students(full_name), tutors(full_name)").in("student_id", ids).order("lesson_date", { ascending: false });
      setRecords(data ?? []);
      setLoading(false);
    };
    fetch();
  }, [user]);

  const statusDot: Record<string, string> = { present: "bg-secondary", absent: "bg-destructive", excused: "bg-muted-foreground" };

  return (
    <ParentLayout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground">Attendance</h2>
        {loading ? <TableSkeleton columns={4} /> : records.length === 0 ? (
          <EmptyState title="No attendance records" description="Attendance data will appear once sessions are logged." icon={ClipboardCheck} />
        ) : (
          <div className="rounded-xl border border-border bg-card overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border">
                {["Date", "Student", "Tutor", "Status"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 text-foreground">{formatDate(r.lesson_date)}</td>
                    <td className="px-4 py-3 text-foreground">{r.students?.full_name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.tutors?.full_name}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className={`h-2.5 w-2.5 rounded-full ${statusDot[r.status]}`} />
                        <span className="capitalize text-muted-foreground">{r.status}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </ParentLayout>
  );
}
