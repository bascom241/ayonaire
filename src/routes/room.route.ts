import express from "express";
const router = express.Router();
import { authorize } from "../middlewares/auth.middleware.js";
import { create } from "../controllers/room.controller.js";
import { upload } from "../middlewares/multer.js";

router.post("/", authorize, upload.single("profile"), create);

export default router;
