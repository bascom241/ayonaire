import express from "express";
const router = express.Router();
import { restrictTo, authorize } from "../middlewares/auth.middleware.js";
import {
  createCourseCat,
  getCourseCategories,
  create,
  edit,
  assign,
  saveToDraft,
  getAdminCourses,
  getAll,
  getSingle,
  remove,
  togglePublish,
} from "../controllers/course.controller.js";
import { upload } from "../middlewares/multer.js";
import { cache } from "../middlewares/cache.middleware.js";

router.get("/all",  getAll);
router.get("/cat", authorize, getCourseCategories);
router.post("/cat", authorize, restrictTo("admin"), createCourseCat);
router.post(
  "/create",
  authorize,
  restrictTo("admin", "instructor"),
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "introVideo", maxCount: 1 },
  ]),
  create,
);
router.put(
  "/edit",
  authorize,
  restrictTo("admin", "instructor"),
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "introVideo", maxCount: 1 },
  ]),
  edit,
);
router.put("/assign", authorize, restrictTo("admin"), assign);
router.put(
  "/save-to-draft",
  authorize,
  restrictTo("admin"),
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "introVideo", maxCount: 1 },
  ]),
  saveToDraft,
);
// Not documented and deployed
router.get("/", authorize, restrictTo("admin"), cache(60), getAdminCourses);
router.delete(
  "/:courseId",
  authorize,
  restrictTo("admin", "instructor"),
  remove,
);
router.put(
  "/:courseId/publish",
  authorize,
  restrictTo("admin", "instructor"),
  togglePublish,
);
router.get("/:courseId", authorize, getSingle);
export default router;
