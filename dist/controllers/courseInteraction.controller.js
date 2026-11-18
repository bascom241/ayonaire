import { AppError } from "../errors/AppError.js";
import { CourseNote, LearningReminder } from "../models/courseInteraction.model.js";
import lessonModel from "../models/lesson.model.js";
import { nextReminderTime, reminderLocalParts } from "../utils/reminderSchedule.js";
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
export const notes = async (req, res, next) => {
    try {
        const items = await CourseNote.find({ course: req.params.courseId, user: requireUserId(req) }).populate("lesson", "title").sort({ createdAt: -1 });
        res.json({ success: true, data: items.map((item) => ({ id: item._id, lessonId: item.lesson?._id, lessonTitle: item.lesson?.title ?? "Deleted lesson", content: item.content, createdAt: item.createdAt })) });
    }
    catch (error) {
        next(error);
    }
};
export const createNote = async (req, res, next) => {
    try {
        if (typeof req.body.content !== "string" || !req.body.content.trim() || !req.body.lessonId)
            throw new AppError("Lesson and content are required", 400);
        const item = await CourseNote.create({ course: param(req.params.courseId, "courseId"), lesson: req.body.lessonId, user: requireUserId(req), content: req.body.content });
        res.status(201).json({ success: true, data: item });
    }
    catch (error) {
        next(error);
    }
};
export const importNotes = async (req, res, next) => {
    try {
        const courseId = param(req.params.courseId, "courseId");
        const userId = requireUserId(req);
        if (!Array.isArray(req.body.notes) || req.body.notes.length > 500)
            throw new AppError("A maximum of 500 notes can be imported at once", 400);
        const imported = [];
        const failed = [];
        for (const note of req.body.notes) {
            if (typeof note?.id !== "string" || !note.id || note.id.length > 128 || typeof note.lessonId !== "string" || typeof note.content !== "string" || !note.content.trim() || note.content.length > 20000 || !Number.isFinite(Date.parse(note.createdAt))) {
                if (typeof note?.id === "string")
                    failed.push(note.id);
                continue;
            }
            try {
                if (!(await lessonModel.exists({ _id: note.lessonId, course: courseId }))) {
                    failed.push(note.id);
                    continue;
                }
                try {
                    await CourseNote.updateOne({ course: courseId, user: userId, legacyId: note.id }, { $setOnInsert: { course: courseId, user: userId, legacyId: note.id, lesson: note.lessonId, content: note.content.trim(), createdAt: new Date(note.createdAt) } }, { upsert: true, timestamps: false, runValidators: true });
                }
                catch (error) {
                    if (error?.code !== 11000)
                        throw error;
                }
                const saved = await CourseNote.findOne({ course: courseId, user: userId, legacyId: note.id });
                if (saved && saved.lesson.toString() === note.lessonId && saved.content === note.content.trim() && saved.createdAt?.getTime() === new Date(note.createdAt).getTime())
                    imported.push(note.id);
                else
                    failed.push(note.id);
            }
            catch (error) {
                failed.push(note.id);
            }
        }
        res.json({ success: true, data: { imported, failed } });
    }
    catch (error) {
        next(error);
    }
};
export const deleteNote = async (req, res, next) => {
    try {
        const item = await CourseNote.findOneAndDelete({ _id: param(req.params.noteId, "noteId"), course: param(req.params.courseId, "courseId"), user: requireUserId(req) });
        if (!item)
            throw new AppError("Note not found", 404);
        res.json({ success: true });
    }
    catch (error) {
        next(error);
    }
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
export const activateReminder = async (req, res, next) => {
    try {
        const reminder = await LearningReminder.findOne({ _id: param(req.params.reminderId, "reminderId"), course: param(req.params.courseId, "courseId"), user: requireUserId(req) });
        if (!reminder)
            throw new AppError("Reminder not found", 404);
        if (reminder.timezone)
            throw new AppError("Reminder is already activated", 409);
        const timezone = req.body.timezone;
        if (typeof timezone !== "string" || !/^([01]\d|2[0-3]):[0-5]\d$/.test(reminder.time))
            throw new AppError("A valid time zone and reminder time are required", 400);
        let weekday;
        let nextDeliveryAt;
        try {
            weekday = reminderLocalParts(new Date(), timezone).weekday;
            nextDeliveryAt = nextReminderTime(new Date(), timezone, reminder.time, reminder.frequency, weekday);
        }
        catch {
            throw new AppError("Invalid time zone or schedule", 400);
        }
        const updated = await LearningReminder.findOneAndUpdate({ _id: reminder._id, user: requireUserId(req), $or: [{ timezone: { $exists: false } }, { timezone: null }] }, { $set: { timezone, weekday, nextDeliveryAt }, $unset: { lastError: "" } }, { new: true });
        if (!updated)
            throw new AppError("Reminder is already activated", 409);
        res.json({ success: true, data: updated });
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
