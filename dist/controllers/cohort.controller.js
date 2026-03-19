import { assignInstructorToCohort, assignStudentToCohort, createCohort, } from "../services/cohort.service.js";
export const create = async (req, res, next) => {
    try {
        const { name, course, creator, isActive, description } = req.body;
        const dataToSend = {
            name,
            course,
            creator,
            isActive,
            description,
        };
        const data = await createCohort(dataToSend);
        res.status(201).json({ success: true, message: "cohort created", data });
    }
    catch (error) {
        next(error);
    }
};
export const assign = async (req, res, next) => {
    try {
        const { userId, cohortId } = req.body;
        const dataToSend = {
            userId,
            cohortId,
        };
        const data = await assignStudentToCohort(dataToSend);
        res.status(200).json({ success: true, message: data });
    }
    catch (error) {
        next(error);
    }
};
export const assignInstructor = async (req, res, next) => {
    try {
        const { instructorId, cohortId } = req.body;
        const dataToSend = {
            instructorId,
            cohortId,
        };
        const data = await assignInstructorToCohort(dataToSend);
        res.status(200).json({ success: true, message: data });
    }
    catch (error) {
        next(error);
    }
};
