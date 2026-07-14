import express from "express";
const router = express.Router();
import { restrictTo, authorize } from "../middlewares/auth.middleware.js";
import {
  create,
  edit,
  deleteF,
  view,
  likeFeed,
  commentOnAfeed,
  deleteC,
  uploadTags,
  shareFeed,
  reportFeed,
} from "../controllers/feed.controller.js";
import { upload } from "../middlewares/multer.js";

router.post("/", authorize, upload.single("media"), create);
router.put("/", authorize, upload.single("media"), edit);
router.delete("/", authorize, deleteF);
router.get("/", authorize, view);
router.post("/like", authorize, likeFeed);
router.post("/comment", authorize, commentOnAfeed);
router.delete("/comment", authorize, deleteC);
router.post("/share", authorize, shareFeed);
router.post("/report", authorize, reportFeed);
router.post("/tag", authorize, restrictTo("admin"), uploadTags);

export default router;
