import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError.js";
import {
  createQuiz,
  addQuestion,
  submitQuiz,
} from "../services/quiz.service.js";
import {
  CreateQuizDto,
  CreateQuestionDto,
  SubmitQuizDto,
} from "../types/quiz.types.js";
export const create = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const dataToSend: CreateQuizDto = {
      title: req.body.title,
      moduleId: req.body.moduleId,
      randomizeQuestions: req.body.randomizeQuestions,
      showCorrectAnswers: req.body.showCorrectAnswers,
      allowRetakes: req.body.allowRetakes,
    };
    const data = await createQuiz(dataToSend);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const createQuestion = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const dataToSend: CreateQuestionDto = {
      quizId: req.body.quizId,
      question: req.body.question,
      options: req.body.options,
      multipleCorrectAnswer: req.body.multipleCorrectAnswer,
      randomizeChoice: req.body.randomizeChoice,
      points: req.body.points,
    };

    const data = await addQuestion(dataToSend);

    res.status(201).json({
      success: true,
      data,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

interface AuthRequest extends Request {
  user?: { id?: string };
}
export const submit = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.user?.id;
    if (!id) {
      throw new AppError("unauthorized", 401);
    }
    const dataToSend: SubmitQuizDto = {
      quizId: req.body.quizId,
      userId: id,
      answers: req.body.answers,
    };

    const data = await submitQuiz(dataToSend);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};
