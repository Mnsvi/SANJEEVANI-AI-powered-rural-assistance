import { AppError } from "../utils/AppError.js";

export const notFound = (req, res, next) => {
    next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
};

export const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || "Server error";

    if (err.code === 11000) {
        statusCode = 400;
        message = "Duplicate value: user already exists";
    }

    res.status(statusCode).json({
        success: false,
        message
    });
};