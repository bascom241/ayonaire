import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ room: vi.fn(), find: vi.fn(), findOne: vi.fn(), count: vi.fn() }));
vi.mock("../models/room.model.js", () => ({ default: { findOne: mocks.room } }));
vi.mock("../models/message.model.js", () => ({ default: { find: mocks.find, findOne: mocks.findOne, countDocuments: mocks.count } }));
vi.mock("../server.js", () => ({ io: {} }));
import { getMessagesForRoom, toMessageResponse } from "../services/message.service.js";

describe("conversation search", () => {
  beforeEach(() => vi.clearAllMocks());
  it("denies nonmembers before querying messages", async () => {
    mocks.room.mockResolvedValueOnce(null);
    await expect(getMessagesForRoom({ roomId: "room", requesterId: "other", query: { search: "secret" } })).rejects.toMatchObject({ statusCode: 403 });
    expect(mocks.find).not.toHaveBeenCalled();
  });
  it("searches only the selected room and treats regex characters literally", async () => {
    mocks.room.mockResolvedValueOnce({});
    const chain: any = { sort: () => chain, skip: () => chain, limit: () => chain, populate: () => chain, then: (resolve: any) => resolve([]) };
    mocks.find.mockReturnValue(chain); mocks.count.mockResolvedValue(0);
    await getMessagesForRoom({ roomId: "room", requesterId: "member", query: { search: ".*" } });
    expect(mocks.find).toHaveBeenCalledWith({ roomId: "room", text: { $regex: "\\.\\*", $options: "i" } });
  });
  it("binds older-message cursors to the requested room and uses a stable timestamp and id boundary", async () => {
    const createdAt = new Date("2026-11-19T10:00:00Z");
    mocks.room.mockResolvedValue({}); mocks.findOne.mockResolvedValue({ _id: "cursor", createdAt });
    const chain: any = { sort: () => chain, skip: () => chain, limit: () => chain, populate: () => chain, then: (resolve: any) => resolve([]) };
    mocks.find.mockReturnValue(chain); mocks.count.mockResolvedValue(0);
    await getMessagesForRoom({ roomId: "room", requesterId: "member", query: { before: "cursor" } });
    expect(mocks.findOne).toHaveBeenCalledWith({ _id: "cursor", roomId: "room" });
    expect(mocks.find).toHaveBeenCalledWith({ roomId: "room", $or: [{ createdAt: { $lt: createdAt } }, { createdAt, _id: { $lt: "cursor" } }] });
  });
  it("includes read identities only when formatting a private conversation", () => {
    const message = { _id: "message", roomId: "room", senderId: { _id: "sender", name: "Sender" }, createdAt: new Date(), readBy: ["reader"], reactions: [] };
    expect(toMessageResponse(message).readBy).toBeUndefined();
    expect(toMessageResponse(message, true).readBy).toEqual(["reader"]);
  });
});
