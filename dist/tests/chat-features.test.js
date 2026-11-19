import { beforeEach, describe, expect, it, vi } from "vitest";
const m = vi.hoisted(() => ({ room: vi.fn(), find: vi.fn(), update: vi.fn(), updateMany: vi.fn(), roomUpdate: vi.fn(), emit: vi.fn(), format: vi.fn(), createEvent: vi.fn() }));
vi.mock("../models/room.model.js", () => ({ default: { findOne: m.room, updateOne: m.roomUpdate } }));
vi.mock("../models/message.model.js", () => ({ default: { findById: m.find, updateOne: m.update, updateMany: m.updateMany } }));
vi.mock("../server.js", () => ({ io: { to: () => ({ emit: m.emit }) } }));
vi.mock("../services/message.service.js", () => ({ toMessageResponse: m.format }));
vi.mock("../models/chatEvent.model.js", () => ({ default: { create: m.createEvent } }));
import { createRoomEvent, editMessage, getMessageThread, markRoomRead, setAnnouncementOnly, setMessagePinned, setRoomPreference } from "../services/chatFeatures.service.js";
describe("chat feature permissions", () => {
    beforeEach(() => vi.clearAllMocks());
    it("prevents nonmembers from changing another conversation's settings", async () => {
        m.room.mockResolvedValue(null);
        await expect(setRoomPreference("room", "outsider", "mutedBy", true)).rejects.toMatchObject({ statusCode: 403 });
        expect(m.roomUpdate).not.toHaveBeenCalled();
    });
    it("prevents students from pinning group messages even if they created the group", async () => {
        m.find.mockResolvedValue({ roomId: "room" });
        m.room.mockResolvedValue({ isGroup: true, roomCreator: "student" });
        await expect(setMessagePinned("message", "student", "user", true)).rejects.toMatchObject({ statusCode: 403 });
        expect(m.update).not.toHaveBeenCalled();
    });
    it("prevents participants from editing messages they did not send", async () => {
        m.find.mockResolvedValue({ roomId: "room", senderId: "author" });
        m.room.mockResolvedValue({ isGroup: false });
        await expect(editMessage("message", "other", "new text")).rejects.toMatchObject({ statusCode: 403 });
        expect(m.update).not.toHaveBeenCalled();
    });
    it("saves a sender's edit and broadcasts the updated message", async () => {
        const chain = { populate: () => chain, then: (resolve) => resolve({}) };
        m.find.mockResolvedValueOnce({ roomId: "room", senderId: "author" }).mockReturnValueOnce(chain);
        m.room.mockResolvedValue({ isGroup: false });
        m.update.mockResolvedValue({});
        m.format.mockReturnValue({ id: "message", roomId: "room", text: "updated" });
        await expect(editMessage("message", "author", " updated ")).resolves.toMatchObject({ text: "updated" });
        expect(m.update).toHaveBeenCalledWith({ _id: "message", senderId: "author" }, { $set: { text: "updated", editedAt: expect.any(Date) } });
        expect(m.emit).toHaveBeenCalledWith("message:updated", expect.objectContaining({ id: "message" }));
    });
    it("records reads and sends read receipts only for private rooms", async () => {
        m.room.mockResolvedValueOnce({ isGroup: true }).mockResolvedValueOnce({ isGroup: false });
        m.updateMany.mockResolvedValue({});
        await markRoomRead("room", "member");
        expect(m.emit).not.toHaveBeenCalled();
        await markRoomRead("room", "member");
        expect(m.emit).toHaveBeenCalledWith("message:read", expect.objectContaining({ roomId: "room", userId: "member" }));
    });
    it("rejects thread access by nonmembers before looking up messages", async () => {
        m.room.mockResolvedValue(null);
        await expect(getMessageThread("room", "message", "outsider")).rejects.toMatchObject({ statusCode: 403 });
        expect(m.find).not.toHaveBeenCalled();
    });
    it("rejects student-created group events and unsafe meeting links", async () => {
        m.room.mockResolvedValueOnce({ isGroup: true, roomCreator: "student" }).mockResolvedValueOnce({ isGroup: false });
        await expect(createRoomEvent("room", "student", "user", {})).rejects.toMatchObject({ statusCode: 403 });
        await expect(createRoomEvent("room", "student", "user", { title: "Meeting", startsAt: "2030-01-01T10:00:00Z", endsAt: "2030-01-01T11:00:00Z", meetingUrl: "javascript:alert(1)" })).rejects.toMatchObject({ statusCode: 400 });
        expect(m.createEvent).not.toHaveBeenCalled();
    });
    it("creates a valid group event for its instructor and notifies the room", async () => {
        m.room.mockResolvedValue({ isGroup: true, roomCreator: "teacher" });
        m.createEvent.mockResolvedValue({ _id: "event" });
        await expect(createRoomEvent("room", "teacher", "instructor", { title: " Live class ", startsAt: "2030-01-01T10:00:00Z", endsAt: "2030-01-01T11:00:00Z", meetingUrl: "https://example.com/join" })).resolves.toEqual({ id: "event" });
        expect(m.createEvent).toHaveBeenCalledWith(expect.objectContaining({ roomId: "room", createdBy: "teacher", title: "Live class", meetingUrl: "https://example.com/join" }));
        expect(m.emit).toHaveBeenCalledWith("room:events-updated", { roomId: "room" });
    });
    it("only lets the assigned group instructor or an administrator change announcement mode", async () => {
        m.room.mockResolvedValue({ isGroup: true, roomCreator: "teacher" });
        await expect(setAnnouncementOnly("room", "student", "user", true)).rejects.toMatchObject({ statusCode: 403 });
        expect(m.roomUpdate).not.toHaveBeenCalled();
        m.roomUpdate.mockResolvedValue({});
        await expect(setAnnouncementOnly("room", "teacher", "instructor", true)).resolves.toEqual({ roomId: "room", enabled: true });
        expect(m.roomUpdate).toHaveBeenCalledWith({ _id: "room" }, { $set: { announcementOnly: true } });
    });
});
