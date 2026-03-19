import dotenv from "dotenv";
dotenv.config();
import app from "./app.js";
import { connecToDB } from "./utils/db.js";
console.log("🚀 Starting server...");
// 🔍 Check environment variables
console.log("🌍 ENV CHECK:", {
    PORT: process.env.PORT || "❌ NOT SET",
    MONGO_URI: process.env.MONGO_URI ? "✅ SET" : "❌ NOT SET",
});
// ✅ Always fallback to 3000
const port = Number(process.env.PORT) || 3000;
// 🔥 Catch hidden crashes
process.on("uncaughtException", (err) => {
    console.error("💥 Uncaught Exception:", err);
});
process.on("unhandledRejection", (err) => {
    console.error("💥 Unhandled Rejection:", err);
});
// ⏳ Start DB connection
console.log("⏳ Connecting to database...");
connecToDB()
    .then(() => {
    console.log("✅ Database connected successfully");
    app.listen(port, "0.0.0.0", () => {
        console.log(`🔥 Server running on port ${port}`);
    });
})
    .catch((err) => {
    console.error("❌ Database connection failed:", err);
    process.exit(1); // stop container if DB fails
});
