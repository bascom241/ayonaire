import { Server } from "socket.io";
import roomSocket from "./room.socket.js";
import feedSocket from "./feed.socket.js";

const connectSocket = (io: Server) => {
  roomSocket(io);
  feedSocket(io);
};

export default connectSocket;
