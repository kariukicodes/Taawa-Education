import { requireParent } from "../_shared/admin.ts";
import { corsHeaders, jsonResponse } from "../_shared/http.ts";
import { logFunctionError } from "../_shared/log.ts";

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
    const { data: parent, error: parentError } = await adminSupabase
      .from("parents")
      .select("id, full_name, phone, status")
      .eq("user_id", user.id)
      .single();

    if (parentError || !parent) {
      throw parentError ?? new Error("Parent profile not found.");
    }

    const { data: students, error: studentsError } = await adminSupabase
      .from("students")
      .select("id, full_name, grade, age, curriculum, status, start_date")
      .eq("parent_id", parent.id)
      .order("full_name", { ascending: true });

    if (studentsError) throw studentsError;

    const studentIds = (students ?? []).map((student) => student.id);

    const [attendanceResult, paymentsResult, documentsResult, lessonsResult, announcementsResult] =
      await Promise.all([
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

    const studentsById = new Map((students ?? []).map((student) => [student.id, student] as const));
    const tutorsById = new Map((tutors ?? []).map((tutor) => [tutor.id, tutor.full_name] as const));

    return jsonResponse({
      parent,
      students: students ?? [],
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
