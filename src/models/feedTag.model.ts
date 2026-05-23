import mongoose, { Schema } from "mongoose";
import { FeedTag } from "../types/feed.types.js";
const feedTagSchema = new Schema({
  titles: [
    {
      type: String,
      enum: Object.values(FeedTag),
    },
  ],
});

export default mongoose.model("FeedTag", feedTagSchema);
