import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ enrollment: vi.fn(), course: vi.fn(), user: vi.fn(), room: vi.fn() }));
vi.mock("../models/enrollment.model.js", () => ({ default: { findOne: mocks.enrollment } }));
vi.mock("../models/course.model.js", () => ({ default: { findById: mocks.course } }));
vi.mock("../models/user.model.js", () => ({ default: { findById: mocks.user } }));
vi.mock("../models/room.model.js", () => ({ default: { findOne: mocks.room } }));
vi.mock("../models/message.model.js", () => ({ default: {} }));
import { messageCourseInstructor } from "../services/room.service.js";

describe("course instructor conversations", () => {
  beforeEach(() => vi.clearAllMocks());
  it("rejects students without a non-cancelled enrollment before looking up the instructor", async () => {
    mocks.enrollment.mockResolvedValue(null);
    await expect(messageCourseInstructor("course", "student")).rejects.toMatchObject({ statusCode: 403 });
    expect(mocks.enrollment).toHaveBeenCalledWith({ course: "course", student: "student", status: { $ne: "cancelled" } });
    expect(mocks.course).not.toHaveBeenCalled();
  });
  it("opens the existing private conversation with the instructor assigned to the course", async () => {
    mocks.enrollment.mockResolvedValue({});
    mocks.course.mockResolvedValue({ instructor: "teacher" });
    mocks.user.mockResolvedValue({});
    const room = { _id: "room", isGroup: false, roomCreator: "student", participants: [{ _id: "student", name: "Student" }, { _id: "teacher", name: "Teacher" }], createdAt: new Date(), updatedAt: new Date() };
    mocks.room.mockReturnValue({ populate: vi.fn().mockResolvedValue(room) });
    const result = await messageCourseInstructor("course", "student");
    expect(result.id).toBe("room");
    expect(mocks.room).toHaveBeenCalledWith({ isGroup: false, participants: { $all: ["student", "teacher"], $size: 2 } });
  });
});
