import express from "express";
import bodyParser from "body-parser";
const router = express.Router();

import { restrictTo, authorize } from "../middlewares/auth.middleware.js";
import {
  pay,
  handlePayWebHook,
  paymentHistory,
  edit,
  bulkEdit,
  viewSingle,
  addNote,
  analytics,
  studentPurchases,
} from "../controllers/payment.controller.js";
router.post("/initialize", authorize, pay);
router.post(
  "/webhook",
  bodyParser.raw({ type: "application/json" }),
  handlePayWebHook,
);
router.get("/get-all-payments", authorize, restrictTo("admin"), paymentHistory);
router.get("/analytics", authorize, restrictTo("admin"), analytics);
router.get(
  "/student-purchases",
  authorize,
  restrictTo("admin"),
  studentPurchases,
);
router.post("/bulk-edit", authorize, restrictTo("admin"), bulkEdit);
router.put("/edit-order", authorize, restrictTo("admin"), edit);
router.get(
  "/single-order/:orderId",
  authorize,
  restrictTo("admin"),
  viewSingle,
);
router.post(
  "/single-order/:orderId/notes",
  authorize,
  restrictTo("admin"),
  addNote,
);
export default router;
