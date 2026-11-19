import { authenticateSocket } from "./authenticateSocket.js";
import { canAccessCourse } from "../middlewares/courseAccess.middleware.js";
import mongoose from "mongoose";
import roomModel from "../models/room.model.js";
import { assertCurrentCourseRoomAccess } from "../services/roomAccess.service.js";
const roomSocket = (io) => {
    const broadcastPresence = async (roomId) => {
        try {
            const members = await io.in(roomId).fetchSockets();
            const userIds = Array.from(new Set(members.map((member) => member.data.user?.id).filter(Boolean)));
            io.to(roomId).emit("room:presence", { roomId, userIds });
        }
        catch { /* A presence failure must not prevent messaging. */ }
    };
    io.use(authenticateSocket);
    io.on("connection", (socket) => {
        socket.on("room:join", async (data, ack) => {
            const roomId = data?.roomId;
            if (typeof roomId !== "string" || !mongoose.isValidObjectId(roomId)) {
                if (typeof ack === "function")
                    ack({ success: false });
                return;
            }
            try {
                const room = await roomModel.findOne({ _id: roomId, participants: socket.data.user.id });
                if (!room) {
                    if (typeof ack === "function")
                        ack({ success: false });
                    return;
                }
                await assertCurrentCourseRoomAccess(room, socket.data.user.id);
                await socket.join(roomId);
                void broadcastPresence(roomId);
                if (typeof ack === "function")
                    ack({ success: true });
            }
            catch {
                if (typeof ack === "function")
                    ack({ success: false });
            }
        });
        socket.on("room:leave", async (roomId) => {
            if (typeof roomId !== "string" || !socket.rooms.has(roomId))
                return;
            await socket.leave(roomId);
            void broadcastPresence(roomId);
        });
        socket.on("room:presence:request", (data) => {
            const roomId = data?.roomId;
            if (typeof roomId === "string" && socket.rooms.has(roomId))
                void broadcastPresence(roomId);
        });
        socket.on("disconnecting", () => {
            const rooms = [...socket.rooms].filter((roomId) => mongoose.isValidObjectId(roomId));
            setTimeout(() => { for (const roomId of rooms)
                void broadcastPresence(roomId); }, 0);
        });
        socket.on("course:qna:join", async ({ courseId, lessonId }) => {
            if (!courseId)
                return;
            const authenticated = await new Promise((resolve) => authenticateSocket(socket, (error) => resolve(!error)));
            if (!authenticated)
                return;
            try {
                if (!(await canAccessCourse(courseId, socket.data.user.id, socket.data.user.role)))
                    return;
            }
            catch {
                return;
            }
            socket.join(`course:${courseId}:qna`);
            if (lessonId) {
                socket.join(`course:${courseId}:lesson:${lessonId}:qna`);
            }
        });
        socket.on("course:qna:leave", ({ courseId, lessonId }) => {
            if (!courseId)
                return;
            socket.leave(`course:${courseId}:qna`);
            if (lessonId) {
                socket.leave(`course:${courseId}:lesson:${lessonId}:qna`);
            }
        });
        socket.on("typing:start", ({ roomId }) => {
            if (typeof roomId !== "string" || !socket.rooms.has(roomId))
                return;
            socket.to(roomId).emit("typing:start", { roomId, userId: socket.data.user.id });
        });
        // socket.on("send_message", (data)=> {
        //     io.to(data.roomId).emit("receive_message", data)
        // }) To be handled by the controller layer
    });
};
export default roomSocket;
