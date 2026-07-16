import mongoose, { Schema } from "mongoose";

const replySchema = new Schema(
  {
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const supportTicketSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "user is required"],
    },
    subject: {
      type: String,
      required: [true, "subject is required"],
    },
    message: {
      type: String,
      required: [true, "message is required"],
    },
    category: {
      type: String,
      default: "general",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["open", "in-progress", "resolved", "closed"],
      default: "open",
    },
    replies: [replySchema],
  },
  { timestamps: true },
);

export default mongoose.model("SupportTicket", supportTicketSchema);
