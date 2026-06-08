import { sendAnnouncementToStudentsInACohort, sendAnnouncementToStudentsInACourse, } from "../config/mail.js";
import { AppError } from "../errors/AppError.js";
import announcementModel from "../models/announcement.model.js";
import cohortModel from "../models/cohort.model.js";
import courseModel from "../models/course.model.js";
import userModel from "../models/user.model.js";
import { getPagination } from "../utils/getPagination.js";
import { validateRequestBodyWithValues } from "../utils/validateRequestBody.js";
export const createAnnouncement = async (data) => {
    validateRequestBodyWithValues(data, ["title", "summary"]);
    const { title, summary, cohortId, courseId, students } = data;
    const excludedKeys = [title, summary];
    const hasAtLeastOne = Object.entries(data).some(([key, value]) => !excludedKeys.includes(key) && Boolean(value));
    if (!hasAtLeastOne) {
        throw new AppError("At leat one value must be provided", 400);
    }
    if (cohortId) {
        const cohort = await cohortModel
            .findById(cohortId)
            .populate("students", "email");
        if (!cohort) {
            throw new AppError("cohort not found", 404);
        }
        if (!cohort.students || cohort.students.length === 0) {
            throw new AppError("no students found for this cohort", 400);
        }
        const studentEmails = cohort.students.map((student) => student.email);
        await sendAnnouncementToStudentsInACohort(studentEmails, title, summary);
        const announcment = await announcementModel.create({
            audience: cohort.name,
            title: title,
            summary: summary,
        });
        return {
            id: announcment._id.toString(),
            audience: announcment.audience,
            title: announcment.title,
            summary: announcment.summary,
        };
    }
    if (courseId) {
        const course = await courseModel
            .findById(courseId)
            .populate("students", "email");
        if (!course) {
            throw new AppError("cohort not found", 404);
        }
        if (!course.students || course.students.length === 0) {
            throw new AppError("no students found for this course", 400);
        }
        const studentEmails = course.students.map((student) => student.email);
        await sendAnnouncementToStudentsInACourse(studentEmails, title, summary);
        const announcment = await announcementModel.create({
            audience: course.title,
            title: title,
            summary: summary,
        });
        return {
            id: announcment._id.toString(),
            audience: announcment.audience,
            title: announcment.title,
            summary: announcment.summary,
        };
    }
    if (students) {
        const existingStudents = [];
        const nonExistentStudents = [];
        for (const studentEmail of students) {
            const isStudentExist = await userModel.findOne({ email: studentEmail });
            if (isStudentExist) {
                existingStudents.push(studentEmail);
            }
            else {
                nonExistentStudents.push(studentEmail);
                console.log(`Student not found in platform: ${studentEmail}`);
            }
        }
        console.log(`Found ${existingStudents.length} existing students, excluded ${nonExistentStudents.length} non-existent users`);
        if (existingStudents.length > 0) {
            await sendAnnouncementToStudentsInACourse(existingStudents, title, summary);
            const announcment = await announcementModel.create({
                audience: "Specific students",
                title: title,
                summary: summary,
            });
            return {
                id: announcment._id.toString(),
                audience: announcment.audience,
                title: announcment.title,
                summary: announcment.summary,
            };
        }
        else {
            throw new AppError("No valid students found in the platform", 400);
        }
    }
    throw new AppError("could no send announcement", 400);
};
export const getAllAnnounceMents = async (data) => {
    const { page, skip, limit } = getPagination(data);
    const [announcements, total] = await Promise.all([
        announcementModel.find().skip(skip).limit(limit),
        announcementModel.countDocuments(),
    ]);
    const formattedAnnouceMent = announcements.map((announcement) => ({
        id: announcement._id.toString(),
        audience: announcement.audience,
        title: announcement.title,
        summary: announcement.summary,
    }));
    return {
        announcement: formattedAnnouceMent,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};
