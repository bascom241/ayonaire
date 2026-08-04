import mongoose, { Schema } from "mongoose";

const askForHelpQuestionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "user id is required"],
    },
    content: {
      type: String,
      required: [true, "content is required for a question"],
    },
    tags: [{ type: String }],
    media: {
      type: {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
      },
    },
    resolved: {
      type: Boolean,
      default: false,
    },
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    answers: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: [true, "user id is required for an answer"],
        },
        text: {
          type: String,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    shares: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

export default mongoose.model("AskForHelpQuestion", askForHelpQuestionSchema);
