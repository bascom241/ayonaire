import express from "express"
const router = express.Router();
import { authorize, restrictTo } from "../middlewares/auth.middleware.js";
import { create } from "../controllers/announcement.controller.js";


router.post("/create", authorize, restrictTo("admin"), create);

export default router;