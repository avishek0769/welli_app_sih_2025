import ApiError from "../utils/ApiError.js";

const errorHandler = (err, req, res, next) => {
    // If error is already an instance of ApiError, use it as is
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            statusCode: err.statusCode
        });
    }

    // Default to 500 server error
    return res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
        statusCode: err.statusCode || 500,
    });
};

export default errorHandler;