import User from "../models/user.model.js";
import {
  CreateUserDto,
  ForgotPasswordDto,
  UserResponse,
  LoginUserDto,
  LoginResponseDto,
  RefreshTokenDto,
  LogoutDto,
  ResendVerificationDto,
  ResetPasswordDto,
  VerifyEmailDto,
  NonAdminUsers,
  editUserDto,
  UserRole,
  UserParams,
  DeactivateUser,
  AssignRole,
  UserStatus,
  ProfileImageRequest,
  ProfileImageResponse,
  EditProfileRequest,
  EditProfileResponse,
  AddUserDto,
  InviteRequest,
  AcceptInviteRequest,
  AcceptInviteRequestBody,
  CsvRequestBody,
} from "../types/user.types.js";
import { AppError } from "../errors/AppError.js";
import bcrypt from "bcryptjs";
import {
  generateRefreshToken,
  generateToken,
  verifyRefreshToken,
} from "../utils/generateToken.js";
import { deleteImage, uploadMedia } from "../utils/uploadToCloudinary.js";
import userModel from "../models/user.model.js";
import enrollmentModel from "../models/enrollment.model.js";
import courseModel from "../models/course.model.js";
import cohortModel from "../models/cohort.model.js";
import { validateRequestBodyWithValues } from "../utils/validateRequestBody.js";
import crypto from "crypto";
import invitesModel from "../models/invites.model.js";
import refreshTokenModel from "../models/refreshToken.model.js";
import {
  sendEmailInvites,
  sendPasswordResetEmail,
  sendVerificationEmail,
} from "../config/mail.js";
import { appendFile } from "fs";
import { sendInviteEmail } from "../templates/emailTemplates.js";

const ACCESS_TOKEN_EXPIRES_IN_SECONDS = 15 * 60;
const REFRESH_TOKEN_EXPIRES_IN_DAYS = 30;

const hashToken = (token: string) =>
  crypto.createHash("sha256").update(token).digest("hex");

const getRefreshTokenExpiry = () => {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRES_IN_DAYS);
  return expiresAt;
};

const getAuthUrl = () =>
  process.env.FRONTEND_URL ||
  process.env.CLIENT_URL ||
  "https://wwww.ayonaire.com";

const createPlainToken = () => crypto.randomBytes(32).toString("hex");

const createEmailVerificationToken = () => {
  const token = createPlainToken();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);

  return {
    token,
    tokenHash: hashToken(token),
    expiresAt,
  };
};

const createPasswordResetToken = () => {
  const token = createPlainToken();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60);

  return {
    token,
    tokenHash: hashToken(token),
    expiresAt,
  };
};

const sendUserVerificationEmail = async (user: {
  email: string;
  name: string;
  verificationToken: string;
}) => {
  const verificationLink = `${getAuthUrl()}/verify-email?token=${user.verificationToken}`;
  await sendVerificationEmail(user.email, user.name, verificationLink);
};

const ensureUserCanAuthenticate = (user: { status: UserStatus }) => {
  if (user.status === UserStatus.SUSPENDED) {
    throw new AppError("account suspended", 403);
  }

  if (user.status === UserStatus.INACTIVE) {
    throw new AppError("account inactive", 403);
  }
};
export const createUser = async (
  data: CreateUserDto,
): Promise<UserResponse> => {
  validateRequestBodyWithValues<CreateUserDto>(data, [
    "name",
    "email",
    "password",
  ]);

  const exits = await User.findOne({ email: data.email });

  if (exits) {
    throw new AppError("user already exits", 409);
  }

  const hashPasssword = await bcrypt.hash(data.password, 12);
  const verification = createEmailVerificationToken();

  const user = await User.create({
    name: data.name,
    email: data.email,
    password: hashPasssword,
    role: UserRole.USER,
    isEmailVerified: false,
    verificationToken: verification.tokenHash,
    verificationTokenExpiresAt: verification.expiresAt,
  });

  await sendUserVerificationEmail({
    email: user.email,
    name: user.name,
    verificationToken: verification.token,
  });

  return {
    _id: user._id.toString(),
    name: user.name,
    email: user.email,
    status: user.status,
    createdAt: user.createdAt,
  };
};

export const loginUser = async (
  data: LoginUserDto,
  ip: string | undefined,
  userAgent: string | undefined,
): Promise<LoginResponseDto> => {
  validateRequestBodyWithValues<LoginUserDto>(data, ["email", "password"]);

  const user = await User.findOne({ email: data.email });

  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  ensureUserCanAuthenticate(user);

  if (user.isEmailVerified === false) {
    throw new AppError("Please verify your email before logging in", 403);
  }

  const isPassword = await bcrypt.compare(data.password, user.password);

  if (!isPassword) {
    throw new AppError("Invalid email or password", 401);
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
    id: user._id.toString(),
    email: user.email,
    role: user.role,
  });
  const refreshToken = generateRefreshToken({
    id: user._id.toString(),
    email: user.email,
    role: user.role,
  });

  await refreshTokenModel.create({
    user: user._id,
    tokenHash: hashToken(refreshToken),
    ip,
    userAgent,
    expiresAt: getRefreshTokenExpiry(),
  });

  return {
    token,
    accessToken: token,
    refreshToken,
    expiresIn: ACCESS_TOKEN_EXPIRES_IN_SECONDS,
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    },
  };
};

export const verifyUserEmail = async (data: VerifyEmailDto): Promise<string> => {
  validateRequestBodyWithValues<VerifyEmailDto>(data, ["token"]);

  const user = await User.findOne({
    verificationToken: hashToken(data.token),
    verificationTokenExpiresAt: { $gt: new Date() },
  });

  if (!user) {
    throw new AppError("Invalid or expired verification token", 400);
  }

  user.isEmailVerified = true;
  user.verificationToken = undefined as any;
  user.verificationTokenExpiresAt = undefined as any;
  await user.save();

  return "Email verified successfully";
};

export const resendUserVerificationEmail = async (
  data: ResendVerificationDto,
): Promise<string> => {
  validateRequestBodyWithValues<ResendVerificationDto>(data, ["email"]);

  const user = await User.findOne({ email: data.email });
  if (!user) {
    return "If an account exists, a verification email has been sent";
  }

  if (user.isEmailVerified) {
    return "Email is already verified";
  }

  const verification = createEmailVerificationToken();
  user.verificationToken = verification.tokenHash;
  user.verificationTokenExpiresAt = verification.expiresAt;
  await user.save();

  await sendUserVerificationEmail({
    email: user.email,
    name: user.name,
    verificationToken: verification.token,
  });

  return "If an account exists, a verification email has been sent";
};

export const forgotUserPassword = async (
  data: ForgotPasswordDto,
): Promise<string> => {
  validateRequestBodyWithValues<ForgotPasswordDto>(data, ["email"]);

  const user = await User.findOne({ email: data.email });
  if (!user) {
    return "If an account exists, a password reset email has been sent";
  }

  const reset = createPasswordResetToken();
  user.resetPasswordToken = reset.tokenHash;
  user.resetPasswordTokenExpiresAt = reset.expiresAt;
  await user.save();

  const resetLink = `${getAuthUrl()}/reset-password?token=${reset.token}`;
  await sendPasswordResetEmail(user.email, user.name, resetLink);

  return "If an account exists, a password reset email has been sent";
};

export const resetUserPassword = async (
  data: ResetPasswordDto,
): Promise<string> => {
  validateRequestBodyWithValues<ResetPasswordDto>(data, ["token", "password"]);

  const user = await User.findOne({
    resetPasswordToken: hashToken(data.token),
    resetPasswordTokenExpiresAt: { $gt: new Date() },
  });

  if (!user) {
    throw new AppError("Invalid or expired reset token", 400);
  }

  user.password = await bcrypt.hash(data.password, 12);
  user.resetPasswordToken = undefined as any;
  user.resetPasswordTokenExpiresAt = undefined as any;
  await user.save();

  await refreshTokenModel.updateMany(
    { user: user._id, revokedAt: { $exists: false } },
    { revokedAt: new Date() },
  );

  return "Password reset successfully";
};

export const refreshAuthToken = async (
  data: RefreshTokenDto,
  ip: string | undefined,
  userAgent: string | undefined,
): Promise<LoginResponseDto> => {
  validateRequestBodyWithValues<RefreshTokenDto>(data, ["refreshToken"]);

  let decoded;
  try {
    decoded = verifyRefreshToken(data.refreshToken);
  } catch (error) {
    throw new AppError("invalid refresh token", 401);
  }

  const tokenHash = hashToken(data.refreshToken);
  const storedToken = await refreshTokenModel.findOne({ tokenHash });

  if (!storedToken) {
    throw new AppError("refresh session not found", 401);
  }

  if (storedToken.revokedAt) {
    await refreshTokenModel.updateMany(
      { user: storedToken.user, revokedAt: { $exists: false } },
      { revokedAt: new Date() },
    );
    throw new AppError("refresh token already used or revoked", 401);
  }

  if (storedToken.expiresAt.getTime() <= Date.now()) {
    storedToken.revokedAt = new Date();
    await storedToken.save();
    throw new AppError("refresh token expired", 401);
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    throw new AppError("user not found", 404);
  }

  ensureUserCanAuthenticate(user);

  const token = generateToken({
    id: user._id.toString(),
    email: user.email,
    role: user.role,
  });
  const refreshToken = generateRefreshToken({
    id: user._id.toString(),
    email: user.email,
    role: user.role,
  });
  const newTokenHash = hashToken(refreshToken);

  storedToken.revokedAt = new Date();
  storedToken.replacedByTokenHash = newTokenHash;
  await storedToken.save();

  await refreshTokenModel.create({
    user: user._id,
    tokenHash: newTokenHash,
    ip,
    userAgent,
    expiresAt: getRefreshTokenExpiry(),
  });

  return {
    token,
    accessToken: token,
    refreshToken,
    expiresIn: ACCESS_TOKEN_EXPIRES_IN_SECONDS,
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    },
  };
};

export const logoutUser = async (
  data: LogoutDto,
  userId: string | undefined,
): Promise<string> => {
  let storedToken = null;

  if (data.refreshToken) {
    storedToken = await refreshTokenModel.findOne({
      tokenHash: hashToken(data.refreshToken),
    });
  }

  if (data.allDevices) {
    const sessionUserId = userId || storedToken?.user.toString();

    if (!sessionUserId) {
      throw new AppError("Unauthorized", 401);
    }

    await refreshTokenModel.updateMany(
      { user: sessionUserId, revokedAt: { $exists: false } },
      { revokedAt: new Date() },
    );
    return "logged out from all devices";
  }

  validateRequestBodyWithValues<{ refreshToken?: string }>(data, [
    "refreshToken",
  ]);

  if (!storedToken || storedToken.revokedAt) {
    return "logged out";
  }

  if (userId && storedToken.user.toString() !== userId) {
    throw new AppError("Unauthorized", 401);
  }

  storedToken.revokedAt = new Date();
  await storedToken.save();

  return "logged out";
};

export const editUser = async (
  id: string,
  data: editUserDto,
): Promise<UserResponse> => {
  validateRequestBodyWithValues<editUserDto>(data, []);
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
  } else {
    throw new AppError("cant update", 500);
  }
};

export const fetchNonAdminUsers = async (): Promise<NonAdminUsers> => {
  const users = await User.find({ role: { $ne: "admin" } }, { password: 0 });

  return users.map((user) => ({
    _id: user._id,
    name: user.name,
    email: user.email,
    status: user.status,
    createdAt: user.createdAt,
  }));
};

export const deleteUser = async (id: string): Promise<void> => {
  const user = await User.findById(id);
  if (user !== null && user.role === UserRole.ADMIN) {
    throw new AppError("cant delete an admin", 404);
  }
  await User.findByIdAndDelete(id);
};

export const deactivateUser = async (id: string): Promise<void> => {
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

export const suspendUser = async (id: string): Promise<void> => {
  const user = await User.findById(id);

  if (user !== null && user.role === UserRole.ADMIN) {
    throw new AppError("cant suspend an  admin", 404);
  }

  if (user !== null && user.status === UserStatus.SUSPENDED) {
    throw new AppError("account already suspended ", 404);
  }
  await User.findByIdAndUpdate(id, { status: UserStatus.SUSPENDED });
};

export const assignRole = async (
  id: string,
  data: AssignRole,
): Promise<string> => {
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

export const loginHistory = async (id: string) => {
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

export const userActivity = async (id: string) => {
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
export const viewProfile = async (userId: string): Promise<UserResponse> => {
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
export const addProfileImage = async (
  data: ProfileImageRequest,
  userId: string,
): Promise<ProfileImageResponse> => {
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
export const editProfile = async (
  userId: string,
  data: EditProfileRequest,
): Promise<EditProfileResponse> => {
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

  if (data.name !== undefined) user.name = data.name;
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

export const addUser = async (data: AddUserDto): Promise<UserResponse> => {
  validateRequestBodyWithValues<CreateUserDto>(data, [
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
  user.isEmailVerified = true;
  await user.save();

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

interface InviteRequestBody {
  emails: string[];
  courseId:string
  cohortId: string
}

export const inviteUser = async (data: InviteRequest) => {
  validateRequestBodyWithValues<InviteRequestBody>(data, ["emails", "courseId", "cohortId"]);

  const results = {
    sent: [] as string[],
    skipped: [] as string[],
  };

  // For now we have all the invites in promises //

  const invitePromises = data.emails.map(async (email) => {
    try {
      // check if the user with this email exits first;

      const userExists = await userModel.findOne({ email });
      if (userExists) {
        results.skipped.push(email);
        return;
      }
      // check if invites exist for this user/
      const existingInvites = await invitesModel.findOne({ email });
      if (existingInvites) {
        results.skipped.push(email);
        return;
      }

      const token = crypto.randomBytes(32).toString("hex");

      await invitesModel.create({
        email,
        courseId: data.courseId,
        cohortId: data.cohortId,
        token,
        expiresAt: Date.now() + 1000 * 60 * 60 * 24,
      });

      const inviteLink = `https://wwww.ayonaire.com/dashboard/register/accept-invite?token=${token}`;

      await sendEmailInvites(email, inviteLink);
      results.sent.push(email);
    } catch (error) {
      console.error(`failed for ${email}`, error);
      results.skipped.push(email);
    }
  });

  await Promise.all(invitePromises);

  return {
    message: "Invites Process completed",
    ...results,
  };
};

export const acceptInvite = async (data: AcceptInviteRequest):Promise<UserResponse> => {
  const { token } = data;

  if (!token) {
    throw new AppError("token is required", 400);
  }

  const invite = await invitesModel.findOne({ token: data.token });

  if (!invite || invite.used) {
    throw new AppError("Invalid or expired invite", 400);
  }

  if (!invite || !invite.expiresAt) {
    throw new AppError("invalid invite Token");
  }
  const currentTime = Date.now();

  if (currentTime > invite.expiresAt.getTime()) {
    await invitesModel.deleteOne({ _id: invite._id });
    throw new AppError("token exired for this invites", 400);
  }

  validateRequestBodyWithValues<AcceptInviteRequestBody>(data, [
    "name",
    "password",
  ]);

  
  const userExist = await userModel.findOne({ email: invite.email });

  if (userExist) {
    throw new AppError("user already exist", 404);
  }

  const hashPassword = await bcrypt.hash(data.password, 12);

  const user = await userModel.create({
    name: data.name,
    email: invite.email,
    password: hashPassword,
    isEmailVerified: true,
  });

  if (invite.courseId) {
    const enrollmentExist = await await enrollmentModel.findOne({
      student: user._id,
      course: invite.courseId,
    });

    if (enrollmentExist) {
      throw new AppError("student already exits", 400);
    }

    await enrollmentModel.create({
      student: user._id,
      course: invite.courseId,
    });

    await courseModel.findByIdAndUpdate(invite.courseId, {
      $push: { students: user._id },
    });
  }

  if (invite.cohortId) {
    const cohort = await cohortModel.findById(invite.cohortId);

    if (!cohort) {
      throw new AppError("cant find cohhort", 404);
    }

    await cohortModel.findByIdAndUpdate(invite.cohortId, {
      $push: { student: user._id },
    });
  }

  invite.used = true;
  await invite.save();

  return {
     _id: user._id.toString(),
    name: user.name,
    email: user.email,
    status: user.status,
    createdAt: user.createdAt,
  }
};





