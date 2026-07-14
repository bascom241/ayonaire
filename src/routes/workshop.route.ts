import express from "express";
import { restrictTo, authorize } from "../middlewares/auth.middleware.js";
import {
  create,
  get,
  getOne,
  edit,
  remove,
} from "../controllers/workshop.controller.js";

const router = express.Router();

router.post("/", authorize, restrictTo("admin", "instructor"), create);
router.get("/", get);
router.get("/:id", getOne);
router.put("/:id", authorize, restrictTo("admin", "instructor"), edit);
router.delete("/:id", authorize, restrictTo("admin", "instructor"), remove);

export default router;
