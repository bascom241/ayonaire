import express from "express";
const router = express.Router();
import { authorize } from "../middlewares/auth.middleware.js";
import { createGroup, createDM, list } from "../controllers/room.controller.js";
import { upload } from "../middlewares/multer.js";

router.post("/", authorize, upload.single("profile"), createGroup);
router.post("/dm", authorize, createDM);
router.get("/", authorize, list);

export default router;
