import { getResumeLesson, markLessonAsCompleted, updateLastLesson, uploadLesson, viewLessonContent, viewCourseContentForOwner, } from "../services/lesson.service.js";
import { AppError } from "../errors/AppError.js";
import { uploadVideo } from "../services/lesson.service.js";
export const upload = async (req, res, next) => {
    try {
        const { title, module, course, order, duration } = req.body;
        if (!course || !title || !module || !order) {
            throw new AppError("Title,module, course and order is required", 400);
        }
        const parseBoolean = (value) => {
            if (typeof value === "boolean")
                return value;
            if (typeof value === "string")
                return value === "true";
            return undefined;
        };
        const dataToSend = {
            title,
            module,
            course,
            order: Number(order),
            duration: duration !== undefined ? Number(duration) : undefined,
            isPublished: parseBoolean(req.body.isPublished),
            isFreePreview: parseBoolean(req.body.isFreePreview),
            isLocked: parseBoolean(req.body.isLocked),
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
        if (!lessonId) {
            throw new AppError("lessonId is required", 400);
        }
        // multer collapses repeated same-named text fields down to the last
        // value, so multiple "titles" fields never arrive as an array here -
        // the frontend sends them as a single JSON-encoded array string instead.
        let titles = [];
        if (Array.isArray(req.body.titles)) {
            titles = req.body.titles;
        }
        else if (typeof req.body.titles === "string") {
            try {
                const parsed = JSON.parse(req.body.titles);
                titles = Array.isArray(parsed) ? parsed : [req.body.titles];
            }
            catch {
                titles = [req.body.titles];
            }
        }
        const videos = req.files.map((file, index) => ({
            title: titles[index] || file.originalname,
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
            studentId: req.user?.role === "admin" && studentId ? studentId : req.user?.id,
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
            studentId: req.user?.role === "admin" && studentId ? studentId : req.user?.id,
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
        const { courseId, studentId } = { ...req.query, ...req.body };
        const dataToSend = {
            courseId,
            studentId: req.user?.role === "admin" && studentId ? studentId : req.user?.id,
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
        const { courseId, studentId } = { ...req.query, ...req.body };
        const dataToSend = {
            courseId,
            studentId: req.user?.role === "admin" && studentId ? studentId : req.user?.id,
        };
        const data = await viewLessonContent(dataToSend);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
export const viewOwn = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId)
            throw new AppError("Unauthorized", 401);
        const courseId = req.params.courseId;
        const data = await viewCourseContentForOwner(courseId, userId, req.user?.role);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
