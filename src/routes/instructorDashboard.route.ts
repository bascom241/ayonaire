import express from "express";
const router = express.Router();

import { authorize, restrictTo } from "../middlewares/auth.middleware.js";
import {
  stats,
  courses,
  students,
} from "../controllers/instructorDashboard.controller.js";

router.get(
  "/dashboard/stats",
  authorize,
  restrictTo("admin", "instructor"),
  stats,
);
router.get(
  "/dashboard/courses",
  authorize,
  restrictTo("admin", "instructor"),
  courses,
);
router.get(
  "/dashboard/students",
  authorize,
  restrictTo("admin", "instructor"),
  students,
);

export default router;
