import express from "express";
const router = express.Router();
import { authorize } from "../middlewares/auth.middleware.js";
import { getMessagesForARoom, send, } from "../controllers/message.controller.js";
import { upload } from "../middlewares/multer.js";
router.post("/send", authorize, upload.single("file"), send);
router.get("/", authorize, getMessagesForARoom);
export default router;
