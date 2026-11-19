import { describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ get: vi.fn(), authenticate: vi.fn() }));
vi.mock("../socket/authenticateSocket.js", () => ({ authenticateSocket: mocks.authenticate }));
vi.mock("../services/feed.service.js", () => ({ getFeedById: mocks.get }));
import feedSocket from "../socket/feed.socket.js";

describe("feed post links", () => {
  it("requires socket authentication, validates ids, and returns a linked post", async () => {
    const handlers: Record<string, (...args: any[]) => any> = {};
    const socket = { data: { user: { id: "student" } }, on: vi.fn((name, callback) => { handlers[name] = callback; }) };
    const namespace = { use: vi.fn(), on: vi.fn((_name, callback) => callback(socket)), emit: vi.fn() };
    feedSocket({ of: vi.fn(() => namespace) } as any);
    expect(namespace.use).toHaveBeenCalledWith(mocks.authenticate);
    const ack = vi.fn();
    await handlers["feed:get"]({ feedId: "bad-id" }, ack);
    expect(mocks.get).not.toHaveBeenCalled();
    expect(ack).toHaveBeenLastCalledWith(expect.objectContaining({ success: false }));
    const id = "507f1f77bcf86cd799439011";
    mocks.get.mockResolvedValue({ id, content: "A post" });
    await handlers["feed:get"]({ feedId: id }, ack);
    expect(ack).toHaveBeenLastCalledWith({ success: true, data: { id, content: "A post" } });
  });
});
