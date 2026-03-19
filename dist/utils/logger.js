import winston from "winston";
// Logger configuration
const logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(winston.format.timestamp(), winston.format.colorize(), winston.format.printf((info) => `${info.timestamp} [${info.level}]: ${info.message}`)),
    transports: [
        new winston.transports.Console(), // log to console
        new winston.transports.File({ filename: "logs/error.log", level: "error" }),
        new winston.transports.File({ filename: "logs/combined.log" }),
    ],
});
export default logger;
