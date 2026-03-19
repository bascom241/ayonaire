import moduleModel from "../models/module.model.js";
import questionModel from "../models/question.model.js";
import quizModel from "../models/quiz.model.js";
import quizAttemptModel from "../models/quizAttempt.model.js";
import {
  CreateQuizDto,
  CreateQuizResponseDto,
  CreateQuestionDto,
  CreateQuestionResponse,
  SubmitQuizDto,
  SubmitQuizResponse
} from "../types/quiz.types.js";
import { validateRequestBodyWithValues } from "../utils/validateRequestBody.js";
export const createQuiz = async (
  data: CreateQuizDto,
): Promise<CreateQuizResponseDto> => {
  validateRequestBodyWithValues<CreateQuizDto>(data, ["title", "moduleId"]);
  const quiz = await quizModel.create({
    title: data.title,
    module: data.moduleId,
    randomizeQuestions: data.randomizeQuestions,
    showCorrectAnswers: data.showCorrectAnswers,
    allowRetakes: data.allowRetakes,
  });

  await moduleModel.findByIdAndUpdate(data.moduleId, {
    $push: { quizzes: quiz._id },
  });

  return {
    title: quiz.title,
    moduleId: quiz.module.toString(),
    randomizeQuestions: quiz.randomizeQuestions,
    showCorrectAnswers: quiz.showCorrectAnswers,
    allowRetakes: quiz.allowRetakes,
  };
};

export const addQuestion = async (
  data: CreateQuestionDto,
): Promise<CreateQuestionResponse> => {
  validateRequestBodyWithValues<CreateQuestionDto>(data, [
    "quizId",
    "question",
    "options",
  ]);
  const newQuestion = await questionModel.create({
    quiz: data.quizId,
    question: data.question,
    options: data.options,
    multipleCorrectAnswer: data.multipleCorrectAnswer,
    randomizeChoice: data.randomizeChoice,
    points: data.points,
  });

  await quizModel.findByIdAndUpdate(data.quizId, {
    $push: { questions: newQuestion._id },
  });

  return {
    question: newQuestion.question,
    options: (newQuestion.options ?? []).map((opt) => ({
      text: opt.text ?? "",
      isCorrect: opt.isCorrect ?? false,
    })),
    multipleCorrectAnswer: newQuestion.multipleCorrectAnswer,
    randomizeChoice: newQuestion.randomizeChoice,
    points: newQuestion.points,
  };
};

export const submitQuiz = async (
  data: SubmitQuizDto
): Promise<SubmitQuizResponse> => {

  validateRequestBodyWithValues<SubmitQuizDto>(data, [
    "quizId",
    "userId",
    "answers"
  ]);

  const questions = await questionModel.find({
    quiz: data.quizId
  });

  let score = 0;

  const gradedAnswers = data.answers.map((answer) => {

    const question = questions.find(
      q => q._id.toString() === answer.questionId
    );

    if (!question) {
      throw new Error("Question not found");
    }

    const correctOptions = question.options
      .filter(opt => opt.isCorrect)
      .map(opt => opt.text);

    const isCorrect =
      JSON.stringify(correctOptions.sort()) ===
      JSON.stringify(answer.selectedOptions.sort());

    if (isCorrect) {
      score += question.points ?? 0;
    }

    return {
      question: answer.questionId,
      selectedOptions: answer.selectedOptions,
      isCorrect
    };

  });

  await quizAttemptModel.create({
    quiz: data.quizId,
    user: data.userId,
    answers: gradedAnswers,
    score,
    completed: true
  });

  return {
    score,
    answers: gradedAnswers
  };
};
