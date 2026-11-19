import { AppError } from "../errors/AppError.js";
import messageModel from "../models/message.model.js";
import {
  GetMessagesResponse,
  MessageRequestData,
  MessageResponseData,
} from "../types/message.types.js";
import { uploadMedia, uploadFile } from "../utils/uploadToCloudinary.js";
import { validateRequestBodyWithValues } from "../utils/validateRequestBody.js";
import { io } from "../server.js";
import roomModel from "../models/room.model.js";
import { GetMessagesRoom } from "../types/message.types.js";
import { getPagination } from "../utils/getPagination.js";
import { assertCurrentCourseRoomAccess } from "./roomAccess.service.js";
import userModel from "../models/user.model.js";

const getProfilePayload = (user: any) =>
  user?.profile ? { url: user.profile.url, publicId: user.profile.publicId } : null;

const senderPayload = (user: any): any => ({
  id: user?._id?.toString?.() ?? "",
  name: user?.name ?? "Unknown user",
  profile: getProfilePayload(user),
});

const groupedReactions = (reactions: any[] = []) => {
  const groups = new Map<string, any[]>();
  for (const reaction of reactions) {
    const user = reaction.user;
    if (!user) continue;
    const users = groups.get(reaction.emoji) ?? [];
    users.push(senderPayload(user));
    groups.set(reaction.emoji, users);
  }
  return Array.from(groups.entries()).map(([emoji, users]) => ({
    emoji,
    users,
    count: users.length,
  }));
};

export const toMessageResponse = (message: any, includeReadBy = false): MessageResponseData => ({
  id: message._id.toString(),
  senderId: senderPayload(message.senderId),
  roomId: message.roomId.toString(),
  text: message.text ? message.text : "",
  replyTo: message.replyTo
    ? {
        id: message.replyTo._id.toString(),
        text: message.replyTo.text ?? "",
        senderId: senderPayload(message.replyTo.senderId),
      }
    : null,
  media: message.media
    ? { url: message.media.url, publicId: message.media.publicId }
    : undefined,
  file: message.file
    ? { url: message.file.url, publicId: message.file.publicId }
    : undefined,
  reactions: groupedReactions(message.reactions),
  createdAt: message.createdAt.toISOString(),
  editedAt: message.editedAt?.toISOString(),
  pinnedAt: message.pinnedAt?.toISOString(),
  readBy: includeReadBy ? (message.readBy ?? []).map((id: any) => id.toString()) : undefined,
  threadRoot: message.threadRoot?.toString(),
});

export const sendMessage = async (
  data: MessageRequestData,
): Promise<MessageResponseData> => {
  const { roomId, text, media, senderId, file, replyTo } = data;
  validateRequestBodyWithValues<MessageRequestData>(data, [
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
  await assertCurrentCourseRoomAccess(room, senderId);
  if (room.isGroup && room.announcementOnly) {
    const sender = await userModel.findById(senderId).select("role");
    if (sender?.role !== "admin" && !(sender?.role === "instructor" && room.roomCreator.toString() === senderId)) throw new AppError("Only the instructor or an administrator can post announcements", 403);
  }

  let threadRoot;
  if (replyTo) {
    const parentMessage = await messageModel.findOne({ _id: replyTo, roomId });
    if (!parentMessage) {
      throw new AppError("reply target not found in this conversation", 404);
    }
    threadRoot = parentMessage.threadRoot ?? parentMessage._id;
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
    replyTo: replyTo || undefined,
    threadRoot,
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
    .populate("senderId", "name profile")
    .populate({
      path: "replyTo",
      select: "text senderId",
      populate: { path: "senderId", select: "name profile" },
    })
    .populate("reactions.user", "name profile");

  if (!fullMessage) {
    throw new AppError("Error in fetching messages", 400);
  }

  const response = toMessageResponse(fullMessage, !room.isGroup);

  io.to(roomId).emit("message:new", response);

  return response;
};

export const getMessagesForRoom = async (
  data: GetMessagesRoom,
): Promise<GetMessagesResponse> => {
  const { roomId, requesterId, query } = data;
  validateRequestBodyWithValues<GetMessagesRoom>(data, [
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
  await assertCurrentCourseRoomAccess(room, requesterId);

  const { page, limit, skip } = getPagination(query);
  const search = typeof query?.search === "string" ? query.search.trim().slice(0, 200) : "";
  const filter: any = search ? { roomId, text: { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } } : { roomId };
  const before = typeof query?.before === "string" ? query.before : "";
  if (before) {
    const anchor = await messageModel.findOne({ _id: before, roomId });
    if (!anchor) throw new AppError("Message cursor not found in this conversation", 400);
    filter.$or = [{ createdAt: { $lt: anchor.createdAt } }, { createdAt: anchor.createdAt, _id: { $lt: anchor._id } }];
  }

  const [messages, total] = await Promise.all([
    messageModel
      .find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .skip(before ? 0 : skip)
      .limit(limit)
      .populate("senderId", "name profile")
      .populate({
        path: "replyTo",
        select: "text senderId",
        populate: { path: "senderId", select: "name profile" },
      })
      .populate("reactions.user", "name profile"),
    messageModel.countDocuments(search ? { roomId, text: filter.text } : { roomId }),
  ]);

  // Returned newest-first for pagination (page 1 = most recent), but a chat
  // thread reads oldest-first, so the page itself is reversed before return.
  const formattedMessages = messages.reverse().map((message) => toMessageResponse(message, !room.isGroup));

  return {
    messages: formattedMessages,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      nextCursor: messages.length === limit ? messages[0]._id.toString() : null,
    },
  };
};

export const toggleMessageReaction = async (
  messageId: string,
  userId: string,
  emoji: string,
): Promise<MessageResponseData> => {
  if (!emoji?.trim()) {
    throw new AppError("emoji is required", 400);
  }

  const message = await messageModel.findById(messageId);
  if (!message) {
    throw new AppError("message not found", 404);
  }

  const room = await roomModel.findOne({
    _id: message.roomId,
    participants: userId,
  });
  if (!room) {
    throw new AppError("You are not a member of this conversation", 403);
  }
  await assertCurrentCourseRoomAccess(room, userId);

  const selectedEmoji = emoji.trim();
  const hasReacted = (message.reactions ?? []).some(
    (reaction: any) =>
      reaction.emoji === selectedEmoji && reaction.user.toString() === userId,
  );

  await messageModel.findByIdAndUpdate(messageId, {
    [hasReacted ? "$pull" : "$addToSet"]: {
      reactions: { emoji: selectedEmoji, user: userId },
    },
  });

  const updated = await messageModel
    .findById(messageId)
    .populate("senderId", "name profile")
    .populate({
      path: "replyTo",
      select: "text senderId",
      populate: { path: "senderId", select: "name profile" },
    })
    .populate("reactions.user", "name profile");

  if (!updated) {
    throw new AppError("message not found", 404);
  }

  const response = toMessageResponse(updated, !room.isGroup);
  io.to(response.roomId).emit("message:reaction", response);
  return response;
};

export const deleteOwnMessage = async (messageId: string, userId: string) => {
  const message = await messageModel.findById(messageId);
  if (!message) throw new AppError("Message not found", 404);
  const room = await roomModel.findOne({ _id: message.roomId, participants: userId });
  if (!room) throw new AppError("You are not a member of this conversation", 403);
  await assertCurrentCourseRoomAccess(room, userId);
  if (message.senderId.toString() !== userId) throw new AppError("You can only delete your own messages", 403);
  await messageModel.deleteOne({ _id: messageId, senderId: userId });
  const result = { id: messageId, roomId: message.roomId.toString() };
  io.to(result.roomId).emit("message:deleted", result);
  return result;
};
