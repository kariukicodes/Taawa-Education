import { requireAdmin } from "../_shared/admin.ts";
import { ensureEmailAvailable, normalizeEmail } from "../_shared/account.ts";
import { corsHeaders, jsonResponse } from "../_shared/http.ts";
import { logFunctionError } from "../_shared/log.ts";

interface CreateParentUserBody {
  email?: string;
  full_name?: string;
  password?: string;
  phone?: string | null;
}

function validateBody(body: CreateParentUserBody) {
  if (!body.full_name?.trim()) return "Parent full name is required.";
  if (!body.email?.trim()) return "Parent email is required.";
  if (!body.password || body.password.length < 8) {
    return "Temporary password must be at least 8 characters.";
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

  const body = (await req.json()) as CreateParentUserBody;
  const validationError = validateBody(body);

  if (validationError) {
    return jsonResponse({ error: validationError }, { status: 400 });
  }

  const { adminSupabase } = auth;
  let createdUserId: string | null = null;

  try {
    await ensureEmailAvailable(adminSupabase, body.email!);

    const { data: authUserData, error: createUserError } =
      await adminSupabase.auth.admin.createUser({
        email: normalizeEmail(body.email!),
        password: body.password,
        email_confirm: true,
      });

    if (createUserError || !authUserData.user) {
      throw new Error(createUserError?.message ?? "Failed to create auth user.");
    }

    createdUserId = authUserData.user.id;

    const { error: roleError } = await adminSupabase.from("user_roles").insert({
      user_id: createdUserId,
      role: "parent",
    });

    if (roleError) throw roleError;

    const { data: parent, error: parentError } = await adminSupabase
      .from("parents")
      .insert({
        user_id: createdUserId,
        full_name: body.full_name!.trim(),
        phone: body.phone?.trim() || null,
      })
      .select("id, full_name, phone, user_id, status, archived_at")
      .single();

    if (parentError) throw parentError;

    return jsonResponse({ parent });
  } catch (error) {
    if (createdUserId) {
      await adminSupabase.auth.admin.deleteUser(createdUserId);
    }

    logFunctionError("create-parent-user", error, {
      email: body.email,
    });

    return jsonResponse(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 400 },
    );
  }
});
