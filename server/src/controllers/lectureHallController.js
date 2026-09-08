const pool = require('../config/database');
const { sendSuccess, sendError } = require('../services/responseService');
const { validateLectureHall } = require('../validations');

const getAllLectureHalls = async (req, res, next) => {
    try {
        const { floor_side_id, building_id, floor_id } = req.query;

        let query = `
            SELECT lh.*, fs.side_name, f.floor_id, f.floor_number, f.floor_name, b.building_id, b.building_code, b.building_name
            FROM lecture_halls lh
            JOIN floor_sides fs ON lh.floor_side_id = fs.floor_side_id
            JOIN floors f ON fs.floor_id = f.floor_id
            JOIN buildings b ON f.building_id = b.building_id
        `;
        const conditions = [];
        const params = [];

        if (floor_side_id) {
            params.push(floor_side_id);
            conditions.push(`lh.floor_side_id = $${params.length}`);
        }

        if (floor_id) {
            params.push(floor_id);
            conditions.push(`f.floor_id = $${params.length}`);
        }

        if (building_id) {
            params.push(building_id);
            conditions.push(`b.building_id = $${params.length}`);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY lh.hall_id';

        const result = await pool.query(query, params);
        return sendSuccess(res, result.rows);
    } catch (err) {
        next(err);
    }
};

const getLectureHallById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const query = `
            SELECT lh.*, fs.side_name, f.floor_id, f.floor_number, f.floor_name, b.building_id, b.building_code, b.building_name
            FROM lecture_halls lh
            JOIN floor_sides fs ON lh.floor_side_id = fs.floor_side_id
            JOIN floors f ON fs.floor_id = f.floor_id
            JOIN buildings b ON f.building_id = b.building_id
            WHERE lh.hall_id = $1
        `;
        const result = await pool.query(query, [id]);
        if (result.rows.length === 0) {
            return sendError(res, 'Lecture hall not found', 404);
        }
        return sendSuccess(res, result.rows[0]);
    } catch (err) {
        next(err);
    }
};

const createLectureHall = async (req, res, next) => {
    try {
        const errors = validateLectureHall(req.body);
        if (errors.length > 0) {
            return sendError(res, errors.join(', '), 400);
        }

        const { floor_side_id, hall_code, hall_name, description, hall_type, capacity, hall_status } = req.body;

        // Verify floor side exists
        const fsCheck = await pool.query('SELECT floor_side_id FROM floor_sides WHERE floor_side_id = $1', [floor_side_id]);
        if (fsCheck.rows.length === 0) {
            return sendError(res, 'Specified floor_side_id does not exist', 400);
        }

        // Check duplicate hall code
        const codeCheck = await pool.query('SELECT hall_id FROM lecture_halls WHERE LOWER(hall_code) = LOWER($1)', [hall_code.trim()]);
        if (codeCheck.rows.length > 0) {
            return sendError(res, `Lecture hall code '${hall_code}' already exists`, 409);
        }

        const result = await pool.query(
            `INSERT INTO lecture_halls (floor_side_id, hall_code, hall_name, description, hall_type, capacity, hall_status) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [
                floor_side_id,
                hall_code.trim(),
                hall_name.trim(),
                description ? description.trim() : null,
                hall_type ? hall_type.trim() : 'Lecture',
                capacity,
                hall_status ? hall_status.trim() : 'Active'
            ]
        );

        return sendSuccess(res, result.rows[0], 201, 'Lecture hall created successfully');
    } catch (err) {
        if (err.code === '23505') {
            return sendError(res, 'Lecture hall code already exists', 409);
        }
        next(err);
    }
};

const updateLectureHall = async (req, res, next) => {
    try {
        const { id } = req.params;
        const errors = validateLectureHall(req.body);
        if (errors.length > 0) {
            return sendError(res, errors.join(', '), 400);
        }

        const { floor_side_id, hall_code, hall_name, description, hall_type, capacity, hall_status } = req.body;

        const existing = await pool.query('SELECT hall_id FROM lecture_halls WHERE hall_id = $1', [id]);
        if (existing.rows.length === 0) {
            return sendError(res, 'Lecture hall not found', 404);
        }

        const fsCheck = await pool.query('SELECT floor_side_id FROM floor_sides WHERE floor_side_id = $1', [floor_side_id]);
        if (fsCheck.rows.length === 0) {
            return sendError(res, 'Specified floor_side_id does not exist', 400);
        }

        const codeCheck = await pool.query('SELECT hall_id FROM lecture_halls WHERE LOWER(hall_code) = LOWER($1) AND hall_id <> $2', [hall_code.trim(), id]);
        if (codeCheck.rows.length > 0) {
            return sendError(res, `Lecture hall code '${hall_code}' already exists`, 409);
        }

        const result = await pool.query(
            `UPDATE lecture_halls 
             SET floor_side_id = $1, hall_code = $2, hall_name = $3, description = $4, hall_type = $5, capacity = $6, hall_status = $7, updated_at = NOW() 
             WHERE hall_id = $8 RETURNING *`,
            [
                floor_side_id,
                hall_code.trim(),
                hall_name.trim(),
                description ? description.trim() : null,
                hall_type ? hall_type.trim() : 'Lecture',
                capacity,
                hall_status ? hall_status.trim() : 'Active',
                id
            ]
        );

        return sendSuccess(res, result.rows[0], 200, 'Lecture hall updated successfully');
    } catch (err) {
        if (err.code === '23505') {
            return sendError(res, 'Lecture hall code already exists', 409);
        }
        next(err);
    }
};

const deleteLectureHall = async (req, res, next) => {
    try {
        const { id } = req.params;

        const existing = await pool.query('SELECT hall_id FROM lecture_halls WHERE hall_id = $1', [id]);
        if (existing.rows.length === 0) {
            return sendError(res, 'Lecture hall not found', 404);
        }

        // Delete guard: check sessions referencing hall_id or original_hall_id
        const sessionCheck = await pool.query('SELECT session_id FROM lecture_sessions WHERE hall_id = $1 OR original_hall_id = $1 LIMIT 1', [id]);
        if (sessionCheck.rows.length > 0) {
            return sendError(res, 'Cannot delete lecture hall: active or historic sessions are linked to this hall', 409);
        }

        await pool.query('DELETE FROM lecture_halls WHERE hall_id = $1', [id]);
        return sendSuccess(res, null, 200, 'Lecture hall deleted successfully');
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getAllLectureHalls,
    getLectureHallById,
    createLectureHall,
    updateLectureHall,
    deleteLectureHall
};
