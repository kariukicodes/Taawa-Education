import { requireParent } from "../_shared/admin.ts";
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
  normalizeAssignment,
  normalizeParent,
  normalizeStudent,
  selectWithFallback,
} from "../_shared/schemaCompat.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "GET" && req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, { status: 405 });
  }

  const auth = await requireParent(req);
  if ("error" in auth) return auth.error;

  const { adminSupabase, user } = auth;

  try {
    const parentResult = await selectWithFallback(
      () =>
        adminSupabase
          .from("parents")
          .select("id, full_name, phone, status, user_id, created_at")
          .eq("user_id", user.id)
          .single(),
      () =>
        adminSupabase
          .from("parents")
          .select(PARENT_BASIC_SELECT)
          .eq("user_id", user.id)
          .single(),
      normalizeParent,
    );

    const parent = parentResult.data as Record<string, any> | null;
    const parentError = parentResult.error;

    if (parentError || !parent) {
      throw parentError ?? new Error("Parent profile not found.");
    }

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAgoDate = weekAgo.toISOString().split("T")[0];

    const studentsResult = await selectWithFallback(
      () =>
        adminSupabase
          .from("students")
          .select(STUDENT_FULL_SELECT)
          .eq("parent_id", parent.id)
          .order("full_name", { ascending: true }),
      () =>
        adminSupabase
          .from("students")
          .select(STUDENT_BASIC_SELECT)
          .eq("parent_id", parent.id)
          .order("full_name", { ascending: true }),
      normalizeStudent,
    );

    const students = Array.isArray(studentsResult.data) ? studentsResult.data : [];
    const studentsError = studentsResult.error;

    if (studentsError) throw studentsError;

    const studentIds = (students ?? []).map((student) => student.id);

    const [assignmentsResult, attendanceResult, paymentsResult, recentLessonsResult, lessonsWeekResult] =
      await Promise.all([
        studentIds.length
          ? selectWithFallback(
              () =>
                adminSupabase
                  .from("tutor_assignments")
                  .select(ASSIGNMENT_FULL_SELECT)
                  .in("student_id", studentIds),
              () =>
                adminSupabase
                  .from("tutor_assignments")
                  .select(ASSIGNMENT_BASIC_SELECT)
                  .in("student_id", studentIds),
              normalizeAssignment,
            )
          : Promise.resolve({ data: [], error: null, usedFallback: false }),
        studentIds.length
          ? adminSupabase.from("attendance").select("status").in("student_id", studentIds)
          : Promise.resolve({ data: [], error: null }),
        studentIds.length
          ? adminSupabase
              .from("payments")
              .select("amount_kes")
              .in("student_id", studentIds)
              .in("status", ["Pending", "Overdue"])
          : Promise.resolve({ data: [], error: null }),
        studentIds.length
          ? adminSupabase
              .from("lessons")
              .select("id, student_id, tutor_id, subject, date, comments, performance_rating")
              .in("student_id", studentIds)
              .order("date", { ascending: false })
              .limit(4)
          : Promise.resolve({ data: [], error: null }),
        studentIds.length
          ? adminSupabase
              .from("lessons")
              .select("id", { count: "exact", head: true })
              .in("student_id", studentIds)
              .gte("date", weekAgoDate)
          : Promise.resolve({ count: 0, error: null }),
      ]);

    if (assignmentsResult.error) throw assignmentsResult.error;
    if (attendanceResult.error) throw attendanceResult.error;
    if (paymentsResult.error) throw paymentsResult.error;
    if (recentLessonsResult.error) throw recentLessonsResult.error;
    if (lessonsWeekResult.error) throw lessonsWeekResult.error;

    const assignments = Array.isArray(assignmentsResult.data)
      ? assignmentsResult.data.map((assignment) => normalizeAssignment(assignment))
      : [];

    const tutorIds = Array.from(
      new Set(assignments.map((assignment) => assignment.tutor_id)),
    );

    const { data: tutors, error: tutorsError } = tutorIds.length
      ? await adminSupabase
          .from("tutors")
          .select("id, full_name, phone, user_id")
          .in("id", tutorIds)
      : { data: [], error: null };

    if (tutorsError) throw tutorsError;

    const tutorAuthDetails = new Map<string, Awaited<ReturnType<typeof getAuthUserDetails>>>();
    const tutorUserIds = Array.from(
      new Set((tutors ?? []).map((tutor) => tutor.user_id).filter(Boolean)),
    ) as string[];

    await Promise.all(
      tutorUserIds.map(async (tutorUserId) => {
        tutorAuthDetails.set(
          tutorUserId,
          await getAuthUserDetails(adminSupabase, tutorUserId),
        );
      }),
    );

    const assignmentsByStudentId = new Map(
      assignments.map((assignment) => [assignment.student_id, assignment] as const),
    );
    const tutorsById = new Map((tutors ?? []).map((tutor) => [tutor.id, tutor] as const));
    const studentsById = new Map(students.map((student) => [student.id, student] as const));

    const children = students.map((student) => {
      const assignment = assignmentsByStudentId.get(student.id);
      const tutor = assignment ? tutorsById.get(assignment.tutor_id) : null;
      const authDetails = tutor?.user_id ? tutorAuthDetails.get(tutor.user_id) : null;

      return {
        id: student.id,
        full_name: student.full_name,
        age: student.age,
        grade: student.grade,
        curriculum: student.curriculum,
        status: student.status,
        start_date: assignment?.start_date ?? null,
        meeting_provider: assignment?.meeting_provider ?? null,
        meeting_link: assignment?.meeting_link ?? null,
        session_day_of_week: assignment?.session_day_of_week ?? null,
        session_start_time: assignment?.session_start_time ?? null,
        session_end_time: assignment?.session_end_time ?? null,
        session_frequency: assignment?.session_frequency ?? "weekly",
        session_timezone: assignment?.session_timezone ?? "Africa/Nairobi",
        session_end_date: assignment?.session_end_date ?? null,
        reminder_enabled: assignment?.reminder_enabled ?? true,
        reminder_offset_minutes: assignment?.reminder_offset_minutes ?? 60,
        tutor: tutor
          ? {
              full_name: tutor.full_name,
              phone: tutor.phone,
              email: authDetails?.account_email ?? null,
            }
          : null,
      };
    });

    const totalAttendance = attendanceResult.data?.length ?? 0;
    const presentAttendance =
      attendanceResult.data?.filter((attendance) => attendance.status === "present").length ?? 0;
    const pendingPayments =
      paymentsResult.data?.reduce((sum, payment) => sum + payment.amount_kes, 0) ?? 0;

    const recentLessons = (recentLessonsResult.data ?? []).map((lesson) => {
      const student = studentsById.get(lesson.student_id);
      const tutor = lesson.tutor_id ? tutorsById.get(lesson.tutor_id) : null;

      return {
        ...lesson,
        students: { full_name: student?.full_name ?? "Student" },
        tutors: { full_name: tutor?.full_name ?? "Tutor" },
      };
    });

    return jsonResponse({
      parent: {
        id: parent.id,
        full_name: parent.full_name,
        phone: parent.phone,
        status: parent.status,
      },
      stats: {
        childrenCount: children.length,
        lessonsThisWeek: lessonsWeekResult.count ?? 0,
        attendanceRate:
          totalAttendance > 0 ? Math.round((presentAttendance / totalAttendance) * 100) : 0,
        pendingPayments,
        activeMeetingLinks: children.filter((child) => child.meeting_link).length,
      },
      children,
      recentLessons,
    });
  } catch (error) {
    logFunctionError("get-parent-dashboard", error, {
      user_id: user.id,
    });

    return jsonResponse(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 400 },
    );
  }
});
