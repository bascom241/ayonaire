import { afterEach, describe, expect, it, vi } from "vitest";
const mock = vi.hoisted(() => ({ claim: vi.fn(), update: vi.fn(), user: vi.fn(), enrollment: vi.fn(), send: vi.fn() }));
vi.mock("../models/courseInteraction.model.js", () => ({ LearningReminder: { findOneAndUpdate: mock.claim, updateOne: mock.update } }));
vi.mock("../models/enrollment.model.js", () => ({ default: { exists: mock.enrollment } }));
vi.mock("../models/user.model.js", () => ({ default: { findById: mock.user } }));
vi.mock("../config/mail.js", () => ({ sendLearningReminderEmail: mock.send }));
import { deliverDueReminders } from "../services/reminderDelivery.service.js";

describe("reminder delivery", () => {
  afterEach(() => { vi.clearAllMocks(); vi.unstubAllEnvs(); });
  it("sends a claimed one-time reminder and clears its next delivery", async () => {
    vi.stubEnv("BREVO_API_KEY", "test"); vi.stubEnv("EMAIL_FROM", "test@example.com");
    mock.claim.mockResolvedValueOnce({ _id: "r", user: "u", course: "c", name: "Study", frequency: "Once" }).mockResolvedValueOnce(null);
    mock.user.mockResolvedValue({ email: "student@example.com", status: "active" });
    mock.enrollment.mockResolvedValue({ _id: "e" }); mock.send.mockResolvedValue(undefined); mock.update.mockResolvedValue({});
    await deliverDueReminders();
    expect(mock.send).toHaveBeenCalledWith("student@example.com", "Study");
    expect(mock.update).toHaveBeenCalledWith(expect.objectContaining({ _id: "r", leaseToken: expect.any(String) }), expect.objectContaining({ $set: expect.objectContaining({ nextDeliveryAt: null, lastSentAt: expect.any(Date) }) }));
  });
  it("retains a failed delivery for retry", async () => {
    vi.stubEnv("BREVO_API_KEY", "test"); vi.stubEnv("EMAIL_FROM", "test@example.com");
    mock.claim.mockResolvedValueOnce({ _id: "r", user: "u", course: "c", frequency: "Once" }).mockResolvedValueOnce(null);
    mock.user.mockResolvedValue({ email: "student@example.com", status: "active" }); mock.enrollment.mockResolvedValue({ _id: "e" }); mock.send.mockRejectedValueOnce(new Error("offline")); mock.update.mockResolvedValue({});
    await deliverDueReminders();
    expect(mock.update).toHaveBeenCalledWith(expect.objectContaining({ _id: "r" }), expect.objectContaining({ $set: expect.objectContaining({ lastError: expect.stringContaining("retry"), leaseUntil: expect.any(Date) }) }));
  });
});
