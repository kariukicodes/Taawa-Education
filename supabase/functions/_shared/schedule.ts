export type AssignmentSchedule = {
  start_date?: string | null;
  session_day_of_week?: number | null;
  session_start_time?: string | null;
  session_end_time?: string | null;
  session_frequency?: "weekly" | "biweekly" | null;
  session_timezone?: string | null;
  session_end_date?: string | null;
  reminder_enabled?: boolean | null;
  reminder_offset_minutes?: number | null;
};

const DAY_CODES = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"] as const;

export function isScheduleConfigured(schedule: AssignmentSchedule) {
  return Boolean(
    schedule.start_date &&
      schedule.session_day_of_week !== null &&
      schedule.session_day_of_week !== undefined &&
      schedule.session_start_time &&
      schedule.session_end_time,
  );
}

export function validateSchedule(schedule: AssignmentSchedule) {
  if (!isScheduleConfigured(schedule)) {
    return "Add a start date, session day, and start/end times to schedule recurring classes.";
  }

  if (
    schedule.session_day_of_week === undefined ||
    schedule.session_day_of_week === null ||
    schedule.session_day_of_week < 0 ||
    schedule.session_day_of_week > 6
  ) {
    return "Session day of week must be between Sunday and Saturday.";
  }

  if (
    !schedule.session_start_time ||
    !schedule.session_end_time ||
    schedule.session_end_time <= schedule.session_start_time
  ) {
    return "Session end time must be after the session start time.";
  }

  return null;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

export function getFirstSessionDate(schedule: AssignmentSchedule) {
  if (!schedule.start_date) {
    throw new Error("A session start date is required.");
  }

  const base = new Date(`${schedule.start_date}T00:00:00Z`);
  const targetDay = schedule.session_day_of_week ?? base.getUTCDay();
  const diff = (targetDay - base.getUTCDay() + 7) % 7;
  return addDays(base, diff);
}

export function toDateOnly(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function toLocalDateTime(dateOnly: string, timeValue: string) {
  const time = timeValue.length === 5 ? `${timeValue}:00` : timeValue;
  return `${dateOnly}T${time}`;
}

export function getSessionDurationMinutes(schedule: AssignmentSchedule) {
  if (!schedule.session_start_time || !schedule.session_end_time) {
    return 60;
  }

  const [startHour, startMinute] = schedule.session_start_time.split(":").map(Number);
  const [endHour, endMinute] = schedule.session_end_time.split(":").map(Number);
  return endHour * 60 + endMinute - (startHour * 60 + startMinute);
}

export function buildGoogleRecurrenceRule(schedule: AssignmentSchedule) {
  if (schedule.session_day_of_week === undefined || schedule.session_day_of_week === null) {
    return null;
  }

  const interval = schedule.session_frequency === "biweekly" ? 2 : 1;
  const byDay = DAY_CODES[schedule.session_day_of_week];
  let rule = `RRULE:FREQ=WEEKLY;INTERVAL=${interval};BYDAY=${byDay}`;

  if (schedule.session_end_date) {
    const until = schedule.session_end_date.replaceAll("-", "");
    rule += `;UNTIL=${until}T235959Z`;
  }

  return rule;
}

export function buildZoomWeeklyDay(schedule: AssignmentSchedule) {
  if (schedule.session_day_of_week === undefined || schedule.session_day_of_week === null) {
    return null;
  }

  return schedule.session_day_of_week === 0
    ? "1"
    : String(schedule.session_day_of_week + 1);
}

export function buildSchedulePreview(schedule: AssignmentSchedule) {
  if (!isScheduleConfigured(schedule)) {
    return null;
  }

  const day = DAY_CODES[schedule.session_day_of_week ?? 0];
  const frequency = schedule.session_frequency === "biweekly" ? "Every 2 weeks" : "Weekly";
  return `${frequency} on ${day} at ${schedule.session_start_time} (${schedule.session_timezone ?? "Africa/Nairobi"})`;
}
