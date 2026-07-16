import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError.js";
import {
  createQuiz,
  addQuestion,
  submitQuiz,
  listQuizzes,
  getQuizById,
  updateQuiz,
  deleteQuiz,
  getQuizResults,
} from "../services/quiz.service.js";
import {
  CreateQuizDto,
  CreateQuestionDto,
  SubmitQuizDto,
  UpdateQuizDto,
} from "../types/quiz.types.js";

interface AuthRequest extends Request {
  user?: { id?: string; role?: string };
}

export const create = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const dataToSend: CreateQuizDto = {
      title: req.body.title,
      moduleId: req.body.moduleId,
      createdBy: req.user?.id,
      randomizeQuestions: req.body.randomizeQuestions,
      showCorrectAnswers: req.body.showCorrectAnswers,
      allowRetakes: req.body.allowRetakes,
      status: req.body.status,
      dueDate: req.body.dueDate,
    };
    const data = await createQuiz(dataToSend);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getAll = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError("Unauthorized", 401);

    const data = await listQuizzes(userId, req.user?.role, req.query);
    res.status(200).json({ success: true, ...data });
  } catch (error) {
    next(error);
  }
};

export const getSingle = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const quizId = req.params.quizId as string;
    const data = await getQuizById(quizId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const update = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError("Unauthorized", 401);

    const quizId = req.params.quizId as string;
    const dataToSend: UpdateQuizDto = {
      title: req.body.title,
      randomizeQuestions: req.body.randomizeQuestions,
      showCorrectAnswers: req.body.showCorrectAnswers,
      allowRetakes: req.body.allowRetakes,
      status: req.body.status,
      dueDate: req.body.dueDate,
    };
    const data = await updateQuiz(quizId, userId, req.user?.role, dataToSend);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const remove = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError("Unauthorized", 401);

    const quizId = req.params.quizId as string;
    await deleteQuiz(quizId, userId, req.user?.role);
    res.status(200).json({ success: true, message: "Quiz deleted" });
  } catch (error) {
    next(error);
  }
};

export const results = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError("Unauthorized", 401);

    const quizId = req.params.quizId as string;
    const data = await getQuizResults(quizId, userId, req.user?.role);
    res.status(200).json({ success: true, data });
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
