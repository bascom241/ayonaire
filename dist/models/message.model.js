import mongoose, { Schema } from "mongoose";
const messageSchema = new Schema({
    roomId: {
        type: Schema.Types.ObjectId,
        ref: "Room",
        required: [true, "room id is required"],
    },
    senderId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: "sender id is required",
    },
    text: {
        type: String,
    },
    editedAt: { type: Date },
    pinnedAt: { type: Date },
    pinnedBy: { type: Schema.Types.ObjectId, ref: "User" },
    replyTo: {
        type: Schema.Types.ObjectId,
        ref: "message",
    },
    threadRoot: { type: Schema.Types.ObjectId, ref: "message" },
    media: {
        type: {
            url: { type: String, required: true },
            publicId: { type: String, required: true },
        },
    },
    file: {
        type: {
            url: { type: String, required: true },
            publicId: { type: String, required: true },
        },
    },
    readBy: [
        {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    reactions: [
        {
            emoji: { type: String, required: true },
            user: { type: Schema.Types.ObjectId, ref: "User", required: true },
        },
    ],
}, { timestamps: true });
messageSchema.index({ roomId: 1, createdAt: -1, _id: -1 });
messageSchema.index({ roomId: 1, threadRoot: 1, createdAt: 1 });
export default mongoose.model("message", messageSchema);
