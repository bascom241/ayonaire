import { AppError } from "../errors/AppError.js";
import messageModel from "../models/message.model.js";
import { uploadMedia, uploadFile } from "../utils/uploadToCloudinary.js";
import { validateRequestBodyWithValues } from "../utils/validateRequestBody.js";
import { io } from "../server.js";
import roomModel from "../models/room.model.js";
import { getPagination } from "../utils/getPagination.js";
const getProfilePayload = (user) => user?.profile ? { url: user.profile.url, publicId: user.profile.publicId } : null;
const toMessageResponse = (message) => ({
    id: message._id.toString(),
    senderId: {
        id: message.senderId._id.toString(),
        name: message.senderId.name,
        profile: getProfilePayload(message.senderId),
    },
    roomId: message.roomId.toString(),
    text: message.text ? message.text : "",
    media: message.media
        ? { url: message.media.url, publicId: message.media.publicId }
        : undefined,
    file: message.file
        ? { url: message.file.url, publicId: message.file.publicId }
        : undefined,
    createdAt: message.createdAt.toISOString(),
});
export const sendMessage = async (data) => {
    const { roomId, text, media, senderId, file } = data;
    validateRequestBodyWithValues(data, [
        "roomId",
        "senderId",
    ]);
    const hasText = text?.trim();
    if (!hasText && !media && !file) {
        throw new AppError("Either text or media must be sent", 400);
    }
    const room = await roomModel.findOne({ _id: roomId, participants: senderId });
    if (!room) {
        throw new AppError("You are not a member of this conversation", 403);
    }
    let uploadMediaResult;
    let uploadFileResult;
    if (media) {
        uploadMediaResult = await uploadMedia(media.buffer, "image");
    }
    if (file) {
        uploadFileResult = await uploadFile(file.buffer, "raw");
    }
    const message = await messageModel.create({
        roomId,
        senderId,
        text,
        media: uploadMediaResult
            ? {
                url: uploadMediaResult.secure_url,
                publicId: uploadMediaResult.public_id,
            }
            : undefined,
        file: uploadFileResult
            ? {
                url: uploadFileResult.secure_url,
                publicId: uploadFileResult.public_id,
            }
            : undefined,
    });
    // Bumps the room's updatedAt (via the timestamps plugin) so the
    // conversation list can sort by most-recent activity.
    await roomModel.findByIdAndUpdate(roomId, {});
    const fullMessage = await messageModel
        .findById(message._id)
        .populate("senderId", "name profile");
    if (!fullMessage) {
        throw new AppError("Error in fetching messages", 400);
    }
    const response = toMessageResponse(fullMessage);
    io.to(roomId).emit("message:new", response);
    return response;
};
export const getMessagesForRoom = async (data) => {
    const { roomId, requesterId, query } = data;
    validateRequestBodyWithValues(data, [
        "roomId",
        "requesterId",
    ]);
    const room = await roomModel.findOne({
        _id: roomId,
        participants: requesterId,
    });
    if (!room) {
        throw new AppError("You are not a member of this conversation", 403);
    }
    const { page, limit, skip } = getPagination(query);
    const [messages, total] = await Promise.all([
        messageModel
            .find({ roomId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate("senderId", "name profile"),
        messageModel.countDocuments({ roomId }),
    ]);
    // Returned newest-first for pagination (page 1 = most recent), but a chat
    // thread reads oldest-first, so the page itself is reversed before return.
    const formattedMessages = messages.reverse().map(toMessageResponse);
    return {
        messages: formattedMessages,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};
