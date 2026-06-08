import { getMessagesForRoom, sendMessage } from "../services/message.service.js";
export const send = async (req, res, next) => {
    try {
        const authRequest = req;
        const senderId = authRequest.user?.id;
        if (!senderId) {
            return res.status(400).json({ message: "Sender id is required" });
        }
        const { text, roomId } = req.body;
        console.log(req.body);
        const dataToSend = {
            senderId,
            roomId,
            media: req.file,
            file: req.file,
            text
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
        const query = req.query;
        const { roomId } = req.body;
        const dataToSend = {
            roomId,
            query
        };
        const data = await getMessagesForRoom(dataToSend);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
