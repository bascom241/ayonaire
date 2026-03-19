import { viewEnrolledCourses } from "../services/enroll.service.js";
import { AppError } from "../errors/AppError.js";
export const enrolledCourses = async (req, res, next) => {
    try {
        const id = req.user?.id;
        if (!id) {
            throw new AppError("unauthorized", 401);
        }
        ;
        const data = await viewEnrolledCourses(id);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
