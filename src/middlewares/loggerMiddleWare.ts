import expressWinston from "express-winston";
import logger from "../utils/logger.js";

export const requestLogger = expressWinston.logger({
  winstonInstance: logger,
  meta: true,
  msg: "{{req.method}} {{req.url}} {{res.statusCode}} {{res.responseTime}}ms",
  colorize: true,
});
