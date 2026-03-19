import express from "express"
const router = express.Router();
import { createQuestion, create , submit  } from "../controllers/quiz.controller.js"

import { restrictTo,  authorize} from "../middlewares/auth.middleware.js"
router.post("/question", authorize, restrictTo("admin", "instructor"), createQuestion)
router.post("/quiz/submit", authorize, submit)
router.post("/quiz", authorize, restrictTo("admin", "instructor"), create);


export default router;