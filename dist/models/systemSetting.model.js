import mongoose, { Schema } from "mongoose";
import { SettingCategory } from "../types/systemSetting.types.js";
const systemSettingSchema = new Schema({
    category: {
        type: String,
        enum: Object.values(SettingCategory),
        required: true,
        unique: true,
    },
    data: {
        type: Schema.Types.Mixed,
        default: {},
    },
    updatedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
}, { timestamps: true });
export default mongoose.model("SystemSetting", systemSettingSchema);
