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
 
  profile: Profile 
  role: UserRole;
  phoneNumber: string 
  status: UserStatus;
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

export interface AddUserDto {
  name: string;
  email: string
  phoneNumber: string
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
  refreshToken?: string;
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
  name: any
  profile: ProfileData
}

export interface EditProfileResponse {
  name: string 
   profile?: {
    url: string;
    publicId: string;
  } | undefined | null
}
