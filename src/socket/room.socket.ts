import { Server } from "socket.io";

const roomSocket = (io: Server) => {
  io.on("connection", (socket) => {
    console.log(socket.id);

    socket.on("room:join", (data) => {
      const { roomId } = data;

      socket.join(roomId);

      console.log("JOINED ROOM:", roomId);
      console.log("SOCKET ROOMS:", socket.rooms);
    });

    socket.on("room:leave", (roomId) => {
      socket.leave(roomId);
    });

    socket.on("course:qna:join", ({ courseId, lessonId }) => {
      if (!courseId) return;
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

    socket.on("typing:start", ({ roomId, user }) => {
      socket.to(roomId).emit("typing:start", user);
    });

    socket.on("user:online", (userId) => {
      socket.broadcast.emit("user:online", userId);
    });

    socket.on("disconnect", () => {
      console.log("dicsonnected");
    });

    // socket.on("send_message", (data)=> {
    //     io.to(data.roomId).emit("receive_message", data)
    // }) To be handled by the controller layer
  });
};

export default roomSocket;
