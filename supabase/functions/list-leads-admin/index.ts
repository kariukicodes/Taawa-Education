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
  const { data: leads, error } = await adminSupabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return jsonResponse({ error: error.message }, { status: 400 });
  }

  return jsonResponse({ leads: leads ?? [] });
});
