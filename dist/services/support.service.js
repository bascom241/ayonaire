import { AppError } from "../errors/AppError.js";
import supportTicketModel from "../models/supportTicket.model.js";
import { getPagination } from "../utils/getPagination.js";
import { validateRequestBodyWithValues } from "../utils/validateRequestBody.js";
export const createTicket = async (userId, data) => {
    validateRequestBodyWithValues(data, [
        "subject",
        "message",
    ]);
    return supportTicketModel.create({
        user: userId,
        subject: data.subject,
        message: data.message,
        category: data.category,
        priority: data.priority,
    });
};
export const listTickets = async (userId, role, query) => {
    const { page, limit, skip } = getPagination(query);
    const filter = {};
    if (role !== "admin")
        filter.user = userId;
    if (query.status)
        filter.status = query.status;
    if (query.priority)
        filter.priority = query.priority;
    const [tickets, total] = await Promise.all([
        supportTicketModel
            .find(filter)
            .populate("user", "name email")
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 }),
        supportTicketModel.countDocuments(filter),
    ]);
    return {
        tickets,
        pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
};
const ensureTicketAccess = async (ticketId, userId, role) => {
    const ticket = await supportTicketModel.findById(ticketId);
    if (!ticket) {
        throw new AppError("ticket not found", 404);
    }
    if (role !== "admin" && ticket.user.toString() !== userId) {
        throw new AppError("Forbidden", 403);
    }
    return ticket;
};
export const getTicketById = async (ticketId, userId, role) => {
    const ticket = await ensureTicketAccess(ticketId, userId, role);
    await ticket.populate("user", "name email");
    await ticket.populate("replies.author", "name role");
    return ticket;
};
export const replyToTicket = async (ticketId, userId, role, message) => {
    if (!message) {
        throw new AppError("message is required", 400);
    }
    const ticket = await ensureTicketAccess(ticketId, userId, role);
    ticket.replies.push({
        author: userId,
        message,
        createdAt: new Date(),
    });
    if (role === "admin" && ticket.status === "open") {
        ticket.status = "in-progress";
    }
    await ticket.save();
    return ticket;
};
export const updateTicketStatus = async (ticketId, status) => {
    const ticket = await supportTicketModel.findByIdAndUpdate(ticketId, { status }, { new: true, runValidators: true });
    if (!ticket) {
        throw new AppError("ticket not found", 404);
    }
    return ticket;
};
