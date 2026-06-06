import { requireAdmin } from "../_shared/admin.ts";
import { corsHeaders, jsonResponse } from "../_shared/http.ts";
import { logFunctionError } from "../_shared/log.ts";

interface ManageTaskBody {
  action?: "create" | "update" | "delete" | "mark_done" | "mark_pending";
  task_id?: string;
  tutor_id?: string;
  title?: string;
  description?: string | null;
  due_date?: string | null;
}

function validateBody(body: ManageTaskBody) {
  if (!body.action || !["create", "update", "delete", "mark_done", "mark_pending"].includes(body.action)) {
    return "A valid task action is required.";
  }

  if (body.action === "create" || body.action === "update") {
    if (!body.tutor_id) return "Tutor selection is required.";
    if (!body.title?.trim()) return "Task title is required.";
  }

  if ((body.action === "update" || body.action === "delete" || body.action === "mark_done" || body.action === "mark_pending") && !body.task_id) {
    return "Task id is required.";
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

  const body = (await req.json()) as ManageTaskBody;
  const validationError = validateBody(body);

  if (validationError) {
    return jsonResponse({ error: validationError }, { status: 400 });
  }

  const { adminSupabase } = auth;

  try {
    if (body.action === "delete") {
      const { error } = await adminSupabase.from("tasks").delete().eq("id", body.task_id);
      if (error) throw error;
      return jsonResponse({ deletedId: body.task_id });
    }

    if (body.action === "mark_done" || body.action === "mark_pending") {
      const nextStatus = body.action === "mark_done" ? "done" : "pending";
      const { data: task, error } = await adminSupabase
        .from("tasks")
        .update({ status: nextStatus })
        .eq("id", body.task_id)
        .select("id, tutor_id, title, description, due_date, status, created_at")
        .single();

      if (error || !task) throw error ?? new Error("Task not found.");

      const { data: tutor, error: tutorError } = await adminSupabase
        .from("tutors")
        .select("full_name")
        .eq("id", task.tutor_id)
        .single();

      if (tutorError) throw tutorError;

      return jsonResponse({
        task: {
          ...task,
          tutors: { full_name: tutor.full_name },
        },
      });
    }

    const payload = {
      tutor_id: body.tutor_id,
      title: body.title!.trim(),
      description: body.description?.trim() || null,
      due_date: body.due_date || null,
    };

    const query =
      body.action === "create"
        ? adminSupabase.from("tasks").insert(payload)
        : adminSupabase.from("tasks").update(payload).eq("id", body.task_id);

    const { data: task, error } = await query
      .select("id, tutor_id, title, description, due_date, status, created_at")
      .single();

    if (error || !task) throw error ?? new Error("Task could not be saved.");

    const { data: tutor, error: tutorError } = await adminSupabase
      .from("tutors")
      .select("full_name")
      .eq("id", task.tutor_id)
      .single();

    if (tutorError) throw tutorError;

    return jsonResponse({
      task: {
        ...task,
        tutors: { full_name: tutor.full_name },
      },
    });
  } catch (error) {
    logFunctionError("manage-task-admin", error, {
      action: body.action,
      task_id: body.task_id,
      tutor_id: body.tutor_id,
    });

    return jsonResponse(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 400 },
    );
  }
});
