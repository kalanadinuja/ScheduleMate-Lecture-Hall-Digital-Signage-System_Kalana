const pool = require('../config/database');
const { sendSuccess, sendError } = require('../services/responseService');
const { validateLecturer } = require('../validations');

const getAllLecturers = async (req, res, next) => {
    try {
        const { search } = req.query;

        let query = 'SELECT * FROM lecturers';
        const params = [];

        if (search && search.trim()) {
            const searchTerm = `%${search.trim()}%`;
            query += ' WHERE full_name ILIKE $1 OR email ILIKE $1 OR lecturer_code ILIKE $1';
            params.push(searchTerm);
        }

        query += ' ORDER BY lecturer_id';

        const result = await pool.query(query, params);
        return sendSuccess(res, result.rows);
    } catch (err) {
        next(err);
    }
};

const getLecturerById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM lecturers WHERE lecturer_id = $1', [id]);
        if (result.rows.length === 0) {
            return sendError(res, 'Lecturer not found', 404);
        }
        return sendSuccess(res, result.rows[0]);
    } catch (err) {
        next(err);
    }
};

const createLecturer = async (req, res, next) => {
    try {
        const errors = validateLecturer(req.body);
        if (errors.length > 0) {
            return sendError(res, errors.join(', '), 400);
        }

        const { lecturer_code, full_name, title, email, department, contact_number } = req.body;

        // Check duplicate code or email
        const codeCheck = await pool.query('SELECT lecturer_id FROM lecturers WHERE LOWER(lecturer_code) = LOWER($1)', [lecturer_code.trim()]);
        if (codeCheck.rows.length > 0) {
            return sendError(res, `Lecturer code '${lecturer_code}' already exists`, 409);
        }

        const emailCheck = await pool.query('SELECT lecturer_id FROM lecturers WHERE LOWER(email) = LOWER($1)', [email.trim()]);
        if (emailCheck.rows.length > 0) {
            return sendError(res, `Lecturer email '${email}' already exists`, 409);
        }

        const result = await pool.query(
            `INSERT INTO lecturers (lecturer_code, full_name, title, email, department, contact_number) 
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [
                lecturer_code.trim(),
                full_name.trim(),
                title ? title.trim() : null,
                email.trim().toLowerCase(),
                department ? department.trim() : null,
                contact_number ? contact_number.trim() : null
            ]
        );

        return sendSuccess(res, result.rows[0], 201, 'Lecturer created successfully');
    } catch (err) {
        if (err.code === '23505') {
            return sendError(res, 'Lecturer code or email already exists', 409);
        }
        next(err);
    }
};

const updateLecturer = async (req, res, next) => {
    try {
        const { id } = req.params;
        const errors = validateLecturer(req.body);
        if (errors.length > 0) {
            return sendError(res, errors.join(', '), 400);
        }

        const { lecturer_code, full_name, title, email, department, contact_number } = req.body;

        const existing = await pool.query('SELECT lecturer_id FROM lecturers WHERE lecturer_id = $1', [id]);
        if (existing.rows.length === 0) {
            return sendError(res, 'Lecturer not found', 404);
        }

        const codeCheck = await pool.query('SELECT lecturer_id FROM lecturers WHERE LOWER(lecturer_code) = LOWER($1) AND lecturer_id <> $2', [lecturer_code.trim(), id]);
        if (codeCheck.rows.length > 0) {
            return sendError(res, `Lecturer code '${lecturer_code}' already exists`, 409);
        }

        const emailCheck = await pool.query('SELECT lecturer_id FROM lecturers WHERE LOWER(email) = LOWER($1) AND lecturer_id <> $2', [email.trim(), id]);
        if (emailCheck.rows.length > 0) {
            return sendError(res, `Lecturer email '${email}' already exists`, 409);
        }

        const result = await pool.query(
            `UPDATE lecturers 
             SET lecturer_code = $1, full_name = $2, title = $3, email = $4, department = $5, contact_number = $6, updated_at = NOW() 
             WHERE lecturer_id = $7 RETURNING *`,
            [
                lecturer_code.trim(),
                full_name.trim(),
                title ? title.trim() : null,
                email.trim().toLowerCase(),
                department ? department.trim() : null,
                contact_number ? contact_number.trim() : null,
                id
            ]
        );

        return sendSuccess(res, result.rows[0], 200, 'Lecturer updated successfully');
    } catch (err) {
        if (err.code === '23505') {
            return sendError(res, 'Lecturer code or email already exists', 409);
        }
        next(err);
    }
};

const deleteLecturer = async (req, res, next) => {
    try {
        const { id } = req.params;

        const existing = await pool.query('SELECT lecturer_id FROM lecturers WHERE lecturer_id = $1', [id]);
        if (existing.rows.length === 0) {
            return sendError(res, 'Lecturer not found', 404);
        }

        const sessionCheck = await pool.query('SELECT session_id FROM lecture_sessions WHERE lecturer_id = $1 LIMIT 1', [id]);
        if (sessionCheck.rows.length > 0) {
            return sendError(res, 'Cannot delete lecturer: scheduled sessions exist for this lecturer', 409);
        }

        await pool.query('DELETE FROM lecturers WHERE lecturer_id = $1', [id]);
        return sendSuccess(res, null, 200, 'Lecturer deleted successfully');
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getAllLecturers,
    getLecturerById,
    createLecturer,
    updateLecturer,
    deleteLecturer
};
