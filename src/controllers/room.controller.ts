import { Request, Response, NextFunction } from "express";
import { CreateRoomRequest } from "../types/room.types.js";
import { createRoom } from "../services/room.service.js";
interface RoomAuthRequest extends Request {
  user?: { id?: string };
}

export const create = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authRequest = req as RoomAuthRequest;
    const senderId = authRequest.user?.id;
    if (!senderId) {
      return res.status(400).json({ message: "Sender id is required" });
    }
    const { name, description } = req.body;
    const dataToSend: CreateRoomRequest = {
      userId: senderId,
      description,
      name,
      profile: req.file,
    };

    const data = await createRoom(dataToSend);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};
