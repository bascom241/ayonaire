import mongoose from "mongoose";
import { AppError } from "../errors/AppError.js";
import courseModel from "../models/course.model.js";
import enrollmentModel from "../models/enrollment.model.js";
import userModel from "../models/user.model.js";
import { getPagination } from "../utils/getPagination.js";
import { validateRequestBodyWithValues } from "../utils/validateRequestBody.js";
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
    const course = await courseModel.findByIdAndUpdate(data.course, {
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
export const viewCompletedCourses = async (userId) => {
    const user = await userModel.findById(userId);
    if (!user) {
        throw new AppError("Student not found", 404);
    }
    const completedCourses = await enrollmentModel
        .find({ student: userId, completed: true })
        .populate({
        path: "course",
        select: "title description thumbnail instructor",
        populate: {
            path: "instructor",
            select: "instructorId",
            populate: { path: "instructorId", select: "name" },
        },
    })
        .sort({ updatedAt: -1 });
    return completedCourses;
};
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
                    { $unwind: { path: "$instructor", preserveNullAndEmptyArrays: true } },
                    {
                        $project: {
                            _id: 1,
                            title: 1,
                            thumbnail: 1,
                            status: 1,
                            instructor: {
                                $cond: [
                                    "$instructor",
                                    { name: "$instructor.name" },
                                    null,
                                ],
                            },
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
// Student to view full detail of a single course they are enrolled in
// (title/description/thumbnail/instructor plus their own progress).
// course.instructor stores a raw User _id (see assignInstuctorToCourse) even
// though the schema ref says "Instructor", so it's resolved directly against
// userModel here rather than via .populate(), matching the same approach
// already used in viewEnrolledCourses' aggregation above.
export const getEnrolledCourseDetail = async (studentId, courseId) => {
    const enrollment = await enrollmentModel.findOne({
        student: studentId,
        course: courseId,
    });
    if (!enrollment) {
        throw new AppError("You are not enrolled in this course", 403);
    }
    const course = await courseModel.findById(courseId);
    if (!course) {
        throw new AppError("course not found", 404);
    }
    let instructor = null;
    if (course.instructor) {
        const instructorUser = await userModel.findById(course.instructor, "name");
        instructor = instructorUser
            ? { id: instructorUser._id.toString(), name: instructorUser.name }
            : null;
    }
    return {
        _id: course._id.toString(),
        title: course.title,
        description: course.description,
        thumbnail: course.thumbnail
            ? { url: course.thumbnail.url, publicId: course.thumbnail.publicId }
            : undefined,
        category: course.category?.toString(),
        instructor,
        price: course.price,
        courseLevel: course.courseLevel,
        status: course.status,
        progress: enrollment.progress,
        completed: enrollment.completed,
        completedLessons: enrollment.comletedLessons.map((id) => id.toString()),
        lastLesson: enrollment.lastLesson
            ? enrollment.lastLesson.toString()
            : null,
        enrolledAt: enrollment.createdAt,
    };
};
/// ----------- Admin enrollment management ---------------///
export const getAssignableStudentsForAdmin = async (query) => {
    const { page, limit, skip } = getPagination(query);
    const search = typeof query.search === "string" ? query.search.trim() : "";
    const filter = {};
    if (search) {
        filter.$or = [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
        ];
    }
    const [users, total] = await Promise.all([
        userModel
            .find(filter, { password: 0 })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        userModel.countDocuments(filter),
    ]);
    return {
        students: users.map((user) => ({
            _id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status,
            profile: user.profile
                ? { url: user.profile.url, publicId: user.profile.publicId }
                : null,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        })),
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};
export const getAllEnrollmentsForAdmin = async (query) => {
    const { page, limit, skip } = getPagination(query);
    const filter = {};
    if (query.course)
        filter.course = query.course;
    if (query.status)
        filter.status = query.status;
    const [enrollments, total] = await Promise.all([
        enrollmentModel
            .find(filter)
            .populate("student", "name email")
            .populate("course", "title")
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 }),
        enrollmentModel.countDocuments(filter),
    ]);
    return {
        enrollments: enrollments.map((e) => ({
            _id: e._id.toString(),
            student: e.student
                ? { _id: e.student._id.toString(), name: e.student.name, email: e.student.email }
                : null,
            course: e.course
                ? { _id: e.course._id.toString(), title: e.course.title }
                : null,
            status: e.status,
            progress: e.progress,
            completed: e.completed,
            createdAt: e.createdAt,
            updatedAt: e.updatedAt,
        })),
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};
export const bulkEnrollStudents = async (courseId, studentIds) => {
    validateRequestBodyWithValues({ courseId, studentIds }, ["courseId", "studentIds"]);
    const course = await courseModel.findById(courseId);
    if (!course) {
        throw new AppError("course does not exist", 404);
    }
    const enrolled = [];
    const skipped = [];
    for (const studentId of studentIds) {
        const user = await userModel.findById(studentId);
        if (!user) {
            skipped.push(studentId);
            continue;
        }
        const existing = await enrollmentModel.findOne({
            student: studentId,
            course: courseId,
        });
        if (existing) {
            skipped.push(user.email);
            continue;
        }
        await enrollmentModel.create({ course: courseId, student: studentId });
        await courseModel.findByIdAndUpdate(courseId, {
            $addToSet: { students: studentId },
        });
        enrolled.push(user.email);
    }
    return { enrolled, skipped };
};
export const bulkEnrollStudentsByEmail = async (courseId, emails) => {
    const course = await courseModel.findById(courseId);
    if (!course) {
        throw new AppError("course does not exist", 404);
    }
    const enrolled = [];
    const skipped = [];
    for (const rawEmail of emails) {
        const email = rawEmail.trim().toLowerCase();
        if (!email)
            continue;
        const user = await userModel.findOne({ email });
        if (!user) {
            skipped.push(email);
            continue;
        }
        const existing = await enrollmentModel.findOne({
            student: user._id,
            course: courseId,
        });
        if (existing) {
            skipped.push(email);
            continue;
        }
        await enrollmentModel.create({ course: courseId, student: user._id });
        await courseModel.findByIdAndUpdate(courseId, {
            $addToSet: { students: user._id },
        });
        enrolled.push(email);
    }
    return { enrolled, skipped };
};
