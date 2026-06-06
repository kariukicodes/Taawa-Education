import { requireAdmin } from "../_shared/admin.ts";
import { corsHeaders, jsonResponse } from "../_shared/http.ts";

interface ManageAnnouncementBody {
  action?: "create" | "update" | "delete";
  announcement_id?: string;
  message?: string;
  target_role?: string;
}

function validateBody(body: ManageAnnouncementBody) {
  if (!body.action || !["create", "update", "delete"].includes(body.action)) {
    return "A valid announcement action is required.";
  }

  if ((body.action === "create" || body.action === "update") && !body.message?.trim()) {
    return "Announcement message is required.";
  }

  if ((body.action === "create" || body.action === "update") && !body.target_role?.trim()) {
    return "Announcement target role is required.";
  }

  if ((body.action === "update" || body.action === "delete") && !body.announcement_id) {
    return "Announcement id is required.";
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

  const body = (await req.json()) as ManageAnnouncementBody;
  const validationError = validateBody(body);

  if (validationError) {
    return jsonResponse({ error: validationError }, { status: 400 });
  }

  const { adminSupabase } = auth;

  try {
    if (body.action === "delete") {
      const { error: deleteError } = await adminSupabase
        .from("announcements")
        .delete()
        .eq("id", body.announcement_id);

      if (deleteError) throw deleteError;

      return jsonResponse({ deletedId: body.announcement_id });
    }

    if (body.action === "create") {
      const { data: announcement, error: createError } = await adminSupabase
        .from("announcements")
        .insert({
          message: body.message!.trim(),
          target_role: body.target_role!.trim(),
        })
        .select("*")
        .single();

      if (createError || !announcement) {
        throw createError ?? new Error("Unable to create announcement.");
      }

      return jsonResponse({ announcement });
    }

    const { data: announcement, error: updateError } = await adminSupabase
      .from("announcements")
      .update({
        message: body.message!.trim(),
        target_role: body.target_role!.trim(),
      })
      .eq("id", body.announcement_id)
      .select("*")
      .single();

    if (updateError || !announcement) {
      throw updateError ?? new Error("Unable to update announcement.");
    }

    return jsonResponse({ announcement });
  } catch (error) {
    return jsonResponse(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 400 },
    );
  }
});
