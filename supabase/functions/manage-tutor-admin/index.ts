import { requireAdmin } from "../_shared/admin.ts";
import { corsHeaders, jsonResponse } from "../_shared/http.ts";
import {
  TUTOR_BASIC_SELECT,
  TUTOR_FULL_SELECT,
  isMissingColumnError,
  normalizeTutor,
} from "../_shared/schemaCompat.ts";

interface ManageTutorBody {
  action?: "update" | "delete";
  tutor_id?: string;
  full_name?: string;
  phone?: string | null;
  rate_kes?: number | null;
  status?: "active" | "inactive";
}

function validateBody(body: ManageTutorBody) {
  if (!body.tutor_id) return "Tutor id is required.";

  if (body.action === "update") {
    if (!body.full_name?.trim()) return "Tutor full name is required.";
    if (body.status && !["active", "inactive"].includes(body.status)) {
      return "Tutor status must be active or inactive.";
    }
  }

  if (!body.action || !["update", "delete"].includes(body.action)) {
    return "A valid tutor action is required.";
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

  const body = (await req.json()) as ManageTutorBody;
  const validationError = validateBody(body);

  if (validationError) {
    return jsonResponse({ error: validationError }, { status: 400 });
  }

  const { adminSupabase } = auth;

  try {
    const { data: existingTutor, error: lookupError } = await adminSupabase
      .from("tutors")
      .select("id, user_id")
      .eq("id", body.tutor_id)
      .single();

    if (lookupError || !existingTutor) {
      throw new Error("Tutor record not found.");
    }

    if (body.action === "delete") {
      if (existingTutor.user_id) {
        const { error: deleteUserError } = await adminSupabase.auth.admin.deleteUser(
          existingTutor.user_id,
        );

        if (deleteUserError) throw deleteUserError;
      } else {
        const { error: deleteTutorError } = await adminSupabase
          .from("tutors")
          .delete()
          .eq("id", body.tutor_id);

        if (deleteTutorError) throw deleteTutorError;
      }

      return jsonResponse({ deletedId: body.tutor_id });
    }

    const richUpdateResult = await adminSupabase
      .from("tutors")
      .update({
        full_name: body.full_name!.trim(),
        phone: body.phone?.trim() || null,
        rate_kes: body.rate_kes ?? 0,
        status: body.status ?? "active",
      })
      .eq("id", body.tutor_id)
      .select(TUTOR_FULL_SELECT)
      .single();

    let tutor: Record<string, unknown> | null = null;
    let updateError = richUpdateResult.error;

    if (!richUpdateResult.error && richUpdateResult.data) {
      tutor = normalizeTutor(richUpdateResult.data);
    } else if (isMissingColumnError(richUpdateResult.error)) {
      const fallbackUpdateResult = await adminSupabase
        .from("tutors")
        .update({
          full_name: body.full_name!.trim(),
          phone: body.phone?.trim() || null,
        })
        .eq("id", body.tutor_id)
        .select(TUTOR_BASIC_SELECT)
        .single();

      updateError = fallbackUpdateResult.error;
      tutor = fallbackUpdateResult.data ? normalizeTutor(fallbackUpdateResult.data) : null;
    }

    if (updateError || !tutor) throw updateError ?? new Error("Tutor update failed.");

    const { count, error: countError } = await adminSupabase
      .from("tutor_assignments")
      .select("*", { count: "exact", head: true })
      .eq("tutor_id", body.tutor_id);

    if (countError) throw countError;

    return jsonResponse({
      tutor: {
        ...tutor,
        tutor_assignments: Array.from({ length: count ?? 0 }, () => ({})),
      },
    });
  } catch (error) {
    return jsonResponse(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 400 },
    );
  }
});
