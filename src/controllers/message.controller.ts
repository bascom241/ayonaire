
import { Request, Response, NextFunction } from "express";
import { MessageRequestData } from "../types/message.types.js";
import { sendMessage } from "../services/message.service.js";
interface MessageAuthRequest extends Request {
  user?: { id?: string };
}
export const send = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authRequest = req as MessageAuthRequest
        const senderId = authRequest.user?.id;
        if (!senderId) {
            return res.status(400).json({ message: "Sender id is required" });
        }
        const { text, roomId } = req.body;
        console.log(req.body)
        const dataToSend: MessageRequestData = {
            senderId,
            roomId, 
            media: req.file,
            file: req.file,
            text
        };


        const data = await sendMessage(dataToSend);
        res.status(200).json({success: true, data})
    } catch (error) {
        next(error)
    }
}