import { requireAdmin } from "../_shared/admin.ts";
import { corsHeaders, jsonResponse } from "../_shared/http.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "GET" && req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, { status: 405 });
  }

  const auth = await requireAdmin(req);
  if ("error" in auth) return auth.error;

  const { adminSupabase } = auth;

  const [lessonsResult, studentsResult, tutorsResult] = await Promise.all([
    adminSupabase
      .from("lessons")
      .select("id, student_id, tutor_id, subject, date, topics_covered, homework, comments, performance_rating, created_at")
      .order("date", { ascending: false }),
    adminSupabase.from("students").select("id, full_name"),
    adminSupabase.from("tutors").select("id, full_name"),
  ]);

  if (lessonsResult.error) {
    return jsonResponse({ error: lessonsResult.error.message }, { status: 400 });
  }

  if (studentsResult.error) {
    return jsonResponse({ error: studentsResult.error.message }, { status: 400 });
  }

  if (tutorsResult.error) {
    return jsonResponse({ error: tutorsResult.error.message }, { status: 400 });
  }

  const studentNames = new Map((studentsResult.data ?? []).map((student) => [student.id, student.full_name] as const));
  const tutorNames = new Map((tutorsResult.data ?? []).map((tutor) => [tutor.id, tutor.full_name] as const));

  return jsonResponse({
    lessons: (lessonsResult.data ?? []).map((lesson) => ({
      ...lesson,
      students: { full_name: studentNames.get(lesson.student_id) ?? "Unknown student" },
      tutors: { full_name: tutorNames.get(lesson.tutor_id) ?? "Unknown tutor" },
    })),
  });
});
