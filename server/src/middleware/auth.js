const jwt = require('jsonwebtoken');
const { sendError } = require('../services/responseService');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return sendError(res, 'Unauthorized: Access token is missing or invalid', 401);
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'schedulemate_secret');
        req.admin = decoded;
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return sendError(res, 'Unauthorized: Token has expired', 401);
        }
        return sendError(res, 'Unauthorized: Invalid token', 401);
    }
};

module.exports = {
    verifyToken
};
