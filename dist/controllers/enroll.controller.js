import csvParser from "csv-parser";
import { Readable } from "node:stream";
import { viewCompletedCourses, viewEnrolledCourses, getEnrolledCourseDetail, getAllEnrollmentsForAdmin, bulkEnrollStudents, bulkEnrollStudentsByEmail, } from "../services/enroll.service.js";
import { AppError } from "../errors/AppError.js";
export const enrolledCourses = async (req, res, next) => {
    try {
        const id = req.user?.id;
        if (!id) {
            throw new AppError("unauthorized", 401);
        }
        const data = await viewEnrolledCourses(id);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
export const completedCourses = async (req, res, next) => {
    try {
        const id = req.user?.id;
        if (!id) {
            throw new AppError("unauthorized", 401);
        }
        const data = await viewCompletedCourses(id);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
export const courseDetail = async (req, res, next) => {
    try {
        const id = req.user?.id;
        if (!id) {
            throw new AppError("unauthorized", 401);
        }
        const { courseId } = req.params;
        if (!courseId || typeof courseId !== "string") {
            throw new AppError("courseId is required", 400);
        }
        const data = await getEnrolledCourseDetail(id, courseId);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
export const getAllEnrollments = async (req, res, next) => {
    try {
        const data = await getAllEnrollmentsForAdmin(req.query);
        res.status(200).json({ success: true, ...data });
    }
    catch (error) {
        next(error);
    }
};
export const enrollStudents = async (req, res, next) => {
    try {
        const { courseId, studentIds } = req.body;
        if (!courseId || !Array.isArray(studentIds) || studentIds.length === 0) {
            throw new AppError("courseId and studentIds[] are required", 400);
        }
        const data = await bulkEnrollStudents(courseId, studentIds);
        res.status(200).json({ success: true, message: "Enrollment processed", data });
    }
    catch (error) {
        next(error);
    }
};
export const enrollStudentsCsv = async (req, res, next) => {
    try {
        const { courseId } = req.body;
        if (!courseId) {
            throw new AppError("courseId is required", 400);
        }
        if (!req.file) {
            throw new AppError("csv file is required", 400);
        }
        const emails = [];
        const stream = Readable.from(req.file.buffer);
        await new Promise((resolve, reject) => {
            stream
                .pipe(csvParser())
                .on("data", (row) => {
                if (row.email) {
                    emails.push(row.email.trim());
                }
            })
                .on("end", resolve)
                .on("error", reject);
        });
        const uniqueEmails = [...new Set(emails)];
        const data = await bulkEnrollStudentsByEmail(courseId, uniqueEmails);
        res.status(200).json({ success: true, message: "Enrollment processed", data });
    }
    catch (error) {
        next(error);
    }
};
