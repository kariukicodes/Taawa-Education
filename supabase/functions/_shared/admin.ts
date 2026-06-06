import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { jsonResponse } from "./http.ts";

type PortalRole = "admin" | "parent" | "teacher";

function getEnv(name: string) {
  const value = Deno.env.get(name);

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

async function requireRole(
  req: Request,
  role: PortalRole,
  forbiddenMessage: string,
) {
  const supabaseUrl = getEnv("SUPABASE_URL");
  const publishableKey =
    Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY");
  const serviceRoleKey = getEnv("SUPABASE_SERVICE_ROLE_KEY");
  const authorization = req.headers.get("Authorization");

  if (!publishableKey || !authorization) {
    return {
      error: jsonResponse(
        { error: "Missing authorization header or publishable key." },
        { status: 401 },
      ),
    };
  }

  const callerSupabase = createClient(supabaseUrl, publishableKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { Authorization: authorization } },
  });

  const adminSupabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const {
    data: { user },
    error: userError,
  } = await callerSupabase.auth.getUser();

  if (userError || !user) {
    return {
      error: jsonResponse(
        { error: userError?.message ?? "Unable to resolve the signed-in user." },
        { status: 401 },
      ),
    };
  }

  const { data: isAdmin, error: roleError } = await callerSupabase.rpc("has_role", {
    _user_id: user.id,
    _role: role,
  });

  if (roleError) {
    return {
      error: jsonResponse({ error: roleError.message }, { status: 500 }),
    };
  }

  if (!isAdmin) {
    return {
      error: jsonResponse(
        { error: forbiddenMessage },
        { status: 403 },
      ),
    };
  }

  return {
    adminSupabase,
    user,
  };
}

export async function requireAdmin(req: Request) {
  return requireRole(req, "admin", "Only admin users can access this resource.");
}

export async function requireTeacher(req: Request) {
  return requireRole(req, "teacher", "Only tutor accounts can access this resource.");
}

export async function requireParent(req: Request) {
  return requireRole(req, "parent", "Only parent accounts can access this resource.");
}
