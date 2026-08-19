import roomSocket from "./room.socket.js";
import feedSocket from "./feed.socket.js";
const connectSocket = (io) => {
    roomSocket(io);
    feedSocket(io);
};
export default connectSocket;
