import express from "express";
const router = express.Router();
import { authorize, restrictTo } from "../middlewares/auth.middleware.js";
import { getAll, getByCategory, updateByCategory, } from "../controllers/systemSetting.controller.js";
router.get("/", authorize, restrictTo("admin"), getAll);
router.get("/:category", authorize, restrictTo("admin"), getByCategory);
router.put("/:category", authorize, restrictTo("admin"), updateByCategory);
export default router;
