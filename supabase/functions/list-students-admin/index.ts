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

  const { data: students, error: studentsError } = await adminSupabase
    .from("students")
    .select("id, parent_id, full_name, age, grade, curriculum, status, archived_at, created_at")
    .order("created_at", { ascending: false });

  if (studentsError) {
    return jsonResponse({ error: studentsError.message }, { status: 400 });
  }

  const parentIds = Array.from(
    new Set((students ?? []).map((student) => student.parent_id).filter(Boolean)),
  );
  const studentIds = (students ?? []).map((student) => student.id);

  let parentNames = new Map<string, string>();
  let tutorInfoByStudent = new Map<string, { tutor_id: string; full_name: string }>();

  if (parentIds.length > 0) {
    const { data: parents, error: parentsError } = await adminSupabase
      .from("parents")
      .select("id, full_name")
      .in("id", parentIds);

    if (parentsError) {
      return jsonResponse({ error: parentsError.message }, { status: 400 });
    }

    parentNames = new Map((parents ?? []).map((parent) => [parent.id, parent.full_name]));
  }

  if (studentIds.length > 0) {
    const { data: assignments, error: assignmentsError } = await adminSupabase
      .from("tutor_assignments")
      .select("student_id, tutor_id, tutors(full_name)")
      .in("student_id", studentIds);

    if (assignmentsError) {
      return jsonResponse({ error: assignmentsError.message }, { status: 400 });
    }

    tutorInfoByStudent = new Map(
      (assignments ?? []).flatMap((assignment) => {
        const tutorName = Array.isArray(assignment.tutors)
          ? assignment.tutors[0]?.full_name
          : assignment.tutors?.full_name;

        return tutorName
          ? [[assignment.student_id, { tutor_id: assignment.tutor_id, full_name: tutorName }] as const]
          : [];
      }),
    );
  }

  return jsonResponse({
    students: (students ?? []).map((student) => {
      const tutor = tutorInfoByStudent.get(student.id);

      return {
        ...student,
        parents: student.parent_id
          ? { full_name: parentNames.get(student.parent_id) ?? null }
          : null,
        tutor_assignments: tutor
          ? [{ tutor_id: tutor.tutor_id, tutors: { full_name: tutor.full_name } }]
          : [],
      };
    }),
  });
});
