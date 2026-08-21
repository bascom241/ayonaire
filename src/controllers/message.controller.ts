import { Request, Response, NextFunction } from "express";
import { GetMessagesRoom, MessageRequestData } from "../types/message.types.js";
import {
  getMessagesForRoom,
  sendMessage,
  toggleMessageReaction,
} from "../services/message.service.js";
import { AppError } from "../errors/AppError.js";

interface MessageAuthRequest extends Request {
  user?: { id?: string };
}

function firstUploadedFile(
  files: Express.Multer.File[] | { [fieldname: string]: Express.Multer.File[] } | undefined,
  field: "media" | "file",
) {
  if (!files || Array.isArray(files)) return undefined;
  return files[field]?.[0];
}

export const send = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authRequest = req as MessageAuthRequest;
    const senderId = authRequest.user?.id;
    if (!senderId) {
      return res.status(400).json({ message: "Sender id is required" });
    }
    const { text, roomId } = req.body;
    const media = firstUploadedFile(req.files, "media");
    const file = firstUploadedFile(req.files, "file") ?? req.file;
    const dataToSend: MessageRequestData = {
      senderId,
      roomId,
      media,
      file,
      text,
    };

    const data = await sendMessage(dataToSend);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getMessagesForARoom = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authRequest = req as MessageAuthRequest;
    const requesterId = authRequest.user?.id;
    if (!requesterId) {
      throw new AppError("unauthorized", 401);
    }

    const { roomId } = req.params;
    if (!roomId || typeof roomId !== "string") {
      throw new AppError("roomId is required", 400);
    }

    const dataToSend: GetMessagesRoom = {
      roomId,
      requesterId,
      query: req.query,
    };

    const data = await getMessagesForRoom(dataToSend);

    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const reactToMessage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authRequest = req as MessageAuthRequest;
    const userId = authRequest.user?.id;
    if (!userId) {
      throw new AppError("unauthorized", 401);
    }

    const data = await toggleMessageReaction(
      req.params.messageId,
      userId,
      req.body.emoji,
    );

    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};
