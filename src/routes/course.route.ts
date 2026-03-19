import express from "express"
const router = express.Router()
import { restrictTo, authorize } from "../middlewares/auth.middleware.js";
import { createCourseCat, create, edit, assign} from "../controllers/course.controller.js";
import { upload } from "../middlewares/multer.js";

router.post("/cat", authorize, restrictTo("admin"), createCourseCat);
router.post("/create", authorize, restrictTo("admin", "instructor"),upload.single("thumbnail"), create)
router.put("/edit", authorize,restrictTo("admin", "instructor"),upload.single("thumbnail"),edit)
router.put("/assign", authorize, restrictTo("admin"),assign)
export default router;
