import { useEffect, useMemo, useState } from "react";
import { ClipboardCheck } from "lucide-react";

import { TeacherLayout } from "@/components/layouts/TeacherLayout";
import { formatDate } from "@/lib/format";
import { CardSkeleton } from "@/components/ui/CardSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAuth } from "@/contexts/AuthContext";
import { DEMO_DATA } from "@/lib/demoData";
import { invokeSupabaseFunction } from "@/lib/invokeSupabaseFunction";
import { reportClientError } from "@/lib/reportClientError";
import { toast } from "@/hooks/use-toast";

type AttendanceRecord = {
  id: string;
  student_id: string;
  tutor_id: string;
  lesson_date: string;
  status: string;
  created_at?: string;
  students: { full_name: string };
};

type StudentOption = {
  id: string;
  full_name: string;
  subjects?: string[] | null;
};

type TeacherWorkspaceResponse = {
  students: StudentOption[];
  attendance: AttendanceRecord[];
};

export default function TeacherAttendance() {
  const today = new Date().toISOString().slice(0, 10);
  const { user, roleOverride, loading: authLoading } = useAuth();
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    student_id: "",
    lesson_date: today,
    status: "present",
  });

  const isDemo =
    import.meta.env.DEV &&
    import.meta.env.VITE_ENABLE_DEMO_MODE === "true" &&
    roleOverride === "teacher";

  const fetchAttendance = async () => {
    setLoading(true);
    setLoadError(null);

    if (isDemo) {
      setStudents(DEMO_DATA.teacher.students);
      setRecords(DEMO_DATA.teacher.attendance.records);
      setLoading(false);
      return;
    }

    try {
      const data = await invokeSupabaseFunction<TeacherWorkspaceResponse>(
        "get-teacher-workspace",
        undefined,
      );
      setStudents(data.students ?? []);
      setRecords(data.attendance ?? []);
    } catch (err) {
      reportClientError("TeacherAttendance.fetchAttendance", err);
      const message = err instanceof Error ? err.message : String(err);
      setLoadError(message);
      setStudents([]);
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

  useEffect(() => {
    if (authLoading) return;
    if (!isDemo && !user) return;
    void fetchAttendance();
  }, [authLoading, isDemo, user?.id]);

  const updateStatus = async (record: AttendanceRecord, status: string) => {
    if (isDemo) {
      setRecords((prev) => prev.map((item) => (item.id === record.id ? { ...item, status } : item)));
      return;
    }

    try {
      const { attendance } = await invokeSupabaseFunction<{ attendance: AttendanceRecord }>(
        "manage-teacher-attendance",
        {
          attendance_id: record.id,
          student_id: record.student_id,
          lesson_date: record.lesson_date,
          status,
        },
      );

      setRecords((prev) => prev.map((item) => (item.id === record.id ? attendance : item)));
    } catch (err) {
      reportClientError("TeacherAttendance.updateStatus", err, {
        attendanceId: record.id,
      });
      const message = err instanceof Error ? err.message : String(err);
      toast({
        title: "Failed to update attendance",
        description: message,
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.student_id) {
      toast({
        title: "Student required",
        description: "Choose a student before saving attendance.",
        variant: "destructive",
      });
      return;
    }

    if (!form.lesson_date) {
      toast({
        title: "Date required",
        description: "Choose the lesson date before saving attendance.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    try {
      if (isDemo) {
        const student = students.find((item) => item.id === form.student_id);
        const nextRecord: AttendanceRecord = {
          id: `demo_attendance_${Date.now()}`,
          student_id: form.student_id,
          tutor_id: "demo_tutor",
          lesson_date: form.lesson_date,
          status: form.status,
          students: { full_name: student?.full_name ?? "Student" },
        };
        setRecords((prev) => [nextRecord, ...prev]);
      } else {
        const { attendance } = await invokeSupabaseFunction<{ attendance: AttendanceRecord }>(
          "manage-teacher-attendance",
          form,
        );

        setRecords((prev) => {
          const existingIndex = prev.findIndex((item) => item.id === attendance.id);
          if (existingIndex === -1) return [attendance, ...prev];
          return prev.map((item) => (item.id === attendance.id ? attendance : item));
        });
      }

      setForm({
        student_id: "",
        lesson_date: today,
        status: "present",
      });

      toast({
        title: "Attendance saved",
        description: "The attendance record was saved successfully.",
      });
    } catch (err) {
      reportClientError("TeacherAttendance.handleSubmit", err);
      const message = err instanceof Error ? err.message : String(err);
      toast({
        title: "Failed to save attendance",
        description: message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const statusStyles = useMemo(
    () => ({
      present: "bg-secondary text-primary-foreground",
      absent: "bg-destructive text-destructive-foreground",
      excused: "bg-muted text-muted-foreground",
    }),
    [],
  );

  return (
    <TeacherLayout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground">Attendance</h2>

        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="mb-4 text-lg font-semibold text-foreground">Log Attendance</h3>
          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-4">
            <select
              value={form.student_id}
              onChange={(e) => setForm((prev) => ({ ...prev, student_id: e.target.value }))}
              className="rounded-lg border border-border bg-muted px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
            >
              <option value="">Select Student</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.full_name}
                </option>
              ))}
            </select>

            <input
              type="date"
              value={form.lesson_date}
              onChange={(e) => setForm((prev) => ({ ...prev, lesson_date: e.target.value }))}
              className="rounded-lg border border-border bg-muted px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
            />

            <select
              value={form.status}
              onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
              className="rounded-lg border border-border bg-muted px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
            >
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="excused">Excused</option>
            </select>

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Attendance"}
            </button>
          </form>
        </div>

        {loadError && !loading && (
          <EmptyState title="Account setup needed" description={loadError} icon={ClipboardCheck} />
        )}

        {loading ? (
          <CardSkeleton count={4} />
        ) : loadError ? null : records.length === 0 ? (
          <EmptyState
            title="No attendance records"
            description="Attendance data will appear once sessions are logged."
            icon={ClipboardCheck}
          />
        ) : (
          <div className="space-y-3">
            {records.map((record) => (
              <div
                key={record.id}
                className="flex flex-col justify-between gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center"
              >
                <div>
                  <p className="font-medium text-foreground">{record.students?.full_name}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(record.lesson_date)}</p>
                </div>

                <div className="flex gap-1">
                  {(["present", "absent", "excused"] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => void updateStatus(record, status)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                        record.status === status
                          ? statusStyles[status]
                          : "bg-muted/50 text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </TeacherLayout>
  );
}
