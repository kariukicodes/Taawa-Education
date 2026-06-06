import { requireAdmin } from "../_shared/admin.ts";
import { corsHeaders, jsonResponse } from "../_shared/http.ts";

interface ManageLeadBody {
  action?: "create" | "update" | "delete" | "convert";
  child_age?: number | null;
  child_name?: string | null;
  curriculum_interest?: string | null;
  email?: string;
  follow_up_date?: string | null;
  grade?: string | null;
  lead_id?: string;
  message?: string | null;
  notes?: string | null;
  parent_name?: string;
  phone?: string | null;
  referral_source?: string | null;
  status?: string;
  create_student?: boolean;
  tutor_id?: string | null;
}

function validateBody(body: ManageLeadBody) {
  if (!body.action || !["create", "update", "delete", "convert"].includes(body.action)) {
    return "A valid lead action is required.";
  }

  if (body.action === "create") {
    if (!body.parent_name?.trim()) return "Parent name is required.";
    if (!body.email?.trim()) return "Email is required.";
  }

  if (body.action === "update") {
    if (!body.lead_id) return "Lead id is required.";
    if (!body.parent_name?.trim()) return "Parent name is required.";
    if (!body.email?.trim()) return "Email is required.";
    if (!body.status?.trim()) return "Lead status is required.";
  }

  if (body.action === "delete" && !body.lead_id) {
    return "Lead id is required.";
  }

  if (body.action === "convert" && !body.lead_id) {
    return "Lead id is required.";
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

  const body = (await req.json()) as ManageLeadBody;
  const validationError = validateBody(body);

  if (validationError) {
    return jsonResponse({ error: validationError }, { status: 400 });
  }

  const { adminSupabase, user } = auth;
  let createdParentId: string | null = null;
  let createdStudentId: string | null = null;

  try {
    if (body.action === "delete") {
      const { error: deleteError } = await adminSupabase
        .from("leads")
        .delete()
        .eq("id", body.lead_id);

      if (deleteError) throw deleteError;

      return jsonResponse({ deletedId: body.lead_id });
    }

    if (body.action === "create") {
      const { data: lead, error: createError } = await adminSupabase
        .from("leads")
        .insert({
          parent_name: body.parent_name!.trim(),
          email: body.email!.trim().toLowerCase(),
          phone: body.phone?.trim() || null,
          child_name: body.child_name?.trim() || null,
          child_age: body.child_age ?? null,
          grade: body.grade?.trim() || null,
          curriculum_interest: body.curriculum_interest?.trim() || null,
          referral_source: body.referral_source?.trim() || null,
          message: body.message?.trim() || null,
          status: body.status?.trim() || "New",
          notes: body.notes?.trim() || null,
          follow_up_date: body.follow_up_date || null,
        })
        .select("*")
        .single();

      if (createError || !lead) throw createError ?? new Error("Unable to create lead.");
      return jsonResponse({ lead });
    }

    if (body.action === "update") {
      const { data: lead, error: updateError } = await adminSupabase
        .from("leads")
        .update({
          parent_name: body.parent_name!.trim(),
          email: body.email!.trim().toLowerCase(),
          phone: body.phone?.trim() || null,
          child_name: body.child_name?.trim() || null,
          child_age: body.child_age ?? null,
          grade: body.grade?.trim() || null,
          curriculum_interest: body.curriculum_interest?.trim() || null,
          referral_source: body.referral_source?.trim() || null,
          message: body.message?.trim() || null,
          status: body.status!.trim(),
          notes: body.notes?.trim() || null,
          follow_up_date: body.follow_up_date || null,
        })
        .eq("id", body.lead_id)
        .select("*")
        .single();

      if (updateError || !lead) throw updateError ?? new Error("Unable to update lead.");
      return jsonResponse({ lead });
    }

    const { data: lead, error: leadLookupError } = await adminSupabase
      .from("leads")
      .select("*")
      .eq("id", body.lead_id)
      .single();

    if (leadLookupError || !lead) {
      throw new Error("Lead record not found.");
    }

    const { data: parent, error: parentError } = await adminSupabase
      .from("parents")
      .insert({
        full_name: lead.parent_name,
        phone: lead.phone,
        user_id: null,
      })
      .select("id, full_name")
      .single();

    if (parentError || !parent) throw parentError ?? new Error("Unable to create parent profile.");
    createdParentId = parent.id;

    let student:
      | {
          id: string;
          full_name: string;
          grade: string | null;
        }
      | null = null;

    if (body.create_student !== false) {
      if (!lead.child_name?.trim()) {
        throw new Error("This lead does not include a child name, so a student record cannot be created.");
      }

      const { data: createdStudent, error: studentError } = await adminSupabase
        .from("students")
        .insert({
          parent_id: parent.id,
          full_name: lead.child_name.trim(),
          age: lead.child_age ?? null,
          grade: lead.grade?.trim() || null,
          curriculum: lead.curriculum_interest?.trim() || "CBC",
        })
        .select("id, full_name, grade")
        .single();

      if (studentError || !createdStudent) {
        throw studentError ?? new Error("Unable to create student record.");
      }

      createdStudentId = createdStudent.id;
      student = createdStudent;

      if (body.tutor_id) {
        const { error: assignmentError } = await adminSupabase
          .from("tutor_assignments")
          .insert({
            tutor_id: body.tutor_id,
            student_id: createdStudent.id,
            assigned_by: user.id,
          });

        if (assignmentError) throw assignmentError;
      }
    }

    const { data: updatedLead, error: updateLeadError } = await adminSupabase
      .from("leads")
      .update({
        status: "Enrolled",
        notes: lead.notes
          ? `${lead.notes}\nConverted on ${new Date().toISOString()}`
          : `Converted on ${new Date().toISOString()}`,
      })
      .eq("id", lead.id)
      .select("*")
      .single();

    if (updateLeadError || !updatedLead) {
      throw updateLeadError ?? new Error("Unable to mark lead as converted.");
    }

    return jsonResponse({
      lead: updatedLead,
      parent: {
        id: parent.id,
        full_name: parent.full_name,
      },
      student,
    });
  } catch (error) {
    if (createdStudentId) {
      await adminSupabase.from("students").delete().eq("id", createdStudentId);
    }

    if (createdParentId) {
      await adminSupabase.from("parents").delete().eq("id", createdParentId);
    }

    return jsonResponse(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 400 },
    );
  }
});
