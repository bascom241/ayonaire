import { Server } from "socket.io";
import { authenticateSocket } from "./authenticateSocket.js";
import { canAccessCourse } from "../middlewares/courseAccess.middleware.js";
import mongoose from "mongoose";
import roomModel from "../models/room.model.js";

const roomSocket = (io: Server) => {
  io.use(authenticateSocket);
  io.on("connection", (socket) => {
    socket.on("room:join", async (data, ack) => {
      const roomId = data?.roomId;
      if (typeof roomId !== "string" || !mongoose.isValidObjectId(roomId)) {
        if (typeof ack === "function") ack({ success: false });
        return;
      }
      try {
        const room = await roomModel.exists({ _id: roomId, participants: socket.data.user.id });
        if (!room) {
          if (typeof ack === "function") ack({ success: false });
          return;
        }
        await socket.join(roomId);
        if (typeof ack === "function") ack({ success: true });
      } catch {
        if (typeof ack === "function") ack({ success: false });
      }
    });

    socket.on("room:leave", (roomId) => {
      socket.leave(roomId);
    });

    socket.on("course:qna:join", async ({ courseId, lessonId }) => {
      if (!courseId) return;
      const authenticated = await new Promise<boolean>((resolve) => authenticateSocket(socket, (error) => resolve(!error)));
      if (!authenticated) return;
      try {
        if (!(await canAccessCourse(courseId, socket.data.user.id, socket.data.user.role))) return;
      } catch { return; }
      socket.join(`course:${courseId}:qna`);
      if (lessonId) {
        socket.join(`course:${courseId}:lesson:${lessonId}:qna`);
      }
    });

    socket.on("course:qna:leave", ({ courseId, lessonId }) => {
      if (!courseId) return;
      socket.leave(`course:${courseId}:qna`);
      if (lessonId) {
        socket.leave(`course:${courseId}:lesson:${lessonId}:qna`);
      }
    });

    socket.on("typing:start", ({ roomId }) => {
      if (typeof roomId !== "string" || !socket.rooms.has(roomId)) return;
      socket.to(roomId).emit("typing:start", { roomId, userId: socket.data.user.id });
    });

    // socket.on("send_message", (data)=> {
    //     io.to(data.roomId).emit("receive_message", data)
    // }) To be handled by the controller layer
  });
};

export default roomSocket;
