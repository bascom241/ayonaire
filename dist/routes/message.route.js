import express from "express";
const router = express.Router();
import { authorize } from "../middlewares/auth.middleware.js";
import { getMessagesForARoom, reactToMessage, send, deleteMessage, } from "../controllers/message.controller.js";
import { upload } from "../middlewares/multer.js";
import { edit, pinMessage } from "../controllers/chatFeatures.controller.js";
router.post("/send", authorize, upload.fields([
    { name: "media", maxCount: 1 },
    { name: "file", maxCount: 1 },
]), send);
router.post("/:messageId/reactions", authorize, reactToMessage);
router.patch("/:messageId", authorize, edit);
router.put("/:messageId/pin", authorize, pinMessage);
router.delete("/:messageId", authorize, deleteMessage);
router.get("/:roomId", authorize, getMessagesForARoom);
export default router;
