import mongoose from "mongoose";
import assignmentModel from "../models/assignment.model.js";
import assignmentSubmissionModel from "../models/assignmentSubmission.model.js";
import courseModel from "../models/course.model.js";
import enrollmentModel from "../models/enrollment.model.js";
import quizAttemptModel from "../models/quizAttempt.model.js";
import quizModel from "../models/quiz.model.js";
import { getPagination } from "../utils/getPagination.js";
const getInstructorCourseIds = async (instructorId) => {
    const courses = await courseModel
        .find({ instructor: instructorId })
        .select("_id");
    return courses.map((c) => c._id);
};
export const getInstructorStats = async (instructorId) => {
    const courseIds = await getInstructorCourseIds(instructorId);
    const [totalCourses, totalStudentsAgg, totalAssignments, pendingSubmissions, totalQuizzes, avgScoreAgg,] = await Promise.all([
        courseModel.countDocuments({ instructor: instructorId }),
        enrollmentModel.distinct("student", { course: { $in: courseIds } }),
        assignmentModel.countDocuments({ instructor: instructorId }),
        assignmentSubmissionModel.countDocuments({
            course: { $in: courseIds },
            status: { $ne: "graded" },
        }),
        quizModel.countDocuments({ createdBy: instructorId }),
        quizAttemptModel.aggregate([
            {
                $lookup: {
                    from: "quizzes",
                    localField: "quiz",
                    foreignField: "_id",
                    as: "quiz",
                },
            },
            { $unwind: "$quiz" },
            {
                $match: {
                    "quiz.createdBy": new mongoose.Types.ObjectId(instructorId),
                    completed: true,
                },
            },
            { $group: { _id: null, avgScore: { $avg: "$score" } } },
        ]),
    ]);
    return {
        totalCourses,
        totalStudents: totalStudentsAgg.length,
        totalAssignments,
        pendingSubmissions,
        totalQuizzes,
        avgQuizScore: avgScoreAgg[0]?.avgScore
            ? Math.round(avgScoreAgg[0].avgScore)
            : null,
    };
};
export const getInstructorCourses = async (instructorId, query) => {
    const { page, limit, skip } = getPagination(query);
    const filter = { instructor: instructorId };
    if (query.status)
        filter.status = query.status;
    const [courses, total] = await Promise.all([
        courseModel
            .find(filter)
            .populate("category", "title")
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 }),
        courseModel.countDocuments(filter),
    ]);
    const courseIds = courses.map((c) => c._id);
    const enrollmentCounts = await enrollmentModel.aggregate([
        { $match: { course: { $in: courseIds } } },
        { $group: { _id: "$course", count: { $sum: 1 } } },
    ]);
    const enrollmentCountMap = {};
    enrollmentCounts.forEach((e) => {
        enrollmentCountMap[e._id.toString()] = e.count;
    });
    return {
        courses: courses.map((c) => ({
            _id: c._id.toString(),
            title: c.title,
            description: c.description,
            thumbnail: c.thumbnail,
            category: c.category?.title || null,
            price: c.price,
            status: c.status,
            courseLevel: c.courseLevel,
            enrollmentCount: enrollmentCountMap[c._id.toString()] || 0,
            createdAt: c.createdAt,
        })),
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};
export const getInstructorStudents = async (instructorId, query) => {
    const { page, limit, skip } = getPagination(query);
    const courseIds = await getInstructorCourseIds(instructorId);
    const filter = { course: { $in: courseIds } };
    if (query.course)
        filter.course = query.course;
    const [enrollments, total] = await Promise.all([
        enrollmentModel
            .find(filter)
            .populate("student", "name email profile")
            .populate("course", "title")
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 }),
        enrollmentModel.countDocuments(filter),
    ]);
    return {
        students: enrollments.map((e) => ({
            enrollmentId: e._id.toString(),
            student: e.student
                ? {
                    _id: e.student._id.toString(),
                    name: e.student.name,
                    email: e.student.email,
                    profile: e.student.profile || null,
                }
                : null,
            course: e.course
                ? { _id: e.course._id.toString(), title: e.course.title }
                : null,
            status: e.completed
                ? "completed"
                : e.progress > 0
                    ? "in-progress"
                    : "enrolled",
            progress: e.progress,
            completed: e.completed,
            enrolledAt: e.createdAt,
        })),
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};
