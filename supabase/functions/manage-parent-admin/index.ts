import { requireAdmin } from "../_shared/admin.ts";
import { corsHeaders, jsonResponse } from "../_shared/http.ts";
import { logFunctionError } from "../_shared/log.ts";

interface ManageParentBody {
  action?: "update" | "delete" | "archive" | "restore";
  parent_id?: string;
  full_name?: string;
  phone?: string | null;
}

function validateBody(body: ManageParentBody) {
  if (!body.parent_id) return "Parent id is required.";

  if (body.action === "update" && !body.full_name?.trim()) {
    return "Parent full name is required.";
  }

  if (!body.action || !["update", "delete", "archive", "restore"].includes(body.action)) {
    return "A valid parent action is required.";
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

  const body = (await req.json()) as ManageParentBody;
  const validationError = validateBody(body);

  if (validationError) {
    return jsonResponse({ error: validationError }, { status: 400 });
  }

  const { adminSupabase } = auth;

  try {
    const { data: existingParent, error: lookupError } = await adminSupabase
      .from("parents")
      .select("id, user_id")
      .eq("id", body.parent_id)
      .single();

    if (lookupError || !existingParent) {
      throw new Error("Parent record not found.");
    }

    if (body.action === "delete") {
      const { count, error: linkedStudentsError } = await adminSupabase
        .from("students")
        .select("*", { count: "exact", head: true })
        .eq("parent_id", body.parent_id);

      if (linkedStudentsError) throw linkedStudentsError;

      if ((count ?? 0) > 0) {
        throw new Error("Reassign or remove the linked students before deleting this parent.");
      }

      if (existingParent.user_id) {
        const { error: deleteUserError } = await adminSupabase.auth.admin.deleteUser(
          existingParent.user_id,
        );

        if (deleteUserError) throw deleteUserError;
      } else {
        const { error: deleteParentError } = await adminSupabase
          .from("parents")
          .delete()
          .eq("id", body.parent_id);

        if (deleteParentError) throw deleteParentError;
      }

      return jsonResponse({ deletedId: body.parent_id });
    }

    if (body.action === "archive" || body.action === "restore") {
      const nextStatus = body.action === "archive" ? "inactive" : "active";
      const archivedAt = body.action === "archive" ? new Date().toISOString() : null;

      const { data: parent, error: statusError } = await adminSupabase
        .from("parents")
        .update({
          status: nextStatus,
          archived_at: archivedAt,
        })
        .eq("id", body.parent_id)
        .select("id, full_name, phone, user_id, status, archived_at, created_at")
        .single();

      if (statusError) throw statusError;

      const { data: students, error: studentsError } = await adminSupabase
        .from("students")
        .select("full_name, grade")
        .eq("parent_id", body.parent_id)
        .order("created_at", { ascending: false });

      if (studentsError) throw studentsError;

      return jsonResponse({
        parent: {
          ...parent,
          students: students ?? [],
        },
      });
    }

    const { data: parent, error: updateError } = await adminSupabase
      .from("parents")
      .update({
        full_name: body.full_name!.trim(),
        phone: body.phone?.trim() || null,
      })
      .eq("id", body.parent_id)
      .select("id, full_name, phone, user_id, status, archived_at, created_at")
      .single();

    if (updateError) throw updateError;

    const { data: students, error: studentsError } = await adminSupabase
      .from("students")
      .select("full_name, grade")
      .eq("parent_id", body.parent_id)
      .order("created_at", { ascending: false });

    if (studentsError) throw studentsError;

    return jsonResponse({
      parent: {
        ...parent,
        students: students ?? [],
      },
    });
  } catch (error) {
    logFunctionError("manage-parent-admin", error, {
      action: body.action,
      parent_id: body.parent_id,
    });

    return jsonResponse(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 400 },
    );
  }
});
