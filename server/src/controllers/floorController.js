const pool = require('../config/database');
const { sendSuccess, sendError } = require('../services/responseService');
const { validateFloor } = require('../validations');

const getAllFloors = async (req, res, next) => {
    try {
        const { building_id } = req.query;
        let query = `
            SELECT f.*, b.building_code, b.building_name 
            FROM floors f
            JOIN buildings b ON f.building_id = b.building_id
        `;
        const params = [];

        if (building_id) {
            query += ' WHERE f.building_id = $1';
            params.push(building_id);
        }

        query += ' ORDER BY f.building_id, f.floor_number';

        const result = await pool.query(query, params);
        return sendSuccess(res, result.rows);
    } catch (err) {
        next(err);
    }
};

const getFloorById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const query = `
            SELECT f.*, b.building_code, b.building_name 
            FROM floors f
            JOIN buildings b ON f.building_id = b.building_id
            WHERE f.floor_id = $1
        `;
        const result = await pool.query(query, [id]);
        if (result.rows.length === 0) {
            return sendError(res, 'Floor not found', 404);
        }
        return sendSuccess(res, result.rows[0]);
    } catch (err) {
        next(err);
    }
};

const createFloor = async (req, res, next) => {
    try {
        const errors = validateFloor(req.body);
        if (errors.length > 0) {
            return sendError(res, errors.join(', '), 400);
        }

        const { building_id, floor_number, floor_name, description } = req.body;

        const bCheck = await pool.query('SELECT building_id FROM buildings WHERE building_id = $1', [building_id]);
        if (bCheck.rows.length === 0) {
            return sendError(res, 'Specified building_id does not exist', 400);
        }

        const result = await pool.query(
            'INSERT INTO floors (building_id, floor_number, floor_name, description) VALUES ($1, $2, $3, $4) RETURNING *',
            [building_id, floor_number, floor_name ? floor_name.trim() : null, description ? description.trim() : null]
        );

        return sendSuccess(res, result.rows[0], 201, 'Floor created successfully');
    } catch (err) {
        if (err.code === '23505') {
            return sendError(res, 'Floor number already exists for this building', 409);
        }
        next(err);
    }
};

const updateFloor = async (req, res, next) => {
    try {
        const { id } = req.params;
        const errors = validateFloor(req.body);
        if (errors.length > 0) {
            return sendError(res, errors.join(', '), 400);
        }

        const { building_id, floor_number, floor_name, description } = req.body;

        const existing = await pool.query('SELECT floor_id FROM floors WHERE floor_id = $1', [id]);
        if (existing.rows.length === 0) {
            return sendError(res, 'Floor not found', 404);
        }

        const bCheck = await pool.query('SELECT building_id FROM buildings WHERE building_id = $1', [building_id]);
        if (bCheck.rows.length === 0) {
            return sendError(res, 'Specified building_id does not exist', 400);
        }

        const result = await pool.query(
            'UPDATE floors SET building_id = $1, floor_number = $2, floor_name = $3, description = $4, updated_at = NOW() WHERE floor_id = $5 RETURNING *',
            [building_id, floor_number, floor_name ? floor_name.trim() : null, description ? description.trim() : null, id]
        );

        return sendSuccess(res, result.rows[0], 200, 'Floor updated successfully');
    } catch (err) {
        if (err.code === '23505') {
            return sendError(res, 'Floor number already exists for this building', 409);
        }
        next(err);
    }
};

const deleteFloor = async (req, res, next) => {
    try {
        const { id } = req.params;

        const existing = await pool.query('SELECT floor_id FROM floors WHERE floor_id = $1', [id]);
        if (existing.rows.length === 0) {
            return sendError(res, 'Floor not found', 404);
        }

        const fsCheck = await pool.query('SELECT floor_side_id FROM floor_sides WHERE floor_id = $1 LIMIT 1', [id]);
        if (fsCheck.rows.length > 0) {
            return sendError(res, 'Cannot delete floor: active floor sides are linked to this floor', 409);
        }

        await pool.query('DELETE FROM floors WHERE floor_id = $1', [id]);
        return sendSuccess(res, null, 200, 'Floor deleted successfully');
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getAllFloors,
    getFloorById,
    createFloor,
    updateFloor,
    deleteFloor
};
