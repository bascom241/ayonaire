import express from "express";
import {
  answerQuestion,
  assistant,
  createQuestion,
  createReminder,
  createReview,
  deleteReminder,
  questions,
  reminders,
  reviews,
  saveTranscription,
  transcription,
  upvoteQuestion,
  notes,
  createNote,
  deleteNote,
  importNotes,
  activateReminder,
} from "../controllers/courseInteraction.controller.js";
import { authorize, restrictTo } from "../middlewares/auth.middleware.js";
import { courseAccess } from "../middlewares/courseAccess.middleware.js";

const router = express.Router();

router.get("/:courseId/notes", authorize, courseAccess, notes);
router.post("/:courseId/notes/import", authorize, courseAccess, importNotes);
router.post("/:courseId/notes", authorize, courseAccess, createNote);
router.delete("/:courseId/notes/:noteId", authorize, courseAccess, deleteNote);


router.get("/:courseId/questions", authorize, courseAccess, questions);
router.post("/:courseId/questions", authorize, courseAccess, createQuestion);
router.post("/questions/:questionId/answers", authorize, courseAccess, answerQuestion);
router.post("/questions/:questionId/upvote", authorize, courseAccess, upvoteQuestion);

router.get("/:courseId/reviews", authorize, courseAccess, reviews);
router.post("/:courseId/reviews", authorize, courseAccess, createReview);

router.get(
  "/:courseId/lessons/:lessonId/transcription",
  authorize,
  courseAccess,
  transcription,
);
router.put(
  "/:courseId/lessons/:lessonId/transcription",
  authorize,
  courseAccess,
  restrictTo("admin", "instructor"),
  saveTranscription,
);

router.get("/:courseId/reminders", authorize, courseAccess, reminders);
router.post("/:courseId/reminders", authorize, courseAccess, createReminder);
router.post("/:courseId/reminders/:reminderId/activate", authorize, courseAccess, activateReminder);
router.delete("/:courseId/reminders/:reminderId", authorize, courseAccess, deleteReminder);

router.post("/:courseId/assistant", authorize, courseAccess, assistant);

export default router;
