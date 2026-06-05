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
export const sendMessage = async (
  data: MessageRequestData,
): Promise<MessageResponseData> => {
  const { roomId, text, media, senderId, file } = data;
  validateRequestBodyWithValues<MessageRequestData>(data, [
    "roomId",
    "senderId",
  ]);

  console.log(roomId);
  const hasText = text?.trim();
  if (!hasText && !media && !file) {
    throw new AppError("Either text or media must be sent", 400);
  }

  let uploadMediaResult;
  let uploadFileResult;

  if (media) {
    uploadMediaResult = await uploadMedia(media.buffer, "image");
  }

  if (file) {
    uploadFileResult = await uploadFile(file.buffer, "raw");
  }
  const room = await roomModel.findById(roomId);
  if (!room) {
    throw new AppError("No room to broadcast message", 400);
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
  const fullMessage = await messageModel
    .findById(message._id)
    .populate("senderId", "name");

  if (!fullMessage) {
    throw new AppError("Error in fetching messages", 400);
  }

  io.to(roomId).emit("message:new", fullMessage);

  return {
    senderId: {
      id: fullMessage.senderId._id.toString(),
      name: (fullMessage.senderId as any).name,
    },
    roomId: fullMessage.roomId.toString(),
    text: fullMessage.text ? fullMessage.text : "",
    media: fullMessage.media
      ? {
          url: fullMessage.media?.url,
          publicId: fullMessage.media?.publicId,
        }
      : undefined,
    file: fullMessage.file
      ? {
          url: fullMessage.file?.url,
          publicId: fullMessage.file?.publicId,
        }
      : undefined,
  };
};

export const getMessagesForRoom = async (
  data: GetMessagesRoom,
): Promise<GetMessagesResponse> => {
  const { roomId, query} = data;
  validateRequestBodyWithValues<GetMessagesRoom>(data, ["roomId"]);

  const room = await roomModel.findById(roomId);
  const {page, limit, skip} = getPagination(query)
  if (!room) {
    throw new AppError("room not found", 400);
  }


  const [messages, total] = await Promise.all([
    messageModel
      .find({ roomId })
      .skip(skip)
      .limit(limit)
      .populate("senderId", "name"),
      messageModel.countDocuments()

  ])

  const formattedMessages = messages.map((message) => ({
    senderId: {
      id: message.senderId.toString(),
      name: (message.senderId as any).name,
    },
    roomId: message.roomId.toString(),
    text: message.text ? message.text : "",
    media: message.media
      ? {
          url: message.media?.url,
          publicId: message.media?.publicId,
        }
      : undefined,
    file: message.file
      ? {
          url: message.file?.url,
          publicId: message.file?.publicId,
        }
      : undefined,
  }));

  return {
    messages: formattedMessages,
     pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  }
};
