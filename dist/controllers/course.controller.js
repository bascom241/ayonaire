import { createCourseCategory, listCourseCategories, createCourse, updateCourse, assignInstuctorToCourse, saveCourseAsDraft, getAllCoursesForAdminDashboard, getASingleCourseForAdminDashboard, getAllCourses, getCourseById, deleteCourse, toggleCoursePublishStatus, } from "../services/course.service.js";
import { AppError } from "../errors/AppError.js";
import { safeCacheDel } from "../config/redis.js";
const getCourseUploadFiles = (req) => {
    const files = req.files;
    return {
        thumbnail: files?.thumbnail?.[0],
        introVideo: files?.introVideo?.[0],
    };
};
export const createCourseCat = async (req, res, next) => {
    try {
        const { title } = req.body;
        const data = await createCourseCategory(title);
        res.status(201).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
export const getCourseCategories = async (req, res, next) => {
    try {
        const data = await listCourseCategories();
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
export const create = async (req, res, next) => {
    try {
        const { thumbnail, introVideo } = getCourseUploadFiles(req);
        if (!thumbnail) {
            return res.status(400).json({ message: "Thumbnail is required" });
        }
        const dataToSend = {
            title: req.body.title,
            description: req.body.description,
            category: req.body.category,
            price: req.body.price,
            status: req.body.status,
            instructor: req.body.instructorId,
            thumbnail,
            introVideo,
            courseLevel: req.body.courseLevel,
        };
        const data = await createCourse(dataToSend);
        await safeCacheDel("cache:/course");
        res.status(201).json({
            success: true,
            message: "Course created successfully",
            data,
        });
    }
    catch (error) {
        next(error);
    }
};
export const edit = async (req, res, next) => {
    try {
        const { courseId } = req.query;
        if (!courseId || typeof courseId !== "string") {
            throw new AppError("courseId is required", 400);
        }
        const { thumbnail, introVideo } = getCourseUploadFiles(req);
        const dataToSend = {
            title: req.body.title,
            description: req.body.description,
            category: req.body.category,
            price: req.body.price,
            status: req.body.status,
            instructor: req.body.instructorId,
            thumbnail,
            introVideo,
            courseLevel: req.body.courseLevel,
            completionCertificate: req.body.completionCertificate !== undefined
                ? req.body.completionCertificate === "true" ||
                    req.body.completionCertificate === true
                : undefined,
        };
        const data = await updateCourse(courseId, dataToSend);
        res.status(200).json({
            success: true,
            message: "Course edit successfully",
            data,
        });
    }
    catch (error) {
        next(error);
    }
};
// Admin assing the course o an instructor
export const assign = async (req, res, next) => {
    try {
        const { courseId, instructorId } = req.query;
        if (!courseId || typeof courseId !== "string") {
            throw new AppError("courseId is required", 400);
        }
        if (!instructorId || typeof instructorId !== "string") {
            throw new AppError("instructorId is required", 400);
        }
        const data = await assignInstuctorToCourse(instructorId, courseId);
        res.status(200).json({ success: true, message: data });
    }
    catch (error) {
        next(error);
    }
};
export const saveToDraft = async (req, res, next) => {
    try {
        const { thumbnail, introVideo } = getCourseUploadFiles(req);
        if (!thumbnail) {
            return res.status(400).json({ message: "Thumbnail is required" });
        }
        const dataToSend = {
            title: req.body.title,
            description: req.body.description,
            category: req.body.category,
            price: req.body.price,
            status: req.body.status,
            instructor: req.body.instructorId,
            thumbnail,
            introVideo,
            courseLevel: req.body.courseLevel,
        };
        const data = await saveCourseAsDraft(dataToSend);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
export const getAdminCourses = async (req, res, next) => {
    try {
        const query = req.query;
        const data = await getAllCoursesForAdminDashboard(query);
        res.status(200).json({ success: true, ...data });
    }
    catch (error) {
        next(error);
    }
};
export const getSingleAdminCourse = async (req, res, next) => {
    try {
        const courseId = req.params.courseId;
        if (!courseId || typeof courseId !== "string") {
            throw new AppError("courseId is required", 400);
        }
        const data = await getASingleCourseForAdminDashboard(courseId);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
export const getAll = async (req, res, next) => {
    try {
        const data = await getAllCourses(req.query);
        res.status(200).json({ success: true, ...data });
    }
    catch (error) {
        next(error);
    }
};
export const getSingle = async (req, res, next) => {
    try {
        const courseId = req.params.courseId;
        const data = await getCourseById(courseId);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
export const remove = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId)
            throw new AppError("Unauthorized", 401);
        const courseId = req.params.courseId;
        await deleteCourse(courseId, userId, req.user?.role);
        await safeCacheDel("cache:/course");
        res.status(200).json({ success: true, message: "Course deleted" });
    }
    catch (error) {
        next(error);
    }
};
export const togglePublish = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId)
            throw new AppError("Unauthorized", 401);
        const courseId = req.params.courseId;
        const data = await toggleCoursePublishStatus(courseId, userId, req.user?.role);
        await safeCacheDel("cache:/course");
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
