import { AppError } from "../errors/AppError.js";
import moduleModel from "../models/module.model.js";
import questionModel from "../models/question.model.js";
import quizModel from "../models/quiz.model.js";
import quizAttemptModel from "../models/quizAttempt.model.js";
import enrollmentModel from "../models/enrollment.model.js";
import { getPagination } from "../utils/getPagination.js";
import { validateRequestBodyWithValues } from "../utils/validateRequestBody.js";
export const createQuiz = async (data) => {
    validateRequestBodyWithValues(data, ["title", "moduleId"]);
    const quiz = await quizModel.create({
        title: data.title,
        module: data.moduleId,
        createdBy: data.createdBy,
        randomizeQuestions: data.randomizeQuestions,
        showCorrectAnswers: data.showCorrectAnswers,
        allowRetakes: data.allowRetakes,
        status: data.status,
        dueDate: data.dueDate,
    });
    await moduleModel.findByIdAndUpdate(data.moduleId, {
        $push: { quizzes: quiz._id },
    });
    return {
        _id: quiz._id.toString(),
        title: quiz.title,
        moduleId: quiz.module.toString(),
        randomizeQuestions: quiz.randomizeQuestions,
        showCorrectAnswers: quiz.showCorrectAnswers,
        allowRetakes: quiz.allowRetakes,
    };
};
export const listQuizzes = async (userId, role, query) => {
    const { page, limit, skip } = getPagination(query);
    const filter = {};
    if (query.status)
        filter.status = query.status;
    if (query.module)
        filter.module = query.module;
    if (role === "user" || role === "student") {
        const courses = await enrollmentModel.find({ student: userId }).distinct("course");
        const modules = await moduleModel.find({ course: { $in: courses } }).distinct("_id");
        filter.module = query.module && modules.some((id) => id.toString() === query.module)
            ? query.module : { $in: query.module ? [] : modules };
        filter.status = "active";
    }
    else if (role !== "admin") {
        filter.createdBy = userId;
    }
    else if (query.createdBy) {
        filter.createdBy = query.createdBy;
    }
    const [quizzes, total] = await Promise.all([
        quizModel
            .find(filter)
            .populate("createdBy", "name")
            .populate({
            path: "module",
            select: "title course",
            populate: { path: "course", select: "title" },
        })
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 }),
        quizModel.countDocuments(filter),
    ]);
    const quizIds = quizzes.map((q) => q._id);
    const attemptStats = await quizAttemptModel.aggregate([
        { $match: { quiz: { $in: quizIds }, completed: true } },
        {
            $group: {
                _id: "$quiz",
                count: { $sum: 1 },
                avgScore: { $avg: "$score" },
            },
        },
    ]);
    const statsMap = {};
    attemptStats.forEach((s) => {
        statsMap[s._id.toString()] = { count: s.count, avgScore: s.avgScore };
    });
    return {
        quizzes: quizzes.map((q) => {
            const stats = statsMap[q._id.toString()];
            return {
                _id: q._id.toString(),
                title: q.title,
                status: q.status,
                dueDate: q.dueDate,
                createdBy: q.createdBy
                    ? { _id: q.createdBy._id.toString(), name: q.createdBy.name }
                    : null,
                course: q.module?.course
                    ? { _id: q.module.course._id.toString(), title: q.module.course.title }
                    : null,
                module: q.module?._id?.toString() || q.module?.toString(),
                questionsCount: q.questions.length,
                totalPoints: q.totalPoints,
                attemptsCount: stats?.count || 0,
                avgScore: stats ? Math.round(stats.avgScore) : null,
                createdAt: q.createdAt,
            };
        }),
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};
export const getQuizById = async (quizId, userId, role) => {
    const quiz = await quizModel
        .findById(quizId)
        .populate("questions")
        .populate({
        path: "module",
        select: "title course",
        populate: { path: "course", select: "title" },
    });
    if (!quiz) {
        throw new AppError("Quiz not found", 404);
    }
    if (role === "user" || role === "student") {
        const module = await moduleModel.findById(quiz.module?._id ?? quiz.module);
        if (quiz.status !== "active" || !module || !(await enrollmentModel.exists({ student: userId, course: module.course }))) {
            throw new AppError("Quiz not available", 403);
        }
        const safe = quiz.toObject();
        safe.questions = safe.questions.map((q) => ({ ...q, options: q.options.map(({ isCorrect, ...option }) => option) }));
        safe.course = safe.module?.course;
        return safe;
    }
    return quiz;
};
export const updateQuiz = async (quizId, userId, role, data) => {
    const quiz = await quizModel.findById(quizId);
    if (!quiz) {
        throw new AppError("Quiz not found", 404);
    }
    if (role !== "admin" &&
        quiz.createdBy &&
        quiz.createdBy.toString() !== userId) {
        throw new AppError("You do not own this quiz", 403);
    }
    if (data.title !== undefined)
        quiz.title = data.title;
    if (data.randomizeQuestions !== undefined)
        quiz.randomizeQuestions = data.randomizeQuestions;
    if (data.showCorrectAnswers !== undefined)
        quiz.showCorrectAnswers = data.showCorrectAnswers;
    if (data.allowRetakes !== undefined)
        quiz.allowRetakes = data.allowRetakes;
    if (data.status !== undefined)
        quiz.status = data.status;
    if (data.dueDate !== undefined)
        quiz.dueDate = data.dueDate;
    await quiz.save();
    return quiz;
};
export const deleteQuiz = async (quizId, userId, role) => {
    const quiz = await quizModel.findById(quizId);
    if (!quiz) {
        throw new AppError("Quiz not found", 404);
    }
    if (role !== "admin" &&
        quiz.createdBy &&
        quiz.createdBy.toString() !== userId) {
        throw new AppError("You do not own this quiz", 403);
    }
    await questionModel.deleteMany({ quiz: quizId });
    await quizAttemptModel.deleteMany({ quiz: quizId });
    await moduleModel.findByIdAndUpdate(quiz.module, {
        $pull: { quizzes: quiz._id },
    });
    await quizModel.findByIdAndDelete(quizId);
};
export const getQuizResults = async (quizId, userId, role) => {
    const quiz = await quizModel.findById(quizId);
    if (!quiz) {
        throw new AppError("Quiz not found", 404);
    }
    if (role !== "admin" &&
        quiz.createdBy &&
        quiz.createdBy.toString() !== userId) {
        throw new AppError("You do not own this quiz", 403);
    }
    const attempts = await quizAttemptModel
        .find({ quiz: quizId })
        .populate("user", "name email")
        .sort({ createdAt: -1 });
    return attempts.map((attempt) => ({
        attemptId: attempt._id.toString(),
        student: attempt.user
            ? {
                _id: attempt.user._id.toString(),
                name: attempt.user.name,
                email: attempt.user.email,
            }
            : null,
        score: attempt.score,
        totalPoints: quiz.totalPoints,
        percentage: quiz.totalPoints
            ? Math.round((attempt.score / quiz.totalPoints) * 100)
            : 0,
        completed: attempt.completed,
        submittedAt: attempt.createdAt,
    }));
};
export const addQuestion = async (data) => {
    validateRequestBodyWithValues(data, [
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
        $inc: { totalPoints: newQuestion.points ?? 0 },
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
export const submitQuiz = async (data) => {
    validateRequestBodyWithValues(data, [
        "quizId",
        "userId",
        "answers",
    ]);
    const quiz = await quizModel.findById(data.quizId);
    if (!quiz || quiz.status !== "active")
        throw new AppError("Quiz not available", 404);
    const module = await moduleModel.findById(quiz.module);
    if (!module || !(await enrollmentModel.exists({ student: data.userId, course: module.course })))
        throw new AppError("You are not enrolled in this course", 403);
    if (!quiz.allowRetakes && await quizAttemptModel.exists({ quiz: data.quizId, user: data.userId, completed: true }))
        throw new AppError("Retakes are not allowed", 400);
    const questions = await questionModel.find({
        quiz: data.quizId,
    });
    if (!Array.isArray(data.answers) || new Set(data.answers.map((answer) => answer.questionId)).size !== data.answers.length) {
        throw new AppError("Invalid or duplicate answers", 400);
    }
    let score = 0;
    const gradedAnswers = data.answers.map((answer) => {
        const question = questions.find((q) => q._id.toString() === answer.questionId);
        if (!question) {
            throw new AppError("Question not found", 400);
        }
        if (!Array.isArray(answer.selectedOptions) || new Set(answer.selectedOptions).size !== answer.selectedOptions.length || answer.selectedOptions.some((id) => !question.options.some((option) => option._id.toString() === id))) {
            throw new AppError("Invalid selected options", 400);
        }
        const correctOptions = question.options
            .filter((opt) => opt.isCorrect)
            .map((opt) => opt._id.toString());
        const isCorrect = JSON.stringify(correctOptions.sort()) ===
            JSON.stringify(answer.selectedOptions.sort());
        if (isCorrect) {
            score += question.points ?? 0;
        }
        return {
            question: answer.questionId,
            selectedOptions: answer.selectedOptions,
            isCorrect,
        };
    });
    await quizAttemptModel.create({
        quiz: data.quizId,
        user: data.userId,
        answers: gradedAnswers,
        score,
        completed: true,
    });
    return {
        score,
        totalPoints: quiz.totalPoints,
        correctCount: gradedAnswers.filter((answer) => answer.isCorrect).length,
        totalQuestions: questions.length,
        completed: true,
        answers: gradedAnswers,
    };
};
