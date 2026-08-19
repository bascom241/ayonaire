import { AppError } from "../errors/AppError.js";
import courseModel from "../models/course.model.js";
import lessonModel from "../models/lesson.model.js";
import { CourseQuestion, CourseReview, LearningReminder, LessonTranscription, } from "../models/courseInteraction.model.js";
import { callAI } from "../utils/aiClient.js";
const ensureCourse = async (courseId) => {
    const course = await courseModel.findById(courseId);
    if (!course)
        throw new AppError("course not found", 404);
    return course;
};
const ensureLesson = async (lessonId) => {
    if (!lessonId)
        return null;
    const lesson = await lessonModel.findById(lessonId);
    if (!lesson)
        throw new AppError("lesson not found", 404);
    return lesson;
};
const userPayload = (user) => ({
    id: user?._id?.toString?.() ?? "",
    name: user?.name ?? "Deleted user",
    profile: user?.profile
        ? { url: user.profile.url, publicId: user.profile.publicId }
        : null,
});
const questionPayload = (question) => ({
    id: question._id.toString(),
    title: question.title,
    details: question.details,
    course: question.course.toString(),
    lesson: question.lesson?.toString?.() ?? null,
    author: userPayload(question.user),
    upvotes: (question.upvotes ?? []).map((id) => id.toString()),
    upvoteCount: question.upvotes?.length ?? 0,
    commentCount: question.answers?.length ?? 0,
    answers: (question.answers ?? []).map((answer) => ({
        id: answer._id.toString(),
        text: answer.text,
        author: userPayload(answer.user),
        createdAt: answer.createdAt,
    })),
    createdAt: question.createdAt,
    updatedAt: question.updatedAt,
});
export const listCourseQuestions = async (courseId, lessonId) => {
    await ensureCourse(courseId);
    await ensureLesson(lessonId);
    const filter = { course: courseId };
    if (lessonId)
        filter.lesson = lessonId;
    const questions = await CourseQuestion.find(filter)
        .populate("user", "name profile")
        .populate("answers.user", "name profile")
        .sort({ createdAt: -1 });
    return { questions: questions.map(questionPayload) };
};
export const createCourseQuestion = async (userId, data) => {
    await ensureCourse(data.courseId);
    await ensureLesson(data.lessonId);
    if (!data.title?.trim() || !data.details?.trim()) {
        throw new AppError("title and details are required", 400);
    }
    const question = await CourseQuestion.create({
        course: data.courseId,
        lesson: data.lessonId,
        user: userId,
        title: data.title.trim(),
        details: data.details.trim(),
    });
    const populated = await CourseQuestion.findById(question._id)
        .populate("user", "name profile")
        .populate("answers.user", "name profile");
    return questionPayload(populated);
};
export const answerCourseQuestion = async (userId, questionId, text) => {
    if (!text?.trim())
        throw new AppError("answer text is required", 400);
    const question = await CourseQuestion.findByIdAndUpdate(questionId, { $push: { answers: { user: userId, text: text.trim() } } }, { new: true })
        .populate("user", "name profile")
        .populate("answers.user", "name profile");
    if (!question)
        throw new AppError("question not found", 404);
    return questionPayload(question);
};
export const toggleQuestionUpvote = async (userId, questionId) => {
    const question = await CourseQuestion.findById(questionId);
    if (!question)
        throw new AppError("question not found", 404);
    const hasUpvoted = question.upvotes.some((id) => id.toString() === userId);
    await CourseQuestion.findByIdAndUpdate(questionId, {
        [hasUpvoted ? "$pull" : "$addToSet"]: { upvotes: userId },
    });
    return { upvoted: !hasUpvoted };
};
export const listCourseReviews = async (courseId) => {
    await ensureCourse(courseId);
    const reviews = await CourseReview.find({ course: courseId })
        .populate("user", "name profile")
        .sort({ createdAt: -1 });
    const ratingStats = [5, 4, 3, 2, 1].map((stars) => {
        const count = reviews.filter((review) => review.rating === stars).length;
        return {
            stars,
            count,
            percentage: reviews.length ? Math.round((count / reviews.length) * 100) : 0,
        };
    });
    const averageRating = reviews.length
        ? reviews.reduce((sum, review) => sum + review.rating, 0) /
            reviews.length
        : 0;
    return {
        averageRating: Number(averageRating.toFixed(1)),
        totalReviews: reviews.length,
        ratingStats,
        reviews: reviews.map((review) => ({
            id: review._id.toString(),
            rating: review.rating,
            content: review.content,
            author: userPayload(review.user),
            createdAt: review.createdAt,
        })),
    };
};
export const upsertCourseReview = async (userId, data) => {
    await ensureCourse(data.courseId);
    if (!data.rating || data.rating < 1 || data.rating > 5) {
        throw new AppError("rating must be between 1 and 5", 400);
    }
    if (!data.content?.trim())
        throw new AppError("review content is required", 400);
    return CourseReview.findOneAndUpdate({ course: data.courseId, user: userId }, {
        course: data.courseId,
        user: userId,
        rating: data.rating,
        content: data.content.trim(),
    }, { upsert: true, new: true, runValidators: true });
};
export const getLessonTranscription = async (courseId, lessonId) => {
    await ensureCourse(courseId);
    await ensureLesson(lessonId);
    const transcription = await LessonTranscription.findOne({
        course: courseId,
        lesson: lessonId,
    });
    return { sections: transcription?.sections ?? [] };
};
export const upsertLessonTranscription = async (courseId, lessonId, sections) => {
    await ensureCourse(courseId);
    await ensureLesson(lessonId);
    return LessonTranscription.findOneAndUpdate({ course: courseId, lesson: lessonId }, { course: courseId, lesson: lessonId, sections }, { upsert: true, new: true, runValidators: true });
};
export const listLearningReminders = async (courseId, userId) => {
    await ensureCourse(courseId);
    const reminders = await LearningReminder.find({ course: courseId, user: userId })
        .sort({ createdAt: -1 });
    return { reminders };
};
export const createLearningReminder = async (courseId, userId, data) => {
    await ensureCourse(courseId);
    if (!data.time?.trim())
        throw new AppError("time is required", 400);
    return LearningReminder.create({
        course: courseId,
        user: userId,
        name: data.name,
        frequency: data.frequency,
        time: data.time,
        calendarProvider: data.calendarProvider ?? "none",
    });
};
export const askCourseAssistant = async (data) => {
    const course = await ensureCourse(data.courseId);
    const lesson = await ensureLesson(data.lessonId);
    if (!data.question?.trim())
        throw new AppError("question is required", 400);
    const answer = await callAI("course assistant response", `Course: ${course.title}\nLesson: ${lesson?.title ?? "Current course"}\nStudent question: ${data.question}`);
    return {
        answer,
        suggestions: [
            "Summarize this lesson",
            "Explain the hardest concept",
            "Give me a practice task",
        ],
    };
};
