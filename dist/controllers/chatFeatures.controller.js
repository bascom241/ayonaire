import { AppError } from "../errors/AppError.js";
import { createRoomEvent, deleteRoomEvent, editMessage, getMessageThread, listPinnedMessages, listRoomEvents, markRoomRead, setAnnouncementOnly, setMessagePinned, setRoomPreference } from "../services/chatFeatures.service.js";
function auth(req) { const user = req.user; if (!user?.id)
    throw new AppError("unauthorized", 401); return { id: user.id, role: user.role ?? "" }; }
function param(req, key) { const value = req.params[key]; if (typeof value !== "string" || !value)
    throw new AppError(`${key} is required`, 400); return value; }
export const edit = async (req, res, next) => { try {
    const user = auth(req);
    res.json({ success: true, data: await editMessage(param(req, "messageId"), user.id, req.body.text) });
}
catch (error) {
    next(error);
} };
export const pinMessage = async (req, res, next) => { try {
    const user = auth(req);
    res.json({ success: true, data: await setMessagePinned(param(req, "messageId"), user.id, user.role, req.body.pinned) });
}
catch (error) {
    next(error);
} };
export const pins = async (req, res, next) => { try {
    res.json({ success: true, data: await listPinnedMessages(param(req, "roomId"), auth(req).id) });
}
catch (error) {
    next(error);
} };
export const read = async (req, res, next) => { try {
    res.json({ success: true, data: await markRoomRead(param(req, "roomId"), auth(req).id) });
}
catch (error) {
    next(error);
} };
export const preference = async (req, res, next) => { try {
    const field = req.params.preference;
    if (field !== "muted" && field !== "pinned")
        throw new AppError("Unknown preference", 400);
    res.json({ success: true, data: await setRoomPreference(param(req, "roomId"), auth(req).id, field === "muted" ? "mutedBy" : "pinnedBy", req.body.enabled) });
}
catch (error) {
    next(error);
} };
export const thread = async (req, res, next) => { try {
    res.json({ success: true, data: await getMessageThread(param(req, "roomId"), param(req, "messageId"), auth(req).id) });
}
catch (error) {
    next(error);
} };
export const events = async (req, res, next) => { try {
    res.json({ success: true, data: await listRoomEvents(param(req, "roomId"), auth(req).id) });
}
catch (error) {
    next(error);
} };
export const createEvent = async (req, res, next) => { try {
    const user = auth(req);
    res.status(201).json({ success: true, data: await createRoomEvent(param(req, "roomId"), user.id, user.role, req.body) });
}
catch (error) {
    next(error);
} };
export const deleteEvent = async (req, res, next) => { try {
    const user = auth(req);
    res.json({ success: true, data: await deleteRoomEvent(param(req, "roomId"), param(req, "eventId"), user.id, user.role) });
}
catch (error) {
    next(error);
} };
export const announcementMode = async (req, res, next) => { try {
    const user = auth(req);
    res.json({ success: true, data: await setAnnouncementOnly(param(req, "roomId"), user.id, user.role, req.body.enabled) });
}
catch (error) {
    next(error);
} };
