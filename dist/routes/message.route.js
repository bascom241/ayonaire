import express from "express";
const router = express.Router();
import { authorize } from "../middlewares/auth.middleware.js";
import { getMessagesForARoom, send } from "../controllers/message.controller.js";
router.post("/send", authorize, send);
router.get("/", authorize, getMessagesForARoom);
export default router;
