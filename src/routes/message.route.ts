import express from "express";
const router = express.Router();
import { authorize } from "../middlewares/auth.middleware.js";
import {
  getMessagesForARoom,
  reactToMessage,
  send,
} from "../controllers/message.controller.js";
import { upload } from "../middlewares/multer.js";

router.post(
  "/send",
  authorize,
  upload.fields([
    { name: "media", maxCount: 1 },
    { name: "file", maxCount: 1 },
  ]),
  send,
);
router.post("/:messageId/reactions", authorize, reactToMessage);
router.get("/:roomId", authorize, getMessagesForARoom);
export default router;
