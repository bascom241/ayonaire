import mongoose, { Schema } from "mongoose";
const chatEventSchema = new Schema({
    roomId: { type: Schema.Types.ObjectId, ref: "Room", required: true, index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, maxlength: 120 },
    startsAt: { type: Date, required: true },
    endsAt: { type: Date, required: true },
    meetingUrl: { type: String },
}, { timestamps: true });
chatEventSchema.index({ roomId: 1, startsAt: 1 });
export default mongoose.model("ChatEvent", chatEventSchema);
