import { AppError } from "../errors/AppError.js";
import { getInstructorCourses, getInstructorStats, getInstructorStudents, } from "../services/instructorDashboard.service.js";
export const stats = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId)
            throw new AppError("Unauthorized", 401);
        const data = await getInstructorStats(userId);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
export const courses = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId)
            throw new AppError("Unauthorized", 401);
        const data = await getInstructorCourses(userId, req.query);
        res.status(200).json({ success: true, ...data });
    }
    catch (error) {
        next(error);
    }
};
export const students = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId)
            throw new AppError("Unauthorized", 401);
        const data = await getInstructorStudents(userId, req.query);
        res.status(200).json({ success: true, ...data });
    }
    catch (error) {
        next(error);
    }
};
