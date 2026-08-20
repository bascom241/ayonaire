// 2️⃣ Instructor Management
// • Approve or reject instructor applications
// • View instructor profiles and activity
// • Assign instructors to courses or classes
// • Suspend or delete instructor accounts
// Instructor first need to create an account with us
// first get insrtuctor that want to apply to ayonaire
// we collect the id of that istructor and get the information
// we change the status of that instructor
// editInstructorApplicationStatus
import { AppError } from "../errors/AppError.js";
import instructorProfileModel from "../models/instructorProfile.model.js";
import User from "../models/user.model.js";
import { InstructorApplicationStatus, } from "../types/instructor.types.js";
import { UserRole } from "../types/user.types.js";
import categoryModel from "../models/category.model.js";
export const applyAsInstructor = async (userId, data) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new AppError("user does not exist", 404);
    }
    const existingInstructor = await instructorProfileModel.findOne({
        instructorId: userId,
    });
    if (existingInstructor) {
        throw new AppError("instructor account created for this user", 403);
    }
    const categoryExists = await categoryModel.findById(data.instructorCourseCategory);
    if (!categoryExists) {
        throw new AppError("selected course category does not exist", 403);
    }
    const instructor = await instructorProfileModel.create({
        instructorId: userId,
        bio: data.bio,
        expertise: data.expertise,
        instructorCourseCategory: data.instructorCourseCategory,
        applicationStatus: InstructorApplicationStatus.PENDING,
    });
    return instructor;
};
export const approveInstructorApplicationStatus = async (userId) => {
    const instructor = await instructorProfileModel
        .findOne({ instructorId: userId })
        .populate("instructorId", "name");
    if (!instructor) {
        throw new AppError("Instructor application not found", 404);
    }
    if (instructor.applicationStatus === InstructorApplicationStatus.APPROVED) {
        throw new AppError("Instructor already approved", 403);
    }
    instructor.applicationStatus = InstructorApplicationStatus.APPROVED;
    await instructor.save();
    await User.findByIdAndUpdate(userId, { role: UserRole.INSTRUCTOR });
    return `${instructor.instructorId.name} is approved`;
};
export const rejectInstructorApplicationStatus = async (userId) => {
    const instructor = await instructorProfileModel
        .findOne({ instructorId: userId })
        .populate("instructorId", "name");
    if (!instructor) {
        throw new AppError("user not found", 404);
    }
    if (instructor.applicationStatus === InstructorApplicationStatus.REJECTED) {
        throw new AppError("instructor alraedy rejected", 403);
    }
    await instructorProfileModel.findOneAndUpdate({ instructorId: userId }, { applicationStatus: InstructorApplicationStatus.REJECTED });
    await User.findByIdAndUpdate(userId, { role: UserRole.USER });
    return `${instructor.instructorId.name} is rejected`;
};
export const getInstructorProfiles = async () => {
    const instructors = await instructorProfileModel
        .find()
        .populate({
        path: "instructorId",
        select: "name email loginHistory activity profile",
    })
        .populate({
        path: "instructorCourseCategory",
        select: "title",
    })
        .populate("courses", "title status");
    return instructors.map((inst) => ({
        _id: inst._id.toString(),
        instructorId: {
            _id: inst.instructorId._id.toString(),
            name: inst.instructorId.name,
            email: inst.instructorId.email,
            loginHistory: inst.instructorId.loginHistory,
            activity: inst.instructorId.activity,
            profile: inst.instructorId.profile ?? null,
        },
        bio: inst.bio,
        expertise: inst.expertise,
        instructorCourseCategory: inst.instructorCourseCategory.title,
        applicationStatus: inst.applicationStatus,
        courses: inst.courses ?? [],
        createdAt: inst.createdAt,
        updatedAt: inst.updatedAt,
    }));
};
export const getInstructorProfile = async (id) => {
    const instructor = await instructorProfileModel
        .findOne({ instructorId: id })
        .populate({
        path: "instructorId",
        select: "name email loginHistory activity profile",
    })
        .populate({
        path: "instructorCourseCategory",
        select: "title",
    })
        .populate("courses", "title status")
        .lean();
    if (!instructor) {
        throw new AppError("Instructor profile not found", 404);
    }
    const populatedUser = instructor.instructorId;
    const populatedCategory = instructor.instructorCourseCategory;
    return {
        _id: instructor._id.toString(),
        instructorId: {
            _id: populatedUser._id.toString(),
            name: populatedUser.name,
            email: populatedUser.email,
            loginHistory: populatedUser.loginHistory,
            activity: populatedUser.activity,
            profile: populatedUser.profile ?? null,
        },
        bio: instructor.bio,
        expertise: instructor.expertise,
        instructorCourseCategory: populatedCategory.title,
        applicationStatus: instructor.applicationStatus,
        courses: instructor.courses ?? [],
        createdAt: instructor.createdAt,
        updatedAt: instructor.updatedAt,
    };
};
