import User from "../models/user.model.js";
import { UserRole, UserStatus, } from "../types/user.types.js";
import { AppError } from "../errors/AppError.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateToken.js";
import { deleteImage, uploadMedia } from "../utils/uploadToCloudinary.js";
import userModel from "../models/user.model.js";
import enrollmentModel from "../models/enrollment.model.js";
import courseModel from "../models/course.model.js";
import cohortModel from "../models/cohort.model.js";
import { validateRequestBodyWithValues } from "../utils/validateRequestBody.js";
export const createUser = async (data) => {
    validateRequestBodyWithValues(data, [
        "name",
        "email",
        "password",
    ]);
    const exits = await User.findOne({ email: data.email });
    if (exits) {
        throw new AppError("user already exits", 409);
    }
    const hashPasssword = await bcrypt.hash(data.password, 12);
    const user = await User.create({ ...data, password: hashPasssword });
    return {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        status: user.status,
        createdAt: user.createdAt,
    };
};
export const loginUser = async (data, ip, userAgent) => {
    validateRequestBodyWithValues(data, ["email", "password"]);
    const user = await User.findOne({ email: data.email });
    if (!user) {
        throw new AppError("user not found", 404);
    }
    const isPassword = await bcrypt.compare(data.password, user.password);
    console.log(data.password);
    if (!isPassword) {
        throw new AppError("invalid credentials", 401);
    }
    await User.findByIdAndUpdate(user.id, {
        $push: {
            loginHistory: {
                ip,
                userAgent,
                loggedInAt: new Date(),
            },
            activity: {
                action: "LOGIN",
                performedAt: new Date(),
            },
        },
    });
    const token = generateToken({
        id: user._id,
        email: user.email,
        role: user.role,
    });
    return {
        token,
    };
};
export const editUser = async (id, data) => {
    validateRequestBodyWithValues(data, []);
    const isUser = await User.findById(id);
    if (isUser === null) {
        throw new AppError("user not found", 404);
    }
    if (isUser.role === UserRole.ADMIN) {
        throw new AppError("amin user cannot be edited by another admin", 403);
    }
    const user = await User.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
    });
    if (user) {
        return {
            _id: user._id.toString(),
            name: user.name,
            email: user.email,
            status: user.status,
            createdAt: user.createdAt,
        };
    }
    else {
        throw new AppError("cant update", 500);
    }
};
export const fetchNonAdminUsers = async () => {
    const users = await User.find({ role: { $ne: "admin" } }, { password: 0 });
    return users.map((user) => ({
        _id: user._id,
        name: user.name,
        email: user.email,
        status: user.status,
        createdAt: user.createdAt,
    }));
};
export const deleteUser = async (id) => {
    const user = await User.findById(id);
    if (user !== null && user.role === UserRole.ADMIN) {
        throw new AppError("cant delete an admin", 404);
    }
    await User.findByIdAndDelete(id);
};
export const deactivateUser = async (id) => {
    const user = await User.findById(id);
    if (user !== null && user.role === UserRole.ADMIN) {
        throw new AppError("cant deactive admin", 404);
    }
    if (user !== null && user.status === UserStatus.INACTIVE) {
        throw new AppError("account already deactivated ", 404);
    }
    await User.findByIdAndUpdate(id, {
        status: UserStatus.INACTIVE,
    });
};
export const suspendUser = async (id) => {
    const user = await User.findById(id);
    if (user !== null && user.role === UserRole.ADMIN) {
        throw new AppError("cant suspend an  admin", 404);
    }
    if (user !== null && user.status === UserStatus.SUSPENDED) {
        throw new AppError("account already suspended ", 404);
    }
    await User.findByIdAndUpdate(id, { status: UserStatus.SUSPENDED });
};
export const assignRole = async (id, data) => {
    const user = await User.findById(id);
    if (user !== null && user.role === UserRole.ADMIN) {
        throw new AppError("Only super admin can change admin role", 404);
    }
    const updatedUser = await User.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
    });
    return `role ${data.role.toUpperCase()} assinged to ${updatedUser?.name}`;
};
export const loginHistory = async (id) => {
    const user = await User.findById(id, {
        loginHistory: 1,
        email: 1,
        name: 1,
    });
    if (!user) {
        throw new AppError("user not found", 404);
    }
    return user.loginHistory;
};
export const userActivity = async (id) => {
    const user = await User.findById(id, {
        activity: 1,
        email: 1,
        name: 1,
    });
    if (!user) {
        throw new AppError("user not found", 404);
    }
    return user.activity;
};
/// Students Mangmenet service
// "** for students to view his profile
export const viewProfile = async (userId) => {
    const user = await User.findById(userId);
    console.log(user);
    if (!user) {
        throw new AppError("user not found");
    }
    return {
        email: user?.email,
        name: user?.name,
        status: user?.status,
        createdAt: user?.createdAt,
        profile: user.profile
            ? {
                url: user.profile.url,
                publicId: user.profile.publicId,
            }
            : null,
    };
};
// **for student to view Profile Image
export const addProfileImage = async (data, userId) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new AppError("user not found", 400);
    }
    if (user.profile?.publicId) {
        await deleteImage(user.profile.publicId);
    }
    const uploadedResult = await uploadMedia(data.profile.buffer, "image");
    user.profile = {
        url: uploadedResult.secure_url,
        publicId: uploadedResult.public_id,
    };
    const uploadedData = await user.save();
    return {
        profile: {
            url: uploadedData.profile.url,
            publicId: uploadedData.profile.publicId,
        },
    };
};
// ** for student to edit hs profile
export const editProfile = async (userId, data) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new AppError("user not found", 400);
    }
    if (user.profile?.publicId) {
        await deleteImage(user.profile.publicId);
    }
    const uploadedResult = await uploadMedia(data.profile.buffer, "image");
    user.profile = {
        url: uploadedResult.secure_url,
        publicId: uploadedResult.public_id,
    };
    if (data.name !== undefined)
        user.name = data.name;
    const editedProfileData = await user.save();
    return {
        name: editedProfileData.name,
        profile: {
            url: editedProfileData.profile.url,
            publicId: editedProfileData.profile.publicId,
        },
    };
};
// ** for admin to add student manually instead of registeration by students
// ** We need to add the user as a student first to genrate an Id
// before the admin can assign courses to them , add them to a cohort
export const addUser = async (data) => {
    validateRequestBodyWithValues(data, [
        "name",
        "email",
        "password",
    ]);
    const userExist = await userModel.findOne({ email: data.email });
    if (userExist) {
        throw new AppError("user already exist", 404);
    }
    const hashPasssword = await bcrypt.hash(data.password, 12);
    const user = await userModel.create({ ...data, password: hashPasssword });
    if (data.courseId) {
        const enrollmentExist = await enrollmentModel.findOne({
            student: user._id,
            course: data.courseId,
        });
        if (enrollmentExist) {
            throw new AppError("student already exits", 400);
        }
        await enrollmentModel.create({
            course: data.courseId,
            student: user._id,
        });
        await courseModel.findByIdAndUpdate(data.courseId, {
            $push: { students: user._id },
        });
    }
    if (data.cohortId) {
        const cohort = await cohortModel.findById(data.cohortId);
        if (!cohort) {
            throw new AppError("cant find cohhort", 404);
        }
        await cohortModel.findByIdAndUpdate(data.cohortId, {
            $push: { student: user._id },
        });
    }
    return {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        status: user.status,
        createdAt: user.createdAt,
    };
};
