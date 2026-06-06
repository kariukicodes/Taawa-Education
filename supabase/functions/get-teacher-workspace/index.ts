import { requireTeacher } from "../_shared/admin.ts";
import { corsHeaders, jsonResponse } from "../_shared/http.ts";
import { logFunctionError } from "../_shared/log.ts";

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
    const { data: tutor, error: tutorError } = await adminSupabase
      .from("tutors")
      .select("id, full_name, phone, status")
      .eq("user_id", user.id)
      .single();

    if (tutorError || !tutor) {
      throw tutorError ?? new Error("Tutor profile not found.");
    }

    const [assignmentsResult, tasksResult, attendanceResult, lessonsResult, earningsResult, announcementsResult] =
      await Promise.all([
        adminSupabase
          .from("tutor_assignments")
          .select("id, student_id, created_at")
          .eq("tutor_id", tutor.id)
          .order("created_at", { ascending: false }),
        adminSupabase
          .from("tasks")
          .select("id, tutor_id, title, description, due_date, status, created_at")
          .eq("tutor_id", tutor.id)
          .order("due_date", { ascending: true, nullsFirst: false }),
        adminSupabase
          .from("attendance")
          .select("id, student_id, tutor_id, lesson_date, status, created_at")
          .eq("tutor_id", tutor.id)
          .order("lesson_date", { ascending: false }),
        adminSupabase
          .from("lessons")
          .select("id, student_id, tutor_id, subject, date, topics_covered, homework, performance_rating, comments, created_at")
          .eq("tutor_id", tutor.id)
          .order("date", { ascending: false }),
        adminSupabase
          .from("earnings")
          .select("id, tutor_id, description, amount_kes, date, created_at")
          .eq("tutor_id", tutor.id)
          .order("date", { ascending: false }),
        adminSupabase
          .from("announcements")
          .select("id, message, target_role, created_at")
          .in("target_role", ["teacher", "all"])
          .order("created_at", { ascending: false }),
      ]);

    const firstError = [
      assignmentsResult.error,
      tasksResult.error,
      attendanceResult.error,
      lessonsResult.error,
      earningsResult.error,
      announcementsResult.error,
    ].find(Boolean);

    if (firstError) {
      throw firstError;
    }

    const studentIds = Array.from(
      new Set((assignmentsResult.data ?? []).map((assignment) => assignment.student_id)),
    );

    const { data: students, error: studentsError } = studentIds.length
      ? await adminSupabase
          .from("students")
          .select("id, full_name, age, grade, curriculum, subjects, start_date, status")
          .in("id", studentIds)
      : { data: [], error: null };

    if (studentsError) throw studentsError;

    const studentsById = new Map((students ?? []).map((student) => [student.id, student] as const));

    return jsonResponse({
      tutor,
      students: students ?? [],
      tasks: tasksResult.data ?? [],
      attendance: (attendanceResult.data ?? []).map((record) => ({
        ...record,
        students: {
          full_name: studentsById.get(record.student_id)?.full_name ?? "Student",
        },
      })),
      lessons: (lessonsResult.data ?? []).map((lesson) => ({
        ...lesson,
        students: {
          full_name: studentsById.get(lesson.student_id)?.full_name ?? "Student",
        },
      })),
      earnings: earningsResult.data ?? [],
      announcements: announcementsResult.data ?? [],
    });
  } catch (error) {
    logFunctionError("get-teacher-workspace", error, {
      user_id: user.id,
    });

    return jsonResponse(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 400 },
    );
  }
});
