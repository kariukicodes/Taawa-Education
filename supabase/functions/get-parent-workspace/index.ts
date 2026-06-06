import { requireParent } from "../_shared/admin.ts";
import { corsHeaders, jsonResponse } from "../_shared/http.ts";
import { logFunctionError } from "../_shared/log.ts";
import {
  PARENT_BASIC_SELECT,
  PARENT_FULL_SELECT,
  STUDENT_BASIC_SELECT,
  STUDENT_FULL_SELECT,
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

    const studentIds = students.map((student) => student.id);

    const [assignmentsResult, attendanceResult, paymentsResult, documentsResult, lessonsResult, announcementsResult] =
      await Promise.all([
        studentIds.length
          ? adminSupabase
              .from("tutor_assignments")
              .select("student_id, tutor_id")
              .in("student_id", studentIds)
          : Promise.resolve({ data: [], error: null }),
        studentIds.length
          ? adminSupabase
              .from("attendance")
              .select("id, student_id, tutor_id, lesson_date, status, created_at")
              .in("student_id", studentIds)
              .order("lesson_date", { ascending: false })
          : Promise.resolve({ data: [], error: null }),
        studentIds.length
          ? adminSupabase
              .from("payments")
              .select("id, student_id, description, amount_kes, date, status, created_at")
              .in("student_id", studentIds)
              .order("date", { ascending: false })
          : Promise.resolve({ data: [], error: null }),
        studentIds.length
          ? adminSupabase
              .from("documents")
              .select("id, student_id, file_name, file_url, uploaded_by, created_at")
              .in("student_id", studentIds)
              .order("created_at", { ascending: false })
          : Promise.resolve({ data: [], error: null }),
        studentIds.length
          ? adminSupabase
              .from("lessons")
              .select("id, student_id, tutor_id, subject, date, topics_covered, homework, performance_rating, comments, created_at")
              .in("student_id", studentIds)
              .order("date", { ascending: false })
          : Promise.resolve({ data: [], error: null }),
        adminSupabase
          .from("announcements")
          .select("id, message, target_role, created_at")
          .in("target_role", ["parent", "all"])
          .order("created_at", { ascending: false }),
      ]);

    const firstError = [
      assignmentsResult.error,
      attendanceResult.error,
      paymentsResult.error,
      documentsResult.error,
      lessonsResult.error,
      announcementsResult.error,
    ].find(Boolean);

    if (firstError) throw firstError;

    const tutorIds = Array.from(
      new Set(
        (attendanceResult.data ?? [])
          .map((record) => record.tutor_id)
          .concat((assignmentsResult.data ?? []).map((assignment) => assignment.tutor_id))
          .concat((lessonsResult.data ?? []).map((lesson) => lesson.tutor_id)),
      ),
    );

    const { data: tutors, error: tutorsError } = tutorIds.length
      ? await adminSupabase
          .from("tutors")
          .select("id, full_name")
          .in("id", tutorIds)
      : { data: [], error: null };

    if (tutorsError) throw tutorsError;

    const studentsById = new Map(students.map((student) => [student.id, student] as const));
    const tutorsById = new Map((tutors ?? []).map((tutor) => [tutor.id, tutor.full_name] as const));

    return jsonResponse({
      parent,
      students,
      attendance: (attendanceResult.data ?? []).map((record) => ({
        ...record,
        students: { full_name: studentsById.get(record.student_id)?.full_name ?? "Student" },
        tutors: { full_name: tutorsById.get(record.tutor_id) ?? "Tutor" },
      })),
      payments: (paymentsResult.data ?? []).map((payment) => ({
        ...payment,
        students: { full_name: studentsById.get(payment.student_id)?.full_name ?? "Student" },
      })),
      documents: (documentsResult.data ?? []).map((document) => ({
        ...document,
        students: { full_name: studentsById.get(document.student_id)?.full_name ?? "Student" },
      })),
      lessons: (lessonsResult.data ?? []).map((lesson) => ({
        ...lesson,
        students: { full_name: studentsById.get(lesson.student_id)?.full_name ?? "Student" },
        tutors: { full_name: tutorsById.get(lesson.tutor_id) ?? "Tutor" },
      })),
      announcements: announcementsResult.data ?? [],
    });
  } catch (error) {
    logFunctionError("get-parent-workspace", error, {
      user_id: user.id,
    });

    return jsonResponse(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 400 },
    );
  }
});
