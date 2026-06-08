import express from "express";
const router = express.Router();
import { restrictTo, authorize } from "../middlewares/auth.middleware.js";
import { createCourseCat, create, edit, assign, saveToDraft, getAdminCourses, getSingleAdminCourse } from "../controllers/course.controller.js";
import { upload } from "../middlewares/multer.js";
import { cache } from "../middlewares/cache.middleware.js";
router.post("/cat", authorize, restrictTo("admin"), createCourseCat);
router.post("/create", authorize, restrictTo("admin", "instructor"), upload.single("thumbnail"), create);
router.put("/edit", authorize, restrictTo("admin", "instructor"), upload.single("thumbnail"), edit);
router.put("/assign", authorize, restrictTo("admin"), assign);
router.put("/save-to-draft", authorize, restrictTo("admin"), upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "introVideo", maxCount: 1 }
]), saveToDraft);
// Not documented and deployed
router.get("/", authorize, restrictTo("admin"), cache(60), getAdminCourses);
// Not Documented and deployed
router.get("/:courseId", authorize, restrictTo("admin"), getSingleAdminCourse);
export default router;
