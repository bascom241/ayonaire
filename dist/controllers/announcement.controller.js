import { createAnnouncement, getAllAnnounceMents } from "../services/announcement.service.js";
import { AppError } from "../errors/AppError.js";
export const create = async (req, res, next) => {
    try {
        const { title, summary, cohortId, courseId, students } = req.body;
        if (!title || !summary) {
            throw new AppError("Title and summary are required", 400);
        }
        const dataToSend = {
            title,
            summary,
        };
        if (cohortId) {
            dataToSend.cohortId = cohortId;
        }
        else if (courseId) {
            dataToSend.courseId = courseId;
        }
        else if (students && Array.isArray(students)) {
            dataToSend.students = students;
        }
        else {
            throw new AppError("Please provide either cohortId, courseId, or students array", 400);
        }
        const data = await createAnnouncement(dataToSend);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
export const getAll = async (req, res, next) => {
    try {
        const query = req.query;
        const data = await getAllAnnounceMents(query);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
