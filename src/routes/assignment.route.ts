import express from "express";
const router = express.Router();

import { authorize, restrictTo } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.js";
import {
  create,
  getAll,
  getSingle,
  update,
  remove,
  submit,
  getSubmissions,
  grade,
} from "../controllers/assignment.controller.js";

router.post(
  "/",
  authorize,
  restrictTo("admin", "instructor"),
  upload.array("materials", 10),
  create,
);
router.get("/", authorize, restrictTo("admin", "instructor"), getAll);
router.get("/:assignmentId", authorize, getSingle);
router.put(
  "/:assignmentId",
  authorize,
  restrictTo("admin", "instructor"),
  update,
);
router.delete(
  "/:assignmentId",
  authorize,
  restrictTo("admin", "instructor"),
  remove,
);
router.post(
  "/:assignmentId/submit",
  authorize,
  upload.single("file"),
  submit,
);
router.get(
  "/:assignmentId/submissions",
  authorize,
  restrictTo("admin", "instructor"),
  getSubmissions,
);
router.put(
  "/submission/:submissionId/grade",
  authorize,
  restrictTo("admin", "instructor"),
  grade,
);

export default router;
