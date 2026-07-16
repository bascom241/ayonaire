import express from "express";
const router = express.Router();

import { authorize, restrictTo } from "../middlewares/auth.middleware.js";
import {
  create,
  getAll,
  getSingle,
  update,
  approve,
  remove,
  report,
} from "../controllers/attendance.controller.js";

router.post("/", authorize, restrictTo("admin", "instructor"), create);
router.get("/", authorize, restrictTo("admin", "instructor"), getAll);
router.get("/reports", authorize, restrictTo("admin", "instructor"), report);
router.get("/:sessionId", authorize, restrictTo("admin", "instructor"), getSingle);
router.put("/:sessionId", authorize, restrictTo("admin", "instructor"), update);
router.put("/:sessionId/approve", authorize, restrictTo("admin"), approve);
router.delete("/:sessionId", authorize, restrictTo("admin"), remove);

export default router;
