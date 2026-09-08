const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const { sendSuccess, sendError } = require('../services/responseService');

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return sendError(res, 'Email and password are required', 400);
        }

        const query = 'SELECT admin_id, name, email, password_hash, role FROM admins WHERE LOWER(email) = LOWER($1)';
        const result = await pool.query(query, [email.trim()]);

        if (result.rows.length === 0) {
            return sendError(res, 'Invalid email or password', 401);
        }

        const admin = result.rows[0];

        // Check password using bcrypt or plain text fallback if not hashed yet
        let isMatch = false;
        if (admin.password_hash.startsWith('$2b$') || admin.password_hash.startsWith('$2a$')) {
            isMatch = await bcrypt.compare(password, admin.password_hash);
        } else {
            isMatch = (password === admin.password_hash);
        }

        if (!isMatch) {
            return sendError(res, 'Invalid email or password', 401);
        }

        const secret = process.env.JWT_SECRET || 'schedulemate_secret';
        const expiresIn = process.env.JWT_EXPIRES_IN || '8h';

        const payload = {
            admin_id: admin.admin_id,
            email: admin.email,
            role: admin.role
        };

        const token = jwt.sign(payload, secret, { expiresIn });

        return sendSuccess(res, {
            token,
            admin: {
                admin_id: admin.admin_id,
                name: admin.name,
                email: admin.email,
                role: admin.role
            }
        }, 200, 'Login successful');

    } catch (err) {
        next(err);
    }
};

const getProfile = async (req, res, next) => {
    try {
        const adminId = req.admin.admin_id;
        const result = await pool.query('SELECT admin_id, name, email, role, created_at FROM admins WHERE admin_id = $1', [adminId]);
        if (result.rows.length === 0) {
            return sendError(res, 'Admin profile not found', 404);
        }
        return sendSuccess(res, result.rows[0]);
    } catch (err) {
        next(err);
    }
};

module.exports = {
    login,
    getProfile
};
