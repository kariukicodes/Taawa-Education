import { useEffect, useState } from "react";
import { ClipboardCheck } from "lucide-react";

import { ParentLayout } from "@/components/layouts/ParentLayout";
import { formatDate } from "@/lib/format";
import { TableSkeleton } from "@/components/ui/TableSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAuth } from "@/contexts/AuthContext";
import { DEMO_DATA } from "@/lib/demoData";
import { invokeSupabaseFunction } from "@/lib/invokeSupabaseFunction";
import { reportClientError } from "@/lib/reportClientError";
import { toast } from "@/hooks/use-toast";

type AttendanceRecord = {
  id: string;
  lesson_date: string;
  status: string;
  students: { full_name: string };
  tutors: { full_name: string };
};

type ParentWorkspaceResponse = {
  attendance: AttendanceRecord[];
};

export default function ParentAttendance() {
  const { user, roleOverride, loading: authLoading } = useAuth();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const isDemo =
    import.meta.env.DEV &&
    import.meta.env.VITE_ENABLE_DEMO_MODE === "true" &&
    roleOverride === "parent";

  useEffect(() => {
    if (authLoading) return;
    if (!isDemo && !user) return;

    const fetchAttendance = async () => {
      setLoading(true);
      setLoadError(null);

      try {
        const data = isDemo
          ? { attendance: DEMO_DATA.parent.attendance.records as AttendanceRecord[] }
          : await invokeSupabaseFunction<ParentWorkspaceResponse>(
              "get-parent-workspace",
              undefined,
            );

        setRecords(data.attendance ?? []);
      } catch (err) {
        reportClientError("ParentAttendance.fetchAttendance", err);
        const message = err instanceof Error ? err.message : String(err);
        setLoadError(message);
        setRecords([]);
        toast({
          title: "Failed to load attendance",
          description: message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    void fetchAttendance();
  }, [authLoading, isDemo, user?.id]);

  const statusDot: Record<string, string> = {
    present: "bg-secondary",
    absent: "bg-destructive",
    excused: "bg-muted-foreground",
  };

  return (
    <ParentLayout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground">Attendance</h2>

        {loadError && !loading && (
          <EmptyState title="Account setup needed" description={loadError} icon={ClipboardCheck} />
        )}

        {loading ? (
          <TableSkeleton columns={4} />
        ) : loadError ? null : records.length === 0 ? (
          <EmptyState
            title="No attendance records"
            description="Attendance data will appear once sessions are logged."
            icon={ClipboardCheck}
          />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {["Date", "Student", "Tutor", "Status"].map((heading) => (
                    <th
                      key={heading}
                      className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 text-foreground">{formatDate(record.lesson_date)}</td>
                    <td className="px-4 py-3 text-foreground">{record.students?.full_name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{record.tutors?.full_name}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className={`h-2.5 w-2.5 rounded-full ${statusDot[record.status]}`} />
                        <span className="capitalize text-muted-foreground">{record.status}</span>
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
