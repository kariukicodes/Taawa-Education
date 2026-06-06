import { requireAdmin } from "../_shared/admin.ts";
import { corsHeaders, jsonResponse } from "../_shared/http.ts";
import { logFunctionError } from "../_shared/log.ts";

interface ManageUserAccountBody {
  action?: "send_reset" | "generate_invite_link";
  entity_id?: string;
  entity_type?: "parent" | "tutor";
  redirect_to?: string;
}

function validateBody(body: ManageUserAccountBody) {
  if (!body.entity_id) return "Entity id is required.";
  if (!body.entity_type || !["parent", "tutor"].includes(body.entity_type)) {
    return "A valid entity type is required.";
  }
  if (!body.action || !["send_reset", "generate_invite_link"].includes(body.action)) {
    return "A valid account action is required.";
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

  const body = (await req.json()) as ManageUserAccountBody;
  const validationError = validateBody(body);

  if (validationError) {
    return jsonResponse({ error: validationError }, { status: 400 });
  }

  const { adminSupabase } = auth;

  try {
    const table = body.entity_type === "parent" ? "parents" : "tutors";
    const { data: entity, error: entityError } = await adminSupabase
      .from(table)
      .select("id, full_name, user_id")
      .eq("id", body.entity_id)
      .single();

    if (entityError || !entity) {
      throw new Error(`${body.entity_type === "parent" ? "Parent" : "Tutor"} record not found.`);
    }

    if (!entity.user_id) {
      throw new Error("This profile does not have a linked login account yet.");
    }

    const { data: userLookup, error: userLookupError } = await adminSupabase.auth.admin.getUserById(
      entity.user_id,
    );

    if (userLookupError || !userLookup.user?.email) {
      throw userLookupError ?? new Error("Linked auth account email could not be resolved.");
    }

    const email = userLookup.user.email;

    if (body.action === "send_reset") {
      const { error: resetError } = await adminSupabase.auth.resetPasswordForEmail(email, {
        redirectTo: body.redirect_to,
      });

      if (resetError) throw resetError;

      return jsonResponse({
        email,
        message: `Password reset email sent to ${email}.`,
      });
    }

    const { data: generatedLink, error: inviteError } = await adminSupabase.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: {
        redirectTo: body.redirect_to,
      },
    });

    if (inviteError || !generatedLink.properties?.action_link) {
      throw inviteError ?? new Error("Unable to generate sign-in link.");
    }

    return jsonResponse({
      email,
      action_link: generatedLink.properties.action_link,
      message: `Invite link generated for ${email}.`,
    });
  } catch (error) {
    logFunctionError("manage-user-account-admin", error, {
      entity_type: body.entity_type,
      entity_id: body.entity_id,
      action: body.action,
    });

    return jsonResponse(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 400 },
    );
  }
});
