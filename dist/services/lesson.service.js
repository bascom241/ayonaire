import { AppError } from "../errors/AppError.js";
import enrollmentModel from "../models/enrollment.model.js";
import lessonModel from "../models/lesson.model.js";
import moduleModel from "../models/module.model.js";
import courseModel from "../models/course.model.js";
import mongoose, { Types } from "mongoose";
import { uploadMedia } from "../utils/uploadToCloudinary.js";
import { issueCertificateIfEligible } from "./certificate.service.js";
export const uploadLesson = async (data) => {
    const lessonData = {
        title: data.title,
        module: data.module,
        course: data.course,
        order: data.order,
        duration: data.duration,
        isPublished: data.isPublished ?? true,
        isFreePreview: data.isFreePreview ?? false,
        isLocked: data.isLocked ?? true,
    };
    const isModule = await moduleModel.findById(lessonData.module);
    if (!isModule) {
        throw new AppError("module Id is required", 400);
    }
    const isCourse = await courseModel.findById(lessonData.course);
    if (!isCourse) {
        throw new AppError("course Id is required", 400);
    }
    const lesson = await lessonModel.create(lessonData);
    await moduleModel.findByIdAndUpdate(lessonData.module, {
        $push: { lessons: lesson._id },
    });
    return {
        _id: lesson.id.toString(),
        title: lesson.title,
        module: lesson.module.toString(),
        course: lesson.course.toString(),
        order: lesson.order,
        duration: lesson.duration ?? undefined,
        isPublished: lesson.isPublished,
        isFreePreview: lesson.isFreePreview,
        isLocked: lesson.isLocked,
    };
};
const MAX_VIDEO_SIZE = Number(process.env.MAX_VIDEO_UPLOAD_SIZE_MB || 1500) * 1024 * 1024;
const isValidHttpUrl = (url) => {
    try {
        const parsedUrl = new URL(url);
        return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
    }
    catch {
        return false;
    }
};
const inferVideoProvider = (url) => {
    const host = new URL(url).hostname.replace(/^www\./, "").toLowerCase();
    if (host.includes("youtube.com") || host.includes("youtu.be")) {
        return "youtube";
    }
    if (host.includes("vimeo.com"))
        return "vimeo";
    if (host.includes("mux.com") || host.includes("mux.dev"))
        return "mux";
    if (host.includes("bunnycdn.com") || host.includes("bunny.net")) {
        return "bunny";
    }
    if (host.includes("cloudflarestream.com"))
        return "cloudflare";
    if (host.includes("cloudinary.com"))
        return "cloudinary";
    return "external";
};
export const uploadVideo = async (lessonId, data) => {
    const lesson = await lessonModel.findById(lessonId);
    if (!lesson) {
        throw new AppError("lesson not found", 400);
    }
    const uploadedVideos = [];
    for (const video of data.videos) {
        if (video.buffer.length > MAX_VIDEO_SIZE) {
            throw new AppError(`Cant upload. ${video.title} exceeds ${Math.round(MAX_VIDEO_SIZE / 1024 / 1024)}MB`, 413);
        }
        const result = await uploadMedia(video.buffer, "video");
        uploadedVideos.push({
            title: video.title,
            url: result.secure_url,
            publicId: result.public_id,
            duration: result.duration || 0,
            sourceType: "upload",
            provider: "cloudinary",
        });
    }
    lesson.videos.push(...uploadedVideos);
    const result = await lesson.save();
    return {
        title: result.videos.map((t) => t.title),
        url: result.videos.map((u) => u.url),
        publicId: result.videos.map((p) => p.publicId ?? undefined),
        duration: result.videos.map((d) => d.duration),
    };
};
export const addLessonVideoUrl = async (data) => {
    if (!isValidHttpUrl(data.url)) {
        throw new AppError("A valid http(s) video URL is required", 400);
    }
    const lesson = await lessonModel.findById(data.lessonId);
    if (!lesson) {
        throw new AppError("lesson not found", 400);
    }
    const video = {
        title: data.title || "Lesson video",
        url: data.url,
        duration: data.duration ?? 0,
        sourceType: "url",
        provider: data.provider ?? inferVideoProvider(data.url),
    };
    lesson.videos.push(video);
    await lesson.save();
    return video;
};
export const markLessonAsCompleted = async (data) => {
    const enrollment = await enrollmentModel.findOne({
        student: data.studentId,
        course: data.courseId,
    });
    if (!enrollment) {
        throw new AppError("enrollment not fount", 404);
    }
    if (!enrollment.comletedLessons.some((id) => id.toString() === data.lessonId.toString())) {
        enrollment.comletedLessons.push(new mongoose.Types.ObjectId(data.lessonId));
    }
    const totalLessons = await lessonModel.countDocuments({
        course: data.courseId,
        isPublished: true,
    });
    enrollment.progress =
        totalLessons > 0
            ? (enrollment.comletedLessons.length / totalLessons) * 100
            : 0;
    if (enrollment.progress >= 100) {
        enrollment.completed = true;
    }
    await enrollment.save();
    if (enrollment.completed) {
        await issueCertificateIfEligible(data.studentId, data.courseId);
    }
    return {
        course: enrollment.course.toString(),
        student: enrollment.student?.toString() || data.studentId.toString(),
        status: enrollment.status,
        completedLessons: enrollment.comletedLessons.map((id) => id.toString()),
        progress: enrollment.progress,
        completed: enrollment.completed,
    };
};
export const updateLastLesson = async (data) => {
    const enrollment = await enrollmentModel.findOne({
        student: data.studentId,
        course: data.courseId,
    });
    if (!enrollment) {
        throw new AppError("enrollment not fount", 404);
    }
    const updatedEnrollmentLastLesson = await enrollmentModel.findOneAndUpdate({ student: data.studentId, course: data.courseId }, { lastLesson: data.lessonId }, { new: true });
    if (!updatedEnrollmentLastLesson) {
        throw new AppError("could not update last lesson", 400);
    }
    return {
        course: updatedEnrollmentLastLesson.course.toString(),
        student: updatedEnrollmentLastLesson.student?.toString() ||
            data.studentId.toString(),
        status: updatedEnrollmentLastLesson.status,
        completedLessons: updatedEnrollmentLastLesson.comletedLessons.map((id) => id.toString()),
        progress: updatedEnrollmentLastLesson.progress,
        completed: updatedEnrollmentLastLesson.completed,
        lastLesson: updatedEnrollmentLastLesson.lastLesson
            ? updatedEnrollmentLastLesson.lastLesson.toString()
            : null,
    };
};
export const getResumeLesson = async (data) => {
    const enrollment = await enrollmentModel.findOne({
        student: data.studentId,
        course: data.courseId,
    });
    if (!enrollment) {
        throw new AppError("enrollment not found", 400);
    }
    if (enrollment.lastLesson) {
        return { lessonId: enrollment.lastLesson.toString() };
    }
    // fallback → return first lesson
    const firstLesson = await lessonModel
        .findOne({
        course: data.courseId,
        isPublished: true,
    })
        .sort({ order: 1 });
    return { lessonId: firstLesson ? firstLesson._id.toString() : null };
};
export const viewLessonContent = async (data) => {
    const myEnrollment = await enrollmentModel.findOne({
        student: data.studentId,
        course: data.courseId,
    });
    if (!myEnrollment) {
        throw new AppError("You are not enrolled in this course", 403);
    }
    const pipeline = [
        {
            $match: {
                course: new Types.ObjectId(data.courseId),
            },
        },
        {
            $sort: { order: 1 },
        },
        {
            $lookup: {
                from: "lessons",
                localField: "_id",
                foreignField: "module",
                as: "lessons",
            },
        },
        {
            $addFields: {
                lessons: {
                    $sortArray: {
                        input: "$lessons",
                        sortBy: { order: 1 },
                    },
                },
            },
        },
        {
            $addFields: {
                lessons: {
                    $map: {
                        input: "$lessons",
                        as: "lesson",
                        in: {
                            $mergeObjects: [
                                "$$lesson",
                                {
                                    isLocked: false,
                                    isCompleted: {
                                        $in: ["$$lesson._id", myEnrollment?.comletedLessons ?? [],],
                                    },
                                },
                            ],
                        },
                    },
                },
            },
        },
    ];
    const modules = await moduleModel.aggregate(pipeline);
    return {
        modules,
        progress: myEnrollment ? myEnrollment.progress : 0,
        lastLesson: myEnrollment?.lastLesson
            ? myEnrollment.lastLesson.toString()
            : null,
    };
};
// For the course's own instructor (or an admin) to preview its curriculum -
// there is no enrollment record for them to key off, so this skips the
// isCompleted/progress overlay entirely rather than reusing viewLessonContent.
export const viewCourseContentForOwner = async (courseId, userId, role) => {
    const course = await courseModel.findById(courseId);
    if (!course) {
        throw new AppError("course not found", 404);
    }
    if (role !== "admin" &&
        course.instructor &&
        course.instructor.toString() !== userId) {
        throw new AppError("You do not own this course", 403);
    }
    const pipeline = [
        { $match: { course: new Types.ObjectId(courseId) } },
        { $sort: { order: 1 } },
        {
            $lookup: {
                from: "lessons",
                localField: "_id",
                foreignField: "module",
                as: "lessons",
            },
        },
        {
            $addFields: {
                lessons: {
                    $sortArray: { input: "$lessons", sortBy: { order: 1 } },
                },
            },
        },
    ];
    const modules = await moduleModel.aggregate(pipeline);
    return { modules };
};
