import { createGroupRoom, findOrCreateDM, listMyRooms, } from "../services/room.service.js";
import { AppError } from "../errors/AppError.js";
export const createGroup = async (req, res, next) => {
    try {
        const authRequest = req;
        const senderId = authRequest.user?.id;
        if (!senderId) {
            throw new AppError("Sender id is required", 400);
        }
        const { name, description, participantIds } = req.body;
        // participantIds arrives as a JSON string when sent alongside a file
        // via multipart/form-data.
        const parsedParticipantIds = typeof participantIds === "string"
            ? JSON.parse(participantIds)
            : participantIds;
        const dataToSend = {
            userId: senderId,
            participantIds: parsedParticipantIds,
            description,
            name,
            profile: req.file,
        };
        const data = await createGroupRoom(dataToSend);
        res.status(201).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
export const createDM = async (req, res, next) => {
    try {
        const authRequest = req;
        const senderId = authRequest.user?.id;
        if (!senderId) {
            throw new AppError("Sender id is required", 400);
        }
        const { otherUserId } = req.body;
        const dataToSend = {
            userId: senderId,
            otherUserId,
        };
        const data = await findOrCreateDM(dataToSend);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
export const list = async (req, res, next) => {
    try {
        const authRequest = req;
        const userId = authRequest.user?.id;
        if (!userId) {
            throw new AppError("unauthorized", 401);
        }
        const data = await listMyRooms(userId);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
