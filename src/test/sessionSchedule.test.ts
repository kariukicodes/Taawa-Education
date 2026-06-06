import { describe, expect, it } from "vitest";

import { formatSessionReminder, formatSessionSchedule } from "@/lib/sessionSchedule";

describe("sessionSchedule", () => {
  it("formats weekly schedules", () => {
    expect(
      formatSessionSchedule({
        session_day_of_week: 1,
        session_start_time: "16:00:00",
        session_end_time: "17:30:00",
        session_frequency: "weekly",
      }),
    ).toBe("Every week on Monday, 4:00 PM - 5:30 PM");
  });

  it("formats biweekly schedules", () => {
    expect(
      formatSessionSchedule({
        session_day_of_week: 4,
        session_start_time: "09:15:00",
        session_end_time: "10:15:00",
        session_frequency: "biweekly",
      }),
    ).toBe("Every 2 weeks on Thursday, 9:15 AM - 10:15 AM");
  });

  it("formats reminder labels", () => {
    expect(formatSessionReminder({ reminder_enabled: true, reminder_offset_minutes: 120 })).toBe(
      "Reminder 2 hours before",
    );
    expect(formatSessionReminder({ reminder_enabled: true, reminder_offset_minutes: 45 })).toBe(
      "Reminder 45 minutes before",
    );
    expect(formatSessionReminder({ reminder_enabled: false, reminder_offset_minutes: 45 })).toBe(
      "Reminders off",
    );
  });
});
