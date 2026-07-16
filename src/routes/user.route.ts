import express from "express";
import {
  registerUser,
  login,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
  refreshToken,
  logout,
  getNonAdminUsers,
  updateUser,
  getUserLoginHistory,
  getUserActivityHistory,
  assignRoleToUser,
  deactivateToUser,
  suspendToUser,
  activateToUser,
  removeUser,
  viewMyProfile,
  uploadImage,
  edit,
  add,
  invite,
  accept,
  inviteUserCsv,
  getLeaderboard,
} from "../controllers/user.controller.js";
const router = express.Router();
import { restrictTo, authorize } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.js";

router.post("/register", registerUser);
router.post("/login", login);
router.post("/verify-email", verifyEmail);
router.get("/verify-email", verifyEmail);
router.post("/resend-verification-email", resendVerificationEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/refresh-token", refreshToken);
router.post("/logout", logout);
router.get(
  "/non-admin-users",
  authorize,
  restrictTo("admin"),
  getNonAdminUsers,
);
router.put("/user/:id", authorize, restrictTo("admin"), updateUser);
router.get(
  "/user/:id/login-history",
  authorize,
  restrictTo("admin"),
  getUserLoginHistory,
);
router.get(
  "/user/:id/user-activity-history",
  authorize,
  restrictTo("admin"),
  getUserActivityHistory,
);
router.put(
  "/user/:id/assign-role",
  authorize,
  restrictTo("admin"),
  assignRoleToUser,
);
router.put(
  "/user/:id/deativate-user",
  authorize,
  restrictTo("admin"),
  deactivateToUser,
);
router.put(
  "/user/:id/deactivate-user",
  authorize,
  restrictTo("admin"),
  deactivateToUser,
);
router.put(
  "/user/:id/suspend-user",
  authorize,
  restrictTo("admin"),
  suspendToUser,
);
router.put(
  "/user/:id/activate-user",
  authorize,
  restrictTo("admin"),
  activateToUser,
);
router.delete("/user/:id", authorize, restrictTo("admin"), removeUser);
router.post("/get-profile", authorize, viewMyProfile);
router.post("/add-profile", authorize, upload.single("profile"), uploadImage);
router.put("/edit-profile", authorize, upload.single("profile"), edit);
router.get("/leaderboard", authorize, getLeaderboard);
router.post("/add", authorize, restrictTo("admin"), add);
router.post("/invite", authorize, restrictTo("admin"), invite);
router.post("/accept-invite/:token", accept);
router.post(
  "/invite/csv",
  authorize,
  restrictTo("admin"),
  upload.single("file"),
  inviteUserCsv,
);
export default router;
