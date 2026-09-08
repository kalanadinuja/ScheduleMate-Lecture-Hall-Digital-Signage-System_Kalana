const pool = require('../config/database');
const { sendSuccess, sendError } = require('../services/responseService');
const { validateDigitalDisplay } = require('../validations');

const getAllDisplays = async (req, res, next) => {
    try {
        const query = `
            SELECT d.*, fs.side_name, f.floor_id, f.floor_number, f.floor_name, b.building_id, b.building_code, b.building_name
            FROM digital_displays d
            JOIN floor_sides fs ON d.floor_side_id = fs.floor_side_id
            JOIN floors f ON fs.floor_id = f.floor_id
            JOIN buildings b ON f.building_id = b.building_id
            ORDER BY d.display_id
        `;
        const result = await pool.query(query);
        return sendSuccess(res, result.rows);
    } catch (err) {
        next(err);
    }
};

const getDisplayById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const query = `
            SELECT d.*, fs.side_name, f.floor_id, f.floor_number, f.floor_name, b.building_id, b.building_code, b.building_name
            FROM digital_displays d
            JOIN floor_sides fs ON d.floor_side_id = fs.floor_side_id
            JOIN floors f ON fs.floor_id = f.floor_id
            JOIN buildings b ON f.building_id = b.building_id
            WHERE d.display_id = $1
        `;
        const result = await pool.query(query, [id]);
        if (result.rows.length === 0) {
            return sendError(res, 'Digital display not found', 404);
        }
        return sendSuccess(res, result.rows[0]);
    } catch (err) {
        next(err);
    }
};

const createDisplay = async (req, res, next) => {
    try {
        const errors = validateDigitalDisplay(req.body);
        if (errors.length > 0) {
            return sendError(res, errors.join(', '), 400);
        }

        const { display_code, display_name, floor_side_id, refresh_interval_seconds, rotation_mode, operation_mode, display_status } = req.body;

        const fsCheck = await pool.query('SELECT floor_side_id FROM floor_sides WHERE floor_side_id = $1', [floor_side_id]);
        if (fsCheck.rows.length === 0) {
            return sendError(res, 'Specified floor_side_id does not exist', 400);
        }

        const codeCheck = await pool.query('SELECT display_id FROM digital_displays WHERE LOWER(display_code) = LOWER($1)', [display_code.trim()]);
        if (codeCheck.rows.length > 0) {
            return sendError(res, `Display code '${display_code}' already exists`, 409);
        }

        const result = await pool.query(
            `INSERT INTO digital_displays 
             (display_code, display_name, floor_side_id, refresh_interval_seconds, rotation_mode, operation_mode, display_status) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [
                display_code.trim(),
                display_name.trim(),
                floor_side_id,
                refresh_interval_seconds || 30,
                rotation_mode || 'Default',
                operation_mode || 'Active',
                display_status || 'Online'
            ]
        );

        return sendSuccess(res, result.rows[0], 201, 'Digital display created successfully');
    } catch (err) {
        if (err.code === '23505') {
            return sendError(res, 'Display code already exists', 409);
        }
        next(err);
    }
};

const updateDisplay = async (req, res, next) => {
    try {
        const { id } = req.params;
        const errors = validateDigitalDisplay(req.body);
        if (errors.length > 0) {
            return sendError(res, errors.join(', '), 400);
        }

        const { display_code, display_name, floor_side_id, refresh_interval_seconds, rotation_mode, operation_mode, display_status } = req.body;

        const existing = await pool.query('SELECT display_id FROM digital_displays WHERE display_id = $1', [id]);
        if (existing.rows.length === 0) {
            return sendError(res, 'Digital display not found', 404);
        }

        const fsCheck = await pool.query('SELECT floor_side_id FROM floor_sides WHERE floor_side_id = $1', [floor_side_id]);
        if (fsCheck.rows.length === 0) {
            return sendError(res, 'Specified floor_side_id does not exist', 400);
        }

        const codeCheck = await pool.query('SELECT display_id FROM digital_displays WHERE LOWER(display_code) = LOWER($1) AND display_id <> $2', [display_code.trim(), id]);
        if (codeCheck.rows.length > 0) {
            return sendError(res, `Display code '${display_code}' already exists`, 409);
        }

        const result = await pool.query(
            `UPDATE digital_displays 
             SET display_code = $1, display_name = $2, floor_side_id = $3, refresh_interval_seconds = $4, 
                 rotation_mode = $5, operation_mode = $6, display_status = $7, last_updated = NOW(), updated_at = NOW() 
             WHERE display_id = $8 RETURNING *`,
            [
                display_code.trim(),
                display_name.trim(),
                floor_side_id,
                refresh_interval_seconds || 30,
                rotation_mode || 'Default',
                operation_mode || 'Active',
                display_status || 'Online',
                id
            ]
        );

        return sendSuccess(res, result.rows[0], 200, 'Digital display updated successfully');
    } catch (err) {
        if (err.code === '23505') {
            return sendError(res, 'Display code already exists', 409);
        }
        next(err);
    }
};

const deleteDisplay = async (req, res, next) => {
    try {
        const { id } = req.params;

        const existing = await pool.query('SELECT display_id FROM digital_displays WHERE display_id = $1', [id]);
        if (existing.rows.length === 0) {
            return sendError(res, 'Digital display not found', 404);
        }

        await pool.query('DELETE FROM digital_displays WHERE display_id = $1', [id]);
        return sendSuccess(res, null, 200, 'Digital display deleted successfully');
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getAllDisplays,
    getDisplayById,
    createDisplay,
    updateDisplay,
    deleteDisplay
};
