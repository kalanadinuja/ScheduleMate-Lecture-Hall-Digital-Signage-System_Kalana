/**
 * Response Service helper for consistent API response envelope.
 * Shape:
 * Success: { success: true, data?: any, message?: string }
 * Error:   { success: false, message?: string, error?: string }
 */

const sendSuccess = (res, data = null, statusCode = 200, message = undefined) => {
    const responseBody = {
        success: true
    };

    if (data !== null && data !== undefined) {
        responseBody.data = data;
    }

    if (message) {
        responseBody.message = message;
    }

    return res.status(statusCode).json(responseBody);
};

const sendError = (res, messageOrError, statusCode = 400, isServerError = false) => {
    const responseBody = {
        success: false
    };

    if (isServerError || statusCode >= 500) {
        responseBody.error = typeof messageOrError === 'string' ? messageOrError : (messageOrError?.message || 'Internal Server Error');
    } else {
        responseBody.message = typeof messageOrError === 'string' ? messageOrError : (messageOrError?.message || 'Bad Request');
    }

    return res.status(statusCode).json(responseBody);
};

module.exports = {
    sendSuccess,
    sendError
};
