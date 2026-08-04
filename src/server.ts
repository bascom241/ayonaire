import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import { connecToDB } from "./utils/db.js";
import { connectRedis } from "./config/redis.js";

import http from "http";
import { Server } from "socket.io";
import connectSocket from "./socket/index.js";

console.log("Starting server...");
const server = http.createServer(app);

export const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

connectSocket(io);

const port = Number(process.env.PORT) || 5000;

// Catch hidden crashes
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
});

// Start everything
const startServer = async () => {
  try {
    console.log("⏳ Connecting to database...");
    await connecToDB();
    console.log("✅ Database connected");

    server.listen(port, "0.0.0.0", () => {
      console.log(`🚀 Server running on port ${port}`);
    });

    // Redis is only used for response caching (see cache.middleware.ts /
    // safeCacheDel) - both are already written to degrade gracefully when
    // Redis is unreachable, so a failed/slow connection here must never
    // block server startup or crash the process.
  
  } catch (err) {
    console.error("❌ Startup error:", err);
    process.exit(1);
  }
};

startServer();


