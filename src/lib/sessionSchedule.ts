export type SessionSchedule = {
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

const DAY_LABELS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

function formatTimeValue(value: string | null | undefined) {
  if (!value) return null;
  const [hourText, minuteText] = value.split(":");
  const hour = Number(hourText);
  const minute = Number(minuteText ?? "0");

  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return value;
  }

  const period = hour >= 12 ? "PM" : "AM";
  const normalizedHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${normalizedHour}:${String(minute).padStart(2, "0")} ${period}`;
}

export function formatSessionSchedule(schedule: SessionSchedule) {
  const hasDay = schedule.session_day_of_week !== undefined && schedule.session_day_of_week !== null;
  const hasTimes = Boolean(schedule.session_start_time && schedule.session_end_time);

  if (!hasDay || !hasTimes) {
    return "Schedule not set";
  }

  const dayLabel = DAY_LABELS[schedule.session_day_of_week ?? 0] ?? "Day";
  const frequency = schedule.session_frequency === "biweekly" ? "Every 2 weeks" : "Every week";
  const start = formatTimeValue(schedule.session_start_time);
  const end = formatTimeValue(schedule.session_end_time);

  return `${frequency} on ${dayLabel}, ${start} - ${end}`;
}

export function formatSessionReminder(schedule: SessionSchedule) {
  if (schedule.reminder_enabled === false) {
    return "Reminders off";
  }

  const offset = schedule.reminder_offset_minutes ?? 60;

  if (offset % 60 === 0) {
    const hours = offset / 60;
    return `Reminder ${hours} hour${hours === 1 ? "" : "s"} before`;
  }

  return `Reminder ${offset} minutes before`;
}

export function hasSessionSchedule(schedule: SessionSchedule) {
  return (
    schedule.session_day_of_week !== undefined &&
    schedule.session_day_of_week !== null &&
    Boolean(schedule.session_start_time) &&
    Boolean(schedule.session_end_time)
  );
}
