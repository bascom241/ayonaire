import { AppError } from "../errors/AppError.js";
import { createAssignmentForAModule, deleteAssignment, getAssignmentById, gradeSubmission, listAssignments, listAllSubmissions, listSubmissionsForAssignment, submitAssignment, updateAssignment, } from "../services/assignment.service.js";
const getMaterialFiles = (req) => {
    const files = req.files;
    const titles = req.body.materialTitles || [];
    const titleList = Array.isArray(titles) ? titles : [titles];
    return (files ?? []).map((file, index) => ({
        title: titleList[index] || file.originalname,
        buffer: file.buffer,
        mimetype: file.mimetype,
        originalname: file.originalname,
    }));
};
export const create = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId)
            throw new AppError("Unauthorized", 401);
        const { course, title, description, module } = req.body;
        if (!course || !title || !description || !module) {
            throw new AppError("course, title, description and module are required", 400);
        }
        const dataToSend = {
            course,
            title,
            description,
            module,
            cohort: req.body.cohort,
            instructions: req.body.instructions,
            assignmentType: req.body.assignmentType,
            status: req.body.status,
            dueDate: req.body.dueDate,
            totalPoints: req.body.totalPoints ? Number(req.body.totalPoints) : undefined,
            allowedFileTypes: req.body.allowedFileTypes,
            materials: getMaterialFiles(req),
        };
        const data = await createAssignmentForAModule(userId, req.user?.role, dataToSend);
        res
            .status(201)
            .json({ success: true, message: "Assignment created", data });
    }
    catch (error) {
        next(error);
    }
};
export const getAll = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId)
            throw new AppError("Unauthorized", 401);
        const data = await listAssignments(userId, req.user?.role, req.query);
        res.status(200).json({ success: true, ...data });
    }
    catch (error) {
        next(error);
    }
};
export const getSingle = async (req, res, next) => {
    try {
        const assignmentId = req.params.assignmentId;
        const data = await getAssignmentById(assignmentId);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
export const update = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId)
            throw new AppError("Unauthorized", 401);
        const assignmentId = req.params.assignmentId;
        const dataToSend = {
            title: req.body.title,
            description: req.body.description,
            instructions: req.body.instructions,
            cohort: req.body.cohort,
            assignmentType: req.body.assignmentType,
            status: req.body.status,
            dueDate: req.body.dueDate,
            totalPoints: req.body.totalPoints !== undefined
                ? Number(req.body.totalPoints)
                : undefined,
            allowedFileTypes: req.body.allowedFileTypes,
        };
        const data = await updateAssignment(assignmentId, userId, req.user?.role, dataToSend);
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
        const assignmentId = req.params.assignmentId;
        await deleteAssignment(assignmentId, userId, req.user?.role);
        res.status(200).json({ success: true, message: "Assignment deleted" });
    }
    catch (error) {
        next(error);
    }
};
export const submit = async (req, res, next) => {
    try {
        const studentId = req.user?.id;
        if (!studentId)
            throw new AppError("Unauthorized", 401);
        const assignmentId = req.params.assignmentId;
        const file = req.file;
        const data = await submitAssignment({
            assignmentId,
            studentId,
            text: req.body.text,
            file: file
                ? {
                    buffer: file.buffer,
                    mimetype: file.mimetype,
                    originalname: file.originalname,
                }
                : undefined,
        });
        res.status(200).json({ success: true, message: "Assignment submitted", data });
    }
    catch (error) {
        next(error);
    }
};
export const getSubmissions = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId)
            throw new AppError("Unauthorized", 401);
        const assignmentId = req.params.assignmentId;
        const data = await listSubmissionsForAssignment(assignmentId, userId, req.user?.role);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
export const getAllSubmissions = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId)
            throw new AppError("Unauthorized", 401);
        const data = await listAllSubmissions(userId, req.user?.role, req.query);
        res.status(200).json({ success: true, ...data });
    }
    catch (error) {
        next(error);
    }
};
export const grade = async (req, res, next) => {
    try {
        const graderId = req.user?.id;
        if (!graderId)
            throw new AppError("Unauthorized", 401);
        const submissionId = req.params.submissionId;
        if (req.body.grade === undefined) {
            throw new AppError("grade is required", 400);
        }
        const data = await gradeSubmission({
            submissionId,
            grade: Number(req.body.grade),
            feedback: req.body.feedback,
            graderId,
        });
        res.status(200).json({ success: true, message: "Submission graded", data });
    }
    catch (error) {
        next(error);
    }
};
