import mongoose, { Schema } from "mongoose";

const roomSchema = new Schema({

  roomCreator: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: [true, "creator id is required"],
  },
  name: {
    type: String,
    required: [true, "room name is required"],
  },
  description: {
    type: String,
    required: [true, "description is required"]
  },
  profile: {
    type: {
      url: { type: String, required: true },
      publicId: { type: String, required: true },
    }
  }
  
}, {timestamps: true});
export default mongoose.model("Room",roomSchema);
