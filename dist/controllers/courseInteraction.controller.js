import { AppError } from "../errors/AppError.js";
import { answerCourseQuestion, askCourseAssistant, createCourseQuestion, createLearningReminder, deleteLearningReminder, getLessonTranscription, listCourseQuestions, listCourseReviews, listLearningReminders, toggleQuestionUpvote, upsertCourseReview, upsertLessonTranscription, } from "../services/courseInteraction.service.js";
const requireUserId = (req) => {
    const userId = req.user?.id;
    if (!userId)
        throw new AppError("Unauthorized", 401);
    return userId;
};
const param = (value, name) => {
    if (typeof value !== "string" || !value) {
        throw new AppError(`${name} is required`, 400);
    }
    return value;
};
export const questions = async (req, res, next) => {
    try {
        const data = await listCourseQuestions(param(req.params.courseId, "courseId"), req.query.lessonId);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
export const createQuestion = async (req, res, next) => {
    try {
        const data = await createCourseQuestion(requireUserId(req), {
            courseId: param(req.params.courseId, "courseId"),
            lessonId: req.body.lessonId,
            title: req.body.title,
            details: req.body.details,
        });
        res.status(201).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
export const answerQuestion = async (req, res, next) => {
    try {
        const data = await answerCourseQuestion(requireUserId(req), param(req.params.questionId, "questionId"), req.body.text);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
export const upvoteQuestion = async (req, res, next) => {
    try {
        const data = await toggleQuestionUpvote(requireUserId(req), param(req.params.questionId, "questionId"));
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
export const reviews = async (req, res, next) => {
    try {
        const data = await listCourseReviews(param(req.params.courseId, "courseId"));
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
export const createReview = async (req, res, next) => {
    try {
        await upsertCourseReview(requireUserId(req), {
            courseId: param(req.params.courseId, "courseId"),
            rating: Number(req.body.rating),
            content: req.body.content,
        });
        const data = await listCourseReviews(param(req.params.courseId, "courseId"));
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
export const transcription = async (req, res, next) => {
    try {
        const data = await getLessonTranscription(param(req.params.courseId, "courseId"), param(req.params.lessonId, "lessonId"));
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
export const saveTranscription = async (req, res, next) => {
    try {
        const data = await upsertLessonTranscription(param(req.params.courseId, "courseId"), param(req.params.lessonId, "lessonId"), req.body.sections ?? []);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
export const reminders = async (req, res, next) => {
    try {
        const data = await listLearningReminders(param(req.params.courseId, "courseId"), requireUserId(req));
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
export const createReminder = async (req, res, next) => {
    try {
        const data = await createLearningReminder(param(req.params.courseId, "courseId"), requireUserId(req), req.body);
        res.status(201).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
export const deleteReminder = async (req, res, next) => {
    try {
        const data = await deleteLearningReminder(param(req.params.courseId, "courseId"), param(req.params.reminderId, "reminderId"), requireUserId(req));
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
export const assistant = async (req, res, next) => {
    try {
        const data = await askCourseAssistant({
            courseId: param(req.params.courseId, "courseId"),
            lessonId: req.body.lessonId,
            question: req.body.question,
        });
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
