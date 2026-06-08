import express from "express";
const router = express.Router();
import { authorize, restrictTo } from "../middlewares/auth.middleware.js";
import { create, getAll } from "../controllers/announcement.controller.js";
router.post("/", authorize, restrictTo("admin"), create);
router.get("/", authorize, getAll);
export default router;
