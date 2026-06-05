import express from "express"
const router = express.Router();
import { authorize } from "../middlewares/auth.middleware.js";
import { send } from "../controllers/message.controller.js";


router.post("/send", authorize, send);
export default router