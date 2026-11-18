const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function reminderLocalParts(date: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: timezone, weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(date);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return { weekday: weekdays.indexOf(get("weekday")), time: `${get("hour")}:${get("minute")}` };
}

export function nextReminderTime(after: Date, timezone: string, time: string, frequency: string, weekday: number): Date {
  // Search real UTC minutes so DST gaps and repeated hours are resolved in the target zone.
  const formatter = new Intl.DateTimeFormat("en-US", { timeZone: timezone, weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
  const start = Math.floor(after.getTime() / 60000) * 60000 + 60000;
  for (let offset = 0; offset < 9 * 24 * 60; offset++) {
    const candidate = new Date(start + offset * 60000);
    const parts = formatter.formatToParts(candidate);
    const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
    if (`${get("hour")}:${get("minute")}` === time && (frequency !== "Weekly" || weekdays.indexOf(get("weekday")) === weekday)) return candidate;
  }
  throw new Error("Unable to schedule reminder");
}
