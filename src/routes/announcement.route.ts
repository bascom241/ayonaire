import express from "express";
const router = express.Router();
import { authorize, restrictTo } from "../middlewares/auth.middleware.js";
import {
  create,
  getAll,
  update,
  remove,
} from "../controllers/announcement.controller.js";

router.post("/", authorize, restrictTo("admin", "instructor"), create);
router.get("/", authorize, getAll);
router.put(
  "/:announcementId",
  authorize,
  restrictTo("admin", "instructor"),
  update,
);
router.delete(
  "/:announcementId",
  authorize,
  restrictTo("admin", "instructor"),
  remove,
);
export default router;
