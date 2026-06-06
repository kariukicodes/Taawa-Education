import {
  AssignmentSchedule,
  buildGoogleRecurrenceRule,
  buildZoomWeeklyDay,
  getFirstSessionDate,
  getSessionDurationMinutes,
  isScheduleConfigured,
  toDateOnly,
  toLocalDateTime,
  validateSchedule,
} from "./schedule.ts";

type MeetingProvider = "google_meet" | "zoom" | "custom";

export type MeetingRequest = AssignmentSchedule & {
  provider: MeetingProvider;
  title: string;
  description: string;
  attendeeEmails?: string[];
};

export type MeetingResult = {
  meetingLink: string | null;
  externalMeetingId: string | null;
  providerMessage?: string | null;
};

function getOptionalEnv(name: string) {
  return Deno.env.get(name)?.trim() || null;
}

function requireEnv(name: string) {
  const value = getOptionalEnv(name);

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

async function getGoogleAccessToken() {
  const clientId = requireEnv("GOOGLE_CLIENT_ID");
  const clientSecret = requireEnv("GOOGLE_CLIENT_SECRET");
  const refreshToken = requireEnv("GOOGLE_REFRESH_TOKEN");

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  const payload = await response.json();

  if (!response.ok || !payload.access_token) {
    throw new Error(payload.error_description ?? payload.error ?? "Unable to authenticate with Google Calendar.");
  }

  return payload.access_token as string;
}

async function createGoogleMeet(request: MeetingRequest): Promise<MeetingResult> {
  const validationError = validateSchedule(request);
  if (validationError) throw new Error(validationError);

  const calendarId = requireEnv("GOOGLE_CALENDAR_ID");
  const accessToken = await getGoogleAccessToken();
  const firstSessionDate = getFirstSessionDate(request);
  const firstDateOnly = toDateOnly(firstSessionDate);
  const recurrenceRule = buildGoogleRecurrenceRule(request);
  const attendees = (request.attendeeEmails ?? [])
    .filter(Boolean)
    .map((email) => ({ email }));

  const eventBody = {
    summary: request.title,
    description: request.description,
    start: {
      dateTime: toLocalDateTime(firstDateOnly, request.session_start_time!),
      timeZone: request.session_timezone ?? "Africa/Nairobi",
    },
    end: {
      dateTime: toLocalDateTime(firstDateOnly, request.session_end_time!),
      timeZone: request.session_timezone ?? "Africa/Nairobi",
    },
    recurrence: recurrenceRule ? [recurrenceRule] : [],
    attendees,
    reminders: {
      useDefault: false,
      overrides:
        request.reminder_enabled === false
          ? []
          : [{ method: "email", minutes: request.reminder_offset_minutes ?? 60 }],
    },
    conferenceData: {
      createRequest: {
        requestId: crypto.randomUUID(),
        conferenceSolutionKey: { type: "hangoutsMeet" },
      },
    },
  };

  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?conferenceDataVersion=1&sendUpdates=all`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(eventBody),
    },
  );

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.error?.message ?? "Unable to create the Google Meet session.");
  }

  const entryPoint = payload.conferenceData?.entryPoints?.find?.(
    (entry: { entryPointType?: string }) => entry.entryPointType === "video",
  );

  return {
    meetingLink: entryPoint?.uri ?? payload.hangoutLink ?? payload.htmlLink ?? null,
    externalMeetingId: payload.id ?? null,
    providerMessage:
      payload.conferenceData?.createRequest?.status?.statusCode === "pending"
        ? "Google Meet link generation is still pending. Refresh the assignment shortly."
        : null,
  };
}

async function getZoomAccessToken() {
  const accountId = requireEnv("ZOOM_ACCOUNT_ID");
  const clientId = requireEnv("ZOOM_CLIENT_ID");
  const clientSecret = requireEnv("ZOOM_CLIENT_SECRET");
  const basicAuth = btoa(`${clientId}:${clientSecret}`);

  const response = await fetch("https://zoom.us/oauth/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "account_credentials",
      account_id: accountId,
    }),
  });

  const payload = await response.json();

  if (!response.ok || !payload.access_token) {
    throw new Error(payload.reason ?? payload.error ?? "Unable to authenticate with Zoom.");
  }

  return payload.access_token as string;
}

async function createZoomMeeting(request: MeetingRequest): Promise<MeetingResult> {
  const validationError = validateSchedule(request);
  if (validationError) throw new Error(validationError);

  const hostUserId = requireEnv("ZOOM_HOST_USER_ID");
  const accessToken = await getZoomAccessToken();
  const firstSessionDate = getFirstSessionDate(request);
  const firstDateOnly = toDateOnly(firstSessionDate);
  const weeklyDay = buildZoomWeeklyDay(request);

  const response = await fetch(`https://api.zoom.us/v2/users/${encodeURIComponent(hostUserId)}/meetings`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      topic: request.title,
      agenda: request.description,
      type: 8,
      start_time: toLocalDateTime(firstDateOnly, request.session_start_time!),
      duration: getSessionDurationMinutes(request),
      timezone: request.session_timezone ?? "Africa/Nairobi",
      recurrence: {
        type: 2,
        repeat_interval: request.session_frequency === "biweekly" ? 2 : 1,
        weekly_days: weeklyDay,
        end_date_time: request.session_end_date
          ? `${request.session_end_date}T23:59:59Z`
          : undefined,
        end_times: request.session_end_date ? undefined : 0,
      },
      settings: {
        join_before_host: true,
        waiting_room: false,
      },
    }),
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.message ?? "Unable to create the Zoom meeting.");
  }

  return {
    meetingLink: payload.join_url ?? null,
    externalMeetingId: payload.id ? String(payload.id) : null,
    providerMessage: null,
  };
}

export async function maybeCreateNativeMeeting(request: MeetingRequest): Promise<MeetingResult> {
  if (request.provider === "custom") {
    return {
      meetingLink: null,
      externalMeetingId: null,
      providerMessage: null,
    };
  }

  if (!isScheduleConfigured(request)) {
    throw new Error("Recurring schedule details are required before creating a native meeting.");
  }

  if (request.provider === "google_meet") {
    return createGoogleMeet(request);
  }

  if (request.provider === "zoom") {
    return createZoomMeeting(request);
  }

  return {
    meetingLink: null,
    externalMeetingId: null,
    providerMessage: null,
  };
}

export function getNativeMeetingSetupHint(provider: MeetingProvider) {
  if (provider === "google_meet") {
    return "Add Google Calendar secrets (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN, GOOGLE_CALENDAR_ID) to auto-create Meet links.";
  }

  if (provider === "zoom") {
    return "Add Zoom Server-to-Server OAuth secrets (ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID, ZOOM_CLIENT_SECRET, ZOOM_HOST_USER_ID) to auto-create Zoom meetings.";
  }

  return null;
}
