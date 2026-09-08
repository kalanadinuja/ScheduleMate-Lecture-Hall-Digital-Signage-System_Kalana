const { sendError } = require('../services/responseService');

// 404 Not Found Middleware
const notFoundHandler = (req, res, next) => {
    return sendError(res, `Cannot ${req.method} ${req.originalUrl} - Route not found`, 404);
};

// Global Centralized Error Handling Middleware
const globalErrorHandler = (err, req, res, next) => {
    console.error('Unhandled Error:', err.stack || err.message || err);
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    return sendError(res, message, statusCode, true);
};

module.exports = {
    notFoundHandler,
    globalErrorHandler
};
