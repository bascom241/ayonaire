import { AppError } from "../errors/AppError.js";
export const errorHanlder = (err, _req, res, _next) => {
    let statusCode = 500;
    let message = "Internal server error";
    if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message;
    }
    if (process.env.NODE_ENV !== "test") {
        console.error(err);
    }
    res.status(statusCode).json({
        success: false,
        message,
    });
};
