import mongoose, { Schema } from "mongoose";
import { User, UserRole, UserStatus } from "../types/user.types.js";

const activitySchema = new Schema(
  {
    action: String,
    performedAt: {
      type: Date,
      default: Date.now,
    },
    meta: Object,
  },
  { _id: false },
);

const loginHistorySchema = new Schema(
  {
    ip: String,
    userAgent: String,
    loggedInAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false },
);

const userSchema = new Schema<User>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      minLength: 8,
      required: true,
    },
    profile: {
      type: {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
      },
    },
    bio: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    linkedin: {
      type: String,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
    company: {
      type: String,
      trim: true,
    },
    instagram: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
      message: `Role must be one of: ${Object.values(UserRole).join(", ")}`,
    },
    status: {
      type: String,
      enum: Object.values(UserStatus),
      default: UserStatus.ACTIVE,
      message: `Role must be one of: ${Object.values(UserStatus).join(", ")}`,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    cohorts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Cohort",
      },
    ],
    loginHistory: {
      type: [loginHistorySchema],
      default: [],
    },
    activity: {
      type: [activitySchema],
      default: [],
    },
    verificationToken: String,
    verificationTokenExpiresAt: Date,
    resetPasswordToken: String,
    resetPasswordTokenExpiresAt: Date,
  },
  { timestamps: true },
);

export default mongoose.model<User>("User", userSchema);
