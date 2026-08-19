import mongoose, { Schema } from "mongoose";
import { NotificationType, NotificationRecipientType, NotificationChannel, NotificationSendOption, NotificationStatus, } from "../types/notification.types.js";
const notificationSchema = new Schema({
    name: {
        type: String,
        required: [true, "notification name is required"],
    },
    message: {
        type: String,
        required: [true, "message is required"],
    },
    type: {
        type: String,
        enum: Object.values(NotificationType),
        default: NotificationType.REMINDER,
    },
    recipientType: {
        type: String,
        enum: Object.values(NotificationRecipientType),
        default: NotificationRecipientType.ALL,
    },
    recipients: [
        {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    course: {
        type: Schema.Types.ObjectId,
        ref: "Course",
    },
    cohort: {
        type: Schema.Types.ObjectId,
        ref: "Cohort",
    },
    channel: {
        type: String,
        enum: Object.values(NotificationChannel),
        default: NotificationChannel.IN_APP,
    },
    sendOption: {
        type: String,
        enum: Object.values(NotificationSendOption),
        default: NotificationSendOption.NOW,
    },
    scheduledAt: {
        type: Date,
    },
    isRecurringTemplate: {
        type: Boolean,
        default: false,
    },
    status: {
        type: String,
        enum: Object.values(NotificationStatus),
        default: NotificationStatus.DRAFT,
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    sentAt: {
        type: Date,
    },
    stats: {
        successCount: { type: Number, default: 0 },
        failedCount: { type: Number, default: 0 },
    },
}, { timestamps: true });
export default mongoose.model("Notification", notificationSchema);
