import { bulkActionForOrder, editOrder, handlePaystackWebhook, initializePayment, payHistory, viewSingleOrder, addOrderNote, getPaymentAnalytics, getStudentPurchases, } from "../services/payment.service.js";
import crypto from "crypto";
import { AppError } from "../errors/AppError.js";
export const pay = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const email = req.user?.email;
        const dataToSend = {
            courseId: req.body.courseId,
        };
        const data = await initializePayment(dataToSend, userId, email);
        res
            .status(200)
            .json({ success: true, message: "Payment initialized", data });
    }
    catch (error) {
        next(error);
    }
};
export const handlePayWebHook = async (req, res, next) => {
    try {
        const paystackSecret = process.env.PAYSTACK_SECRET;
        if (!paystackSecret) {
            throw new Error("PAYSTACK_SECRET is not set in environment variables");
        }
        const hash = crypto
            .createHmac("sha512", paystackSecret)
            .update(JSON.stringify(req.body))
            .digest("hex");
        if (hash !== req.headers["x-paystack-signature"]) {
            return res.sendStatus(401);
        }
        const webhookEvent = {
            event: req.body.event,
            data: {
                reference: req.body.data.reference,
                channel: req.body.data.channel,
                metadata: {
                    studentId: req.body.data.metadata.studentId,
                    courseId: req.body.data.metadata.courseId,
                    billingAddress: req.body.data.metadata.billingAddress,
                    shippingAddress: req.body.data.metadata.shippingAddress,
                },
            },
        };
        await handlePaystackWebhook(webhookEvent);
        return res.sendStatus(200);
    }
    catch (error) {
        console.error("Paystack webhook error:", error);
        res.sendStatus(500);
    }
};
export const paymentHistory = async (req, res, next) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const search = typeof req.query.search === "string" ? req.query.search : "";
        const order = req.query.order === "asc" || req.query.order === "desc"
            ? req.query.order
            : "desc";
        const sortBy = typeof req.query.sortBy === "string" ? req.query.sortBy : "createdAt";
        const dataToSend = {
            page,
            limit,
            search,
            order,
            sortBy,
        };
        const data = await payHistory(dataToSend);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
export const bulkEdit = async (req, res, next) => {
    try {
        const dataToSend = {
            orderIds: req.body.orderIds,
            Completed: req.body.completed,
            Onhold: req.body.onhold,
            Cancelled: req.body.cancelled,
            Revoke: req.body.revoke,
            Refund: req.body.refund,
            Delete: req.body.delete,
            Processing: req.body.processing,
        };
        const data = await bulkActionForOrder(dataToSend);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
export const edit = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const dataToSend = {
            orderId: req.body.orderId,
            billingAddress: req.body.billingAddress,
            shippingAddress: req.body.shippingAddress,
        };
        const data = await editOrder(dataToSend, userId);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
export const viewSingle = async (req, res, next) => {
    try {
        const orderId = req.params.orderId;
        if (!orderId || typeof orderId !== "string") {
            throw new AppError("order id is missing or Invalid format", 400);
        }
        const data = await viewSingleOrder({ orderId });
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
export const addNote = async (req, res, next) => {
    try {
        const authorId = req.user?.id;
        if (!authorId)
            throw new AppError("Unauthorized", 401);
        const orderId = req.params.orderId;
        if (!req.body.content) {
            throw new AppError("content is required", 400);
        }
        const data = await addOrderNote(orderId, authorId, req.body.content, req.body.isPrivate);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
export const analytics = async (req, res, next) => {
    try {
        const data = await getPaymentAnalytics();
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
export const studentPurchases = async (req, res, next) => {
    try {
        const data = await getStudentPurchases(req.query);
        res.status(200).json({ success: true, ...data });
    }
    catch (error) {
        next(error);
    }
};
