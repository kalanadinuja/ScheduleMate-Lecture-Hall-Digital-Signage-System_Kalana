const pool = require('../config/database');
const { sendSuccess, sendError } = require('../services/responseService');
const { validateModule } = require('../validations');

const getAllModules = async (req, res, next) => {
    try {
        const { department, module_type } = req.query;

        let query = 'SELECT * FROM modules';
        const conditions = [];
        const params = [];

        if (department) {
            params.push(department);
            conditions.push(`LOWER(department) = LOWER($${params.length})`);
        }

        if (module_type) {
            params.push(module_type);
            conditions.push(`LOWER(module_type) = LOWER($${params.length})`);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY module_id';

        const result = await pool.query(query, params);
        return sendSuccess(res, result.rows);
    } catch (err) {
        next(err);
    }
};

const getModuleById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM modules WHERE module_id = $1', [id]);
        if (result.rows.length === 0) {
            return sendError(res, 'Module not found', 404);
        }
        return sendSuccess(res, result.rows[0]);
    } catch (err) {
        next(err);
    }
};

const createModule = async (req, res, next) => {
    try {
        const errors = validateModule(req.body);
        if (errors.length > 0) {
            return sendError(res, errors.join(', '), 400);
        }

        const { module_code, module_name, description, department, module_type } = req.body;

        const codeCheck = await pool.query('SELECT module_id FROM modules WHERE LOWER(module_code) = LOWER($1)', [module_code.trim()]);
        if (codeCheck.rows.length > 0) {
            return sendError(res, `Module code '${module_code}' already exists`, 409);
        }

        const result = await pool.query(
            `INSERT INTO modules (module_code, module_name, description, department, module_type) 
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [
                module_code.trim(),
                module_name.trim(),
                description ? description.trim() : null,
                department ? department.trim() : null,
                module_type ? module_type.trim() : 'Core'
            ]
        );

        return sendSuccess(res, result.rows[0], 201, 'Module created successfully');
    } catch (err) {
        if (err.code === '23505') {
            return sendError(res, 'Module code already exists', 409);
        }
        next(err);
    }
};

const updateModule = async (req, res, next) => {
    try {
        const { id } = req.params;
        const errors = validateModule(req.body);
        if (errors.length > 0) {
            return sendError(res, errors.join(', '), 400);
        }

        const { module_code, module_name, description, department, module_type } = req.body;

        const existing = await pool.query('SELECT module_id FROM modules WHERE module_id = $1', [id]);
        if (existing.rows.length === 0) {
            return sendError(res, 'Module not found', 404);
        }

        const codeCheck = await pool.query('SELECT module_id FROM modules WHERE LOWER(module_code) = LOWER($1) AND module_id <> $2', [module_code.trim(), id]);
        if (codeCheck.rows.length > 0) {
            return sendError(res, `Module code '${module_code}' already exists`, 409);
        }

        const result = await pool.query(
            `UPDATE modules 
             SET module_code = $1, module_name = $2, description = $3, department = $4, module_type = $5, updated_at = NOW() 
             WHERE module_id = $6 RETURNING *`,
            [
                module_code.trim(),
                module_name.trim(),
                description ? description.trim() : null,
                department ? department.trim() : null,
                module_type ? module_type.trim() : 'Core',
                id
            ]
        );

        return sendSuccess(res, result.rows[0], 200, 'Module updated successfully');
    } catch (err) {
        if (err.code === '23505') {
            return sendError(res, 'Module code already exists', 409);
        }
        next(err);
    }
};

const deleteModule = async (req, res, next) => {
    try {
        const { id } = req.params;

        const existing = await pool.query('SELECT module_id FROM modules WHERE module_id = $1', [id]);
        if (existing.rows.length === 0) {
            return sendError(res, 'Module not found', 404);
        }

        const sessionCheck = await pool.query('SELECT session_id FROM lecture_sessions WHERE module_id = $1 LIMIT 1', [id]);
        if (sessionCheck.rows.length > 0) {
            return sendError(res, 'Cannot delete module: scheduled sessions exist for this module', 409);
        }

        await pool.query('DELETE FROM modules WHERE module_id = $1', [id]);
        return sendSuccess(res, null, 200, 'Module deleted successfully');
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getAllModules,
    getModuleById,
    createModule,
    updateModule,
    deleteModule
};
