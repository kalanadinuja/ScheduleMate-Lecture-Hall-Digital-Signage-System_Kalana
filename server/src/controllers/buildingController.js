const pool = require('../config/database');
const { sendSuccess, sendError } = require('../services/responseService');
const { validateBuilding } = require('../validations');

const getAllBuildings = async (req, res, next) => {
    try {
        const query = `
            SELECT b.*, 
                   (SELECT COUNT(*)::int FROM floors f WHERE f.building_id = b.building_id) AS floor_count,
                   (SELECT COUNT(*)::int FROM lecture_halls lh JOIN floor_sides fs ON lh.floor_side_id = fs.floor_side_id JOIN floors f ON fs.floor_id = f.floor_id WHERE f.building_id = b.building_id) AS hall_count
            FROM buildings b
            ORDER BY b.building_id
        `;
        const result = await pool.query(query);
        return sendSuccess(res, result.rows);
    } catch (err) {
        next(err);
    }
};

const getBuildingById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const query = `
            SELECT b.*, 
                   (SELECT COUNT(*)::int FROM floors f WHERE f.building_id = b.building_id) AS floor_count
            FROM buildings b
            WHERE b.building_id = $1
        `;
        const result = await pool.query(query, [id]);
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

        const { building_code, building_name, location } = req.body;

        const check = await pool.query('SELECT building_id FROM buildings WHERE LOWER(building_code) = LOWER($1)', [building_code.trim()]);
        if (check.rows.length > 0) {
            return sendError(res, `Building code '${building_code}' already exists`, 409);
        }

        const result = await pool.query(
            'INSERT INTO buildings (building_code, building_name, location) VALUES ($1, $2, $3) RETURNING *',
            [building_code.trim(), building_name.trim(), location ? location.trim() : null]
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

        const { building_code, building_name, location } = req.body;

        const existing = await pool.query('SELECT building_id FROM buildings WHERE building_id = $1', [id]);
        if (existing.rows.length === 0) {
            return sendError(res, 'Building not found', 404);
        }

        const check = await pool.query('SELECT building_id FROM buildings WHERE LOWER(building_code) = LOWER($1) AND building_id <> $2', [building_code.trim(), id]);
        if (check.rows.length > 0) {
            return sendError(res, `Building code '${building_code}' already exists`, 409);
        }

        const result = await pool.query(
            'UPDATE buildings SET building_code = $1, building_name = $2, location = $3, updated_at = NOW() WHERE building_id = $4 RETURNING *',
            [building_code.trim(), building_name.trim(), location ? location.trim() : null, id]
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
