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
export default mongoose.model("message", messageSchema);
