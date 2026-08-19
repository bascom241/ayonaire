import { AppError } from "../errors/AppError.js";
import { createAttendanceSession, listAttendanceSessions, getAttendanceSessionById, updateAttendanceSession, approveAttendanceSession, deleteAttendanceSession, getAttendanceReport, } from "../services/attendance.service.js";
export const create = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId)
            throw new AppError("Unauthorized", 401);
        const data = await createAttendanceSession(userId, req.body);
        res.status(201).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
export const getAll = async (req, res, next) => {
    try {
        const data = await listAttendanceSessions(req.query);
        res.status(200).json({ success: true, ...data });
    }
    catch (error) {
        next(error);
    }
};
export const getSingle = async (req, res, next) => {
    try {
        const sessionId = req.params.sessionId;
        const data = await getAttendanceSessionById(sessionId);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
export const update = async (req, res, next) => {
    try {
        const sessionId = req.params.sessionId;
        const data = await updateAttendanceSession(sessionId, req.body);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
export const approve = async (req, res, next) => {
    try {
        const approverId = req.user?.id;
        if (!approverId)
            throw new AppError("Unauthorized", 401);
        const sessionId = req.params.sessionId;
        const data = await approveAttendanceSession(sessionId, approverId, req.body.approve !== false);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
export const remove = async (req, res, next) => {
    try {
        const sessionId = req.params.sessionId;
        await deleteAttendanceSession(sessionId);
        res.status(200).json({ success: true, message: "Attendance session deleted" });
    }
    catch (error) {
        next(error);
    }
};
export const report = async (req, res, next) => {
    try {
        const data = await getAttendanceReport(req.query);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
