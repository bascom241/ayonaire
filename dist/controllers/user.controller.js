import csvParser from "csv-parser";
import { Readable } from "node:stream";
import { createUser, fetchNonAdminUsers, forgotUserPassword, loginUser, refreshAuthToken, logoutUser, resendUserVerificationEmail, resetUserPassword, verifyUserEmail, editUser, loginHistory, userActivity, assignRole, deactivateUser, suspendUser, viewProfile, addProfileImage, editProfile, addUser, inviteUser, acceptInvite, fetchLeaderboard, } from "../services/user.service.js";
import { AppError } from "../errors/AppError.js";
export const registerUser = async (req, res, next) => {
    try {
        const user = await createUser(req.body);
        res.status(201).json({ success: true, data: user });
    }
    catch (error) {
        console.log(error);
        next(error);
    }
};
export const login = async (req, res, next) => {
    try {
        const token = await loginUser(req.body, req.ip, req.headers["user-agent"]);
        res.status(200).json({ success: true, data: token });
    }
    catch (error) {
        next(error);
    }
};
export const verifyEmail = async (req, res, next) => {
    try {
        const message = await verifyUserEmail({
            token: req.query.token || req.body.token,
        });
        res.status(200).json({ success: true, message });
    }
    catch (error) {
        next(error);
    }
};
export const resendVerificationEmail = async (req, res, next) => {
    try {
        const message = await resendUserVerificationEmail(req.body);
        res.status(200).json({ success: true, message });
    }
    catch (error) {
        next(error);
    }
};
export const forgotPassword = async (req, res, next) => {
    try {
        const message = await forgotUserPassword(req.body);
        res.status(200).json({ success: true, message });
    }
    catch (error) {
        next(error);
    }
};
export const resetPassword = async (req, res, next) => {
    try {
        const message = await resetUserPassword({
            token: req.query.token || req.body.token,
            password: req.body.password,
        });
        res.status(200).json({ success: true, message });
    }
    catch (error) {
        next(error);
    }
};
export const refreshToken = async (req, res, next) => {
    try {
        const data = await refreshAuthToken(req.body, req.ip, req.headers["user-agent"]);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
export const logout = async (req, res, next) => {
    try {
        const message = await logoutUser(req.body, req.user?.id);
        res.status(200).json({ success: true, message });
    }
    catch (error) {
        next(error);
    }
};
export const getNonAdminUsers = async (req, res, next) => {
    try {
        const users = await fetchNonAdminUsers();
        res.status(200).json({ success: true, data: users });
    }
    catch (error) {
        next(error);
    }
};
export const assignRoleToUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const data = await assignRole(id, req.body);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
export const suspendToUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        await suspendUser(id);
        res.status(200).json({ success: true, message: "user suspended" });
    }
    catch (error) {
        next(error);
    }
};
export const deactivateToUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        await deactivateUser(id);
        res.status(200).json({ success: true, message: "user deactivated" });
    }
    catch (error) {
        next(error);
    }
};
export const updateUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const data = await editUser(id, req.body);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
export const getUserLoginHistory = async (req, res, next) => {
    try {
        const { id } = req.params;
        const data = await loginHistory(id);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
export const getUserActivityHistory = async (req, res, next) => {
    try {
        const { id } = req.params;
        const data = await userActivity(id);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
export const viewMyProfile = async (req, res, next) => {
    try {
        const { id } = req.user;
        if (!id) {
            throw new AppError("user id is required! cant destructure from token", 400);
        }
        const data = await viewProfile(id);
        console.log(data);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
export const uploadImage = async (req, res, next) => {
    try {
        const id = req.user?.id;
        if (!id) {
            throw new AppError("Unauthorized", 401);
        }
        console.log("req.file:", req.file);
        if (!req.file) {
            throw new AppError("Thumbnail is required", 400);
        }
        const dataToSend = {
            profile: req.file,
        };
        const data = await addProfileImage(dataToSend, id);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        console.error("UPLOAD ERROR:", error);
        next(error);
    }
};
export const edit = async (req, res, next) => {
    try {
        const id = req.user?.id;
        if (!id) {
            throw new AppError("Unauthorized", 401);
        }
        const dataToSend = {
            name: req.body.name,
            bio: req.body.bio,
            linkedin: req.body.linkedin,
            website: req.body.website,
            company: req.body.company,
            instagram: req.body.instagram,
            profile: req.file,
        };
        const data = await editProfile(id, dataToSend);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        console.log("Updat Error: ", error);
        next(error);
    }
};
export const getLeaderboard = async (req, res, next) => {
    try {
        const period = req.query.period || "all-time";
        const limit = req.query.limit ? Number(req.query.limit) : 10;
        const data = await fetchLeaderboard(period, limit);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
// Not yet tested with post man
export const add = async (req, res, next) => {
    try {
        const dataToSend = {
            name: req.body.name,
            email: req.body.email,
            role: req.body.role,
            status: req.body.status,
            password: req.body.password,
            courseId: req.body.courseId,
            cohortId: req.body.cohortId,
        };
        const data = await addUser(dataToSend);
        res.status(201).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
export const invite = async (req, res, next) => {
    try {
        const dataToSend = {
            emails: req.body.emails,
            courseId: req.body.courseId,
            cohortId: req.body.cohortId,
        };
        const data = await inviteUser(dataToSend);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        console.log(error);
        next(error);
    }
};
export const accept = async (req, res, next) => {
    try {
        const { token } = req.params;
        if (typeof token !== "string") {
            throw new AppError("Invalid token format", 400);
        }
        const dataToSend = {
            token,
            name: req.body.name,
            password: req.body.password,
        };
        const data = await acceptInvite(dataToSend);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
export const inviteUserCsv = async (req, res, next) => {
    try {
        if (!req.file) {
            throw new AppError("csv file is required", 400);
        }
        const emails = [];
        const stream = Readable.from(req.file.buffer);
        await new Promise((resolve, reject) => {
            stream.pipe(csvParser())
                .on("data", (row) => {
                if (row.email) {
                    emails.push(row.email.trim());
                }
            })
                .on("end", resolve)
                .on("error", reject);
        });
        const uniqueEmails = [...new Set(emails)];
        const data = await inviteUser({
            emails: uniqueEmails,
            courseId: req.body.courseId,
            cohortId: req.body.cohortId,
        });
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
