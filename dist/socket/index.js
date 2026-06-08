import roomSocket from "./room.socket.js";
const connectSocket = (io) => {
    roomSocket(io);
};
export default connectSocket;
