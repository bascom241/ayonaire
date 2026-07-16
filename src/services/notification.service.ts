import { AppError } from "../errors/AppError.js";
import notificationModel from "../models/notification.model.js";
import userModel from "../models/user.model.js";
import courseModel from "../models/course.model.js";
import cohortModel from "../models/cohort.model.js";
import { UserRole } from "../types/user.types.js";
import {
  CreateNotificationRequest,
  NotificationRecipientType,
  NotificationStatus,
  UpdateNotificationRequest,
} from "../types/notification.types.js";
import { getPagination } from "../utils/getPagination.js";
import { validateRequestBodyWithValues } from "../utils/validateRequestBody.js";
import { sendBulkNotificationEmail } from "../config/mail.js";

const resolveRecipientEmails = async (
  recipientType: string | undefined,
  recipients: string[] | undefined,
  courseId: string | undefined,
  cohortId: string | undefined,
): Promise<string[]> => {
  if (cohortId) {
    const cohort = await cohortModel.findById(cohortId).populate("students", "email");
    return (cohort?.students as any[])?.map((s) => s.email) || [];
  }

  if (courseId) {
    const course = await courseModel.findById(courseId).populate("students", "email");
    return (course?.students as any[])?.map((s) => s.email) || [];
  }

  if (recipientType === NotificationRecipientType.SPECIFIC_USERS && recipients?.length) {
    const users = await userModel.find({ _id: { $in: recipients } }, "email");
    return users.map((u) => u.email);
  }

  if (recipientType === NotificationRecipientType.STUDENTS) {
    const users = await userModel.find({ role: UserRole.USER }, "email");
    return users.map((u) => u.email);
  }

  if (recipientType === NotificationRecipientType.INSTRUCTORS) {
    const users = await userModel.find({ role: UserRole.INSTRUCTOR }, "email");
    return users.map((u) => u.email);
  }

  // ALL
  const users = await userModel.find({}, "email");
  return users.map((u) => u.email);
};

export const createNotification = async (
  userId: string,
  data: CreateNotificationRequest,
) => {
  validateRequestBodyWithValues<CreateNotificationRequest>(data, [
    "name",
    "message",
  ]);

  const status =
    data.status ||
    (data.sendOption === "schedule" ? "scheduled" : "draft");

  const notification = await notificationModel.create({
    name: data.name,
    message: data.message,
    type: data.type,
    recipientType: data.recipientType,
    recipients: data.recipients,
    course: data.course,
    cohort: data.cohort,
    channel: data.channel,
    sendOption: data.sendOption,
    scheduledAt: data.scheduledAt,
    isRecurringTemplate: data.isRecurringTemplate,
    status,
    createdBy: userId,
  });

  if (data.sendOption === "now" || data.status === "sent") {
    return sendNotificationNow(notification._id.toString());
  }

  return notification;
};

export const sendNotificationNow = async (notificationId: string) => {
  const notification = await notificationModel.findById(notificationId);
  if (!notification) {
    throw new AppError("notification not found", 404);
  }

  let successCount = 0;
  let failedCount = 0;

  if (
    notification.channel === "email" ||
    notification.channel === "both" ||
    notification.type === "email" ||
    notification.type === "both"
  ) {
    const emails = await resolveRecipientEmails(
      notification.recipientType,
      notification.recipients?.map((r) => r.toString()),
      notification.course?.toString(),
      notification.cohort?.toString(),
    );

    const result = await sendBulkNotificationEmail(
      emails,
      notification.name,
      notification.message,
    );
    successCount = result.success;
    failedCount = result.failed;
  } else {
    // in-app only notifications count all resolved recipients as delivered
    const emails = await resolveRecipientEmails(
      notification.recipientType,
      notification.recipients?.map((r) => r.toString()),
      notification.course?.toString(),
      notification.cohort?.toString(),
    );
    successCount = emails.length;
  }

  notification.status = NotificationStatus.SENT;
  notification.sentAt = new Date();
  notification.stats = { successCount, failedCount };
  await notification.save();

  return notification;
};

export const listNotifications = async (query: any) => {
  const { page, limit, skip } = getPagination(query);

  const filter: Record<string, any> = {};
  if (query.type) filter.type = query.type;
  if (query.status) filter.status = query.status;
  if (query.channel) filter.channel = query.channel;
  if (query.isRecurringTemplate !== undefined)
    filter.isRecurringTemplate = query.isRecurringTemplate === "true";

  const [notifications, total] = await Promise.all([
    notificationModel
      .find(filter)
      .populate("course", "title")
      .populate("cohort", "name")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }),
    notificationModel.countDocuments(filter),
  ]);

  return {
    notifications,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

export const getNotificationById = async (id: string) => {
  const notification = await notificationModel.findById(id);
  if (!notification) {
    throw new AppError("notification not found", 404);
  }
  return notification;
};

export const updateNotification = async (
  id: string,
  data: UpdateNotificationRequest,
) => {
  const notification = await notificationModel.findById(id);
  if (!notification) {
    throw new AppError("notification not found", 404);
  }

  if (notification.status === NotificationStatus.SENT) {
    throw new AppError("cannot edit a notification that has already been sent", 400);
  }

  if (data.name !== undefined) notification.name = data.name;
  if (data.message !== undefined) notification.message = data.message;
  if (data.status !== undefined) notification.status = data.status as any;
  if (data.scheduledAt !== undefined)
    notification.scheduledAt = data.scheduledAt as any;

  await notification.save();
  return notification;
};

export const deleteNotification = async (id: string) => {
  const notification = await notificationModel.findByIdAndDelete(id);
  if (!notification) {
    throw new AppError("notification not found", 404);
  }
};
