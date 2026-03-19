import express from "express";
const router = express.Router();
import { create } from "../controllers/module.controller.js";
import { authorize, restrictTo } from "../middlewares/auth.middleware.js";
router.post("/create", authorize, restrictTo("admin", "instructor"), create);
export default router;
