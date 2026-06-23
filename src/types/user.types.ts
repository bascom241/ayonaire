import { Types } from "mongoose";

export enum UserRole {
  ADMIN = "admin",
  INSTRUCTOR = "instructor",
  USER = "user",
}

export enum UserStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  SUSPENDED = "suspended",
  PEDNDING = "pending",
}

export interface loginHistory {
  ip: String ;
  userAgent: string;
  loggedInAt: {
    type: Date;
  };
}

export interface Activity {
  ip: String;
  userAgent: String;
  loggedInAt: {
    type: Date;
  };
}

export interface Profile {
  url : string
  publicId: string
}

export interface User {
  _id?: string;
  name: string;
  email: string;
  password: string;
  profile?: Profile | null;
  bio?: string;
  linkedin?: string;
  website?: string;
  company?: string;
  instagram?: string;
  role: UserRole;
  status: UserStatus;
  isEmailVerified: boolean;
  loginHistory: loginHistory[]
  cohorts: [Types.ObjectId]
  activity: Activity[]
  createdAt: Date;
  updatedAt: Date;
  verificationToken: string;
  verificationTokenExpiresAt: Date;
  resetPasswordToken: string;
  resetPasswordTokenExpiresAt: Date;
}

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
}

export interface VerifyEmailDto {
  token: string;
}

export interface ResendVerificationDto {
  email: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  token: string;
  password: string;
}

export interface AddUserDto {
  name: string;
  email: string
  role: string 
  status: string 
  password: string 
  courseId: string 
  cohortId: string 
}

export interface LoginUserDto {
  email: string;
  password: string;
}

export interface LoginResponseDto {
  token: string;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
  };
}

export interface RefreshTokenDto {
  refreshToken: string;
}

export interface LogoutDto {
  refreshToken?: string;
  allDevices?: boolean;
}

export interface TokenPayload {
  id: string;
  email: string;
  role: string;
}
export interface UserResponse {
  _id?: string;
  name: string;
  email: string;
  profile?: {
    url: string;
    publicId: string;
  } | undefined | null
  bio?: string;
  linkedin?: string;
  website?: string;
  company?: string;
  instagram?: string;
  status: UserStatus;
  createdAt: Date;
}

export interface NonAdminUser {
  _id: string;
  name: string;
  email: string;
  status: UserStatus;
  createdAt: Date;
}

export type NonAdminUsers = NonAdminUser[];

export interface editUserDto {
  email: string;
  name: string;
}

export interface UserParams {
  id: string;
}

export interface DeactivateUser {
  status: string;
}

export interface AssignRole {
  role: string;
}



export interface ProfileData {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
}

export interface ProfileImageRequest {
  profile: ProfileData
}

export interface ProfileImageResponse {
  profile?: {
    url: string;
    publicId: string;
  } | undefined | null
}


export interface EditProfileRequest {
  name?: string
  bio?: string
  linkedin?: string
  website?: string
  company?: string
  instagram?: string
  profile?: ProfileData
}

export interface EditProfileResponse {
  name: string 
  bio?: string;
  linkedin?: string;
  website?: string;
  company?: string;
  instagram?: string;
   profile?: {
    url: string;
    publicId: string;
  } | undefined | null
}

export type LeaderboardPeriod = "all-time" | "month" | "week";

export interface LeaderboardEntry {
  rank: number;
  user: {
    id: string;
    name: string;
    email: string;
    profile?: {
      url: string;
      publicId: string;
    } | null;
  };
  badge: string | null;
  points: number;
  services: string[];
}

export interface InviteRequest{
  emails: string[]
  courseId: string,
  cohortId: string
}
export interface AcceptInviteRequest {
  token: string
  name: string
  password: string
}

export interface AcceptInviteRequestBody {

  name: string
  password: string
}


export interface CsvRequestBody {
  file:any
}
