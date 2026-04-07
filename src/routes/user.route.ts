import express from "express"
import { registerUser,login, getNonAdminUsers, updateUser, getUserLoginHistory, getUserActivityHistory, assignRoleToUser, deactivateToUser, suspendToUser, viewMyProfile, uploadImage, edit, add, invite, accept, inviteUserCsv} from "../controllers/user.controller.js";
const router = express.Router();
import { restrictTo, authorize } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.js";

router.post("/register", registerUser);
router.post("/login", login)
router.get("/non-admin-users", authorize, restrictTo("admin"), getNonAdminUsers)
router.put("/user/:id", authorize, restrictTo("admin"), updateUser);
router.get("/user/:id/login-history", authorize, restrictTo("admin"), getUserLoginHistory)
router.get("/user/:id/user-activity-history", authorize, restrictTo("admin"), getUserActivityHistory)
router.put("/user/:id/assign-role", authorize,restrictTo("admin"), assignRoleToUser)
router.put("/user/:id/deativate-user", authorize,restrictTo("admin"), deactivateToUser)
router.put("/user/:id/suspend-user", authorize,restrictTo("admin"), suspendToUser)
router.post("/get-profile", authorize, viewMyProfile) 
router.post("/add-profile", authorize, upload.single("profile"), uploadImage)
router.put("/edit-profile", authorize, upload.single("profile"), edit )
router.post("/add", authorize, restrictTo("admin"),add)
// Not Documented with Swagger
router.post("/invite",authorize,restrictTo("admin"), invite);
// not Documented with swagger
router.post("/accept-invite/:token",accept)
// Not Documented with Swagger
router.post("/invite/csv", upload.single("file"),inviteUserCsv)
export default router;