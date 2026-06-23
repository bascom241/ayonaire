import { createRoom } from "../services/room.service.js";
export const create = async (req, res, next) => {
    try {
        const authRequest = req;
        const senderId = authRequest.user?.id;
        if (!senderId) {
            return res.status(400).json({ message: "Sender id is required" });
        }
        const { name, description } = req.body;
        const dataToSend = {
            userId: senderId,
            description,
            name,
            profile: req.file,
        };
        const data = await createRoom(dataToSend);
        res.status(201).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
