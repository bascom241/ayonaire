import express from "express";
const router = express.Router();
import { create, getAll } from "../controllers/module.controller.js";
import { authorize, restrictTo } from "../middlewares/auth.middleware.js";
router.post("/create", authorize, restrictTo("admin", "instructor"), create);
router.get("/", authorize, restrictTo("admin", "instructor"), getAll);
export default router;
