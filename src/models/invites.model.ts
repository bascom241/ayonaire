import mongoose, { model, Schema } from "mongoose";

const inviteSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "email is required"],
    },
    courseId: {
      type: mongoose.Types.ObjectId,
      required: [true, "courseId is required"],
    },
    cohortId: {
      type: mongoose.Types.ObjectId,
      required: [true, "cohortId id required"],
    },
    token: {
      type: String,
    },
    expiresAt: Date,
    used: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export default mongoose.model("Invite", inviteSchema);
