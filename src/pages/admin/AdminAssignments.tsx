import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { Plus, Search, Video, X, GitBranch } from "lucide-react";
import { formatDate } from "@/lib/format";
import { TableSkeleton } from "@/components/ui/TableSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmActionDialog } from "@/components/ui/ConfirmActionDialog";
import { useAuth } from "@/contexts/AuthContext";
import { DEMO_DATA } from "@/lib/demoData";
import { toast } from "@/hooks/use-toast";
import { invokeSupabaseFunction } from "@/lib/invokeSupabaseFunction";
import { includesSearchTerm, sortByKey } from "@/lib/adminFilters";
import { reportClientError } from "@/lib/reportClientError";
import { formatSessionReminder, formatSessionSchedule } from "@/lib/sessionSchedule";

type AssignmentRecord = {
  id: string;
  tutor_id: string;
  student_id: string;
  start_date: string | null;
  meeting_provider?: string | null;
  meeting_link?: string | null;
  session_day_of_week?: number | null;
  session_start_time?: string | null;
  session_end_time?: string | null;
  session_frequency?: "weekly" | "biweekly" | null;
  session_timezone?: string | null;
  session_end_date?: string | null;
  reminder_enabled?: boolean | null;
  reminder_offset_minutes?: number | null;
  created_at?: string;
  tutors: { full_name: string };
  students: {
    full_name: string;
    grade: string | null;
    parents?: { full_name: string | null } | null;
  } | null;
};

type AssignmentOption = {
  id: string;
  full_name: string;
  grade?: string | null;
  parent_name?: string | null;
  status?: string;
};

export default function AdminAssignments() {
  const dayOptions = [
    { value: 0, label: "Sunday" },
    { value: 1, label: "Monday" },
    { value: 2, label: "Tuesday" },
    { value: 3, label: "Wednesday" },
    { value: 4, label: "Thursday" },
    { value: 5, label: "Friday" },
    { value: 6, label: "Saturday" },
  ];
  const { roleOverride, loading: authLoading, user } = useAuth();
  const [assignments, setAssignments] = useState<AssignmentRecord[]>([]);
  const [tutors, setTutors] = useState<AssignmentOption[]>([]);
  const [students, setStudents] = useState<AssignmentOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<AssignmentRecord | null>(null);
  const [formError, setFormError] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [studentId, setStudentId] = useState("");
  const [tutorId, setTutorId] = useState("");
  const [meetingProvider, setMeetingProvider] = useState("google_meet");
  const [meetingLink, setMeetingLink] = useState("");
  const [startDate, setStartDate] = useState("");
  const [sessionDayOfWeek, setSessionDayOfWeek] = useState("1");
  const [sessionStartTime, setSessionStartTime] = useState("16:00");
  const [sessionEndTime, setSessionEndTime] = useState("17:00");
  const [sessionFrequency, setSessionFrequency] = useState<"weekly" | "biweekly">("weekly");
  const [sessionTimezone, setSessionTimezone] = useState("Africa/Nairobi");
  const [sessionEndDate, setSessionEndDate] = useState("");
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderOffsetMinutes, setReminderOffsetMinutes] = useState("60");
  const [search, setSearch] = useState("");
  const [providerFilter, setProviderFilter] = useState("all");
  const [pendingDeleteAssignment, setPendingDeleteAssignment] = useState<AssignmentRecord | null>(null);

  const isDemo =
    import.meta.env.DEV &&
    import.meta.env.VITE_ENABLE_DEMO_MODE === "true" &&
    roleOverride === "admin";

  const openModal = (assignment?: AssignmentRecord | null) => {
    setEditingAssignment(assignment ?? null);
    setStudentId(assignment?.student_id ?? "");
    setTutorId(assignment?.tutor_id ?? "");
    setMeetingProvider(assignment?.meeting_provider ?? "google_meet");
    setMeetingLink(assignment?.meeting_link ?? "");
    setStartDate(assignment?.start_date ?? new Date().toISOString().slice(0, 10));
    setSessionDayOfWeek(String(assignment?.session_day_of_week ?? 1));
    setSessionStartTime(assignment?.session_start_time?.slice(0, 5) ?? "16:00");
    setSessionEndTime(assignment?.session_end_time?.slice(0, 5) ?? "17:00");
    setSessionFrequency(assignment?.session_frequency ?? "weekly");
    setSessionTimezone(assignment?.session_timezone ?? "Africa/Nairobi");
    setSessionEndDate(assignment?.session_end_date ?? "");
    setReminderEnabled(assignment?.reminder_enabled ?? true);
    setReminderOffsetMinutes(String(assignment?.reminder_offset_minutes ?? 60));
    setFormError("");
    setShowModal(true);
  };

  const closeModal = () => {
    setEditingAssignment(null);
    setStudentId("");
    setTutorId("");
    setMeetingProvider("google_meet");
    setMeetingLink("");
    setStartDate("");
    setSessionDayOfWeek("1");
    setSessionStartTime("16:00");
    setSessionEndTime("17:00");
    setSessionFrequency("weekly");
    setSessionTimezone("Africa/Nairobi");
    setSessionEndDate("");
    setReminderEnabled(true);
    setReminderOffsetMinutes("60");
    setFormError("");
    setShowModal(false);
  };

  const fetchData = async (showLoader = true) => {
    if (showLoader) {
      setLoading(true);
    }

    if (isDemo) {
      setAssignments(DEMO_DATA.admin.assignments.assignments as AssignmentRecord[]);
      setTutors(DEMO_DATA.admin.students.tutors as AssignmentOption[]);
      setStudents(
        (DEMO_DATA.admin.students.students as any[]).map((student) => ({
          id: student.id,
          full_name: student.full_name,
          grade: student.grade,
          parent_name: student.parents?.full_name ?? null,
        })),
      );
      if (showLoader) setLoading(false);
      return;
    }

    try {
      const { assignments, tutors, students } = await invokeSupabaseFunction<{
        assignments: AssignmentRecord[];
        tutors: AssignmentOption[];
        students: AssignmentOption[];
      }>("list-assignments-admin", undefined);

      setAssignments(assignments ?? []);
      setTutors(tutors ?? []);
      setStudents(students ?? []);
    } catch (err) {
      reportClientError("AdminAssignments.fetchData", err);
      const message = err instanceof Error ? err.message : String(err);
      toast({
        title: "Failed to load assignments",
        description: message,
        variant: "destructive",
      });
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!isDemo && !user) return;
    void fetchData();
  }, [isDemo, authLoading, user?.id]);

  const filteredAssignments = sortByKey(
    assignments.filter((assignment) => {
      const matchesSearch = includesSearchTerm(
        [
          assignment.students?.full_name,
          assignment.students?.parents?.full_name,
          assignment.students?.grade,
          assignment.tutors?.full_name,
          assignment.meeting_provider,
        ],
        search,
      );
      const matchesProvider =
        providerFilter === "all" || assignment.meeting_provider === providerFilter;
      return matchesSearch && matchesProvider;
    }),
    (assignment) => assignment.created_at ?? "",
    "desc",
  );

  const handleSubmit = async () => {
    if (!studentId && !editingAssignment) {
      setFormError("Student selection is required.");
      return;
    }

    if (!tutorId) {
      setFormError("Tutor selection is required.");
      return;
    }

    try {
      if (isDemo) {
        closeModal();
        toast({
          title: editingAssignment ? "Assignment updated" : "Assignment created",
          description: "Demo assignment updated locally.",
        });
        return;
      }

      const response = await invokeSupabaseFunction<{ providerMessage?: string | null }>("manage-assignment-admin", {
        action: editingAssignment ? "update" : "create",
        assignment_id: editingAssignment?.id,
        student_id: editingAssignment?.student_id ?? studentId,
        tutor_id: tutorId,
        meeting_provider: meetingProvider || null,
        meeting_link: meetingLink.trim() || null,
        start_date: startDate || null,
        session_day_of_week: Number(sessionDayOfWeek),
        session_start_time: sessionStartTime || null,
        session_end_time: sessionEndTime || null,
        session_frequency: sessionFrequency,
        session_timezone: sessionTimezone || "Africa/Nairobi",
        session_end_date: sessionEndDate || null,
        reminder_enabled: reminderEnabled,
        reminder_offset_minutes: Number(reminderOffsetMinutes || "60"),
      });

      toast({
        title: editingAssignment ? "Assignment updated" : "Assignment created",
        description: editingAssignment
          ? "Tutor assignment saved successfully."
          : "Tutor assignment created successfully.",
      });
      if (response?.providerMessage) {
        toast({
          title: "Meeting setup update",
          description: response.providerMessage,
        });
      }

      closeModal();
      void fetchData(false);
    } catch (err) {
      reportClientError("AdminAssignments.handleSubmit", err, {
        assignmentId: editingAssignment?.id,
      });
      const message = err instanceof Error ? err.message : String(err);
      setFormError(message);
      toast({
        title: editingAssignment ? "Failed to update assignment" : "Failed to create assignment",
        description: message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (assignment: AssignmentRecord) => {
    setSavingId(assignment.id);

    try {
      if (isDemo) {
        setAssignments((prev) => prev.filter((item) => item.id !== assignment.id));
      } else {
        await invokeSupabaseFunction("manage-assignment-admin", {
          action: "delete",
          assignment_id: assignment.id,
        });

        setAssignments((prev) => prev.filter((item) => item.id !== assignment.id));
      }

      toast({
        title: "Assignment removed",
        description: "The tutor-student link has been removed.",
      });
    } catch (err) {
      reportClientError("AdminAssignments.handleDelete", err, {
        assignmentId: assignment.id,
      });
      const message = err instanceof Error ? err.message : String(err);
      toast({
        title: "Failed to remove assignment",
        description: message,
        variant: "destructive",
      });
    } finally {
      setSavingId(null);
      setPendingDeleteAssignment(null);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Tutor Assignments</h2>

          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            <Plus size={16} />
            New Assignment
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by student, parent, tutor, or meeting type..."
              className="w-full rounded-lg border border-border bg-muted py-2 pl-10 pr-4 text-sm text-foreground focus:border-primary focus:outline-none"
            />
          </div>

          <select
            value={providerFilter}
            onChange={(e) => setProviderFilter(e.target.value)}
            className="rounded-lg border border-border bg-muted px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
          >
            <option value="all">All Meeting Types</option>
            <option value="google_meet">Google Meet</option>
            <option value="zoom">Zoom</option>
            <option value="custom">Custom Link</option>
          </select>
        </div>

        {loading ? (
          <TableSkeleton columns={8} />
        ) : filteredAssignments.length === 0 ? (
          <EmptyState
            title={assignments.length === 0 ? "No assignments yet" : "No assignments match these filters"}
            description={
              assignments.length === 0
                ? "Create the first tutor-student assignment from this screen."
                : "Try a different search term or meeting filter."
            }
            icon={GitBranch}
          />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {["Student", "Parent", "Grade", "Assigned Tutor", "Schedule", "Meeting", "Reminder", "Actions"].map(
                    (heading) => (
                      <th
                        key={heading}
                        className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground"
                      >
                        {heading}
                      </th>
                    ),
                  )}
                </tr>
              </thead>

              <tbody>
                {filteredAssignments.map((assignment) => (
                  <tr
                    key={assignment.id}
                    className="border-b border-border last:border-0 hover:bg-muted/50"
                  >
                    <td className="px-4 py-3 text-foreground">
                      {assignment.students?.full_name}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {assignment.students?.parents?.full_name ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {assignment.students?.grade ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-foreground">{assignment.tutors?.full_name}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatSessionSchedule(assignment)}
                      <div className="text-xs text-muted-foreground/80">
                        Starts {assignment.start_date ? formatDate(assignment.start_date) : "not set"}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {assignment.meeting_link ? (
                        <div className="flex items-center gap-2">
                          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                            {(assignment.meeting_provider ?? "custom").replace("_", " ")}
                          </span>
                          <a
                            href={assignment.meeting_link}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-primary hover:underline"
                          >
                            Open Link
                          </a>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">No meeting link</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatSessionReminder(assignment)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => openModal(assignment)}
                          className="rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground hover:bg-muted"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          disabled={savingId === assignment.id}
                          onClick={() => setPendingDeleteAssignment(assignment)}
                          className="rounded-lg border border-destructive/30 px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 disabled:opacity-50"
                        >
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmActionDialog
        open={Boolean(pendingDeleteAssignment)}
        onOpenChange={(open) => {
          if (!open) setPendingDeleteAssignment(null);
        }}
        title="Remove assignment?"
        description={
          pendingDeleteAssignment
            ? `This unlinks ${pendingDeleteAssignment.students?.full_name ?? "this student"} from ${pendingDeleteAssignment.tutors?.full_name ?? "the tutor"}.`
            : ""
        }
        confirmLabel="Remove Assignment"
        onConfirm={() =>
          pendingDeleteAssignment && handleDelete(pendingDeleteAssignment)
        }
      />

      {showModal && (
        <>
          <div className="fixed inset-0 z-40 bg-background/60" onClick={closeModal} />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl rounded-xl border border-border bg-card p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">
                  {editingAssignment ? "Edit Assignment" : "New Assignment"}
                </h3>
                <button onClick={closeModal}>
                  <X className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>

              <div className="space-y-4">
                {formError && (
                  <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                    {formError}
                  </div>
                )}

                <select
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  disabled={Boolean(editingAssignment)}
                  className="w-full rounded-lg border border-border bg-muted px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none disabled:opacity-60"
                >
                  <option value="">Select Student</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.full_name}
                      {student.parent_name ? ` - ${student.parent_name}` : ""}
                    </option>
                  ))}
                </select>

                <select
                  value={tutorId}
                  onChange={(e) => setTutorId(e.target.value)}
                  className="w-full rounded-lg border border-border bg-muted px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                >
                  <option value="">Select Tutor</option>
                  {tutors.map((tutor) => (
                    <option key={tutor.id} value={tutor.id}>
                      {tutor.full_name}
                      {tutor.status ? ` (${tutor.status})` : ""}
                    </option>
                  ))}
                </select>

                <div className="grid gap-3 sm:grid-cols-[180px_1fr]">
                  <select
                    value={meetingProvider}
                    onChange={(e) => setMeetingProvider(e.target.value)}
                    className="w-full rounded-lg border border-border bg-muted px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                  >
                    <option value="google_meet">Google Meet</option>
                    <option value="zoom">Zoom</option>
                    <option value="custom">Custom Link</option>
                  </select>

                  <input
                    value={meetingLink}
                    onChange={(e) => setMeetingLink(e.target.value)}
                    placeholder="Leave blank to auto-create a native Meet or Zoom link"
                    className="w-full rounded-lg border border-border bg-muted px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-xs font-medium uppercase text-muted-foreground">
                      First Session Date
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full rounded-lg border border-border bg-muted px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium uppercase text-muted-foreground">
                      Session Day
                    </label>
                    <select
                      value={sessionDayOfWeek}
                      onChange={(e) => setSessionDayOfWeek(e.target.value)}
                      className="w-full rounded-lg border border-border bg-muted px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                    >
                      {dayOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-xs font-medium uppercase text-muted-foreground">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={sessionStartTime}
                      onChange={(e) => setSessionStartTime(e.target.value)}
                      className="w-full rounded-lg border border-border bg-muted px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium uppercase text-muted-foreground">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={sessionEndTime}
                      onChange={(e) => setSessionEndTime(e.target.value)}
                      className="w-full rounded-lg border border-border bg-muted px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="space-y-2">
                    <label className="text-xs font-medium uppercase text-muted-foreground">
                      Frequency
                    </label>
                    <select
                      value={sessionFrequency}
                      onChange={(e) => setSessionFrequency(e.target.value as "weekly" | "biweekly")}
                      className="w-full rounded-lg border border-border bg-muted px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                    >
                      <option value="weekly">Every week</option>
                      <option value="biweekly">Every 2 weeks</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium uppercase text-muted-foreground">
                      Timezone
                    </label>
                    <input
                      value={sessionTimezone}
                      onChange={(e) => setSessionTimezone(e.target.value)}
                      className="w-full rounded-lg border border-border bg-muted px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium uppercase text-muted-foreground">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={sessionEndDate}
                      onChange={(e) => setSessionEndDate(e.target.value)}
                      className="w-full rounded-lg border border-border bg-muted px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-[auto_1fr]">
                  <label className="flex items-center gap-2 rounded-lg border border-border bg-muted px-4 py-2 text-sm text-foreground">
                    <input
                      type="checkbox"
                      checked={reminderEnabled}
                      onChange={(e) => setReminderEnabled(e.target.checked)}
                    />
                    Enable reminders
                  </label>
                  <input
                    type="number"
                    min={5}
                    step={5}
                    value={reminderOffsetMinutes}
                    onChange={(e) => setReminderOffsetMinutes(e.target.value)}
                    placeholder="Reminder minutes before class"
                    className="w-full rounded-lg border border-border bg-muted px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="rounded-lg border border-border bg-muted/60 p-3 text-xs text-muted-foreground">
                  Add a weekly or biweekly schedule here. If you leave the meeting link blank and your project has Google Calendar or Zoom secrets configured, EduNest will create the native meeting automatically.
                </div>

                <button
                  type="button"
                  onClick={() => void handleSubmit()}
                  className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  {editingAssignment ? "Save Assignment" : "Create Assignment"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
