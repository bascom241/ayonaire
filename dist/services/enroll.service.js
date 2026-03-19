import mongoose from "mongoose";
import { AppError } from "../errors/AppError.js";
import courseModel from "../models/course.model.js";
import enrollmentModel from "../models/enrollment.model.js";
import userModel from "../models/user.model.js";
export const enrollStudent = async (data) => {
    const user = await userModel.findById(data.student);
    if (!user) {
        throw new AppError("user does not exits ", 400);
    }
    const enrollmentExist = await enrollmentModel.findOne({
        student: data.student,
        course: data.course,
    });
    if (enrollmentExist) {
        throw new AppError("student already exits", 400);
    }
    await enrollmentModel.create({
        course: data.course,
        student: data.student,
    });
    const course = await courseModel.findByIdAndUpdate(data.course, {
        $push: { students: data.student },
    });
    return `${user.email} has been added to ${course?.title}`;
};
export const removeStudentFromCourse = async (data) => {
    const user = await userModel.findById(data.student);
    if (!user) {
        throw new AppError("user does not exits", 400);
    }
    const enrollment = await enrollmentModel.findOne({
        student: data.student,
        course: data.course,
    });
    if (!enrollment) {
        throw new AppError("student does not belong to any enrollment", 400);
    }
    await enrollmentModel.findOneAndDelete({
        student: data.student,
        course: data.course,
    });
    const course = await courseModel.findByIdAndDelete(data.course, {
        $pull: { students: data.student },
    });
    return ` ${user.email} has been removed from this course ${course?.title}`;
};
export const enrolledStudentsPerCourse = async (courseId) => {
    const course = await courseModel.findById(courseId);
    if (!course) {
        throw new AppError("course does not exist", 400);
    }
    const enrollments = await enrollmentModel
        .find({ course: courseId })
        .populate("student");
    const students = enrollments.map((enrollment) => {
        return {
            name: enrollment.name,
            email: enrollment.email,
        };
    });
    return students;
};
export const studentEnrollmentHistory = async (studentId) => {
    const enrollments = await enrollmentModel
        .find({ student: studentId })
        .populate("course", "title description")
        .sort({ createdAt: -1 });
    return enrollments.map((enrollment) => ({
        _id: enrollment._id.toString(),
        course: {
            _id: enrollment.course._id.toString(),
            title: enrollment.course.title,
            description: enrollment.course.description,
        },
        progress: enrollment.progress,
        completed: enrollment.completed,
        status: enrollment.status,
        createdAt: enrollment.createdAt,
    }));
};
export const getStudentCourseProgress = async (studentId, courseId) => {
    const enrollment = await enrollmentModel.findOne({
        student: studentId,
        course: courseId,
    });
    if (!enrollment) {
        throw new AppError("Enrollment not found", 404);
    }
    return {
        progress: enrollment.progress,
        completedLessons: enrollment.comletedLessons.map((id) => id.toString()),
        completed: enrollment.completed,
    };
};
// Student Completed ouser end point  ##Todo
// Student to view Enrolled Courses
export const viewEnrolledCourses = async (userId) => {
    const user = await userModel.findById(userId);
    if (!user) {
        throw new AppError("Student not found", 404);
    }
    const pipeline = [
        {
            $match: {
                student: new mongoose.Types.ObjectId(userId),
            },
        },
        {
            $lookup: {
                from: "courses",
                let: { courseId: "$course" },
                pipeline: [
                    { $match: { $expr: { $eq: ["$_id", "$$courseId"] } } },
                    {
                        $lookup: {
                            from: "users",
                            localField: "instructor",
                            foreignField: "_id",
                            as: "instructor",
                        },
                    },
                    { $unwind: "$instructor" },
                    {
                        $project: {
                            _id: 1,
                            title: 1,
                            thumbnail: 1,
                            status: 1,
                            instructor: { name: "$instructor.name" },
                        },
                    },
                ],
                as: "course",
            },
        },
        { $unwind: "$course" },
    ];
    const enrolledCourse = await enrollmentModel.aggregate(pipeline);
    return enrolledCourse;
};
