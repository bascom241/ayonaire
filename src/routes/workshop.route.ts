import express from "express";
import { restrictTo, authorize } from "../middlewares/auth.middleware.js";
import { create, get, edit } from "../controllers/workshop.controller.js";

const router = express.Router();

router.post("/", authorize, restrictTo("admin", "instructor"), create);
router.get("/", get);
router.put("/:id", authorize, restrictTo("admin", "instructor"), edit);

export default router;
