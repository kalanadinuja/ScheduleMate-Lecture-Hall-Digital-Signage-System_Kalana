const pool = require('../config/database');
const { sendSuccess, sendError } = require('../services/responseService');
const { validateFloorSide } = require('../validations');

const getAllFloorSides = async (req, res, next) => {
    try {
        const { floor_id, building_id } = req.query;
        let query = `
            SELECT fs.*, f.floor_number, f.floor_name, f.building_id, b.building_code, b.building_name
            FROM floor_sides fs
            JOIN floors f ON fs.floor_id = f.floor_id
            JOIN buildings b ON f.building_id = b.building_id
        `;
        const conditions = [];
        const params = [];

        if (floor_id) {
            params.push(floor_id);
            conditions.push(`fs.floor_id = $${params.length}`);
        }

        if (building_id) {
            params.push(building_id);
            conditions.push(`f.building_id = $${params.length}`);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY fs.floor_side_id';

        const result = await pool.query(query, params);
        return sendSuccess(res, result.rows);
    } catch (err) {
        next(err);
    }
};

const getFloorSideById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const query = `
            SELECT fs.*, f.floor_number, f.floor_name, f.building_id, b.building_code, b.building_name
            FROM floor_sides fs
            JOIN floors f ON fs.floor_id = f.floor_id
            JOIN buildings b ON f.building_id = b.building_id
            WHERE fs.floor_side_id = $1
        `;
        const result = await pool.query(query, [id]);
        if (result.rows.length === 0) {
            return sendError(res, 'Floor side not found', 404);
        }
        return sendSuccess(res, result.rows[0]);
    } catch (err) {
        next(err);
    }
};

const createFloorSide = async (req, res, next) => {
    try {
        const errors = validateFloorSide(req.body);
        if (errors.length > 0) {
            return sendError(res, errors.join(', '), 400);
        }

        const { floor_id, side_name, description, status } = req.body;

        const fCheck = await pool.query('SELECT floor_id FROM floors WHERE floor_id = $1', [floor_id]);
        if (fCheck.rows.length === 0) {
            return sendError(res, 'Specified floor_id does not exist', 400);
        }

        const result = await pool.query(
            'INSERT INTO floor_sides (floor_id, side_name, description, status) VALUES ($1, $2, $3, $4) RETURNING *',
            [floor_id, side_name.trim(), description ? description.trim() : null, status ? status.trim() : 'Active']
        );

        return sendSuccess(res, result.rows[0], 201, 'Floor side created successfully');
    } catch (err) {
        if (err.code === '23505') {
            return sendError(res, 'Floor side name already exists for this floor', 409);
        }
        next(err);
    }
};

const updateFloorSide = async (req, res, next) => {
    try {
        const { id } = req.params;
        const errors = validateFloorSide(req.body);
        if (errors.length > 0) {
            return sendError(res, errors.join(', '), 400);
        }

        const { floor_id, side_name, description, status } = req.body;

        const existing = await pool.query('SELECT floor_side_id FROM floor_sides WHERE floor_side_id = $1', [id]);
        if (existing.rows.length === 0) {
            return sendError(res, 'Floor side not found', 404);
        }

        const fCheck = await pool.query('SELECT floor_id FROM floors WHERE floor_id = $1', [floor_id]);
        if (fCheck.rows.length === 0) {
            return sendError(res, 'Specified floor_id does not exist', 400);
        }

        const result = await pool.query(
            'UPDATE floor_sides SET floor_id = $1, side_name = $2, description = $3, status = $4, updated_at = NOW() WHERE floor_side_id = $5 RETURNING *',
            [floor_id, side_name.trim(), description ? description.trim() : null, status ? status.trim() : 'Active', id]
        );

        return sendSuccess(res, result.rows[0], 200, 'Floor side updated successfully');
    } catch (err) {
        if (err.code === '23505') {
            return sendError(res, 'Floor side name already exists for this floor', 409);
        }
        next(err);
    }
};

const deleteFloorSide = async (req, res, next) => {
    try {
        const { id } = req.params;

        const existing = await pool.query('SELECT floor_side_id FROM floor_sides WHERE floor_side_id = $1', [id]);
        if (existing.rows.length === 0) {
            return sendError(res, 'Floor side not found', 404);
        }

        const hallsCheck = await pool.query('SELECT hall_id FROM lecture_halls WHERE floor_side_id = $1 LIMIT 1', [id]);
        if (hallsCheck.rows.length > 0) {
            return sendError(res, 'Cannot delete floor side: active lecture halls are linked to this floor side', 409);
        }

        const displayCheck = await pool.query('SELECT display_id FROM digital_displays WHERE floor_side_id = $1 LIMIT 1', [id]);
        if (displayCheck.rows.length > 0) {
            return sendError(res, 'Cannot delete floor side: active digital displays are linked to this floor side', 409);
        }

        await pool.query('DELETE FROM floor_sides WHERE floor_side_id = $1', [id]);
        return sendSuccess(res, null, 200, 'Floor side deleted successfully');
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getAllFloorSides,
    getFloorSideById,
    createFloorSide,
    updateFloorSide,
    deleteFloorSide
};
