import { requireAdmin } from "../_shared/admin.ts";
import { getAuthUserDetails } from "../_shared/account.ts";
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

  const { data: parents, error: parentsError } = await adminSupabase
    .from("parents")
    .select("id, full_name, phone, user_id, status, archived_at, created_at")
    .order("created_at", { ascending: false });

  if (parentsError) {
    return jsonResponse({ error: parentsError.message }, { status: 400 });
  }

  const parentIds = (parents ?? []).map((parent) => parent.id);
  let studentsByParent = new Map<string, Array<{ full_name: string; grade: string | null }>>();

  if (parentIds.length > 0) {
    const { data: students, error: studentsError } = await adminSupabase
      .from("students")
      .select("parent_id, full_name, grade")
      .in("parent_id", parentIds)
      .order("created_at", { ascending: false });

    if (studentsError) {
      return jsonResponse({ error: studentsError.message }, { status: 400 });
    }

    studentsByParent = (students ?? []).reduce((map, student) => {
      const current = map.get(student.parent_id) ?? [];
      current.push({
        full_name: student.full_name,
        grade: student.grade,
      });
      map.set(student.parent_id, current);
      return map;
    }, new Map<string, Array<{ full_name: string; grade: string | null }>>());
  }

  try {
    const authDetailsByUserId = new Map<string, Awaited<ReturnType<typeof getAuthUserDetails>>>();

    const uniqueUserIds = Array.from(
      new Set((parents ?? []).map((parent) => parent.user_id).filter(Boolean)),
    ) as string[];

    await Promise.all(
      uniqueUserIds.map(async (userId) => {
        authDetailsByUserId.set(userId, await getAuthUserDetails(adminSupabase, userId));
      }),
    );

    return jsonResponse({
      parents: (parents ?? []).map((parent) => ({
        ...parent,
        ...(authDetailsByUserId.get(parent.user_id ?? "") ?? {
          account_email: null,
          last_sign_in_at: null,
          has_login: false,
        }),
        students: studentsByParent.get(parent.id) ?? [],
      })),
    });
  } catch (error) {
    logFunctionError("list-parents-admin", error);
    return jsonResponse(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 400 },
    );
  }
});
