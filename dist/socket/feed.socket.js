import mongoose from "mongoose";
import { authenticateSocket } from "./authenticateSocket.js";
import { createFeed, editFeed, deleteFeed, viewFeeds, likePost, commentOnAPost, deleteComment, sharePost, reportPost, getFeedById, } from "../services/feed.service.js";
const normalizeMedia = (media) => {
    if (!media)
        return undefined;
    const buffer = Buffer.isBuffer(media.buffer)
        ? media.buffer
        : Buffer.from(media.buffer);
    return {
        buffer,
        mimetype: media.mimetype,
        originalname: media.originalname,
    };
};
// A single failure inside a handler must never crash the process or hang
// the caller - every branch always resolves the ack exactly once.
const safeAck = (ack) => {
    if (typeof ack === "function")
        return ack;
    return () => { };
};
const errorMessage = (err) => err instanceof Error ? err.message : "Something went wrong";
const feedSocket = (io) => {
    const feedNamespace = io.of("/feed");
    feedNamespace.use(authenticateSocket);
    feedNamespace.on("connection", (socket) => {
        const userId = socket.data.user?.id;
        socket.on("feed:create", async (payload, ack) => {
            const respond = safeAck(ack);
            try {
                const dataToSend = {
                    content: payload?.content,
                    tag: payload?.tag,
                    channel: payload?.channel,
                    media: normalizeMedia(payload?.media),
                };
                const data = await createFeed(dataToSend, userId);
                respond({ success: true, data });
                feedNamespace.emit("feed:created", data);
            }
            catch (err) {
                respond({ success: false, message: errorMessage(err) });
            }
        });
        socket.on("feed:edit", async (payload, ack) => {
            const respond = safeAck(ack);
            try {
                const dataToSend = {
                    feedId: payload?.feedId,
                    content: payload?.content,
                    tag: payload?.tag,
                    channel: payload?.channel,
                    media: normalizeMedia(payload?.media),
                };
                const data = await editFeed(dataToSend, userId);
                respond({ success: true, data });
                feedNamespace.emit("feed:updated", data);
            }
            catch (err) {
                respond({ success: false, message: errorMessage(err) });
            }
        });
        socket.on("feed:delete", async (payload, ack) => {
            const respond = safeAck(ack);
            try {
                const dataToSend = { feedId: payload?.feedId };
                const message = await deleteFeed(dataToSend, userId);
                respond({ success: true, message });
                feedNamespace.emit("feed:deleted", { feedId: payload?.feedId });
            }
            catch (err) {
                respond({ success: false, message: errorMessage(err) });
            }
        });
        socket.on("feed:list", async (payload, ack) => {
            const respond = safeAck(ack);
            try {
                const query = {
                    tag: payload?.tag,
                    channel: payload?.channel,
                    page: payload?.page,
                    limit: payload?.limit,
                };
                const data = await viewFeeds(query);
                respond({ success: true, data });
            }
            catch (err) {
                respond({ success: false, message: errorMessage(err) });
            }
        });
        socket.on("feed:like", async (payload, ack) => {
            const respond = safeAck(ack);
            try {
                const dataToSend = { feedId: payload?.feedId };
                const data = await likePost(dataToSend, userId);
                respond({ success: true, data });
                feedNamespace.emit("feed:updated", data);
            }
            catch (err) {
                respond({ success: false, message: errorMessage(err) });
            }
        });
        socket.on("feed:comment", async (payload, ack) => {
            const respond = safeAck(ack);
            try {
                const dataToSend = {
                    feedId: payload?.feedId,
                    text: payload?.text,
                };
                const data = await commentOnAPost(dataToSend, userId);
                respond({ success: true, data });
                feedNamespace.emit("feed:updated", data);
            }
            catch (err) {
                respond({ success: false, message: errorMessage(err) });
            }
        });
        socket.on("feed:comment:delete", async (payload, ack) => {
            const respond = safeAck(ack);
            try {
                const dataToSend = {
                    feedId: new mongoose.Types.ObjectId(payload?.feedId),
                    commentId: new mongoose.Types.ObjectId(payload?.commentId),
                };
                const message = await deleteComment(dataToSend, userId);
                respond({ success: true, message });
                const updatedFeed = await getFeedById(payload?.feedId);
                if (updatedFeed) {
                    feedNamespace.emit("feed:updated", updatedFeed);
                }
            }
            catch (err) {
                respond({ success: false, message: errorMessage(err) });
            }
        });
        socket.on("feed:share", async (payload, ack) => {
            const respond = safeAck(ack);
            try {
                const dataToSend = { feedId: payload?.feedId };
                const data = await sharePost(dataToSend, userId);
                respond({ success: true, data });
                feedNamespace.emit("feed:shared", data);
            }
            catch (err) {
                respond({ success: false, message: errorMessage(err) });
            }
        });
        socket.on("feed:report", async (payload, ack) => {
            const respond = safeAck(ack);
            try {
                const dataToSend = {
                    feedId: payload?.feedId,
                    reason: payload?.reason,
                };
                const message = await reportPost(dataToSend, userId);
                respond({ success: true, message });
            }
            catch (err) {
                respond({ success: false, message: errorMessage(err) });
            }
        });
    });
    return feedNamespace;
};
export default feedSocket;
