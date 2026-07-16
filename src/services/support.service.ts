import { AppError } from "../errors/AppError.js";
import supportTicketModel from "../models/supportTicket.model.js";
import { getPagination } from "../utils/getPagination.js";
import { validateRequestBodyWithValues } from "../utils/validateRequestBody.js";

export const createTicket = async (
  userId: string,
  data: { subject: string; message: string; category?: string; priority?: string },
) => {
  validateRequestBodyWithValues<{ subject: string; message: string }>(data, [
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

export const listTickets = async (
  userId: string,
  role: string | undefined,
  query: any,
) => {
  const { page, limit, skip } = getPagination(query);

  const filter: Record<string, any> = {};
  if (role !== "admin") filter.user = userId;
  if (query.status) filter.status = query.status;
  if (query.priority) filter.priority = query.priority;

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

const ensureTicketAccess = async (
  ticketId: string,
  userId: string,
  role: string | undefined,
) => {
  const ticket = await supportTicketModel.findById(ticketId);
  if (!ticket) {
    throw new AppError("ticket not found", 404);
  }
  if (role !== "admin" && ticket.user.toString() !== userId) {
    throw new AppError("Forbidden", 403);
  }
  return ticket;
};

export const getTicketById = async (
  ticketId: string,
  userId: string,
  role: string | undefined,
) => {
  const ticket = await ensureTicketAccess(ticketId, userId, role);
  await ticket.populate("user", "name email");
  await ticket.populate("replies.author", "name role");
  return ticket;
};

export const replyToTicket = async (
  ticketId: string,
  userId: string,
  role: string | undefined,
  message: string,
) => {
  if (!message) {
    throw new AppError("message is required", 400);
  }

  const ticket = await ensureTicketAccess(ticketId, userId, role);

  ticket.replies.push({
    author: userId as any,
    message,
    createdAt: new Date(),
  } as any);

  if (role === "admin" && ticket.status === "open") {
    ticket.status = "in-progress" as any;
  }

  await ticket.save();
  return ticket;
};

export const updateTicketStatus = async (ticketId: string, status: string) => {
  const ticket = await supportTicketModel.findByIdAndUpdate(
    ticketId,
    { status },
    { new: true, runValidators: true },
  );
  if (!ticket) {
    throw new AppError("ticket not found", 404);
  }
  return ticket;
};
