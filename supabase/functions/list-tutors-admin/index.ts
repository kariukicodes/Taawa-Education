import { requireAdmin } from "../_shared/admin.ts";
import { getAuthUserDetails } from "../_shared/account.ts";
import { corsHeaders, jsonResponse } from "../_shared/http.ts";
import { logFunctionError } from "../_shared/log.ts";
import {
  TUTOR_BASIC_SELECT,
  TUTOR_FULL_SELECT,
  normalizeTutor,
  selectWithFallback,
} from "../_shared/schemaCompat.ts";

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

  const tutorsResult = await selectWithFallback(
    () =>
      adminSupabase
        .from("tutors")
        .select(TUTOR_FULL_SELECT)
        .order("created_at", { ascending: false }),
    () =>
      adminSupabase
        .from("tutors")
        .select(TUTOR_BASIC_SELECT)
        .order("created_at", { ascending: false }),
    normalizeTutor,
  );

  if (tutorsResult.error) {
    return jsonResponse({ error: tutorsResult.error.message }, { status: 400 });
  }

  const tutors = Array.isArray(tutorsResult.data) ? tutorsResult.data : [];

  const tutorIds = (tutors ?? []).map((t) => t.id);
  let assignmentCounts = new Map<string, number>();

  if (tutorIds.length > 0) {
    const { data: assignments, error: assignmentsError } = await adminSupabase
      .from("tutor_assignments")
      .select("tutor_id")
      .in("tutor_id", tutorIds);

    if (assignmentsError) {
      return jsonResponse({ error: assignmentsError.message }, { status: 400 });
    }

    assignmentCounts = (assignments ?? []).reduce((map, assignment) => {
      map.set(assignment.tutor_id, (map.get(assignment.tutor_id) ?? 0) + 1);
      return map;
    }, new Map<string, number>());
  }

  try {
    const authDetailsByUserId = new Map<string, Awaited<ReturnType<typeof getAuthUserDetails>>>();
    const uniqueUserIds = Array.from(
      new Set((tutors ?? []).map((tutor) => tutor.user_id).filter(Boolean)),
    ) as string[];

    await Promise.all(
      uniqueUserIds.map(async (userId) => {
        authDetailsByUserId.set(userId, await getAuthUserDetails(adminSupabase, userId));
      }),
    );

    return jsonResponse({
      tutors: (tutors ?? []).map((tutor) => ({
        ...tutor,
        ...(authDetailsByUserId.get(tutor.user_id ?? "") ?? {
          account_email: null,
          last_sign_in_at: null,
          has_login: false,
        }),
        tutor_assignments: Array.from(
          { length: assignmentCounts.get(tutor.id) ?? 0 },
          () => ({})
        ),
      })),
    });
  } catch (error) {
    logFunctionError("list-tutors-admin", error);
    return jsonResponse(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 400 },
    );
  }
});
