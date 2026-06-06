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

  const [
    assignmentsResult,
    tutorsResult,
    studentsResult,
    parentsResult,
  ] = await Promise.all([
    adminSupabase
      .from("tutor_assignments")
      .select("id, tutor_id, student_id, start_date, meeting_provider, meeting_link, created_at, session_day_of_week, session_start_time, session_end_time, session_frequency, session_timezone, session_end_date, reminder_enabled, reminder_offset_minutes, external_meeting_id")
      .order("created_at", { ascending: false }),
    adminSupabase
      .from("tutors")
      .select("id, full_name, status")
      .order("full_name", { ascending: true }),
    adminSupabase
      .from("students")
      .select("id, parent_id, full_name, grade")
      .order("full_name", { ascending: true }),
    adminSupabase
      .from("parents")
      .select("id, full_name"),
  ]);

  if (assignmentsResult.error) {
    return jsonResponse({ error: assignmentsResult.error.message }, { status: 400 });
  }

  if (tutorsResult.error) {
    return jsonResponse({ error: tutorsResult.error.message }, { status: 400 });
  }

  if (studentsResult.error) {
    return jsonResponse({ error: studentsResult.error.message }, { status: 400 });
  }

  if (parentsResult.error) {
    return jsonResponse({ error: parentsResult.error.message }, { status: 400 });
  }

  const tutorNames = new Map(
    (tutorsResult.data ?? []).map((tutor) => [tutor.id, tutor.full_name] as const),
  );
  const studentsById = new Map(
    (studentsResult.data ?? []).map((student) => [student.id, student] as const),
  );
  const parentNames = new Map(
    (parentsResult.data ?? []).map((parent) => [parent.id, parent.full_name] as const),
  );

  return jsonResponse({
    assignments: (assignmentsResult.data ?? []).map((assignment) => {
      const student = studentsById.get(assignment.student_id);

      return {
        ...assignment,
        tutors: { full_name: tutorNames.get(assignment.tutor_id) ?? "Unknown tutor" },
        students: student
          ? {
              full_name: student.full_name,
              grade: student.grade,
              parents: student.parent_id
                ? { full_name: parentNames.get(student.parent_id) ?? null }
                : null,
            }
          : null,
      };
    }),
    tutors: tutorsResult.data ?? [],
    students: (studentsResult.data ?? []).map((student) => ({
      id: student.id,
      full_name: student.full_name,
      grade: student.grade,
      parent_id: student.parent_id,
      parent_name: student.parent_id ? parentNames.get(student.parent_id) ?? null : null,
    })),
  });
});
