import { Server } from "socket.io";
import roomSocket from "./room.socket.js";

const connectSocket = (io: Server) => {
  roomSocket(io);
};

export default connectSocket;
