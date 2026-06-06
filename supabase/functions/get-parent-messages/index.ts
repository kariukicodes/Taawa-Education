import { requireParent } from "../_shared/admin.ts";
import {
  hydrateThreads,
  markThreadRead,
  resolveParentProfile,
} from "../_shared/messages.ts";
import { corsHeaders, jsonResponse } from "../_shared/http.ts";
import { logFunctionError } from "../_shared/log.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "GET" && req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, { status: 405 });
  }

  const auth = await requireParent(req);
  if ("error" in auth) return auth.error;

  const { adminSupabase, user } = auth;

  try {
    const parent = await resolveParentProfile(adminSupabase, user.id);
    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const threadId = typeof body?.thread_id === "string" ? body.thread_id : null;

    if (threadId) {
      const { data: ownedThread, error: ownedThreadError } = await adminSupabase
        .from("message_threads")
        .select("id")
        .eq("id", threadId)
        .eq("parent_id", parent.id)
        .maybeSingle();

      if (ownedThreadError) throw ownedThreadError;
      if (!ownedThread) throw new Error("Conversation not found.");
      await markThreadRead(adminSupabase, "parent", threadId);
    }

    const { data: threads, error: threadsError } = await adminSupabase
      .from("message_threads")
      .select("id, parent_id, tutor_id, student_id, parent_last_read_at, tutor_last_read_at, last_message_at")
      .eq("parent_id", parent.id)
      .order("last_message_at", { ascending: false });

    if (threadsError) throw threadsError;

    const hydratedThreads = await hydrateThreads(adminSupabase, threads ?? [], "parent");

    return jsonResponse({
      parent: {
        id: parent.id,
        full_name: parent.full_name,
        phone: parent.phone,
      },
      threads: hydratedThreads,
    });
  } catch (error) {
    logFunctionError("get-parent-messages", error, {
      user_id: user.id,
    });

    return jsonResponse(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 400 },
    );
  }
});
