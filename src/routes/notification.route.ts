import express from "express";
const router = express.Router();

import { authorize, restrictTo } from "../middlewares/auth.middleware.js";
import {
  create,
  getAll,
  getSingle,
  update,
  remove,
  send,
} from "../controllers/notification.controller.js";

router.post("/", authorize, restrictTo("admin", "instructor"), create);
router.get("/", authorize, restrictTo("admin", "instructor"), getAll);
router.get("/:notificationId", authorize, restrictTo("admin", "instructor"), getSingle);
router.put("/:notificationId", authorize, restrictTo("admin", "instructor"), update);
router.delete("/:notificationId", authorize, restrictTo("admin", "instructor"), remove);
router.post("/:notificationId/send", authorize, restrictTo("admin", "instructor"), send);

export default router;
