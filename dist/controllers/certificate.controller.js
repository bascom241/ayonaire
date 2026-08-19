import { AppError } from "../errors/AppError.js";
import { issueCertificateManually, listCertificates, getMyCertificates, verifyCertificate, revokeCertificate, } from "../services/certificate.service.js";
export const issue = async (req, res, next) => {
    try {
        const { studentId, courseId } = req.body;
        if (!studentId || !courseId) {
            throw new AppError("studentId and courseId are required", 400);
        }
        const data = await issueCertificateManually(studentId, courseId);
        res.status(201).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
export const getAll = async (req, res, next) => {
    try {
        const data = await listCertificates(req.query);
        res.status(200).json({ success: true, ...data });
    }
    catch (error) {
        next(error);
    }
};
export const getMine = async (req, res, next) => {
    try {
        const studentId = req.user?.id;
        if (!studentId)
            throw new AppError("Unauthorized", 401);
        const data = await getMyCertificates(studentId);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
export const verify = async (req, res, next) => {
    try {
        const certificateId = req.params.certificateId;
        const data = await verifyCertificate(certificateId);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
export const revoke = async (req, res, next) => {
    try {
        const id = req.params.id;
        const data = await revokeCertificate(id);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
