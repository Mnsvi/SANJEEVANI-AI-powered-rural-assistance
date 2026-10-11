export const successResponse = (res, statusCode, data = {}, message = "Success") =>
    res.status(statusCode).json({ success: true, message, data });

export const errorResponse = (res, statusCode = 500, message = "Server error", error = null) =>
    res.status(statusCode).json({
        success: false,
        message,
        ...(error && { error })
    });