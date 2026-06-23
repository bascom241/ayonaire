import express from "express";
const router = express.Router();
import { completedCourses, enrolledCourses } from "../controllers/enroll.controller.js";
import { authorize } from "../middlewares/auth.middleware.js";
router.get("/enrolled-coures", authorize, enrolledCourses);
router.get("/enrolled-courses", authorize, enrolledCourses);
router.get("/completed-courses", authorize, completedCourses);
export default router;
