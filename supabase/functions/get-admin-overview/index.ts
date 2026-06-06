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
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    .toISOString()
    .split("T")[0];

  try {
    const [
      studentsRes,
      parentsRes,
      tutorsRes,
      assignmentsRes,
      leadsRes,
      paidPaymentsRes,
      duePaymentsRes,
      recentLeadsRes,
      recentStudentsRes,
      recentAssignmentsRes,
      recentPaymentsRes,
    ] = await Promise.all([
      adminSupabase.from("students").select("id", { count: "exact", head: true }).eq("status", "active"),
      adminSupabase.from("parents").select("id", { count: "exact", head: true }).eq("status", "active"),
      adminSupabase.from("tutors").select("id", { count: "exact", head: true }).eq("status", "active"),
      adminSupabase.from("tutor_assignments").select("id", { count: "exact", head: true }),
      adminSupabase
        .from("leads")
        .select("id", { count: "exact", head: true })
        .neq("status", "Enrolled"),
      adminSupabase
        .from("payments")
        .select("amount_kes")
        .eq("status", "Paid")
        .gte("date", monthStart),
      adminSupabase
        .from("payments")
        .select("amount_kes")
        .in("status", ["Pending", "Overdue"]),
      adminSupabase.from("leads").select("id, parent_name, email, status, created_at").order("created_at", { ascending: false }).limit(5),
      adminSupabase.from("students").select("id, full_name, created_at").order("created_at", { ascending: false }).limit(5),
      adminSupabase.from("tutor_assignments").select("id, student_id, tutor_id, created_at").order("created_at", { ascending: false }).limit(5),
      adminSupabase.from("payments").select("id, student_id, amount_kes, status, created_at").order("created_at", { ascending: false }).limit(5),
    ]);

    const firstError = [
      studentsRes.error,
      parentsRes.error,
      tutorsRes.error,
      assignmentsRes.error,
      leadsRes.error,
      paidPaymentsRes.error,
      duePaymentsRes.error,
      recentLeadsRes.error,
      recentStudentsRes.error,
      recentAssignmentsRes.error,
      recentPaymentsRes.error,
    ].find(Boolean);

    if (firstError) {
      return jsonResponse({ error: firstError.message }, { status: 400 });
    }

    const studentIds = Array.from(new Set((recentPaymentsRes.data ?? []).map((payment) => payment.student_id).concat((recentAssignmentsRes.data ?? []).map((assignment) => assignment.student_id))));
    const tutorIds = Array.from(new Set((recentAssignmentsRes.data ?? []).map((assignment) => assignment.tutor_id)));

    const [studentNamesRes, tutorNamesRes] = await Promise.all([
      studentIds.length > 0
        ? adminSupabase.from("students").select("id, full_name").in("id", studentIds)
        : Promise.resolve({ data: [], error: null }),
      tutorIds.length > 0
        ? adminSupabase.from("tutors").select("id, full_name").in("id", tutorIds)
        : Promise.resolve({ data: [], error: null }),
    ]);

    if (studentNamesRes.error || tutorNamesRes.error) {
      return jsonResponse(
        { error: studentNamesRes.error?.message ?? tutorNamesRes.error?.message ?? "Failed to load recent activity context." },
        { status: 400 },
      );
    }

    const studentNames = new Map((studentNamesRes.data ?? []).map((student) => [student.id, student.full_name] as const));
    const tutorNames = new Map((tutorNamesRes.data ?? []).map((tutor) => [tutor.id, tutor.full_name] as const));

    const recentActivities = [
      ...(recentLeadsRes.data ?? []).map((lead) => ({
        id: `lead-${lead.id}`,
        type: "lead",
        title: `New lead from ${lead.parent_name}`,
        description: `${lead.email} - ${lead.status}`,
        created_at: lead.created_at,
      })),
      ...(recentStudentsRes.data ?? []).map((student) => ({
        id: `student-${student.id}`,
        type: "student",
        title: `Student added: ${student.full_name}`,
        description: "New student profile created",
        created_at: student.created_at,
      })),
      ...(recentAssignmentsRes.data ?? []).map((assignment) => ({
        id: `assignment-${assignment.id}`,
        type: "assignment",
        title: `Tutor assigned to ${studentNames.get(assignment.student_id) ?? "student"}`,
        description: tutorNames.get(assignment.tutor_id)
          ? `${tutorNames.get(assignment.tutor_id)} linked`
          : "Tutor assignment updated",
        created_at: assignment.created_at,
      })),
      ...(recentPaymentsRes.data ?? []).map((payment) => ({
        id: `payment-${payment.id}`,
        type: "payment",
        title: `Payment ${payment.status.toLowerCase()} for ${studentNames.get(payment.student_id) ?? "student"}`,
        description: `KES ${payment.amount_kes.toLocaleString("en-US")}`,
        created_at: payment.created_at,
      })),
    ]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 8);

    const paymentsCollected =
      paidPaymentsRes.data?.reduce((sum, payment) => sum + payment.amount_kes, 0) ?? 0;
    const paymentsDue =
      duePaymentsRes.data?.reduce((sum, payment) => sum + payment.amount_kes, 0) ?? 0;

    return jsonResponse({
      stats: {
        students: studentsRes.count ?? 0,
        parents: parentsRes.count ?? 0,
        tutors: tutorsRes.count ?? 0,
        activeAssignments: assignmentsRes.count ?? 0,
        leads: leadsRes.count ?? 0,
        paymentsDue,
        paymentsCollected,
      },
      recentLeads: recentLeadsRes.data ?? [],
      recentActivities,
    });
  } catch (error) {
    logFunctionError("get-admin-overview", error);
    return jsonResponse(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 400 },
    );
  }
});
