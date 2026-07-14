import { Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { TokenPayload, UserStatus } from "../types/user.types.js";
import User from "../models/user.model.js";

export interface AuthedSocket extends Socket {
  data: {
    user: TokenPayload;
  };
}

export const authenticateSocket = async (
  socket: Socket,
  next: (err?: Error) => void,
) => {
  try {
    const token =
      socket.handshake.auth?.token ||
      (socket.handshake.headers?.authorization?.startsWith("Bearer ")
        ? socket.handshake.headers.authorization.split(" ")[1]
        : undefined);

    if (!token) {
      return next(new Error("Unauthorized: token missing"));
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string,
    ) as TokenPayload;

    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new Error("Unauthorized: user not found"));
    }

    if (user.status === UserStatus.SUSPENDED) {
      return next(new Error("Forbidden: account suspended"));
    }

    if (user.status === UserStatus.INACTIVE) {
      return next(new Error("Forbidden: account inactive"));
    }

    socket.data.user = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    next(new Error("Unauthorized: invalid token"));
  }
};
