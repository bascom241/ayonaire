import winston from "winston";
import path from "path";
const isDev = process.env.NODE_ENV !== "production";
const transports = [
    new winston.transports.Console(),
];
if (isDev) {
    const logDir = path.join(process.cwd(), "logs");
    transports.push(new winston.transports.File({ filename: path.join(logDir, "error.log"), level: "error" }), new winston.transports.File({ filename: path.join(logDir, "combined.log") }));
}
const logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(winston.format.timestamp(), winston.format.colorize(), winston.format.printf((info) => `${info.timestamp} [${info.level}]: ${info.message}`)),
    transports,
});
export default logger;
