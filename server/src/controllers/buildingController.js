const pool = require('../config/database');
const { sendSuccess, sendError } = require('../services/responseService');
const { validateBuilding } = require('../validations');

const getAllBuildings = async (req, res, next) => {
    try {
        const result = await pool.query('SELECT * FROM buildings ORDER BY building_id');
        return sendSuccess(res, result.rows);
    } catch (err) {
        next(err);
    }
};

const getBuildingById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM buildings WHERE building_id = $1', [id]);
        if (result.rows.length === 0) {
            return sendError(res, 'Building not found', 404);
        }
        return sendSuccess(res, result.rows[0]);
    } catch (err) {
        next(err);
    }
};

const createBuilding = async (req, res, next) => {
    try {
        const errors = validateBuilding(req.body);
        if (errors.length > 0) {
            return sendError(res, errors.join(', '), 400);
        }

        const { building_code, building_name } = req.body;

        // Check for duplicate building_code
        const check = await pool.query('SELECT building_id FROM buildings WHERE LOWER(building_code) = LOWER($1)', [building_code.trim()]);
        if (check.rows.length > 0) {
            return sendError(res, `Building code '${building_code}' already exists`, 409);
        }

        const result = await pool.query(
            'INSERT INTO buildings (building_code, building_name) VALUES ($1, $2) RETURNING *',
            [building_code.trim(), building_name.trim()]
        );

        return sendSuccess(res, result.rows[0], 201, 'Building created successfully');
    } catch (err) {
        if (err.code === '23505') {
            return sendError(res, 'Building code already exists', 409);
        }
        next(err);
    }
};

const updateBuilding = async (req, res, next) => {
    try {
        const { id } = req.params;
        const errors = validateBuilding(req.body);
        if (errors.length > 0) {
            return sendError(res, errors.join(', '), 400);
        }

        const { building_code, building_name } = req.body;

        // Check if building exists
        const existing = await pool.query('SELECT building_id FROM buildings WHERE building_id = $1', [id]);
        if (existing.rows.length === 0) {
            return sendError(res, 'Building not found', 404);
        }

        // Check duplicate code on other building
        const check = await pool.query('SELECT building_id FROM buildings WHERE LOWER(building_code) = LOWER($1) AND building_id <> $2', [building_code.trim(), id]);
        if (check.rows.length > 0) {
            return sendError(res, `Building code '${building_code}' already exists`, 409);
        }

        const result = await pool.query(
            'UPDATE buildings SET building_code = $1, building_name = $2, updated_at = NOW() WHERE building_id = $3 RETURNING *',
            [building_code.trim(), building_name.trim(), id]
        );

        return sendSuccess(res, result.rows[0], 200, 'Building updated successfully');
    } catch (err) {
        if (err.code === '23505') {
            return sendError(res, 'Building code already exists', 409);
        }
        next(err);
    }
};

const deleteBuilding = async (req, res, next) => {
    try {
        const { id } = req.params;

        const existing = await pool.query('SELECT building_id FROM buildings WHERE building_id = $1', [id]);
        if (existing.rows.length === 0) {
            return sendError(res, 'Building not found', 404);
        }

        // Delete guard: check existing floors
        const floorsCheck = await pool.query('SELECT floor_id FROM floors WHERE building_id = $1 LIMIT 1', [id]);
        if (floorsCheck.rows.length > 0) {
            return sendError(res, 'Cannot delete building: active floors are linked to this building', 409);
        }

        await pool.query('DELETE FROM buildings WHERE building_id = $1', [id]);
        return sendSuccess(res, null, 200, 'Building deleted successfully');
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getAllBuildings,
    getBuildingById,
    createBuilding,
    updateBuilding,
    deleteBuilding
};
