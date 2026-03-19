import { AppError } from "../errors/AppError.js";
import { createQuiz, addQuestion, submitQuiz, } from "../services/quiz.service.js";
export const create = async (req, res, next) => {
    try {
        const dataToSend = {
            title: req.body.title,
            moduleId: req.body.moduleId,
            randomizeQuestions: req.body.randomizeQuestions,
            showCorrectAnswers: req.body.showCorrectAnswers,
            allowRetakes: req.body.allowRetakes,
        };
        const data = await createQuiz(dataToSend);
        res.status(201).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
export const createQuestion = async (req, res, next) => {
    try {
        const dataToSend = {
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
    }
    catch (error) {
        console.log(error);
        next(error);
    }
};
export const submit = async (req, res, next) => {
    try {
        const id = req.user?.id;
        if (!id) {
            throw new AppError("unauthorized", 401);
        }
        const dataToSend = {
            quizId: req.body.quizId,
            userId: id,
            answers: req.body.answers,
        };
        const data = await submitQuiz(dataToSend);
        res.status(200).json({
            success: true,
            data,
        });
    }
    catch (error) {
        next(error);
    }
};
