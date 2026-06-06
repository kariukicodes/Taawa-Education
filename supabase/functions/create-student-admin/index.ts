import { requireAdmin } from "../_shared/admin.ts";
import { ensureEmailAvailable, normalizeEmail } from "../_shared/account.ts";
import { corsHeaders, jsonResponse } from "../_shared/http.ts";
import { logFunctionError } from "../_shared/log.ts";

interface CreateStudentAdminBody {
  age?: number;
  curriculum?: "CBC" | "British" | "Montessori" | "Custom";
  full_name?: string;
  grade?: string;
  parent?: {
    email?: string;
    full_name?: string;
    password?: string;
    phone?: string | null;
  };
  parent_id?: string;
  tutor_id?: string;
}

function validateBody(body: CreateStudentAdminBody) {
  if (!body.full_name?.trim()) return "Student name is required.";
  if (!Number.isFinite(body.age)) return "Student age is required.";
  if (!body.grade?.trim()) return "Student grade is required.";

  if (!body.parent_id) {
    if (!body.parent?.full_name?.trim()) return "Parent full name is required.";
    if (!body.parent?.email?.trim()) return "Parent email is required.";
    if (!body.parent?.password || body.parent.password.length < 8) {
      return "Parent temporary password must be at least 8 characters.";
    }
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

  const body = (await req.json()) as CreateStudentAdminBody;
  const validationError = validateBody(body);

  if (validationError) {
    return jsonResponse({ error: validationError }, { status: 400 });
  }

  const { adminSupabase, user } = auth;
  let createdParentUserId: string | null = null;
  let createdParentId = body.parent_id ?? null;
  let parentName = body.parent?.full_name?.trim() ?? null;

  try {
    if (!createdParentId) {
      await ensureEmailAvailable(adminSupabase, body.parent!.email!);

      const { data: authUserData, error: createUserError } =
        await adminSupabase.auth.admin.createUser({
          email: normalizeEmail(body.parent!.email!),
          password: body.parent!.password,
          email_confirm: true,
        });

      if (createUserError || !authUserData.user) {
        throw new Error(createUserError?.message ?? "Failed to create parent auth user.");
      }

      createdParentUserId = authUserData.user.id;

      const { error: roleError } = await adminSupabase.from("user_roles").insert({
        user_id: createdParentUserId,
        role: "parent",
      });

      if (roleError) throw roleError;

      const { data: parent, error: parentError } = await adminSupabase
        .from("parents")
        .insert({
          user_id: createdParentUserId,
          full_name: body.parent!.full_name!.trim(),
          phone: body.parent!.phone?.trim() || null,
        })
        .select("id, full_name")
        .single();

      if (parentError) throw parentError;

      createdParentId = parent.id;
      parentName = parent.full_name;
    } else {
      const { data: parent, error: parentLookupError } = await adminSupabase
        .from("parents")
        .select("id, full_name")
        .eq("id", createdParentId)
        .single();

      if (parentLookupError) throw parentLookupError;

      parentName = parent.full_name;
    }

    const { data: student, error: studentError } = await adminSupabase
      .from("students")
      .insert({
        parent_id: createdParentId,
        full_name: body.full_name!.trim(),
        age: body.age,
        grade: body.grade!.trim(),
        curriculum: body.curriculum ?? "CBC",
      })
      .select("id, parent_id, full_name, age, grade, curriculum, status, archived_at, created_at")
      .single();

    if (studentError) throw studentError;

    let tutorName: string | null = null;

    if (body.tutor_id) {
      const { error: assignmentError } = await adminSupabase
        .from("tutor_assignments")
        .insert({
          tutor_id: body.tutor_id,
          student_id: student.id,
          assigned_by: user.id,
        });

      if (assignmentError) throw assignmentError;

      const { data: tutor, error: tutorLookupError } = await adminSupabase
        .from("tutors")
        .select("full_name")
        .eq("id", body.tutor_id)
        .single();

      if (tutorLookupError) throw tutorLookupError;
      tutorName = tutor.full_name;
    }

    return jsonResponse({
      student: {
        ...student,
        parents: parentName ? { full_name: parentName } : null,
        tutor_assignments: tutorName
          ? [{ tutor_id: body.tutor_id, tutors: { full_name: tutorName } }]
          : [],
      },
      parent: createdParentId
        ? {
            id: createdParentId,
            full_name: parentName,
          }
        : null,
    });
  } catch (error) {
    if (createdParentUserId) {
      await adminSupabase.auth.admin.deleteUser(createdParentUserId);
    }

    logFunctionError("create-student-admin", error, {
      student_name: body.full_name,
      parent_id: body.parent_id,
      parent_email: body.parent?.email,
    });

    return jsonResponse(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 400 },
    );
  }
});
