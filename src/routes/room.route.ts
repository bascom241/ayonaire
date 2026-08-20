import express from "express";
const router = express.Router();
import { authorize } from "../middlewares/auth.middleware.js";
import {
  createGroup,
  createDM,
  createCourseRoom,
  list,
} from "../controllers/room.controller.js";
import { upload } from "../middlewares/multer.js";

router.post("/", authorize, upload.single("profile"), createGroup);
router.post("/dm", authorize, createDM);
router.post("/course/:courseId", authorize, createCourseRoom);
router.get("/", authorize, list);

export default router;
