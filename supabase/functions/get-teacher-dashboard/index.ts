import { requireTeacher } from "../_shared/admin.ts";
import { getAuthUserDetails } from "../_shared/account.ts";
import { corsHeaders, jsonResponse } from "../_shared/http.ts";
import { logFunctionError } from "../_shared/log.ts";
import {
  ASSIGNMENT_BASIC_SELECT,
  ASSIGNMENT_FULL_SELECT,
  PARENT_BASIC_SELECT,
  PARENT_FULL_SELECT,
  STUDENT_BASIC_SELECT,
  STUDENT_FULL_SELECT,
  TUTOR_BASIC_SELECT,
  normalizeAssignment,
  normalizeParent,
  normalizeStudent,
  normalizeTutor,
  selectWithFallback,
} from "../_shared/schemaCompat.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "GET" && req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, { status: 405 });
  }

  const auth = await requireTeacher(req);
  if ("error" in auth) return auth.error;

  const { adminSupabase, user } = auth;

  try {
    const tutorResult = await selectWithFallback(
      () =>
        adminSupabase
          .from("tutors")
          .select("id, full_name, phone, status, user_id, created_at")
          .eq("user_id", user.id)
          .single(),
      () =>
        adminSupabase
          .from("tutors")
          .select(TUTOR_BASIC_SELECT)
          .eq("user_id", user.id)
          .single(),
      normalizeTutor,
    );

    const tutor = tutorResult.data as Record<string, any> | null;
    const tutorError = tutorResult.error;

    if (tutorError || !tutor) {
      throw tutorError ?? new Error("Tutor profile not found.");
    }

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAgoDate = weekAgo.toISOString().split("T")[0];

    const [assignmentsResult, tasksResult, lessonsResult] = await Promise.all([
      selectWithFallback(
        () =>
          adminSupabase
            .from("tutor_assignments")
            .select(ASSIGNMENT_FULL_SELECT)
            .eq("tutor_id", tutor.id)
            .order("created_at", { ascending: false }),
        () =>
          adminSupabase
            .from("tutor_assignments")
            .select(ASSIGNMENT_BASIC_SELECT)
            .eq("tutor_id", tutor.id)
            .order("created_at", { ascending: false }),
        normalizeAssignment,
      ),
      adminSupabase
        .from("tasks")
        .select("id, title, description, due_date, status, created_at")
        .eq("tutor_id", tutor.id)
        .order("due_date", { ascending: true, nullsFirst: false }),
      adminSupabase
        .from("lessons")
        .select("id", { count: "exact", head: true })
        .eq("tutor_id", tutor.id)
        .gte("date", weekAgoDate),
    ]);

    if (assignmentsResult.error) throw assignmentsResult.error;
    if (tasksResult.error) throw tasksResult.error;
    if (lessonsResult.error) throw lessonsResult.error;

    const assignments = Array.isArray(assignmentsResult.data) ? assignmentsResult.data : [];
    const studentIds = assignments.map((assignment) => assignment.student_id);

    const { data: students, error: studentsError } = studentIds.length
      ? await selectWithFallback(
          () =>
            adminSupabase
              .from("students")
              .select(STUDENT_FULL_SELECT)
              .in("id", studentIds),
          () =>
            adminSupabase
              .from("students")
              .select(STUDENT_BASIC_SELECT)
              .in("id", studentIds),
          normalizeStudent,
        )
      : { data: [], error: null, usedFallback: false };

    if (studentsError) throw studentsError;

    const parentIds = Array.from(
      new Set((students ?? []).map((student) => student.parent_id).filter(Boolean)),
    ) as string[];

    const { data: parents, error: parentsError } = parentIds.length
      ? await selectWithFallback(
          () =>
            adminSupabase
              .from("parents")
              .select(PARENT_FULL_SELECT)
              .in("id", parentIds),
          () =>
            adminSupabase
              .from("parents")
              .select(PARENT_BASIC_SELECT)
              .in("id", parentIds),
          normalizeParent,
        )
      : { data: [], error: null, usedFallback: false };

    if (parentsError) throw parentsError;

    const parentDetails = new Map<string, Awaited<ReturnType<typeof getAuthUserDetails>>>();
    const parentUserIds = Array.from(
      new Set((parents ?? []).map((parent) => parent.user_id).filter(Boolean)),
    ) as string[];

    await Promise.all(
      parentUserIds.map(async (parentUserId) => {
        parentDetails.set(
          parentUserId,
          await getAuthUserDetails(adminSupabase, parentUserId),
        );
      }),
    );

    const studentsById = new Map((students ?? []).map((student) => [student.id, student] as const));
    const parentsById = new Map((parents ?? []).map((parent) => [parent.id, parent] as const));

    const studentCards = assignments.map((assignment) => {
      const student = studentsById.get(assignment.student_id);
      const parent = student?.parent_id ? parentsById.get(student.parent_id) : null;
      const authDetails =
        parent?.user_id ? parentDetails.get(parent.user_id) : null;

      return {
        id: assignment.id,
        student_id: assignment.student_id,
        full_name: student?.full_name ?? "Unknown student",
        age: student?.age ?? null,
        grade: student?.grade ?? null,
        curriculum: student?.curriculum ?? null,
        status: student?.status ?? "active",
        start_date: assignment.start_date,
        meeting_provider: assignment.meeting_provider ?? null,
        meeting_link: assignment.meeting_link ?? null,
        session_day_of_week: assignment.session_day_of_week ?? null,
        session_start_time: assignment.session_start_time ?? null,
        session_end_time: assignment.session_end_time ?? null,
        session_frequency: assignment.session_frequency ?? "weekly",
        session_timezone: assignment.session_timezone ?? "Africa/Nairobi",
        session_end_date: assignment.session_end_date ?? null,
        reminder_enabled: assignment.reminder_enabled ?? true,
        reminder_offset_minutes: assignment.reminder_offset_minutes ?? 60,
        parent: parent
          ? {
              full_name: parent.full_name,
              phone: parent.phone,
              email: authDetails?.account_email ?? null,
            }
          : null,
      };
    });

    const tasks = tasksResult.data ?? [];

    return jsonResponse({
      tutor: {
        id: tutor.id,
        full_name: tutor.full_name,
        phone: tutor.phone,
        status: tutor.status,
      },
      stats: {
        assignedStudents: studentCards.length,
        pendingTasks: tasks.filter((task) => task.status === "pending").length,
        completedTasks: tasks.filter((task) => task.status === "done").length,
        activeMeetingLinks: studentCards.filter((student) => student.meeting_link).length,
        reportsThisWeek: lessonsResult.count ?? 0,
      },
      students: studentCards.sort((left, right) =>
        left.full_name.localeCompare(right.full_name, undefined, { sensitivity: "base" })
      ),
      tasks: tasks.slice(0, 5),
    });
  } catch (error) {
    logFunctionError("get-teacher-dashboard", error, {
      user_id: user.id,
    });

    return jsonResponse(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 400 },
    );
  }
});
