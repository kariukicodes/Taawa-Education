import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Mail, MessageCircle, Search, Users, Video } from "lucide-react";

import { TeacherLayout } from "@/components/layouts/TeacherLayout";
import { CardSkeleton } from "@/components/ui/CardSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAuth } from "@/contexts/AuthContext";
import { DEMO_DATA } from "@/lib/demoData";
import { buildMailtoLink, buildWhatsAppLink } from "@/lib/contactLinks";
import { includesSearchTerm, sortByKey } from "@/lib/adminFilters";
import { invokeSupabaseFunction } from "@/lib/invokeSupabaseFunction";
import { reportClientError } from "@/lib/reportClientError";
import { formatSessionReminder, formatSessionSchedule } from "@/lib/sessionSchedule";
import { toast } from "@/hooks/use-toast";

type TeacherDashboardResponse = {
  students: Array<{
    id: string;
    student_id: string;
    full_name: string;
    age: number | null;
    grade: string | null;
    curriculum: string | null;
    status: string;
    start_date: string | null;
    meeting_provider: string | null;
    meeting_link: string | null;
    session_day_of_week: number | null;
    session_start_time: string | null;
    session_end_time: string | null;
    session_frequency: "weekly" | "biweekly";
    session_timezone: string | null;
    session_end_date: string | null;
    reminder_enabled: boolean;
    reminder_offset_minutes: number;
    parent: {
      full_name: string;
      phone: string | null;
      email: string | null;
    } | null;
  }>;
};

export default function TeacherStudents() {
  const { user, roleOverride, loading: authLoading } = useAuth();
  const [students, setStudents] = useState<TeacherDashboardResponse["students"]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const isDemo =
    import.meta.env.DEV &&
    import.meta.env.VITE_ENABLE_DEMO_MODE === "true" &&
    roleOverride === "teacher";

  useEffect(() => {
    if (authLoading) return;
    if (!isDemo && !user) return;

    const fetchStudents = async () => {
      setLoading(true);
      setLoadError(null);

      if (isDemo) {
        setStudents([]);
        setLoading(false);
        return;
      }

      try {
        const data = await invokeSupabaseFunction<TeacherDashboardResponse>(
          "get-teacher-dashboard",
          undefined,
        );
        setStudents(data.students ?? []);
      } catch (err) {
        reportClientError("TeacherStudents.fetchStudents", err);
        const message = err instanceof Error ? err.message : String(err);
        setLoadError(message);
        toast({
          title: "Failed to load assigned students",
          description: message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    void fetchStudents();
  }, [authLoading, isDemo, user?.id]);

  const filteredStudents = sortByKey(
    students.filter((student) =>
      includesSearchTerm(
        [
          student.full_name,
          student.grade,
          student.curriculum,
          student.parent?.full_name,
          student.parent?.phone,
          student.parent?.email,
          student.meeting_provider,
        ],
        search,
      ),
    ),
    (student) => student.full_name,
    "asc",
  );

  return (
    <TeacherLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">My Students</h2>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student, parent, grade, or meeting type..."
            className="w-full rounded-lg border border-border bg-muted py-2 pl-10 pr-4 text-sm text-foreground focus:border-primary focus:outline-none"
          />
        </div>

        {loadError && !loading && (
          <EmptyState title="Account setup needed" description={loadError} icon={Users} />
        )}

        {loading ? (
          <CardSkeleton count={3} />
        ) : loadError ? null : filteredStudents.length === 0 ? (
          <EmptyState
            title={students.length === 0 ? "No students assigned" : "No students match this search"}
            description={
              students.length === 0
                ? "Students will appear here once assigned by admin."
                : "Try a different search term."
            }
            icon={Users}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredStudents.map((student) => (
              <div key={student.id} className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary">
                    {student.full_name
                      .split(" ")
                      .map((name) => name[0])
                      .join("")}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{student.full_name}</p>
                    <p className="text-xs text-muted-foreground">
                      Age {student.age ?? "-"} | Grade {student.grade ?? "-"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Curriculum</span>
                    <span className="text-foreground">{student.curriculum ?? "-"}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Parent</span>
                    <span className="text-right text-foreground">
                      {student.parent?.full_name ?? "Not linked"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Session Link</span>
                    <span className="text-foreground">
                      {student.meeting_link
                        ? (student.meeting_provider ?? "custom").replace("_", " ")
                        : "Not added"}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Schedule</span>
                    <span className="text-right text-foreground">
                      {formatSessionSchedule(student)}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Reminder</span>
                    <span className="text-right text-foreground">
                      {formatSessionReminder(student)}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    to={`/teacher/messages?student=${student.student_id}`}
                    className="inline-flex items-center gap-1 rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-xs font-medium text-primary hover:bg-primary/15"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    In-App Chat
                  </Link>
                  {student.parent?.phone && (
                    <a
                      href={buildWhatsAppLink(
                        student.parent.phone,
                        `Hello ${student.parent.full_name}, I'm reaching out about ${student.full_name}'s tutoring session.`,
                      )}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground hover:bg-muted"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      WhatsApp Parent
                    </a>
                  )}
                  {student.parent?.email && (
                    <a
                      href={buildMailtoLink(
                        student.parent.email,
                        `${student.full_name} tutoring update`,
                      )}
                      className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground hover:bg-muted"
                    >
                      <Mail className="h-3.5 w-3.5" />
                      Email Parent
                    </a>
                  )}
                  {student.meeting_link && (
                    <a
                      href={student.meeting_link}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90"
                    >
                      <Video className="h-3.5 w-3.5" />
                      Join Session
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </TeacherLayout>
  );
}
