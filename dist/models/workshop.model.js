import mongoose, { Schema } from "mongoose";
import { PlatformName, WorkShopStatus } from "../types/workShop.types.js";
const platFormSchema = new Schema({
    name: {
        type: String,
        required: "Platform Name is Required",
    },
    link: {
        type: String,
        required: [true, "Platform Link is required"]
    },
    type: {
        type: String,
        enum: Object.values(PlatformName),
        required: [true, "Platform name is required"]
    }
}, { _id: false });
const workShopSchema = new Schema({
    title: {
        type: String,
        required: [true, "workshop name is required"]
    },
    description: {
        type: String,
        required: [true, "workshop description is required"]
    },
    platform: {
        type: platFormSchema,
        required: [true, 'Platform information is required']
    },
    status: {
        type: String,
        enum: Object.values(WorkShopStatus),
        default: WorkShopStatus.UPCOMING,
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    endDate: {
        type: Date,
        required: [true, "End Date is required"]
    }
});
export default mongoose.model("WorkShop", workShopSchema);
