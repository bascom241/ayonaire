import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ feed: vi.fn(), help: vi.fn(), users: vi.fn() }));
vi.mock("../models/feed.model.js", () => ({ default: { aggregate: mocks.feed } }));
vi.mock("../models/askForHelp.model.js", () => ({ default: { aggregate: mocks.help } }));
vi.mock("../models/user.model.js", () => ({ default: { find: mocks.users } }));
import { getCommunityLeaderboard } from "../services/communityLeaderboard.service.js";
describe("community leaderboard", () => {
    beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date("2026-11-18T12:00:00Z")); vi.clearAllMocks(); });
    afterEach(() => vi.useRealTimers());
    it("scores timestamped posts, comments and answers, without returning email addresses", async () => {
        mocks.feed.mockResolvedValueOnce([{ _id: "a", count: 2 }]).mockResolvedValueOnce([{ _id: "b", count: 4 }]);
        mocks.help.mockResolvedValueOnce([{ _id: "b", count: 1 }]);
        mocks.users.mockReturnValue({ lean: () => Promise.resolve([{ _id: "a", name: "Ada", email: "private@example.com" }, { _id: "b", name: "Bea" }]) });
        const result = await getCommunityLeaderboard("week", 10);
        expect(result.map((entry) => [entry.user.name, entry.points, entry.rank])).toEqual([["Bea", 11, 1], ["Ada", 10, 2]]);
        expect(result[0].user).not.toHaveProperty("email");
        expect(JSON.stringify(mocks.feed.mock.calls[0][0])).toContain("2026-11-11T12:00:00.000Z");
        expect(mocks.feed.mock.calls[0][0][0].$match.type.$in).toEqual(["feed", null]);
        expect(JSON.stringify(mocks.feed.mock.calls[1][0])).toContain("comments.createdAt");
        expect(JSON.stringify(mocks.help.mock.calls[0][0])).toContain("answers.createdAt");
    });
    it("rejects unsupported periods", async () => {
        await expect(getCommunityLeaderboard("year", 10)).rejects.toThrow("Invalid leaderboard period");
    });
});
