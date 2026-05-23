import mongoose, { Schema } from "mongoose";
import { FeedType } from "../types/feed.types.js";
const feedSchema = new Schema(
  {
    tag: {
      type: Schema.Types.ObjectId,
      ref:"FeedTag" 
    }, 
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "user id is required"],
    },
    content: {
      type: String,
      required: [true, "content is required for a feed"],
    },
    media: {
      type: {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
      },
    },
    type: {
      type: String,
      enum: Object.values(FeedType),
      default: FeedType.FEED,
    },

    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "referenceModel",
    },

    referenceModel: {
      type: String,
      enum: ["WorkShop"],
    },
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    comments: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: [true, "user id is required for comment"],
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
    likesCount: {
      type: Number,
      default: 0,
    },
    commentCounts: {
      type: Number,
      default: 0,
    },
    reports: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
        reason: String,
      },
    ],
  },
  { timestamps: true },
);
feedSchema.index({ likes: 1 });

export default mongoose.model("Feed", feedSchema);
