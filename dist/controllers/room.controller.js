import { createGroupRoom, ensureCourseRoom, findOrCreateDM, listMyRooms, listAssignedInstructors, messageCourseInstructor, listInstructorStudents, } from "../services/room.service.js";
import { AppError } from "../errors/AppError.js";
export const createGroup = async (req, res, next) => {
    try {
        const authRequest = req;
        const senderId = authRequest.user?.id;
        if (!senderId) {
            throw new AppError("Sender id is required", 400);
        }
        const { name, description, participantIds } = req.body;
        // participantIds arrives as a JSON string when sent alongside a file
        // via multipart/form-data.
        const parsedParticipantIds = typeof participantIds === "string"
            ? JSON.parse(participantIds)
            : participantIds;
        const dataToSend = {
            userId: senderId,
            participantIds: parsedParticipantIds,
            description,
            name,
            profile: req.file,
        };
        const data = await createGroupRoom(dataToSend);
        res.status(201).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
export const instructors = async (req, res, next) => {
    try {
        const id = req.user?.id;
        if (!id)
            throw new AppError("unauthorized", 401);
        res.json({ success: true, data: await listAssignedInstructors(id) });
    }
    catch (error) {
        next(error);
    }
};
export const instructorStudents = async (req, res, next) => {
    try {
        const id = req.user?.id;
        if (!id)
            throw new AppError("unauthorized", 401);
        res.json({ success: true, data: await listInstructorStudents(id) });
    }
    catch (error) {
        next(error);
    }
};
export const instructorConversation = async (req, res, next) => {
    try {
        const id = req.user?.id;
        if (!id)
            throw new AppError("unauthorized", 401);
        const courseId = req.params.courseId;
        if (typeof courseId !== "string")
            throw new AppError("courseId is required", 400);
        res.json({ success: true, data: await messageCourseInstructor(courseId, id) });
    }
    catch (error) {
        next(error);
    }
};
export const createDM = async (req, res, next) => {
    try {
        const authRequest = req;
        const senderId = authRequest.user?.id;
        if (!senderId) {
            throw new AppError("Sender id is required", 400);
        }
        const { otherUserId } = req.body;
        const dataToSend = {
            userId: senderId,
            otherUserId,
        };
        const data = await findOrCreateDM(dataToSend);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
export const createCourseRoom = async (req, res, next) => {
    try {
        const authRequest = req;
        const senderId = authRequest.user?.id;
        if (!senderId) {
            throw new AppError("Sender id is required", 400);
        }
        const courseId = req.params.courseId || req.body.courseId;
        if (!courseId) {
            throw new AppError("courseId is required", 400);
        }
        const data = await ensureCourseRoom(courseId, senderId, authRequest.user?.role);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
export const list = async (req, res, next) => {
    try {
        const authRequest = req;
        const userId = authRequest.user?.id;
        if (!userId) {
            throw new AppError("unauthorized", 401);
        }
        const data = await listMyRooms(userId);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
