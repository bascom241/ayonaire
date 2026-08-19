import mongoose from "mongoose";
import { PaymentStatus, OrderStatus, } from "../types/payment.types.js";
import paymentModel from "../models/payment.model.js";
import enrollmentModel from "../models/enrollment.model.js";
import { AppError } from "../errors/AppError.js";
import courseModel from "../models/course.model.js";
import axios from "axios";
import { EnrollmentStatus } from "../types/enrollment.types.js";
import { validateRequestBodyWithValues } from "../utils/validateRequestBody.js";
export const initializePayment = async (data, userId, email) => {
    console.log(data, userId, email);
    const paymentData = {
        course: new mongoose.Types.ObjectId(data.courseId),
    };
    const course = await courseModel.findById(paymentData.course).select("price");
    if (!course) {
        throw new AppError("course does not exists", 400);
    }
    const enrollment = await enrollmentModel.findOne({
        course: paymentData.course,
        student: userId,
        status: EnrollmentStatus.COMPLETED,
    });
    if (enrollment && enrollment.status === EnrollmentStatus.COMPLETED) {
        throw new AppError("user already enrolled for this course", 400);
    }
    const successfulPayment = await paymentModel.findOne({
        student: userId,
        course: paymentData.course,
        status: PaymentStatus.SUCCESS,
    });
    if (successfulPayment) {
        throw new AppError("Course already Paid for", 400);
    }
    const pendingPayment = await paymentModel.findOne({
        student: userId,
        course: paymentData.course,
        status: PaymentStatus.PENDING,
    });
    if (pendingPayment) {
        throw new AppError("Pending payment exits for this course", 400);
    }
    const reference = "AYONAIRE-" + Date.now();
    /// failed here
    let payment;
    try {
        payment = await paymentModel.create({
            student: new mongoose.Types.ObjectId(userId),
            course: paymentData.course,
            amount: course.price,
            reference,
            status: PaymentStatus.PENDING,
            orderStatus: OrderStatus.PENDING_PAYMENT,
            billingAddress: data.billingAddress,
            shippingAddress: data.shippingAddress,
        });
    }
    catch (err) {
        console.error("Payment create error:", err.message);
        throw new AppError("Failed to create payment record", 500);
    }
    const response = await axios.post("https://api.paystack.co/transaction/initialize", {
        email,
        amount: payment.amount * 100,
        reference,
        metadata: {
            studentId: userId?.toString(),
            courseId: paymentData.course.toString(),
        },
    }, {
        headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET}`,
        },
    });
    return response.data.data.authorization_url;
};
export const handlePaystackWebhook = async (event) => {
    if (event.event !== "charge.success") {
        return;
    }
    const { reference, metadata, channel } = event.data;
    const payment = await paymentModel.findOne({ reference });
    if (!payment) {
        throw new AppError("payment not found", 400);
    }
    if (payment.status === PaymentStatus.SUCCESS) {
        return;
    }
    if (payment.course.toString() !== metadata.courseId ||
        payment.student.toString() !== metadata.studentId) {
        throw new AppError("metadata mismatch", 400);
    }
    payment.status = PaymentStatus.SUCCESS;
    payment.orderStatus = OrderStatus.COMPLETED;
    payment.channel = channel;
    payment.paidAt = new Date();
    await payment.save();
    const existingEnrollment = await enrollmentModel.findOne({
        student: payment.student,
        course: payment.course,
        status: EnrollmentStatus.COMPLETED,
    });
    if (!existingEnrollment) {
        const enrollment = await enrollmentModel.create({
            student: payment.student,
            course: payment.course,
        });
        payment.enrollment = enrollment._id;
        await payment.save();
    }
    await courseModel.findByIdAndUpdate(metadata.courseId, {
        $addToSet: {
            students: metadata.studentId,
        },
    });
    return {
        student: payment.student,
        course: payment.course,
        enrollment: payment.enrollment,
        amount: payment.amount,
        currency: payment.currency,
        reference: payment.reference,
        channel: payment.channel,
        status: payment.status,
        paidAt: payment.paidAt,
        orderStatus: payment.orderStatus,
    };
};
export const payHistory = async (data) => {
    const { page, limit, search, order, sortBy } = data;
    const skip = (page - 1) * limit;
    const pipeline = [];
    // Pipline for student name
    pipeline.push({
        $lookup: {
            from: "users",
            let: { studentId: "$student" },
            pipeline: [
                {
                    $match: {
                        $expr: { $eq: ["$_id", "$$studentId"] },
                    },
                },
                {
                    $project: {
                        _id: 1,
                        name: 1,
                        email: 1,
                    },
                },
            ],
            // localField: "student",
            // foreignField: "_id",
            as: "student",
        },
    });
    pipeline.push({ $unwind: "$student" });
    // pipeine for course title
    pipeline.push({
        $lookup: {
            from: "courses",
            let: { courseId: "$course" },
            pipeline: [
                {
                    $match: {
                        $expr: { $eq: ["$_id", "$$courseId"] },
                    },
                },
                {
                    $project: {
                        _id: 1,
                        title: 1,
                    },
                },
            ],
            // localField: "course",
            // foreignField: "_id",
            as: "course",
        },
    });
    pipeline.push({ $unwind: "$course" });
    if (search) {
        pipeline.push({
            $match: {
                $or: [
                    { "student.name": { $regex: search, $options: "i" } },
                    { "course.title": { $regex: search, $options: "i" } },
                ],
            },
        });
    }
    pipeline.push({
        $sort: { createdAt: order === "asc" ? 1 : -1 },
    });
    // Pagination
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limit });
    const payments = await paymentModel.aggregate(pipeline);
    const total = await paymentModel.aggregate([
        ...pipeline.slice(0, -2), // remove skip + limit
        { $count: "total" },
    ]);
    return {
        data: payments,
        total: total[0]?.total || 0,
        page,
        limit,
    };
};
export const bulkActionForOrder = async (data) => {
    if (!data.orderIds || data.orderIds.length === 0) {
        throw new AppError("orderIds is required", 400);
    }
    const hasAtLeastOne = [
        data.Completed,
        data.Onhold,
        data.Cancelled,
        data.Processing,
        data.Delete,
    ].some(Boolean);
    if (!hasAtLeastOne) {
        throw new AppError("At least one action must be provided", 400);
    }
    const statusFields = [
        data.Completed,
        data.Onhold,
        data.Cancelled,
        data.Processing,
    ].filter(Boolean);
    if (statusFields.length > 1) {
        throw new AppError("Only one status action allowed at a time", 400);
    }
    const filter = { _id: { $in: data.orderIds } };
    if (data.Delete) {
        return await paymentModel.updateMany(filter, { $set: { isDeleted: true } });
    }
    const updatedFields = {};
    if (data.Cancelled)
        updatedFields.orderStatus = OrderStatus.CANCELLED;
    if (data.Completed)
        updatedFields.orderStatus = OrderStatus.COMPLETED;
    if (data.Onhold)
        updatedFields.orderStatus = OrderStatus.ON_HOLD;
    if (data.Processing)
        updatedFields.orderStatus = OrderStatus.PROCESSING;
    return await paymentModel.updateMany(filter, { $set: updatedFields });
};
export const editOrder = async (data, userId) => {
    const { orderId, billingAddress, shippingAddress } = data;
    const payment = await paymentModel.findById(orderId);
    if (!payment) {
        throw new AppError("Order not found", 404);
    }
    // This service is only reachable via the admin-only /edit-order route, so
    // any admin may edit any order's billing/shipping details.
    if (billingAddress) {
        payment.billingAddress = {
            paymentMethod: payment.billingAddress?.paymentMethod || "paystack",
            ...payment.billingAddress,
            ...billingAddress,
        };
    }
    if (shippingAddress) {
        payment.shippingAddress = {
            ...payment.shippingAddress,
            ...shippingAddress,
        };
    }
    await payment.save();
    return payment;
};
export const viewSingleOrder = async (data) => {
    validateRequestBodyWithValues(data, ["orderId"]);
    const { orderId } = data;
    const order = await paymentModel
        .findById(orderId)
        .populate("student", "name email")
        .populate("course", "title")
        .populate("notes.author", "name");
    if (!order) {
        throw new AppError("order not found", 400);
    }
    const purchaseHistory = await paymentModel
        .find({ student: order.student, isDeleted: { $ne: true } })
        .populate("course", "title")
        .sort({ createdAt: -1 })
        .limit(10);
    return {
        _id: order._id.toString(),
        student: order.student,
        course: order.course,
        amount: order.amount,
        currency: order.currency,
        reference: order.reference,
        channel: order.channel,
        status: order.status,
        paidAt: order.paidAt,
        orderStatus: order.orderStatus,
        billingAddress: order.billingAddress,
        shippingAddress: order.shippingAddress,
        notes: order.notes,
        createdAt: order.createdAt,
        purchaseHistory: purchaseHistory.map((p) => ({
            _id: p._id.toString(),
            course: p.course,
            amount: p.amount,
            status: p.status,
            orderStatus: p.orderStatus,
            createdAt: p.createdAt,
        })),
    };
};
export const addOrderNote = async (orderId, authorId, content, isPrivate = true) => {
    const order = await paymentModel.findById(orderId);
    if (!order) {
        throw new AppError("order not found", 404);
    }
    order.notes.push({
        author: new mongoose.Types.ObjectId(authorId),
        content,
        isPrivate,
        createdAt: new Date(),
    });
    await order.save();
    return order.notes;
};
export const getPaymentAnalytics = async () => {
    const [totals, monthly, platformFeeAgg] = await Promise.all([
        paymentModel.aggregate([
            { $match: { status: PaymentStatus.SUCCESS, isDeleted: { $ne: true } } },
            { $group: { _id: null, totalRevenue: { $sum: "$amount" }, count: { $sum: 1 } } },
        ]),
        paymentModel.aggregate([
            { $match: { status: PaymentStatus.SUCCESS, isDeleted: { $ne: true } } },
            {
                $group: {
                    _id: { year: { $year: "$paidAt" }, month: { $month: "$paidAt" } },
                    revenue: { $sum: "$amount" },
                },
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } },
            { $limit: 12 },
        ]),
        paymentModel.aggregate([
            { $match: { status: PaymentStatus.SUCCESS, isDeleted: { $ne: true } } },
            {
                $group: {
                    _id: "$course",
                    revenue: { $sum: "$amount" },
                },
            },
        ]),
    ]);
    const totalRevenue = totals[0]?.totalRevenue || 0;
    // Platform fee is a flat configurable percentage of gross revenue; instructor
    // payout is the remainder. No per-course revenue-share model exists yet, so
    // this is a simple global split rather than a per-instructor ledger.
    const PLATFORM_FEE_PERCENT = 15;
    const platformFees = Math.round((totalRevenue * PLATFORM_FEE_PERCENT) / 100);
    const instructorPayouts = totalRevenue - platformFees;
    return {
        totalRevenue,
        totalTransactions: totals[0]?.count || 0,
        platformFees,
        instructorPayouts,
        platformFeePercent: PLATFORM_FEE_PERCENT,
        monthlyRevenue: monthly.map((m) => ({
            year: m._id.year,
            month: m._id.month,
            revenue: m.revenue,
        })),
    };
};
export const getStudentPurchases = async (query) => {
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.max(1, parseInt(query.limit) || 10);
    const skip = (page - 1) * limit;
    const filter = { isDeleted: { $ne: true } };
    if (query.status)
        filter.status = query.status;
    const [purchases, total] = await Promise.all([
        paymentModel
            .find(filter)
            .populate("student", "name email")
            .populate("course", "title")
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 }),
        paymentModel.countDocuments(filter),
    ]);
    return {
        purchases: purchases.map((p) => ({
            _id: p._id.toString(),
            student: p.student,
            course: p.course,
            amount: p.amount,
            channel: p.channel,
            status: p.status,
            createdAt: p.createdAt,
        })),
        pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
};
