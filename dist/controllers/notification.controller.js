import { AppError } from "../errors/AppError.js";
import { createNotification, sendNotificationNow, listNotifications, getNotificationById, updateNotification, deleteNotification, } from "../services/notification.service.js";
export const create = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId)
            throw new AppError("Unauthorized", 401);
        const data = await createNotification(userId, req.body);
        res.status(201).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
export const getAll = async (req, res, next) => {
    try {
        const data = await listNotifications(req.query);
        res.status(200).json({ success: true, ...data });
    }
    catch (error) {
        next(error);
    }
};
export const getSingle = async (req, res, next) => {
    try {
        const notificationId = req.params.notificationId;
        const data = await getNotificationById(notificationId);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
export const update = async (req, res, next) => {
    try {
        const notificationId = req.params.notificationId;
        const data = await updateNotification(notificationId, req.body);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
export const remove = async (req, res, next) => {
    try {
        const notificationId = req.params.notificationId;
        await deleteNotification(notificationId);
        res.status(200).json({ success: true, message: "Notification deleted" });
    }
    catch (error) {
        next(error);
    }
};
export const send = async (req, res, next) => {
    try {
        const notificationId = req.params.notificationId;
        const data = await sendNotificationNow(notificationId);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
