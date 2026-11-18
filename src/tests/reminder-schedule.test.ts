import { describe, expect, it } from "vitest";
import { nextReminderTime, reminderLocalParts } from "../utils/reminderSchedule.js";

describe("learning reminder scheduling", () => {
  it("uses the student's time zone for the next daily reminder", () => {
    expect(nextReminderTime(new Date("2026-01-01T16:30:00Z"), "America/Los_Angeles", "09:00", "Daily", 4).toISOString()).toBe("2026-01-01T17:00:00.000Z");
  });
  it("schedules weekly reminders on the saved local weekday", () => {
    expect(nextReminderTime(new Date("2026-01-02T18:00:00Z"), "America/Los_Angeles", "09:00", "Weekly", 4).toISOString()).toBe("2026-01-08T17:00:00.000Z");
  });
  it("skips a nonexistent daylight-saving time", () => {
    const next = nextReminderTime(new Date("2026-03-08T08:00:00Z"), "America/Los_Angeles", "02:30", "Daily", 0);
    expect(next.toISOString()).toBe("2026-03-09T09:30:00.000Z");
    expect(reminderLocalParts(next, "America/Los_Angeles").time).toBe("02:30");
  });
});
