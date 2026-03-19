import { getResumeLesson, markLessonAsCompleted, updateLastLesson, uploadLesson, viewLessonContent, } from "../services/lesson.service.js";
import { AppError } from "../errors/AppError.js";
import { uploadVideo } from "../services/lesson.service.js";
export const upload = async (req, res, next) => {
    try {
        const { title, module, course, order } = req.body;
        if (!course || !title || !module || !order) {
            throw new AppError("Title,module, course and order is required", 400);
        }
        const dataToSend = {
            title,
            module,
            course,
            order,
        };
        const data = await uploadLesson(dataToSend);
        res.status(200).json({ success: true, data, message: "Lesson created" });
    }
    catch (error) {
        next(error);
    }
};
export const uploadVid = async (req, res, next) => {
    try {
        if (!req.files || !Array.isArray(req.files)) {
            return res.status(400).json({ message: "No videos uploaded" });
        }
        const { lessonId } = req.body;
        const titles = req.body.titles; // array of strings
        const videos = req.files.map((file, index) => ({
            title: titles?.[index] || file.originalname,
            buffer: file.buffer,
            mimetype: file.mimetype,
            originalname: file.originalname,
        }));
        const data = await uploadVideo(lessonId, { videos });
        res.status(200).json({
            success: true,
            data,
            message: "Lesson Video created succefully",
        });
    }
    catch (error) {
        next(error);
    }
};
export const markLesson = async (req, res, next) => {
    try {
        const { studentId, courseId, lessonId } = req.body;
        const dataToSend = {
            studentId,
            courseId,
            lessonId,
        };
        const data = await markLessonAsCompleted(dataToSend);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
export const update = async (req, res, next) => {
    try {
        const { courseId, lessonId, studentId } = req.body;
        const dataToSend = {
            courseId,
            lessonId,
            studentId,
        };
        const data = await updateLastLesson(dataToSend);
        res
            .status(200)
            .json({ success: true, data, message: "Last lesson updated" });
    }
    catch (error) {
        next(error);
    }
};
export const resume = async (req, res, next) => {
    try {
        const { courseId, studentId } = req.body;
        const dataToSend = {
            courseId,
            studentId,
        };
        const data = await getResumeLesson(dataToSend);
        res
            .status(200)
            .json({ success: true, message: "Last lesson resumed", data });
    }
    catch (error) {
        next(error);
    }
};
export const view = async (req, res, next) => {
    try {
        const { courseId, studentId } = req.body;
        const dataToSend = {
            courseId,
            studentId,
        };
        const data = await viewLessonContent(dataToSend);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
