import { requireAdmin } from "../_shared/admin.ts";
import { corsHeaders, jsonResponse } from "../_shared/http.ts";
import { logFunctionError } from "../_shared/log.ts";

interface ManageStudentBody {
  action?: "update" | "delete" | "archive" | "restore";
  student_id?: string;
  age?: number;
  curriculum?: "CBC" | "British" | "Montessori" | "Custom";
  full_name?: string;
  grade?: string;
  parent_id?: string;
  tutor_id?: string | null;
}

function validateBody(body: ManageStudentBody) {
  if (!body.student_id) return "Student id is required.";

  if (body.action === "update") {
    if (!body.full_name?.trim()) return "Student name is required.";
    if (!Number.isFinite(body.age)) return "Student age is required.";
    if (!body.grade?.trim()) return "Student grade is required.";
    if (!body.parent_id) return "Parent selection is required.";
  }

  if (!body.action || !["update", "delete", "archive", "restore"].includes(body.action)) {
    return "A valid student action is required.";
  }

  return null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, { status: 405 });
  }

  const auth = await requireAdmin(req);
  if ("error" in auth) return auth.error;

  const body = (await req.json()) as ManageStudentBody;
  const validationError = validateBody(body);

  if (validationError) {
    return jsonResponse({ error: validationError }, { status: 400 });
  }

  const { adminSupabase, user } = auth;

  try {
    if (body.action === "delete") {
      const { error: deleteStudentError } = await adminSupabase
        .from("students")
        .delete()
        .eq("id", body.student_id);

      if (deleteStudentError) throw deleteStudentError;

      return jsonResponse({ deletedId: body.student_id });
    }

    if (body.action === "archive" || body.action === "restore") {
      const nextStatus = body.action === "archive" ? "inactive" : "active";
      const archivedAt = body.action === "archive" ? new Date().toISOString() : null;

      const { data: student, error: statusError } = await adminSupabase
        .from("students")
        .update({
          status: nextStatus,
          archived_at: archivedAt,
        })
        .eq("id", body.student_id)
        .select("id, parent_id, full_name, age, grade, curriculum, status, archived_at, created_at")
        .single();

      if (statusError) throw statusError;

      const { data: parent, error: parentLookupError } = await adminSupabase
        .from("parents")
        .select("full_name")
        .eq("id", student.parent_id)
        .single();

      if (parentLookupError) throw parentLookupError;

      const { data: assignment, error: assignmentLookupError } = await adminSupabase
        .from("tutor_assignments")
        .select("tutor_id, tutors(full_name)")
        .eq("student_id", body.student_id)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (assignmentLookupError) throw assignmentLookupError;

      const tutorName = Array.isArray(assignment?.tutors)
        ? assignment.tutors[0]?.full_name
        : assignment?.tutors?.full_name;

      return jsonResponse({
        student: {
          ...student,
          parents: { full_name: parent.full_name },
          tutor_assignments: tutorName && assignment?.tutor_id
            ? [{ tutor_id: assignment.tutor_id, tutors: { full_name: tutorName } }]
            : [],
        },
      });
    }

    const { data: parent, error: parentLookupError } = await adminSupabase
      .from("parents")
      .select("id, full_name")
      .eq("id", body.parent_id)
      .single();

    if (parentLookupError || !parent) {
      throw new Error("Selected parent could not be found.");
    }

    const { data: student, error: updateStudentError } = await adminSupabase
      .from("students")
      .update({
        parent_id: body.parent_id,
        full_name: body.full_name!.trim(),
        age: body.age,
        grade: body.grade!.trim(),
        curriculum: body.curriculum ?? "CBC",
      })
      .eq("id", body.student_id)
      .select("id, parent_id, full_name, age, grade, curriculum, status, archived_at, created_at")
      .single();

    if (updateStudentError) throw updateStudentError;

    const { data: existingAssignments, error: assignmentsLookupError } =
      await adminSupabase
        .from("tutor_assignments")
        .select("id, tutor_id")
        .eq("student_id", body.student_id)
        .order("created_at", { ascending: true });

    if (assignmentsLookupError) throw assignmentsLookupError;

    const assignments = existingAssignments ?? [];
    const primaryAssignment = assignments[0] ?? null;
    const extraAssignmentIds = assignments.slice(1).map((assignment) => assignment.id);

    if (extraAssignmentIds.length > 0) {
      const { error: cleanupAssignmentsError } = await adminSupabase
        .from("tutor_assignments")
        .delete()
        .in("id", extraAssignmentIds);

      if (cleanupAssignmentsError) throw cleanupAssignmentsError;
    }

    let tutorName: string | null = null;
    const nextTutorId = body.tutor_id?.trim() || null;

    if (!nextTutorId) {
      if (primaryAssignment) {
        const { error: deleteAssignmentError } = await adminSupabase
          .from("tutor_assignments")
          .delete()
          .eq("id", primaryAssignment.id);

        if (deleteAssignmentError) throw deleteAssignmentError;
      }
    } else {
      const { data: tutor, error: tutorLookupError } = await adminSupabase
        .from("tutors")
        .select("id, full_name")
        .eq("id", nextTutorId)
        .single();

      if (tutorLookupError || !tutor) {
        throw new Error("Selected tutor could not be found.");
      }

      tutorName = tutor.full_name;

      if (!primaryAssignment) {
        const { error: createAssignmentError } = await adminSupabase
          .from("tutor_assignments")
          .insert({
            tutor_id: nextTutorId,
            student_id: body.student_id,
            assigned_by: user.id,
          });

        if (createAssignmentError) throw createAssignmentError;
      } else if (primaryAssignment.tutor_id !== nextTutorId) {
        const { error: updateAssignmentError } = await adminSupabase
          .from("tutor_assignments")
          .update({ tutor_id: nextTutorId, assigned_by: user.id })
          .eq("id", primaryAssignment.id);

        if (updateAssignmentError) throw updateAssignmentError;
      }
    }

    return jsonResponse({
      student: {
        ...student,
        parents: { full_name: parent.full_name },
        tutor_assignments: tutorName
          ? [{ tutor_id: nextTutorId, tutors: { full_name: tutorName } }]
          : [],
      },
    });
  } catch (error) {
    logFunctionError("manage-student-admin", error, {
      action: body.action,
      student_id: body.student_id,
      parent_id: body.parent_id,
      tutor_id: body.tutor_id,
    });

    return jsonResponse(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 400 },
    );
  }
});
