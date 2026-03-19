import { AppError } from "../errors/AppError.js";
export const errorHanlder = (err, _req, res, _next) => {
    let statusCode = 500;
    let message = "Internal server error";
    if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message;
    }
    res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
};
