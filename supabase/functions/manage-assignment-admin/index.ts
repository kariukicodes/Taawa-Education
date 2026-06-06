import { requireAdmin } from "../_shared/admin.ts";
import { getAuthUserDetails } from "../_shared/account.ts";
import { corsHeaders, jsonResponse } from "../_shared/http.ts";
import { logFunctionError } from "../_shared/log.ts";
import {
  getNativeMeetingSetupHint,
  maybeCreateNativeMeeting,
} from "../_shared/meetings.ts";

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

    let existingAssignment:
      | {
          id: string;
          student_id: string;
          tutor_id: string;
          meeting_provider: string | null;
          meeting_link: string | null;
          start_date: string | null;
          session_day_of_week: number | null;
          session_start_time: string | null;
          session_end_time: string | null;
          session_frequency: "weekly" | "biweekly" | null;
          session_timezone: string | null;
          session_end_date: string | null;
          reminder_enabled: boolean | null;
          reminder_offset_minutes: number | null;
          external_meeting_id: string | null;
        }
      | null = null;

    if (body.action === "create") {
      const { data: existingAssignments, error: lookupError } = await adminSupabase
        .from("tutor_assignments")
        .select("id, student_id, tutor_id, meeting_provider, meeting_link, start_date, session_day_of_week, session_start_time, session_end_time, session_frequency, session_timezone, session_end_date, reminder_enabled, reminder_offset_minutes, external_meeting_id")
        .eq("student_id", body.student_id!)
        .order("created_at", { ascending: true });

      if (lookupError) throw lookupError;

      const existing = existingAssignments ?? [];

      let assignmentId: string;
      existingAssignment = existing[0] ?? null;
      const nextMeetingProvider = trimmedMeetingProvider;

      if (existing.length === 0) {
        const { data: createdAssignment, error: createError } = await adminSupabase
          .from("tutor_assignments")
          .insert({
            tutor_id: body.tutor_id!,
            student_id: body.student_id!,
            assigned_by: user.id,
            meeting_provider: nextMeetingProvider,
            meeting_link: trimmedMeetingLink,
            start_date: body.start_date ?? null,
            session_day_of_week: body.session_day_of_week ?? null,
            session_start_time: body.session_start_time ?? null,
            session_end_time: body.session_end_time ?? null,
            session_frequency: body.session_frequency ?? "weekly",
            session_timezone: body.session_timezone ?? "Africa/Nairobi",
            session_end_date: body.session_end_date ?? null,
            reminder_enabled: body.reminder_enabled ?? true,
            reminder_offset_minutes: body.reminder_offset_minutes ?? 60,
          })
          .select("id, student_id, tutor_id, meeting_provider, meeting_link, start_date, session_day_of_week, session_start_time, session_end_time, session_frequency, session_timezone, session_end_date, reminder_enabled, reminder_offset_minutes, external_meeting_id")
          .single();

        if (createError || !createdAssignment) throw createError ?? new Error("Unable to create assignment.");
        assignmentId = createdAssignment.id;
        existingAssignment = createdAssignment;
      } else {
        assignmentId = existing[0].id;

        const { error: updateExistingError } = await adminSupabase
          .from("tutor_assignments")
          .update({
            tutor_id: body.tutor_id!,
            assigned_by: user.id,
            meeting_provider: nextMeetingProvider,
            meeting_link: trimmedMeetingLink,
            start_date: body.start_date ?? existingAssignment?.start_date ?? null,
            session_day_of_week: body.session_day_of_week ?? existingAssignment?.session_day_of_week ?? null,
            session_start_time: body.session_start_time ?? existingAssignment?.session_start_time ?? null,
            session_end_time: body.session_end_time ?? existingAssignment?.session_end_time ?? null,
            session_frequency: body.session_frequency ?? existingAssignment?.session_frequency ?? "weekly",
            session_timezone: body.session_timezone ?? existingAssignment?.session_timezone ?? "Africa/Nairobi",
            session_end_date: body.session_end_date ?? null,
            reminder_enabled: body.reminder_enabled ?? existingAssignment?.reminder_enabled ?? true,
            reminder_offset_minutes: body.reminder_offset_minutes ?? existingAssignment?.reminder_offset_minutes ?? 60,
          })
          .eq("id", assignmentId);

        if (updateExistingError) throw updateExistingError;

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
      const { data: currentAssignment, error: currentAssignmentError } = await adminSupabase
        .from("tutor_assignments")
        .select("id, student_id, tutor_id, meeting_provider, meeting_link, start_date, session_day_of_week, session_start_time, session_end_time, session_frequency, session_timezone, session_end_date, reminder_enabled, reminder_offset_minutes, external_meeting_id")
        .eq("id", body.assignment_id)
        .single();

      if (currentAssignmentError || !currentAssignment) {
        throw currentAssignmentError ?? new Error("Assignment not found.");
      }

      existingAssignment = currentAssignment;

      const { error: updateError } = await adminSupabase
        .from("tutor_assignments")
        .update({
          tutor_id: body.tutor_id!,
          assigned_by: user.id,
          meeting_provider: trimmedMeetingProvider,
          meeting_link: trimmedMeetingLink,
          start_date: body.start_date ?? existingAssignment.start_date ?? null,
          session_day_of_week: body.session_day_of_week ?? existingAssignment.session_day_of_week ?? null,
          session_start_time: body.session_start_time ?? existingAssignment.session_start_time ?? null,
          session_end_time: body.session_end_time ?? existingAssignment.session_end_time ?? null,
          session_frequency: body.session_frequency ?? existingAssignment.session_frequency ?? "weekly",
          session_timezone: body.session_timezone ?? existingAssignment.session_timezone ?? "Africa/Nairobi",
          session_end_date: body.session_end_date ?? null,
          reminder_enabled: body.reminder_enabled ?? existingAssignment.reminder_enabled ?? true,
          reminder_offset_minutes: body.reminder_offset_minutes ?? existingAssignment.reminder_offset_minutes ?? 60,
        })
        .eq("id", body.assignment_id);

      if (updateError) throw updateError;
    }

    const { data: hydratedAssignment, error: hydratedAssignmentError } = await adminSupabase
      .from("tutor_assignments")
      .select("id, tutor_id, student_id, start_date, meeting_provider, meeting_link, created_at, session_day_of_week, session_start_time, session_end_time, session_frequency, session_timezone, session_end_date, reminder_enabled, reminder_offset_minutes, external_meeting_id")
      .eq("id", body.assignment_id)
      .single();

    if (hydratedAssignmentError || !hydratedAssignment) {
      throw hydratedAssignmentError ?? new Error("Assignment not found.");
    }

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

    if (trimmedMeetingProvider && trimmedMeetingProvider !== "custom" && !trimmedMeetingLink) {
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
      hydratedAssignment.meeting_link !== nextMeetingLink ||
      hydratedAssignment.external_meeting_id !== nextExternalMeetingId
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
        meeting_link: nextMeetingLink,
        tutors: { full_name: tutor.full_name },
        students: {
          full_name: student.full_name,
          grade: student.grade,
        },
      },
      providerMessage,
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
