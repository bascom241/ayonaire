import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import { connecToDB } from "./utils/db.js";

console.log("Starting server...");

// Check environment variables
console.log("ENV CHECK:", {
  PORT: process.env.PORT || "NOT SET",
  MONGO_URI: process.env.MONGO_URI ? "SET" : "NOT SET",
});

const port = Number(process.env.PORT) || 3000;

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

    app.listen(port, "0.0.0.0", () => {
      console.log(`🚀 Server running on port ${port}`);
    });

  } catch (err) {
    console.error("❌ Startup error:", err);
    process.exit(1);
  }
};

startServer();