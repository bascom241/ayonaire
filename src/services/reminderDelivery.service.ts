import crypto from "node:crypto";
import { LearningReminder } from "../models/courseInteraction.model.js";
import enrollmentModel from "../models/enrollment.model.js";
import userModel from "../models/user.model.js";
import { sendLearningReminderEmail } from "../config/mail.js";
import { nextReminderTime } from "../utils/reminderSchedule.js";

const LEASE_MS = 5 * 60 * 1000;
const RETRY_MS = 15 * 60 * 1000;
let running = false;

export async function deliverDueReminders() {
  if (running || !process.env.BREVO_API_KEY || !process.env.EMAIL_FROM) return;
  running = true;
  try {
    for (let i = 0; i < 100; i++) {
      const now = new Date();
      const token = crypto.randomUUID();
      const reminder = await LearningReminder.findOneAndUpdate(
        { nextDeliveryAt: { $lte: now }, $or: [{ leaseUntil: { $exists: false } }, { leaseUntil: null }, { leaseUntil: { $lte: now } }] },
        { $set: { leaseUntil: new Date(now.getTime() + LEASE_MS), leaseToken: token } },
        { new: true, sort: { nextDeliveryAt: 1 } },
      );
      if (!reminder) break;
      try {
        const [user, enrollment] = await Promise.all([
          userModel.findById(reminder.user),
          enrollmentModel.exists({ student: reminder.user, course: reminder.course, status: { $ne: "cancelled" } }),
        ]);
        if (!user || !enrollment || ["inactive", "suspended"].includes(user.status)) {
          await LearningReminder.updateOne({ _id: reminder._id, leaseToken: token }, { $unset: { nextDeliveryAt: "", leaseUntil: "", leaseToken: "" }, $set: { lastError: "Account or enrollment is unavailable" } });
          continue;
        }
        await sendLearningReminderEmail(user.email, reminder.name || "your course");
        const sentAt = new Date();
        const next = reminder.frequency === "Once" ? null : nextReminderTime(new Date(sentAt.getTime() + 12 * 60 * 60 * 1000), reminder.timezone!, reminder.time, reminder.frequency, reminder.weekday!);
        await LearningReminder.updateOne({ _id: reminder._id, leaseToken: token }, { $set: { lastSentAt: sentAt, nextDeliveryAt: next }, $unset: { leaseUntil: "", leaseToken: "", lastError: "" } });
      } catch (error) {
        console.error("Learning reminder delivery failed", error);
        await LearningReminder.updateOne({ _id: reminder._id, leaseToken: token }, { $set: { leaseUntil: new Date(Date.now() + RETRY_MS), lastError: "Email delivery failed; retry scheduled" }, $unset: { leaseToken: "" } });
      }
    }
  } finally { running = false; }
}

export function startReminderDelivery() {
  if (!process.env.BREVO_API_KEY || !process.env.EMAIL_FROM) console.warn("Learning reminder delivery is disabled: BREVO_API_KEY and EMAIL_FROM are required.");
  void deliverDueReminders().catch((error) => console.error("Reminder worker failed", error));
  return setInterval(() => void deliverDueReminders().catch((error) => console.error("Reminder worker failed", error)), 60_000);
}
