import { AppError } from "../errors/AppError.js";
import { createTicket, listTickets, getTicketById, replyToTicket, updateTicketStatus, } from "../services/support.service.js";
export const create = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId)
            throw new AppError("Unauthorized", 401);
        const data = await createTicket(userId, req.body);
        res.status(201).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
export const getAll = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId)
            throw new AppError("Unauthorized", 401);
        const data = await listTickets(userId, req.user?.role, req.query);
        res.status(200).json({ success: true, ...data });
    }
    catch (error) {
        next(error);
    }
};
export const getSingle = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId)
            throw new AppError("Unauthorized", 401);
        const ticketId = req.params.ticketId;
        const data = await getTicketById(ticketId, userId, req.user?.role);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
export const reply = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId)
            throw new AppError("Unauthorized", 401);
        const ticketId = req.params.ticketId;
        const data = await replyToTicket(ticketId, userId, req.user?.role, req.body.message);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
export const updateStatus = async (req, res, next) => {
    try {
        const ticketId = req.params.ticketId;
        if (!req.body.status)
            throw new AppError("status is required", 400);
        const data = await updateTicketStatus(ticketId, req.body.status);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
