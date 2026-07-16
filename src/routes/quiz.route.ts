import express from "express";
const router = express.Router();
import {
  createQuestion,
  create,
  submit,
  getAll,
  getSingle,
  update,
  remove,
  results,
} from "../controllers/quiz.controller.js";

import { restrictTo, authorize } from "../middlewares/auth.middleware.js";
router.post(
  "/question",
  authorize,
  restrictTo("admin", "instructor"),
  createQuestion,
);
router.post("/quiz/submit", authorize, submit);
router.post("/quiz", authorize, restrictTo("admin", "instructor"), create);
router.get("/quiz", authorize, restrictTo("admin", "instructor"), getAll);
router.get("/quiz/:quizId/results", authorize, restrictTo("admin", "instructor"), results);
router.get("/quiz/:quizId", authorize, getSingle);
router.put(
  "/quiz/:quizId",
  authorize,
  restrictTo("admin", "instructor"),
  update,
);
router.delete(
  "/quiz/:quizId",
  authorize,
  restrictTo("admin", "instructor"),
  remove,
);

export default router;
