import { AppError } from "../errors/AppError.js";
import roomModel from "../models/room.model.js";
import messageModel from "../models/message.model.js";
import { io } from "../server.js";
import { toMessageResponse } from "./message.service.js";
import { assertCurrentCourseRoomAccess } from "./roomAccess.service.js";
import chatEventModel from "../models/chatEvent.model.js";
async function memberRoom(roomId, userId) {
    const room = await roomModel.findOne({ _id: roomId, participants: userId });
    if (!room)
        throw new AppError("You are not a member of this conversation", 403);
    await assertCurrentCourseRoomAccess(room, userId);
    return room;
}
async function populatedMessage(messageId) {
    return messageModel.findById(messageId).populate("senderId", "name profile").populate({ path: "replyTo", select: "text senderId", populate: { path: "senderId", select: "name profile" } }).populate("reactions.user", "name profile");
}
export async function editMessage(messageId, userId, text) {
    if (typeof text !== "string" || !text.trim() || text.length > 10000)
        throw new AppError("Message text must be between 1 and 10000 characters", 400);
    const message = await messageModel.findById(messageId);
    if (!message)
        throw new AppError("Message not found", 404);
    const room = await memberRoom(message.roomId.toString(), userId);
    if (message.senderId.toString() !== userId)
        throw new AppError("You can only edit your own messages", 403);
    await messageModel.updateOne({ _id: messageId, senderId: userId }, { $set: { text: text.trim(), editedAt: new Date() } });
    const updated = await populatedMessage(messageId);
    if (!updated)
        throw new AppError("Message not found", 404);
    const response = toMessageResponse(updated, !room.isGroup);
    io.to(response.roomId).emit("message:updated", response);
    return response;
}
export async function setMessagePinned(messageId, userId, role, pinned) {
    if (typeof pinned !== "boolean")
        throw new AppError("pinned must be a boolean", 400);
    const message = await messageModel.findById(messageId);
    if (!message)
        throw new AppError("Message not found", 404);
    const room = await memberRoom(message.roomId.toString(), userId);
    if (room.isGroup && role !== "admin" && !(role === "instructor" && room.roomCreator.toString() === userId))
        throw new AppError("Only the group instructor or an administrator can pin messages", 403);
    await messageModel.updateOne({ _id: messageId }, pinned ? { $set: { pinnedAt: new Date(), pinnedBy: userId } } : { $unset: { pinnedAt: 1, pinnedBy: 1 } });
    const updated = await populatedMessage(messageId);
    if (!updated)
        throw new AppError("Message not found", 404);
    const response = toMessageResponse(updated, !room.isGroup);
    io.to(response.roomId).emit("message:updated", response);
    return response;
}
export async function listPinnedMessages(roomId, userId) {
    const room = await memberRoom(roomId, userId);
    const messages = await messageModel.find({ roomId, pinnedAt: { $exists: true } }).sort({ pinnedAt: -1 }).limit(100).populate("senderId", "name profile").populate({ path: "replyTo", select: "text senderId", populate: { path: "senderId", select: "name profile" } }).populate("reactions.user", "name profile");
    return messages.map((message) => toMessageResponse(message, !room.isGroup));
}
export async function getMessageThread(roomId, messageId, userId) {
    const room = await memberRoom(roomId, userId);
    const selected = await messageModel.findOne({ _id: messageId, roomId });
    if (!selected)
        throw new AppError("Message not found in this conversation", 404);
    const rootId = selected.threadRoot ?? selected._id;
    const root = await populatedMessage(rootId.toString());
    if (!root || root.roomId.toString() !== roomId)
        throw new AppError("Thread not found", 404);
    const replies = await messageModel.find({ roomId, $or: [{ threadRoot: rootId }, { replyTo: rootId }] }).sort({ createdAt: 1 }).limit(200).populate("senderId", "name profile").populate({ path: "replyTo", select: "text senderId", populate: { path: "senderId", select: "name profile" } }).populate("reactions.user", "name profile");
    return { root: toMessageResponse(root, !room.isGroup), replies: replies.map((message) => toMessageResponse(message, !room.isGroup)) };
}
export async function setRoomPreference(roomId, userId, field, enabled) {
    if (typeof enabled !== "boolean")
        throw new AppError("enabled must be a boolean", 400);
    await memberRoom(roomId, userId);
    await roomModel.updateOne({ _id: roomId, participants: userId }, { [enabled ? "$addToSet" : "$pull"]: { [field]: userId } });
    return { roomId, enabled };
}
export async function setAnnouncementOnly(roomId, userId, role, enabled) {
    if (typeof enabled !== "boolean")
        throw new AppError("enabled must be a boolean", 400);
    const room = await memberRoom(roomId, userId);
    if (!room.isGroup)
        throw new AppError("Announcement mode is only available for groups", 400);
    if (role !== "admin" && !(role === "instructor" && room.roomCreator.toString() === userId))
        throw new AppError("Only the group instructor or an administrator can change posting permissions", 403);
    await roomModel.updateOne({ _id: roomId }, { $set: { announcementOnly: enabled } });
    io.to(roomId).emit("room:settings-updated", { roomId });
    return { roomId, enabled };
}
export async function markRoomRead(roomId, userId) {
    const room = await memberRoom(roomId, userId);
    const through = new Date();
    await messageModel.updateMany({ roomId, senderId: { $ne: userId }, readBy: { $ne: userId }, createdAt: { $lte: through } }, { $addToSet: { readBy: userId } });
    if (!room.isGroup)
        io.to(roomId).emit("message:read", { roomId, userId, through: through.toISOString() });
    return { roomId, through: through.toISOString() };
}
export async function listRoomEvents(roomId, userId) {
    await memberRoom(roomId, userId);
    const events = await chatEventModel.find({ roomId, endsAt: { $gte: new Date() } }).sort({ startsAt: 1 }).limit(100).lean();
    return events.map((event) => ({ id: event._id.toString(), title: event.title, startsAt: event.startsAt.toISOString(), endsAt: event.endsAt.toISOString(), meetingUrl: event.meetingUrl, createdBy: event.createdBy.toString() }));
}
export async function createRoomEvent(roomId, userId, role, input) {
    const room = await memberRoom(roomId, userId);
    if (room.isGroup && role !== "admin" && !(role === "instructor" && room.roomCreator.toString() === userId))
        throw new AppError("Only the group instructor or an administrator can create events", 403);
    if (!input || typeof input !== "object")
        throw new AppError("Event details are required", 400);
    if (typeof input.title !== "string" || !input.title.trim() || input.title.length > 120)
        throw new AppError("Enter an event title of up to 120 characters", 400);
    const startsAt = new Date(input.startsAt);
    const endsAt = new Date(input.endsAt);
    if (!Number.isFinite(startsAt.getTime()) || !Number.isFinite(endsAt.getTime()) || endsAt <= startsAt || endsAt <= new Date())
        throw new AppError("Enter a valid start and end time, ending in the future", 400);
    let meetingUrl;
    if (input.meetingUrl) {
        try {
            const parsed = new URL(input.meetingUrl);
            if (parsed.protocol !== "https:")
                throw new Error();
            meetingUrl = parsed.toString();
        }
        catch {
            throw new AppError("Meeting link must be a valid HTTPS URL", 400);
        }
    }
    const event = await chatEventModel.create({ roomId, createdBy: userId, title: input.title.trim(), startsAt, endsAt, meetingUrl });
    io.to(roomId).emit("room:events-updated", { roomId });
    return { id: event._id.toString() };
}
export async function deleteRoomEvent(roomId, eventId, userId, role) {
    const room = await memberRoom(roomId, userId);
    const event = await chatEventModel.findOne({ _id: eventId, roomId });
    if (!event)
        throw new AppError("Event not found", 404);
    if (role !== "admin" && event.createdBy.toString() !== userId && !(room.isGroup && role === "instructor" && room.roomCreator.toString() === userId))
        throw new AppError("You cannot delete this event", 403);
    await chatEventModel.deleteOne({ _id: eventId, roomId });
    io.to(roomId).emit("room:events-updated", { roomId });
    return { id: eventId };
}
