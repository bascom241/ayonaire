import { editFeed, createFeed, viewFeeds, deleteFeed, likePost, commentOnAPost, deleteComment, sharePost, reportPost, getCommunityStats, } from "../services/feed.service.js";
export const create = async (req, res, next) => {
    try {
        const { content, tag, channel } = req.body;
        const userId = req.user?.id;
        const dataToSend = {
            content,
            tag,
            channel,
            media: req.file,
        };
        const data = await createFeed(dataToSend, userId);
        res.status(201).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
export const edit = async (req, res, next) => {
    try {
        const { content, feedId, tag, channel } = req.body;
        const userId = req.user?.id;
        const dataToSend = {
            tag,
            feedId,
            content,
            channel,
            media: req.file,
        };
        const data = await editFeed(dataToSend, userId);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
export const deleteF = async (req, res, next) => {
    try {
        const { feedId } = req.body;
        const userId = req.user?.id;
        const dataToSend = {
            feedId,
        };
        const data = await deleteFeed(dataToSend, userId);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
export const view = async (req, res, next) => {
    try {
        const { tag, channel, page, limit } = req.query;
        const data = await viewFeeds({
            tag: tag,
            channel: channel,
            page: page ? Number(page) : undefined,
            limit: limit ? Number(limit) : undefined,
        });
        res.status(200).json({ success: true, data });
    }
    catch (err) {
        next(err);
    }
};
export const likeFeed = async (req, res, next) => {
    try {
        const { feedId } = req.body;
        const userId = req.user?.id;
        const dataToSend = {
            feedId,
        };
        const data = await likePost(dataToSend, userId);
        res.status(200).json({ success: true, message: "Feed liked", data });
    }
    catch (error) {
        next(error);
    }
};
export const commentOnAfeed = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const { feedId, text } = req.body;
        const dataToSend = {
            feedId,
            text,
        };
        const data = await commentOnAPost(dataToSend, userId);
        res
            .status(200)
            .json({ success: true, data, message: "commented successfully " });
    }
    catch (error) {
        next(error);
    }
};
export const deleteC = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const { feedId, commentId } = req.body;
        const dataToSend = {
            feedId,
            commentId,
        };
        const data = await deleteComment(dataToSend, userId);
        res.status(200).json({ success: true, message: data });
    }
    catch (error) {
        next(error);
    }
};
export const shareFeed = async (req, res, next) => {
    try {
        const { feedId } = req.body;
        const userId = req.user?.id;
        const dataToSend = {
            feedId,
        };
        const data = await sharePost(dataToSend, userId);
        res.status(200).json({ success: true, message: "Feed shared", data });
    }
    catch (error) {
        next(error);
    }
};
export const communityStats = async (req, res, next) => {
    try {
        const data = await getCommunityStats();
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
export const reportFeed = async (req, res, next) => {
    try {
        const { feedId, reason } = req.body;
        const userId = req.user?.id;
        const dataToSend = {
            feedId,
            reason,
        };
        const data = await reportPost(dataToSend, userId);
        res.status(200).json({ success: true, message: data });
    }
    catch (error) {
        next(error);
    }
};
