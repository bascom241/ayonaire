import mongoose, { Schema } from "mongoose";
const refreshTokenSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    tokenHash: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    replacedByTokenHash: String,
    ip: String,
    userAgent: String,
    expiresAt: {
        type: Date,
        required: true,
        index: { expires: 0 },
    },
    revokedAt: Date,
}, { timestamps: true });
export default mongoose.model("RefreshToken", refreshTokenSchema);
