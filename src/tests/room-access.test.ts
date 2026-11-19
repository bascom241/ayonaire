import { beforeEach, describe, expect, it, vi } from "vitest";
const m = vi.hoisted(() => ({ course: vi.fn(), enrollment: vi.fn(), user: vi.fn() }));
vi.mock("../models/course.model.js", () => ({ default: { findById: m.course } }));
vi.mock("../models/enrollment.model.js", () => ({ default: { exists: m.enrollment } }));
vi.mock("../models/user.model.js", () => ({ default: { findById: m.user } }));
import { assertCurrentCourseRoomAccess } from "../services/roomAccess.service.js";

describe("course room access", () => {
  beforeEach(() => vi.clearAllMocks());
  it("rejects a former student with no current enrollment even if still listed in the room", async () => {
    m.course.mockResolvedValue({ instructor: "instructor" }); m.enrollment.mockResolvedValue(null); m.user.mockReturnValue({ select: () => Promise.resolve({ role: "user" }) });
    await expect(assertCurrentCourseRoomAccess({ course: "course" }, "former-student")).rejects.toMatchObject({ statusCode: 403 });
    expect(m.enrollment).toHaveBeenCalledWith({ course: "course", student: "former-student", status: { $ne: "cancelled" } });
  });
  it("allows the assigned instructor without student enrollment", async () => {
    m.course.mockResolvedValue({ instructor: "instructor" });
    await expect(assertCurrentCourseRoomAccess({ course: "course" }, "instructor")).resolves.toBeUndefined();
    expect(m.enrollment).not.toHaveBeenCalled();
  });
});
