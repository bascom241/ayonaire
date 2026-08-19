import { AppError } from "../errors/AppError.js";
import { listTeamMembers, inviteTeamMember, updateTeamMemberRole, suspendTeamMember, removeTeamMember, } from "../services/team.service.js";
export const getAll = async (req, res, next) => {
    try {
        const data = await listTeamMembers();
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
export const invite = async (req, res, next) => {
    try {
        const { email, role } = req.body;
        const data = await inviteTeamMember(email, role);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
export const updateRole = async (req, res, next) => {
    try {
        const id = req.params.id;
        const { role } = req.body;
        if (!role)
            throw new AppError("role is required", 400);
        const data = await updateTeamMemberRole(id, role);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
export const suspend = async (req, res, next) => {
    try {
        const id = req.params.id;
        const data = await suspendTeamMember(id);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
export const remove = async (req, res, next) => {
    try {
        const requesterId = req.user?.id;
        if (!requesterId)
            throw new AppError("Unauthorized", 401);
        const id = req.params.id;
        await removeTeamMember(id, requesterId);
        res.status(200).json({ success: true, message: "Team member removed" });
    }
    catch (error) {
        next(error);
    }
};
