import { describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ room: vi.fn(), find: vi.fn(), count: vi.fn() }));
vi.mock("../models/room.model.js", () => ({ default: { findOne: mocks.room } }));
vi.mock("../models/message.model.js", () => ({ default: { find: mocks.find, countDocuments: mocks.count } }));
vi.mock("../server.js", () => ({ io: {} }));
import { getMessagesForRoom } from "../services/message.service.js";

describe("conversation search", () => {
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
});
