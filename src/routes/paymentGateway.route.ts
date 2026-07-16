import express from "express";
const router = express.Router();

import { authorize, restrictTo } from "../middlewares/auth.middleware.js";
import {
  getGateways,
  connect,
  update,
  disconnect,
  setPrimary,
  getPricingPlans,
  createPlan,
  updatePlan,
  removePlan,
} from "../controllers/paymentGateway.controller.js";

router.get("/gateways", authorize, restrictTo("admin"), getGateways);
router.post("/gateways", authorize, restrictTo("admin"), connect);
router.put("/gateways/:name", authorize, restrictTo("admin"), update);
router.delete("/gateways/:name", authorize, restrictTo("admin"), disconnect);
router.put(
  "/gateways/:name/set-primary",
  authorize,
  restrictTo("admin"),
  setPrimary,
);

router.get(
  "/pricing-plans",
  authorize,
  restrictTo("admin", "instructor"),
  getPricingPlans,
);
router.post(
  "/pricing-plans",
  authorize,
  restrictTo("admin", "instructor"),
  createPlan,
);
router.put(
  "/pricing-plans/:planId",
  authorize,
  restrictTo("admin", "instructor"),
  updatePlan,
);
router.delete(
  "/pricing-plans/:planId",
  authorize,
  restrictTo("admin", "instructor"),
  removePlan,
);

export default router;
