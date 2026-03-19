import express from "express";
const router = express.Router();
import { enrolledCourses } from "../controllers/enroll.controller.js";
import { authorize } from "../middlewares/auth.middleware.js";
router.get("/enrolled-coures", authorize, enrolledCourses);
export default router;
