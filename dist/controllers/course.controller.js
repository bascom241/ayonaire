import { createCourseCategory, createCourse, updateCourse, assignInstuctorToCourse } from "../services/course.service.js";
import { AppError } from "../errors/AppError.js";
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
export const create = async (req, res, next) => {
    try {
        console.log("req.file:", req.file);
        if (!req.file) {
            return res.status(400).json({ message: "Thumbnail is required" });
        }
        const dataToSend = {
            title: req.body.title,
            description: req.body.description,
            category: req.body.category,
            price: req.body.price,
            status: req.body.status,
            instructor: req.body.instructorId,
            thumbnail: req.file,
            introVideo: req.file,
            courseLevel: req.body
        };
        const data = await createCourse(dataToSend);
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
        console.log(courseId);
        if (!courseId) {
            throw new AppError("courseId is is required", 404);
        }
        const dataToSend = {
            title: req.body.title,
            description: req.body.description,
            category: req.body.category,
            price: req.body.price,
            status: req.body.status,
            instructor: req.body.instructorId,
            thumbnail: req.file,
        };
        console.log(dataToSend);
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
