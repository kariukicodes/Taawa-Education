import { requireParent } from "../_shared/admin.ts";
import {
  ensureMessageThreadForParent,
  markThreadRead,
  resolveParentProfile,
} from "../_shared/messages.ts";
import { corsHeaders, jsonResponse } from "../_shared/http.ts";
import { logFunctionError } from "../_shared/log.ts";

type SendParentMessageBody = {
  thread_id?: string;
  student_id?: string;
  body?: string;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, { status: 405 });
  }

  const auth = await requireParent(req);
  if ("error" in auth) return auth.error;

  const { adminSupabase, user } = auth;
  const payload = (await req.json()) as SendParentMessageBody;
  const messageBody = payload.body?.trim();

  if (!messageBody) {
    return jsonResponse({ error: "Message text is required." }, { status: 400 });
  }

  try {
    const parent = await resolveParentProfile(adminSupabase, user.id);

    let threadId = payload.thread_id ?? null;

    if (threadId) {
      const { data: ownedThread, error: ownedThreadError } = await adminSupabase
        .from("message_threads")
        .select("id")
        .eq("id", threadId)
        .eq("parent_id", parent.id)
        .maybeSingle();

      if (ownedThreadError) throw ownedThreadError;
      if (!ownedThread) throw new Error("Conversation not found.");
    } else if (payload.student_id) {
      threadId = await ensureMessageThreadForParent(
        adminSupabase,
        parent.id,
        payload.student_id,
        user.id,
      );
    } else {
      throw new Error("Select a child or existing conversation before sending a message.");
    }

    const { error: insertError } = await adminSupabase
      .from("messages")
      .insert({
        thread_id: threadId,
        sender_user_id: user.id,
        sender_role: "parent",
        body: messageBody,
      });

    if (insertError) throw insertError;

    await markThreadRead(adminSupabase, "parent", threadId);

    return jsonResponse({ success: true, thread_id: threadId });
  } catch (error) {
    logFunctionError("send-parent-message", error, {
      user_id: user.id,
      thread_id: payload.thread_id,
      student_id: payload.student_id,
    });

    return jsonResponse(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 400 },
    );
  }
});
