import { Request, Response, NextFunction } from "express";
import { CreateGroupRoomRequest, CreateDMRequest } from "../types/room.types.js";
import {
  createGroupRoom,
  ensureCourseRoom,
  findOrCreateDM,
  listMyRooms,
} from "../services/room.service.js";
import { AppError } from "../errors/AppError.js";

interface RoomAuthRequest extends Request {
  user?: { id?: string; role?: string };
}

export const createGroup = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authRequest = req as RoomAuthRequest;
    const senderId = authRequest.user?.id;
    if (!senderId) {
      throw new AppError("Sender id is required", 400);
    }
    const { name, description, participantIds } = req.body;

    // participantIds arrives as a JSON string when sent alongside a file
    // via multipart/form-data.
    const parsedParticipantIds =
      typeof participantIds === "string"
        ? JSON.parse(participantIds)
        : participantIds;

    const dataToSend: CreateGroupRoomRequest = {
      userId: senderId,
      participantIds: parsedParticipantIds,
      description,
      name,
      profile: req.file,
    };

    const data = await createGroupRoom(dataToSend);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const createDM = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authRequest = req as RoomAuthRequest;
    const senderId = authRequest.user?.id;
    if (!senderId) {
      throw new AppError("Sender id is required", 400);
    }
    const { otherUserId } = req.body;

    const dataToSend: CreateDMRequest = {
      userId: senderId,
      otherUserId,
    };

    const data = await findOrCreateDM(dataToSend);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const createCourseRoom = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authRequest = req as RoomAuthRequest;
    const senderId = authRequest.user?.id;
    if (!senderId) {
      throw new AppError("Sender id is required", 400);
    }

    const courseId = req.params.courseId || req.body.courseId;
    if (!courseId) {
      throw new AppError("courseId is required", 400);
    }

    const data = await ensureCourseRoom(
      courseId,
      senderId,
      authRequest.user?.role,
    );
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authRequest = req as RoomAuthRequest;
    const userId = authRequest.user?.id;
    if (!userId) {
      throw new AppError("unauthorized", 401);
    }

    const data = await listMyRooms(userId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};
