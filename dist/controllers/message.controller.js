import { getMessagesForRoom, sendMessage, } from "../services/message.service.js";
import { AppError } from "../errors/AppError.js";
export const send = async (req, res, next) => {
    try {
        const authRequest = req;
        const senderId = authRequest.user?.id;
        if (!senderId) {
            return res.status(400).json({ message: "Sender id is required" });
        }
        const { text, roomId } = req.body;
        const dataToSend = {
            senderId,
            roomId,
            media: req.file,
            file: req.file,
            text,
        };
        const data = await sendMessage(dataToSend);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
export const getMessagesForARoom = async (req, res, next) => {
    try {
        const authRequest = req;
        const requesterId = authRequest.user?.id;
        if (!requesterId) {
            throw new AppError("unauthorized", 401);
        }
        const { roomId } = req.params;
        if (!roomId || typeof roomId !== "string") {
            throw new AppError("roomId is required", 400);
        }
        const dataToSend = {
            roomId,
            requesterId,
            query: req.query,
        };
        const data = await getMessagesForRoom(dataToSend);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
