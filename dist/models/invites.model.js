import mongoose from "mongoose";
const inviteSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, "email is required"],
    },
    courseId: {
        type: mongoose.Types.ObjectId,
    },
    cohortId: {
        type: mongoose.Types.ObjectId,
    },
    role: {
        type: String,
        enum: ["user", "instructor", "admin"],
        default: "user",
    },
    token: {
        type: String,
    },
    expiresAt: Date,
    used: { type: Boolean, default: false },
}, { timestamps: true });
export default mongoose.model("Invite", inviteSchema);
