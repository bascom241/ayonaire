import { AppError } from "../errors/AppError.js";
import courseModel from "../models/course.model.js";
import lessonModel from "../models/lesson.model.js";
import {
  CourseQuestion,
  CourseReview,
  LearningReminder,
  LessonTranscription,
} from "../models/courseInteraction.model.js";
import { callAI } from "../utils/aiClient.js";
import { io } from "../server.js";

const ensureCourse = async (courseId: string) => {
  const course = await courseModel.findById(courseId);
  if (!course) throw new AppError("course not found", 404);
  return course;
};

const ensureLesson = async (lessonId?: string) => {
  if (!lessonId) return null;
  const lesson = await lessonModel.findById(lessonId);
  if (!lesson) throw new AppError("lesson not found", 404);
  return lesson;
};

const userPayload = (user: any) => ({
  id: user?._id?.toString?.() ?? "",
  name: user?.name ?? "Deleted user",
  profile: user?.profile
    ? { url: user.profile.url, publicId: user.profile.publicId }
    : null,
});

const questionPayload = (question: any) => ({
  id: question._id.toString(),
  title: question.title,
  details: question.details,
  course: question.course.toString(),
  lesson: question.lesson?.toString?.() ?? null,
  author: userPayload(question.user),
  upvotes: (question.upvotes ?? []).map((id: any) => id.toString()),
  upvoteCount: question.upvotes?.length ?? 0,
  commentCount: question.answers?.length ?? 0,
  answers: (question.answers ?? []).map((answer: any) => ({
    id: answer._id.toString(),
    text: answer.text,
    author: userPayload(answer.user),
    createdAt: answer.createdAt,
  })),
  createdAt: question.createdAt,
  updatedAt: question.updatedAt,
});

const populatedQuestion = (questionId: any) =>
  CourseQuestion.findById(questionId)
    .populate("user", "name profile")
    .populate("answers.user", "name profile");

const emitQuestionChange = (
  event: "course-question:new" | "course-question:update",
  question: any,
) => {
  const payload = questionPayload(question);
  io.to(`course:${payload.course}:qna`).emit(event, payload);
  if (payload.lesson) {
    io.to(`course:${payload.course}:lesson:${payload.lesson}:qna`).emit(
      event,
      payload,
    );
  }
  return payload;
};

export const listCourseQuestions = async (
  courseId: string,
  lessonId?: string,
) => {
  await ensureCourse(courseId);
  await ensureLesson(lessonId);

  const filter: Record<string, any> = { course: courseId };
  if (lessonId) filter.lesson = lessonId;

  const questions = await CourseQuestion.find(filter)
    .populate("user", "name profile")
    .populate("answers.user", "name profile")
    .sort({ createdAt: -1 });

  return { questions: questions.map(questionPayload) };
};

export const createCourseQuestion = async (
  userId: string,
  data: { courseId: string; lessonId?: string; title: string; details: string },
) => {
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

  const populated = await populatedQuestion(question._id);
  return emitQuestionChange("course-question:new", populated);
};

export const answerCourseQuestion = async (
  userId: string,
  questionId: string,
  text: string,
) => {
  if (!text?.trim()) throw new AppError("answer text is required", 400);

  const question = await CourseQuestion.findByIdAndUpdate(
    questionId,
    { $push: { answers: { user: userId, text: text.trim() } } },
    { new: true },
  )
    .populate("user", "name profile")
    .populate("answers.user", "name profile");

  if (!question) throw new AppError("question not found", 404);
  return emitQuestionChange("course-question:update", question);
};

export const toggleQuestionUpvote = async (
  userId: string,
  questionId: string,
) => {
  const question = await CourseQuestion.findById(questionId);
  if (!question) throw new AppError("question not found", 404);

  const hasUpvoted = question.upvotes.some(
    (id: any) => id.toString() === userId,
  );

  await CourseQuestion.findByIdAndUpdate(questionId, {
    [hasUpvoted ? "$pull" : "$addToSet"]: { upvotes: userId },
  });

  const updatedQuestion = await populatedQuestion(questionId);
  if (updatedQuestion) {
    emitQuestionChange("course-question:update", updatedQuestion);
  }

  return { upvoted: !hasUpvoted };
};

export const listCourseReviews = async (courseId: string) => {
  await ensureCourse(courseId);

  const reviews = await CourseReview.find({ course: courseId })
    .populate("user", "name profile")
    .sort({ createdAt: -1 });

  const ratingStats = [5, 4, 3, 2, 1].map((stars) => {
    const count = reviews.filter((review: any) => review.rating === stars).length;
    return {
      stars,
      count,
      percentage: reviews.length ? Math.round((count / reviews.length) * 100) : 0,
    };
  });

  const averageRating = reviews.length
    ? reviews.reduce((sum: number, review: any) => sum + review.rating, 0) /
      reviews.length
    : 0;

  return {
    averageRating: Number(averageRating.toFixed(1)),
    totalReviews: reviews.length,
    ratingStats,
    reviews: reviews.map((review: any) => ({
      id: review._id.toString(),
      rating: review.rating,
      content: review.content,
      author: userPayload(review.user),
      createdAt: review.createdAt,
    })),
  };
};

export const upsertCourseReview = async (
  userId: string,
  data: { courseId: string; rating: number; content: string },
) => {
  await ensureCourse(data.courseId);
  if (!data.rating || data.rating < 1 || data.rating > 5) {
    throw new AppError("rating must be between 1 and 5", 400);
  }
  if (!data.content?.trim()) throw new AppError("review content is required", 400);

  return CourseReview.findOneAndUpdate(
    { course: data.courseId, user: userId },
    {
      course: data.courseId,
      user: userId,
      rating: data.rating,
      content: data.content.trim(),
    },
    { upsert: true, new: true, runValidators: true },
  );
};

export const getLessonTranscription = async (
  courseId: string,
  lessonId: string,
) => {
  await ensureCourse(courseId);
  await ensureLesson(lessonId);

  const transcription = await LessonTranscription.findOne({
    course: courseId,
    lesson: lessonId,
  });

  return { sections: transcription?.sections ?? [] };
};

export const upsertLessonTranscription = async (
  courseId: string,
  lessonId: string,
  sections: any[],
) => {
  await ensureCourse(courseId);
  await ensureLesson(lessonId);

  return LessonTranscription.findOneAndUpdate(
    { course: courseId, lesson: lessonId },
    { course: courseId, lesson: lessonId, sections },
    { upsert: true, new: true, runValidators: true },
  );
};

export const listLearningReminders = async (courseId: string, userId: string) => {
  await ensureCourse(courseId);
  const reminders = await LearningReminder.find({ course: courseId, user: userId })
    .sort({ createdAt: -1 });
  return { reminders };
};

export const createLearningReminder = async (
  courseId: string,
  userId: string,
  data: { name?: string; frequency?: string; time: string; calendarProvider?: string },
) => {
  await ensureCourse(courseId);
  if (!data.time?.trim()) throw new AppError("time is required", 400);

  return LearningReminder.create({
    course: courseId,
    user: userId,
    name: data.name,
    frequency: data.frequency,
    time: data.time,
    calendarProvider: data.calendarProvider ?? "none",
  });
};

export const deleteLearningReminder = async (
  courseId: string,
  reminderId: string,
  userId: string,
) => {
  await ensureCourse(courseId);

  const reminder = await LearningReminder.findOneAndDelete({
    _id: reminderId,
    course: courseId,
    user: userId,
  });

  if (!reminder) {
    throw new AppError("learning reminder not found", 404);
  }

  return { deleted: true };
};

export const askCourseAssistant = async (
  data: { courseId: string; lessonId?: string; question: string },
) => {
  const course = await ensureCourse(data.courseId);
  const lesson = await ensureLesson(data.lessonId);
  if (!data.question?.trim()) throw new AppError("question is required", 400);

  const answer = await callAI(
    "course assistant response",
    `Course: ${course.title}\nLesson: ${lesson?.title ?? "Current course"}\nStudent question: ${data.question}`,
  );

  return {
    answer,
    suggestions: [
      "Summarize this lesson",
      "Explain the hardest concept",
      "Give me a practice task",
    ],
  };
};
