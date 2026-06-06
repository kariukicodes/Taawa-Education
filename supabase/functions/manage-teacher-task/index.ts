import { requireTeacher } from "../_shared/admin.ts";
import { corsHeaders, jsonResponse } from "../_shared/http.ts";
import { logFunctionError } from "../_shared/log.ts";

interface ManageTeacherTaskBody {
  action?: "mark_done" | "mark_pending";
  task_id?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, { status: 405 });
  }

  const auth = await requireTeacher(req);
  if ("error" in auth) return auth.error;

  const body = (await req.json()) as ManageTeacherTaskBody;
  if (!body.task_id) {
    return jsonResponse({ error: "Task id is required." }, { status: 400 });
  }

  if (!body.action || !["mark_done", "mark_pending"].includes(body.action)) {
    return jsonResponse({ error: "A valid task action is required." }, { status: 400 });
  }

  const { adminSupabase, user } = auth;

  try {
    const { data: tutor, error: tutorError } = await adminSupabase
      .from("tutors")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (tutorError || !tutor) throw tutorError ?? new Error("Tutor profile not found.");

    const nextStatus = body.action === "mark_done" ? "done" : "pending";

    const { data: task, error: updateError } = await adminSupabase
      .from("tasks")
      .update({ status: nextStatus })
      .eq("id", body.task_id)
      .eq("tutor_id", tutor.id)
      .select("id, tutor_id, title, description, due_date, status, created_at")
      .single();

    if (updateError || !task) throw updateError ?? new Error("Task not found.");

    return jsonResponse({ task });
  } catch (error) {
    logFunctionError("manage-teacher-task", error, {
      user_id: user.id,
      task_id: body.task_id,
      action: body.action,
    });
    return jsonResponse(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 400 },
    );
  }
});
