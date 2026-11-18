import feedModel from "../models/feed.model.js";
import askForHelpModel from "../models/askForHelp.model.js";
import userModel from "../models/user.model.js";
import { AppError } from "../errors/AppError.js";
export const COMMUNITY_POINTS = { post: 5, comment: 2, answer: 3 };
export async function getCommunityLeaderboard(period, limit) {
    if (!["week", "month", "all-time"].includes(period))
        throw new AppError("Invalid leaderboard period", 400);
    const safeLimit = Number.isFinite(limit) ? Math.max(1, Math.min(100, Math.floor(limit))) : 10;
    const since = period === "all-time" ? null : new Date(Date.now() - (period === "week" ? 7 : 30) * 86400000);
    const filter = (field) => since ? { [field]: { $gte: since } } : {};
    const [posts, comments, answers] = await Promise.all([
        feedModel.aggregate([{ $match: { type: { $in: ["feed", null] }, ...filter("createdAt") } }, { $group: { _id: "$userId", count: { $sum: 1 } } }]),
        feedModel.aggregate([{ $match: { type: { $in: ["feed", null] }, ...filter("comments.createdAt") } }, { $unwind: "$comments" }, { $match: filter("comments.createdAt") }, { $group: { _id: "$comments.userId", count: { $sum: 1 } } }]),
        askForHelpModel.aggregate([{ $match: filter("answers.createdAt") }, { $unwind: "$answers" }, { $match: filter("answers.createdAt") }, { $group: { _id: "$answers.userId", count: { $sum: 1 } } }]),
    ]);
    const totals = new Map();
    const add = (rows, key) => rows.forEach((row) => {
        if (!row._id)
            return;
        const id = row._id.toString();
        const counts = totals.get(id) ?? { posts: 0, comments: 0, answers: 0 };
        counts[key] = row.count;
        totals.set(id, counts);
    });
    add(posts, "posts");
    add(comments, "comments");
    add(answers, "answers");
    const users = await userModel.find({ _id: { $in: [...totals.keys()] }, status: { $nin: ["inactive", "suspended"] } }, "name profile").lean();
    return users.map((user) => {
        const id = user._id.toString();
        const counts = totals.get(id);
        return { user: { id, name: user.name, profile: user.profile ?? null }, ...counts, points: counts.posts * COMMUNITY_POINTS.post + counts.comments * COMMUNITY_POINTS.comment + counts.answers * COMMUNITY_POINTS.answer };
    }).sort((a, b) => b.points - a.points || a.user.name.localeCompare(b.user.name) || a.user.id.localeCompare(b.user.id))
        .slice(0, safeLimit).map((entry, index) => ({ ...entry, rank: index + 1 }));
}
