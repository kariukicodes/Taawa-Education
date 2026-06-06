import { requireAdmin } from "../_shared/admin.ts";
import { getAuthUserDetails } from "../_shared/account.ts";
import { corsHeaders, jsonResponse } from "../_shared/http.ts";
import { logFunctionError } from "../_shared/log.ts";
import {
  getNativeMeetingSetupHint,
  maybeCreateNativeMeeting,
} from "../_shared/meetings.ts";
import {
  ASSIGNMENT_BASIC_SELECT,
  ASSIGNMENT_FULL_SELECT,
  isMissingColumnError,
  normalizeAssignment,
  selectWithFallback,
} from "../_shared/schemaCompat.ts";

interface ManageAssignmentBody {
  action?: "create" | "update" | "delete";
  assignment_id?: string;
  student_id?: string;
  tutor_id?: string;
  meeting_provider?: "google_meet" | "zoom" | "custom" | null;
  meeting_link?: string | null;
  start_date?: string | null;
  session_day_of_week?: number | null;
  session_start_time?: string | null;
  session_end_time?: string | null;
  session_frequency?: "weekly" | "biweekly" | null;
  session_timezone?: string | null;
  session_end_date?: string | null;
  reminder_enabled?: boolean | null;
  reminder_offset_minutes?: number | null;
}

function validateBody(body: ManageAssignmentBody) {
  if (!body.action || !["create", "update", "delete"].includes(body.action)) {
    return "A valid assignment action is required.";
  }

  if (body.action === "create") {
    if (!body.student_id) return "Student selection is required.";
    if (!body.tutor_id) return "Tutor selection is required.";
  }

  if (body.action === "update") {
    if (!body.assignment_id) return "Assignment id is required.";
    if (!body.tutor_id) return "Tutor selection is required.";
  }

  if (body.action === "delete" && !body.assignment_id) {
    return "Assignment id is required.";
  }

  return null;
}

async function loadAssignmentsForStudent(adminSupabase: any, studentId: string) {
  return selectWithFallback(
    () =>
      adminSupabase
        .from("tutor_assignments")
        .select(ASSIGNMENT_FULL_SELECT)
        .eq("student_id", studentId)
        .order("created_at", { ascending: true }),
    () =>
      adminSupabase
        .from("tutor_assignments")
        .select(ASSIGNMENT_BASIC_SELECT)
        .eq("student_id", studentId)
        .order("created_at", { ascending: true }),
    normalizeAssignment,
  );
}

async function loadAssignmentById(adminSupabase: any, assignmentId: string) {
  return selectWithFallback(
    () =>
      adminSupabase
        .from("tutor_assignments")
        .select(ASSIGNMENT_FULL_SELECT)
        .eq("id", assignmentId)
        .single(),
    () =>
      adminSupabase
        .from("tutor_assignments")
        .select(ASSIGNMENT_BASIC_SELECT)
        .eq("id", assignmentId)
        .single(),
    normalizeAssignment,
  );
}

async function createAssignment(adminSupabase: any, userId: string, body: ManageAssignmentBody) {
  const richPayload = {
    tutor_id: body.tutor_id!,
    student_id: body.student_id!,
    assigned_by: userId,
    meeting_provider: body.meeting_provider?.trim() || null,
    meeting_link: body.meeting_link?.trim() || null,
    start_date: body.start_date ?? null,
    session_day_of_week: body.session_day_of_week ?? null,
    session_start_time: body.session_start_time ?? null,
    session_end_time: body.session_end_time ?? null,
    session_frequency: body.session_frequency ?? "weekly",
    session_timezone: body.session_timezone ?? "Africa/Nairobi",
    session_end_date: body.session_end_date ?? null,
    reminder_enabled: body.reminder_enabled ?? true,
    reminder_offset_minutes: body.reminder_offset_minutes ?? 60,
  };

  const richResult = await adminSupabase
    .from("tutor_assignments")
    .insert(richPayload)
    .select(ASSIGNMENT_FULL_SELECT)
    .single();

  if (!richResult.error && richResult.data) {
    return {
      assignment: normalizeAssignment(richResult.data),
      usedFallback: false,
    };
  }

  if (!isMissingColumnError(richResult.error)) {
    throw richResult.error ?? new Error("Unable to create assignment.");
  }

  const fallbackResult = await adminSupabase
    .from("tutor_assignments")
    .insert({
      tutor_id: body.tutor_id!,
      student_id: body.student_id!,
      assigned_by: userId,
    })
    .select(ASSIGNMENT_BASIC_SELECT)
    .single();

  if (fallbackResult.error || !fallbackResult.data) {
    throw fallbackResult.error ?? new Error("Unable to create assignment.");
  }

  return {
    assignment: normalizeAssignment(fallbackResult.data),
    usedFallback: true,
  };
}

async function updateAssignment(
  adminSupabase: any,
  assignmentId: string,
  userId: string,
  body: ManageAssignmentBody,
  existingAssignment: Record<string, unknown> | null,
) {
  const richPayload = {
    tutor_id: body.tutor_id!,
    assigned_by: userId,
    meeting_provider: body.meeting_provider?.trim() || null,
    meeting_link: body.meeting_link?.trim() || null,
    start_date: body.start_date ?? existingAssignment?.start_date ?? null,
    session_day_of_week: body.session_day_of_week ?? existingAssignment?.session_day_of_week ?? null,
    session_start_time: body.session_start_time ?? existingAssignment?.session_start_time ?? null,
    session_end_time: body.session_end_time ?? existingAssignment?.session_end_time ?? null,
    session_frequency: body.session_frequency ?? existingAssignment?.session_frequency ?? "weekly",
    session_timezone: body.session_timezone ?? existingAssignment?.session_timezone ?? "Africa/Nairobi",
    session_end_date: body.session_end_date ?? existingAssignment?.session_end_date ?? null,
    reminder_enabled: body.reminder_enabled ?? existingAssignment?.reminder_enabled ?? true,
    reminder_offset_minutes:
      body.reminder_offset_minutes ?? existingAssignment?.reminder_offset_minutes ?? 60,
  };

  const richResult = await adminSupabase
    .from("tutor_assignments")
    .update(richPayload)
    .eq("id", assignmentId)
    .select(ASSIGNMENT_FULL_SELECT)
    .single();

  if (!richResult.error && richResult.data) {
    return {
      assignment: normalizeAssignment(richResult.data),
      usedFallback: false,
    };
  }

  if (!isMissingColumnError(richResult.error)) {
    throw richResult.error ?? new Error("Unable to update assignment.");
  }

  const fallbackResult = await adminSupabase
    .from("tutor_assignments")
    .update({
      tutor_id: body.tutor_id!,
      assigned_by: userId,
    })
    .eq("id", assignmentId)
    .select(ASSIGNMENT_BASIC_SELECT)
    .single();

  if (fallbackResult.error || !fallbackResult.data) {
    throw fallbackResult.error ?? new Error("Unable to update assignment.");
  }

  return {
    assignment: normalizeAssignment(fallbackResult.data),
    usedFallback: true,
  };
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

  const body = (await req.json()) as ManageAssignmentBody;
  const validationError = validateBody(body);

  if (validationError) {
    return jsonResponse({ error: validationError }, { status: 400 });
  }

  const { adminSupabase, user } = auth;

  try {
    const trimmedMeetingProvider = body.meeting_provider?.trim() || null;
    const trimmedMeetingLink = body.meeting_link?.trim() || null;

    if (body.action === "delete") {
      const { error: deleteError } = await adminSupabase
        .from("tutor_assignments")
        .delete()
        .eq("id", body.assignment_id);

      if (deleteError) throw deleteError;

      return jsonResponse({ deletedId: body.assignment_id });
    }

    let existingAssignment: Record<string, any> | null = null;
    let usedFallbackSchema = false;

    if (body.action === "create") {
      const lookupResult = await loadAssignmentsForStudent(adminSupabase, body.student_id!);

      if (lookupResult.error) throw lookupResult.error;

      usedFallbackSchema = lookupResult.usedFallback;
      const existing = Array.isArray(lookupResult.data) ? lookupResult.data : [];

      let assignmentId: string;
      existingAssignment = existing[0] ?? null;

      if (existing.length === 0) {
        const createdResult = await createAssignment(adminSupabase, user.id, body);
        assignmentId = createdResult.assignment.id;
        existingAssignment = createdResult.assignment;
        usedFallbackSchema = usedFallbackSchema || createdResult.usedFallback;
      } else {
        assignmentId = existing[0].id;
        const updatedResult = await updateAssignment(
          adminSupabase,
          assignmentId,
          user.id,
          body,
          existingAssignment,
        );
        existingAssignment = updatedResult.assignment;
        usedFallbackSchema = usedFallbackSchema || updatedResult.usedFallback;

        const extraIds = existing.slice(1).map((assignment) => assignment.id);

        if (extraIds.length > 0) {
          const { error: cleanupError } = await adminSupabase
            .from("tutor_assignments")
            .delete()
            .in("id", extraIds);

          if (cleanupError) throw cleanupError;
        }
      }

      body.assignment_id = assignmentId;
    } else {
      const currentAssignmentResult = await loadAssignmentById(adminSupabase, body.assignment_id!);

      if (currentAssignmentResult.error || !currentAssignmentResult.data) {
        throw currentAssignmentResult.error ?? new Error("Assignment not found.");
      }

      existingAssignment = currentAssignmentResult.data as Record<string, any>;
      usedFallbackSchema = currentAssignmentResult.usedFallback;

      const updatedResult = await updateAssignment(
        adminSupabase,
        body.assignment_id!,
        user.id,
        body,
        existingAssignment,
      );
      existingAssignment = updatedResult.assignment;
      usedFallbackSchema = usedFallbackSchema || updatedResult.usedFallback;
    }

    const hydratedAssignmentResult = await loadAssignmentById(adminSupabase, body.assignment_id!);

    if (hydratedAssignmentResult.error || !hydratedAssignmentResult.data) {
      throw hydratedAssignmentResult.error ?? new Error("Assignment not found.");
    }

    const hydratedAssignment = hydratedAssignmentResult.data as Record<string, any>;
    usedFallbackSchema = usedFallbackSchema || hydratedAssignmentResult.usedFallback;

    const [
      { data: tutor, error: tutorError },
      { data: student, error: studentError },
    ] = await Promise.all([
      adminSupabase
        .from("tutors")
        .select("id, full_name, user_id")
        .eq("id", hydratedAssignment.tutor_id)
        .single(),
      adminSupabase
        .from("students")
        .select("id, full_name, grade, parent_id")
        .eq("id", hydratedAssignment.student_id)
        .single(),
    ]);

    if (tutorError || !tutor) throw tutorError ?? new Error("Tutor not found.");
    if (studentError || !student) throw studentError ?? new Error("Student not found.");

    const { data: parent, error: parentError } = student.parent_id
      ? await adminSupabase
          .from("parents")
          .select("id, full_name, user_id")
          .eq("id", student.parent_id)
          .single()
      : { data: null, error: null };

    if (parentError) throw parentError;

    const meetingConfigChanged =
      !existingAssignment ||
      existingAssignment.tutor_id !== tutor.id ||
      existingAssignment.meeting_provider !== trimmedMeetingProvider ||
      existingAssignment.start_date !== hydratedAssignment.start_date ||
      existingAssignment.session_day_of_week !== hydratedAssignment.session_day_of_week ||
      existingAssignment.session_start_time !== hydratedAssignment.session_start_time ||
      existingAssignment.session_end_time !== hydratedAssignment.session_end_time ||
      existingAssignment.session_frequency !== hydratedAssignment.session_frequency ||
      existingAssignment.session_timezone !== hydratedAssignment.session_timezone ||
      existingAssignment.session_end_date !== hydratedAssignment.session_end_date ||
      existingAssignment.reminder_enabled !== hydratedAssignment.reminder_enabled ||
      existingAssignment.reminder_offset_minutes !== hydratedAssignment.reminder_offset_minutes;

    let nextMeetingLink =
      trimmedMeetingProvider === "custom"
        ? trimmedMeetingLink
        : trimmedMeetingLink ?? hydratedAssignment.meeting_link ?? null;
    let nextExternalMeetingId =
      trimmedMeetingProvider === "custom" ? null : hydratedAssignment.external_meeting_id ?? null;
    let providerMessage: string | null = null;

    if (
      !usedFallbackSchema &&
      trimmedMeetingProvider &&
      trimmedMeetingProvider !== "custom" &&
      !trimmedMeetingLink
    ) {
      if (!hydratedAssignment.meeting_link || !nextExternalMeetingId || meetingConfigChanged) {
        const tutorDetails = await getAuthUserDetails(adminSupabase, tutor.user_id ?? null);
        const parentDetails =
          parent?.user_id ? await getAuthUserDetails(adminSupabase, parent.user_id) : null;

        try {
          const meetingResult = await maybeCreateNativeMeeting({
            provider: trimmedMeetingProvider,
            title: `${student.full_name} - ${tutor.full_name} Tutoring Session`,
            description: `Recurring tutoring session for ${student.full_name}.`,
            attendeeEmails: [
              tutorDetails.account_email,
              parentDetails?.account_email ?? null,
            ].filter(Boolean) as string[],
            start_date: hydratedAssignment.start_date,
            session_day_of_week: hydratedAssignment.session_day_of_week,
            session_start_time: hydratedAssignment.session_start_time,
            session_end_time: hydratedAssignment.session_end_time,
            session_frequency: hydratedAssignment.session_frequency,
            session_timezone: hydratedAssignment.session_timezone,
            session_end_date: hydratedAssignment.session_end_date,
            reminder_enabled: hydratedAssignment.reminder_enabled,
            reminder_offset_minutes: hydratedAssignment.reminder_offset_minutes,
          });

          nextMeetingLink = meetingResult.meetingLink;
          nextExternalMeetingId = meetingResult.externalMeetingId;
          providerMessage = meetingResult.providerMessage ?? null;
        } catch (meetingError) {
          const setupHint = getNativeMeetingSetupHint(trimmedMeetingProvider);
          const message = meetingError instanceof Error ? meetingError.message : String(meetingError);
          throw new Error(setupHint ? `${message} ${setupHint}` : message);
        }
      }
    }

    if (
      (!usedFallbackSchema && hydratedAssignment.meeting_link !== nextMeetingLink) ||
      (!usedFallbackSchema &&
        hydratedAssignment.external_meeting_id !== nextExternalMeetingId)
    ) {
      const { error: persistMeetingError } = await adminSupabase
        .from("tutor_assignments")
        .update({
          meeting_link: nextMeetingLink,
          external_meeting_id: nextExternalMeetingId,
        })
        .eq("id", hydratedAssignment.id);

      if (persistMeetingError) throw persistMeetingError;
    }

    return jsonResponse({
      assignment: {
        ...hydratedAssignment,
        meeting_link: usedFallbackSchema ? hydratedAssignment.meeting_link ?? null : nextMeetingLink,
        tutors: { full_name: tutor.full_name },
        students: {
          full_name: student.full_name,
          grade: student.grade,
        },
      },
      providerMessage: usedFallbackSchema
        ? "Your database is missing the newer assignment scheduling columns, so this assignment was saved without advanced meeting scheduling."
        : providerMessage,
    });
  } catch (error) {
    logFunctionError("manage-assignment-admin", error, {
      action: body.action,
      assignment_id: body.assignment_id,
      student_id: body.student_id,
      tutor_id: body.tutor_id,
    });

    return jsonResponse(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 400 },
    );
  }
});
