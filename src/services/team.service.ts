import crypto from "crypto";
import { AppError } from "../errors/AppError.js";
import userModel from "../models/user.model.js";
import invitesModel from "../models/invites.model.js";
import { UserRole, UserStatus } from "../types/user.types.js";
import { sendEmailInvites } from "../config/mail.js";

export const listTeamMembers = async () => {
  return userModel.find({ role: UserRole.ADMIN }, { password: 0 });
};

export const inviteTeamMember = async (
  email: string,
  role: "admin" | "instructor" = "admin",
) => {
  if (!email) {
    throw new AppError("email is required", 400);
  }

  const existingUser = await userModel.findOne({ email });
  if (existingUser) {
    throw new AppError("a user with this email already exists", 400);
  }

  const existingInvite = await invitesModel.findOne({ email, used: false });
  if (existingInvite) {
    throw new AppError("an invite is already pending for this email", 400);
  }

  const token = crypto.randomBytes(32).toString("hex");

  await invitesModel.create({
    email,
    role,
    token,
    expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 7,
  });

  const inviteLink = `https://wwww.ayonaire.com/dashboard/register/accept-invite?token=${token}`;
  await sendEmailInvites(email, inviteLink);

  return { message: `Invite sent to ${email}` };
};

export const updateTeamMemberRole = async (
  id: string,
  role: "admin" | "instructor" | "user",
) => {
  const user = await userModel.findByIdAndUpdate(
    id,
    { role },
    { new: true, runValidators: true },
  );
  if (!user) {
    throw new AppError("team member not found", 404);
  }
  return user;
};

export const suspendTeamMember = async (id: string) => {
  const user = await userModel.findByIdAndUpdate(
    id,
    { status: UserStatus.SUSPENDED },
    { new: true },
  );
  if (!user) {
    throw new AppError("team member not found", 404);
  }
  return user;
};

export const removeTeamMember = async (id: string, requesterId: string) => {
  if (id === requesterId) {
    throw new AppError("you cannot remove yourself from the team", 400);
  }

  const user = await userModel.findByIdAndDelete(id);
  if (!user) {
    throw new AppError("team member not found", 404);
  }
};
