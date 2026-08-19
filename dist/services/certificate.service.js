import crypto from "crypto";
import { AppError } from "../errors/AppError.js";
import certificateModel from "../models/certificate.model.js";
import courseModel from "../models/course.model.js";
import enrollmentModel from "../models/enrollment.model.js";
import userModel from "../models/user.model.js";
import { getPagination } from "../utils/getPagination.js";
const generateCertificateId = () => {
    const random = crypto.randomBytes(4).toString("hex").toUpperCase();
    return `AYO-${random}`;
};
export const issueCertificateIfEligible = async (studentId, courseId) => {
    const [course, enrollment, existing] = await Promise.all([
        courseModel.findById(courseId),
        enrollmentModel.findOne({ student: studentId, course: courseId }),
        certificateModel.findOne({ student: studentId, course: courseId }),
    ]);
    if (!course || !enrollment || existing)
        return existing;
    if (!course.completionCertificate)
        return null;
    if (!enrollment.completed)
        return null;
    return certificateModel.create({
        student: studentId,
        course: courseId,
        certificateId: generateCertificateId(),
    });
};
export const issueCertificateManually = async (studentId, courseId) => {
    const student = await userModel.findById(studentId);
    if (!student) {
        throw new AppError("student not found", 404);
    }
    const course = await courseModel.findById(courseId);
    if (!course) {
        throw new AppError("course not found", 404);
    }
    const existing = await certificateModel.findOne({
        student: studentId,
        course: courseId,
    });
    if (existing) {
        throw new AppError("certificate already issued for this student/course", 400);
    }
    return certificateModel.create({
        student: studentId,
        course: courseId,
        certificateId: generateCertificateId(),
    });
};
export const listCertificates = async (query) => {
    const { page, limit, skip } = getPagination(query);
    const filter = {};
    if (query.course)
        filter.course = query.course;
    if (query.student)
        filter.student = query.student;
    if (query.status)
        filter.status = query.status;
    const [certificates, total] = await Promise.all([
        certificateModel
            .find(filter)
            .populate("student", "name email")
            .populate("course", "title")
            .skip(skip)
            .limit(limit)
            .sort({ issuedAt: -1 }),
        certificateModel.countDocuments(filter),
    ]);
    return {
        certificates,
        pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
};
export const getMyCertificates = async (studentId) => {
    return certificateModel
        .find({ student: studentId, status: "active" })
        .populate("course", "title thumbnail")
        .sort({ issuedAt: -1 });
};
export const verifyCertificate = async (certificateId) => {
    const certificate = await certificateModel
        .findOne({ certificateId })
        .populate("student", "name")
        .populate("course", "title");
    if (!certificate) {
        throw new AppError("certificate not found", 404);
    }
    return {
        valid: certificate.status === "active",
        certificateId: certificate.certificateId,
        student: certificate.student,
        course: certificate.course,
        issuedAt: certificate.issuedAt,
        status: certificate.status,
    };
};
export const revokeCertificate = async (id) => {
    const certificate = await certificateModel.findById(id);
    if (!certificate) {
        throw new AppError("certificate not found", 404);
    }
    certificate.status = "revoked";
    await certificate.save();
    return certificate;
};
