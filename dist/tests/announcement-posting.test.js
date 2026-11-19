import { describe, expect, it, vi } from "vitest";
const m = vi.hoisted(() => ({ room: vi.fn(), user: vi.fn(), create: vi.fn() }));
vi.mock("../models/room.model.js", () => ({ default: { findOne: m.room } }));
vi.mock("../models/user.model.js", () => ({ default: { findById: m.user } }));
vi.mock("../models/message.model.js", () => ({ default: { create: m.create } }));
vi.mock("../services/roomAccess.service.js", () => ({ assertCurrentCourseRoomAccess: vi.fn() }));
vi.mock("../server.js", () => ({ io: {} }));
import { sendMessage } from "../services/message.service.js";
describe("announcement room posting", () => {
    it("rejects a student posting through the API even when they are a room member", async () => {
        m.room.mockResolvedValue({ isGroup: true, announcementOnly: true, roomCreator: "teacher" });
        m.user.mockReturnValue({ select: () => Promise.resolve({ role: "user" }) });
        await expect(sendMessage({ roomId: "room", senderId: "student", text: "Not allowed" })).rejects.toMatchObject({ statusCode: 403 });
        expect(m.create).not.toHaveBeenCalled();
    });
});
