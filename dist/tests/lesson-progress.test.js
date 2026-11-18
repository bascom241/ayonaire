import { beforeEach, describe, expect, it, vi } from "vitest";
import { Types } from "mongoose";
const mocks = vi.hoisted(() => ({ enrollment: vi.fn(), lesson: vi.fn(), count: vi.fn(), certificate: vi.fn() }));
vi.mock("../models/enrollment.model.js", () => ({ default: { findOne: mocks.enrollment } }));
vi.mock("../models/lesson.model.js", () => ({ default: { findOne: mocks.lesson, countDocuments: mocks.count } }));
vi.mock("../services/certificate.service.js", () => ({ issueCertificateIfEligible: mocks.certificate }));
import { markLessonAsCompleted } from "../services/lesson.service.js";
describe("lesson completion", () => {
    beforeEach(() => vi.clearAllMocks());
    it("rejects a lesson outside the published course curriculum", async () => {
        const save = vi.fn();
        mocks.enrollment.mockResolvedValue({ comletedLessons: [], save });
        mocks.lesson.mockResolvedValue(null);
        await expect(markLessonAsCompleted({ studentId: "student", courseId: "course", lessonId: new Types.ObjectId("507f1f77bcf86cd799439011") })).rejects.toThrow("Lesson is unavailable");
        expect(save).not.toHaveBeenCalled();
        expect(mocks.certificate).not.toHaveBeenCalled();
    });
    it("rejects locked lessons", async () => {
        mocks.enrollment.mockResolvedValue({ comletedLessons: [] });
        mocks.lesson.mockResolvedValue({ isLocked: true, isFreePreview: false });
        await expect(markLessonAsCompleted({ studentId: "student", courseId: "course", lessonId: new Types.ObjectId("507f1f77bcf86cd799439011") })).rejects.toThrow("Lesson is unavailable");
    });
});
