import { requireAdmin } from "../_shared/admin.ts";
import { corsHeaders, jsonResponse } from "../_shared/http.ts";
import { logFunctionError } from "../_shared/log.ts";

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

  try {
    const [tasksResult, tutorsResult] = await Promise.all([
      adminSupabase
        .from("tasks")
        .select("id, tutor_id, title, description, due_date, status, created_at")
        .order("due_date", { ascending: true, nullsFirst: false }),
      adminSupabase.from("tutors").select("id, full_name").order("full_name", { ascending: true }),
    ]);

    if (tasksResult.error) throw tasksResult.error;
    if (tutorsResult.error) throw tutorsResult.error;

    const tutorNames = new Map(
      (tutorsResult.data ?? []).map((tutor) => [tutor.id, tutor.full_name] as const),
    );

    return jsonResponse({
      tasks: (tasksResult.data ?? []).map((task) => ({
        ...task,
        tutors: task.tutor_id
          ? { full_name: tutorNames.get(task.tutor_id) ?? "Unknown tutor" }
          : null,
      })),
      tutors: tutorsResult.data ?? [],
    });
  } catch (error) {
    logFunctionError("list-tasks-admin", error);
    return jsonResponse(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 400 },
    );
  }
});
