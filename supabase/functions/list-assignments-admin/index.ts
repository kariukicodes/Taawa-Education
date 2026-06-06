import { requireAdmin } from "../_shared/admin.ts";
import { corsHeaders, jsonResponse } from "../_shared/http.ts";
import {
  ASSIGNMENT_BASIC_SELECT,
  ASSIGNMENT_FULL_SELECT,
  TUTOR_BASIC_SELECT,
  normalizeAssignment,
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

  const auth = await requireAdmin(req);
  if ("error" in auth) return auth.error;

  const { adminSupabase } = auth;

  const [assignmentsCompat, tutorsCompat, studentsResult, parentsResult] = await Promise.all([
    selectWithFallback(
      () =>
        adminSupabase
          .from("tutor_assignments")
          .select(ASSIGNMENT_FULL_SELECT)
          .order("created_at", { ascending: false }),
      () =>
        adminSupabase
          .from("tutor_assignments")
          .select(ASSIGNMENT_BASIC_SELECT)
          .order("created_at", { ascending: false }),
      normalizeAssignment,
    ),
    selectWithFallback(
      () =>
        adminSupabase
          .from("tutors")
          .select("id, full_name, status")
          .order("full_name", { ascending: true }),
      () =>
        adminSupabase
          .from("tutors")
          .select(TUTOR_BASIC_SELECT)
          .order("full_name", { ascending: true }),
      normalizeTutor,
    ),
    adminSupabase
      .from("students")
      .select("id, parent_id, full_name, grade")
      .order("full_name", { ascending: true }),
    adminSupabase
      .from("parents")
      .select("id, full_name"),
  ]);

  if (assignmentsCompat.error) {
    return jsonResponse({ error: assignmentsCompat.error.message }, { status: 400 });
  }

  if (tutorsCompat.error) {
    return jsonResponse({ error: tutorsCompat.error.message }, { status: 400 });
  }

  if (studentsResult.error) {
    return jsonResponse({ error: studentsResult.error.message }, { status: 400 });
  }

  if (parentsResult.error) {
    return jsonResponse({ error: parentsResult.error.message }, { status: 400 });
  }

  const assignments = Array.isArray(assignmentsCompat.data) ? assignmentsCompat.data : [];
  const tutors = Array.isArray(tutorsCompat.data) ? tutorsCompat.data : [];

  const tutorNames = new Map(
    tutors.map((tutor) => [tutor.id, tutor.full_name] as const),
  );
  const studentsById = new Map(
    (studentsResult.data ?? []).map((student) => [student.id, student] as const),
  );
  const parentNames = new Map(
    (parentsResult.data ?? []).map((parent) => [parent.id, parent.full_name] as const),
  );

  return jsonResponse({
    assignments: assignments.map((assignment) => {
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
    tutors,
    students: (studentsResult.data ?? []).map((student) => ({
      id: student.id,
      full_name: student.full_name,
      grade: student.grade,
      parent_id: student.parent_id,
      parent_name: student.parent_id ? parentNames.get(student.parent_id) ?? null : null,
    })),
  });
});
