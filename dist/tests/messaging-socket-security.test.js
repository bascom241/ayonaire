import { describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ exists: vi.fn(), authenticate: vi.fn() }));
vi.mock("../models/room.model.js", () => ({ default: { findOne: mocks.exists } }));
vi.mock("../socket/authenticateSocket.js", () => ({ authenticateSocket: mocks.authenticate }));
vi.mock("../middlewares/courseAccess.middleware.js", () => ({ canAccessCourse: vi.fn() }));
import roomSocket from "../socket/room.socket.js";
describe("messaging socket security", () => {
    it("requires authentication and joins only rooms where the authenticated user is a participant", async () => {
        const handlers = {};
        const socket = { data: { user: { id: "student" } }, rooms: new Set(), on: vi.fn((name, cb) => { handlers[name] = cb; }), join: vi.fn(), to: vi.fn() };
        const io = { use: vi.fn(), on: vi.fn((_event, callback) => callback(socket)) };
        roomSocket(io);
        expect(io.use).toHaveBeenCalledWith(mocks.authenticate);
        const id = "507f1f77bcf86cd799439011";
        const ack = vi.fn();
        mocks.exists.mockResolvedValueOnce(null).mockResolvedValueOnce({ _id: id });
        await handlers["room:join"]({ roomId: id }, ack);
        expect(socket.join).not.toHaveBeenCalled();
        expect(ack).toHaveBeenLastCalledWith({ success: false });
        expect(mocks.exists).toHaveBeenCalledWith({ _id: id, participants: "student" });
        await handlers["room:join"]({ roomId: id }, ack);
        expect(socket.join).toHaveBeenCalledWith(id);
        expect(ack).toHaveBeenLastCalledWith({ success: true });
    });
    it("does not relay typing into an unjoined room or trust the supplied user", () => {
        const handlers = {};
        const emit = vi.fn();
        const socket = { data: { user: { id: "student" } }, rooms: new Set(), on: vi.fn((name, cb) => { handlers[name] = cb; }), to: vi.fn(() => ({ emit })) };
        roomSocket({ use: vi.fn(), on: vi.fn((_event, callback) => callback(socket)) });
        handlers["typing:start"]({ roomId: "room", user: "spoofed" });
        expect(emit).not.toHaveBeenCalled();
        socket.rooms.add("room");
        handlers["typing:start"]({ roomId: "room", user: "spoofed" });
        expect(emit).toHaveBeenCalledWith("typing:start", { roomId: "room", userId: "student" });
    });
    it("does not reveal presence to sockets outside the room", async () => {
        const handlers = {};
        const emit = vi.fn();
        const sockets = vi.fn().mockResolvedValue([{ data: { user: { id: "member" } } }]);
        const socket = { data: { user: { id: "student" } }, rooms: new Set(), on: vi.fn((name, cb) => { handlers[name] = cb; }) };
        const io = { use: vi.fn(), on: vi.fn((_event, callback) => callback(socket)), in: vi.fn(() => ({ fetchSockets: sockets })), to: vi.fn(() => ({ emit })) };
        roomSocket(io);
        handlers["room:presence:request"]({ roomId: "room" });
        expect(sockets).not.toHaveBeenCalled();
        socket.rooms.add("room");
        handlers["room:presence:request"]({ roomId: "room" });
        await vi.waitFor(() => expect(emit).toHaveBeenCalledWith("room:presence", { roomId: "room", userIds: ["member"] }));
    });
});
