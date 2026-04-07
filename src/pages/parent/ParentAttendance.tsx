import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ParentLayout } from "@/components/layouts/ParentLayout";
import { formatDate } from "@/lib/format";
import { TableSkeleton } from "@/components/ui/TableSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ClipboardCheck } from "lucide-react";
import { DEMO_DATA } from "@/lib/demoData";

export default function ParentAttendance() {
  const { user, roleOverride } = useAuth();
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const isDemo = import.meta.env.DEV && roleOverride === "parent";

  useEffect(() => {
    if (!user) return;

    if (isDemo) {
      setLoading(true);
      setLoadError(null);
      setRecords(DEMO_DATA.parent.attendance.records);
      setLoading(false);
      return;
    }

    const fetch = async () => {
      setLoading(true);
      setLoadError(null);

      try {
        const { data: parent, error: parentError } = await supabase
          .from("parents")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (parentError) throw parentError;

        if (!parent) {
          setLoadError("No parent record was found for this account. Ask an admin to create a row in parents for your user.");
          setRecords([]);
          return;
        }

        const { data: students, error: studentsError } = await supabase
          .from("students")
          .select("id")
          .eq("parent_id", parent.id);

        if (studentsError) throw studentsError;

        const ids = students?.map((s) => s.id) ?? [];
        if (ids.length === 0) {
          setRecords([]);
          return;
        }

        const { data, error } = await supabase
          .from("attendance")
          .select("*, students(full_name), tutors(full_name)")
          .in("student_id", ids)
          .order("lesson_date", { ascending: false });

        if (error) throw error;
        setRecords(data ?? []);
      } catch (err) {
        console.error("ParentAttendance load failed", err);
        setLoadError("We couldn't load your attendance records.");
        setRecords([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [user, isDemo]);

  const statusDot: Record<string, string> = { present: "bg-secondary", absent: "bg-destructive", excused: "bg-muted-foreground" };

  return (
    <ParentLayout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground">Attendance</h2>

        {loadError && !loading && (
          <EmptyState title="Account setup needed" description={loadError} icon={ClipboardCheck} />
        )}

        {loading ? <TableSkeleton columns={4} /> : loadError ? null : records.length === 0 ? (
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
