import express from "express"
const router = express.Router()
import { create, assign, assignInstructor } from "../controllers/cohort.controller.js";
import { authorize, restrictTo } from "../middlewares/auth.middleware.js";



router.post("/create", authorize, restrictTo("admin","instructor"), create)
router.post("/assign-student", authorize, restrictTo("admin", "instructor"), assign)
router.post("/assign-instrutor", authorize, restrictTo("admin"), assignInstructor)
export default router