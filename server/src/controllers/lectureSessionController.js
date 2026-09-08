const pool = require('../config/database');
const { sendSuccess, sendError } = require('../services/responseService');
const { validateSession } = require('../validations');
const { attachComputedStatus, formatDateString } = require('../services/sessionStatusService');
const { checkSessionOverlap } = require('../services/sessionOverlapService');

const getAllSessions = async (req, res, next) => {
    try {
        const { date, date_from, date_to, building_id, floor_id, hall_id, status } = req.query;

        let query = `
            SELECT s.*, 
                   m.module_code, m.module_name, m.department AS module_department,
                   l.lecturer_code, l.full_name AS lecturer_name, l.title AS lecturer_title,
                   lh.hall_code, lh.hall_name,
                   fs.floor_side_id, fs.side_name,
                   f.floor_id, f.floor_number, f.floor_name,
                   b.building_id, b.building_code, b.building_name,
                   oh.hall_code AS original_hall_code, oh.hall_name AS original_hall_name
            FROM lecture_sessions s
            JOIN modules m ON s.module_id = m.module_id
            JOIN lecturers l ON s.lecturer_id = l.lecturer_id
            JOIN lecture_halls lh ON s.hall_id = lh.hall_id
            JOIN floor_sides fs ON lh.floor_side_id = fs.floor_side_id
            JOIN floors f ON fs.floor_id = f.floor_id
            JOIN buildings b ON f.building_id = b.building_id
            LEFT JOIN lecture_halls oh ON s.original_hall_id = oh.hall_id
        `;

        const conditions = [];
        const params = [];

        if (date_from && date_to) {
            params.push(date_from, date_to);
            conditions.push(`s.session_date BETWEEN $${params.length - 1} AND $${params.length}`);
        } else if (date) {
            params.push(date);
            conditions.push(`s.session_date = $${params.length}`);
        }

        if (building_id) {
            params.push(building_id);
            conditions.push(`b.building_id = $${params.length}`);
        }

        if (floor_id) {
            params.push(floor_id);
            conditions.push(`f.floor_id = $${params.length}`);
        }

        if (hall_id) {
            params.push(hall_id);
            conditions.push(`s.hall_id = $${params.length}`);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY s.session_date ASC, s.start_time ASC';

        const result = await pool.query(query, params);
        let sessions = attachComputedStatus(result.rows);

        // Filter by computed status if requested
        if (status) {
            const targetStatus = status.trim().toLowerCase();
            sessions = sessions.filter(s => s.computed_status.toLowerCase() === targetStatus);
        }

        return sendSuccess(res, sessions);
    } catch (err) {
        next(err);
    }
};

const getSessionById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const query = `
            SELECT s.*, 
                   m.module_code, m.module_name, m.department AS module_department,
                   l.lecturer_code, l.full_name AS lecturer_name, l.title AS lecturer_title,
                   lh.hall_code, lh.hall_name,
                   fs.floor_side_id, fs.side_name,
                   f.floor_id, f.floor_number, f.floor_name,
                   b.building_id, b.building_code, b.building_name,
                   oh.hall_code AS original_hall_code, oh.hall_name AS original_hall_name
            FROM lecture_sessions s
            JOIN modules m ON s.module_id = m.module_id
            JOIN lecturers l ON s.lecturer_id = l.lecturer_id
            JOIN lecture_halls lh ON s.hall_id = lh.hall_id
            JOIN floor_sides fs ON lh.floor_side_id = fs.floor_side_id
            JOIN floors f ON fs.floor_id = f.floor_id
            JOIN buildings b ON f.building_id = b.building_id
            LEFT JOIN lecture_halls oh ON s.original_hall_id = oh.hall_id
            WHERE s.session_id = $1
        `;
        const result = await pool.query(query, [id]);
        if (result.rows.length === 0) {
            return sendError(res, 'Lecture session not found', 404);
        }

        const session = attachComputedStatus(result.rows[0]);
        return sendSuccess(res, session);
    } catch (err) {
        next(err);
    }
};

const createSession = async (req, res, next) => {
    try {
        const errors = validateSession(req.body);
        if (errors.length > 0) {
            return sendError(res, errors.join(', '), 400);
        }

        const { module_id, lecturer_id, hall_id, session_date, start_time, end_time, session_type, description } = req.body;

        // Verify referenced entities exist
        const mCheck = await pool.query('SELECT module_id FROM modules WHERE module_id = $1', [module_id]);
        if (mCheck.rows.length === 0) return sendError(res, 'Specified module_id does not exist', 400);

        const lCheck = await pool.query('SELECT lecturer_id FROM lecturers WHERE lecturer_id = $1', [lecturer_id]);
        if (lCheck.rows.length === 0) return sendError(res, 'Specified lecturer_id does not exist', 400);

        const hCheck = await pool.query('SELECT hall_id FROM lecture_halls WHERE hall_id = $1', [hall_id]);
        if (hCheck.rows.length === 0) return sendError(res, 'Specified hall_id does not exist', 400);

        // Check overlap conflict
        const overlap = await checkSessionOverlap(hall_id, session_date, start_time, end_time);
        if (overlap.hasConflict) {
            return sendError(
                res, 
                `Scheduling conflict: Hall is already booked during this time slot (${overlap.conflictingSession.module_code}: ${overlap.conflictingSession.start_time} - ${overlap.conflictingSession.end_time})`, 
                409
            );
        }

        const result = await pool.query(
            `INSERT INTO lecture_sessions 
             (module_id, lecturer_id, hall_id, session_date, start_time, end_time, session_type, description, status) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'Scheduled') RETURNING *`,
            [module_id, lecturer_id, hall_id, session_date, start_time, end_time, session_type || 'Lecture', description ? description.trim() : null]
        );

        const newSession = attachComputedStatus(result.rows[0]);
        return sendSuccess(res, newSession, 201, 'Lecture session created successfully');
    } catch (err) {
        next(err);
    }
};

const updateSession = async (req, res, next) => {
    try {
        const { id } = req.params;
        const errors = validateSession(req.body);
        if (errors.length > 0) {
            return sendError(res, errors.join(', '), 400);
        }

        const { module_id, lecturer_id, hall_id, session_date, start_time, end_time, session_type, description } = req.body;

        const existing = await pool.query('SELECT * FROM lecture_sessions WHERE session_id = $1', [id]);
        if (existing.rows.length === 0) {
            return sendError(res, 'Lecture session not found', 404);
        }

        // Check overlap excluding self
        const overlap = await checkSessionOverlap(hall_id, session_date, start_time, end_time, id);
        if (overlap.hasConflict) {
            return sendError(
                res, 
                `Scheduling conflict: Hall is already booked during this time slot (${overlap.conflictingSession.module_code}: ${overlap.conflictingSession.start_time} - ${overlap.conflictingSession.end_time})`, 
                409
            );
        }

        const result = await pool.query(
            `UPDATE lecture_sessions 
             SET module_id = $1, lecturer_id = $2, hall_id = $3, session_date = $4, start_time = $5, end_time = $6, session_type = $7, description = $8, updated_at = NOW() 
             WHERE session_id = $9 RETURNING *`,
            [module_id, lecturer_id, hall_id, session_date, start_time, end_time, session_type || 'Lecture', description ? description.trim() : null, id]
        );

        const updatedSession = attachComputedStatus(result.rows[0]);
        return sendSuccess(res, updatedSession, 200, 'Lecture session updated successfully');
    } catch (err) {
        next(err);
    }
};

const cancelSession = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        if (!reason || typeof reason !== 'string' || !reason.trim()) {
            return sendError(res, 'Cancellation reason is required', 400);
        }

        const existing = await pool.query('SELECT * FROM lecture_sessions WHERE session_id = $1', [id]);
        if (existing.rows.length === 0) {
            return sendError(res, 'Lecture session not found', 404);
        }

        if (existing.rows[0].status === 'Cancelled') {
            return sendError(res, 'Session is already cancelled', 400);
        }

        const result = await pool.query(
            `UPDATE lecture_sessions 
             SET status = 'Cancelled', cancellation_reason = $1, updated_at = NOW() 
             WHERE session_id = $2 RETURNING *`,
            [reason.trim(), id]
        );

        const cancelledSession = attachComputedStatus(result.rows[0]);
        return sendSuccess(res, cancelledSession, 200, 'Lecture session cancelled successfully');
    } catch (err) {
        next(err);
    }
};

const rescheduleSession = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { new_date, new_start_time, new_end_time, new_hall_id, reason } = req.body;

        if (!new_date || !new_start_time || !new_end_time || !reason || !reason.trim()) {
            return sendError(res, 'new_date, new_start_time, new_end_time, and reason are required', 400);
        }

        const existing = await pool.query('SELECT * FROM lecture_sessions WHERE session_id = $1', [id]);
        if (existing.rows.length === 0) {
            return sendError(res, 'Lecture session not found', 404);
        }

        const session = existing.rows[0];
        const targetHallId = new_hall_id || session.hall_id;

        // Verify target hall exists
        const hCheck = await pool.query('SELECT hall_id FROM lecture_halls WHERE hall_id = $1', [targetHallId]);
        if (hCheck.rows.length === 0) {
            return sendError(res, 'Specified new_hall_id does not exist', 400);
        }

        // Check overlap conflict for new schedule (excluding self)
        const overlap = await checkSessionOverlap(targetHallId, new_date, new_start_time, new_end_time, id);
        if (overlap.hasConflict) {
            return sendError(
                res, 
                `Scheduling conflict: Target hall is already booked during the new time slot (${overlap.conflictingSession.module_code})`, 
                409
            );
        }

        const origDate = formatDateString(session.session_date);
        const origStartTime = session.start_time;
        const origEndTime = session.end_time;
        const origHallId = session.hall_id;

        const result = await pool.query(
            `UPDATE lecture_sessions 
             SET original_session_date = $1,
                 original_start_time = $2,
                 original_end_time = $3,
                 original_hall_id = $4,
                 session_date = $5,
                 start_time = $6,
                 end_time = $7,
                 hall_id = $8,
                 status = 'Rescheduled',
                 reschedule_reason = $9,
                 updated_at = NOW() 
             WHERE session_id = $10 RETURNING *`,
            [
                origDate,
                origStartTime,
                origEndTime,
                origHallId,
                new_date,
                new_start_time,
                new_end_time,
                targetHallId,
                reason.trim(),
                id
            ]
        );

        const rescheduledSession = attachComputedStatus(result.rows[0]);
        return sendSuccess(res, rescheduledSession, 200, 'Lecture session rescheduled successfully');
    } catch (err) {
        next(err);
    }
};

const deleteSession = async (req, res, next) => {
    try {
        const { id } = req.params;

        const existing = await pool.query('SELECT session_id FROM lecture_sessions WHERE session_id = $1', [id]);
        if (existing.rows.length === 0) {
            return sendError(res, 'Lecture session not found', 404);
        }

        await pool.query('DELETE FROM lecture_sessions WHERE session_id = $1', [id]);
        return sendSuccess(res, null, 200, 'Lecture session deleted successfully');
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getAllSessions,
    getSessionById,
    createSession,
    updateSession,
    cancelSession,
    rescheduleSession,
    deleteSession
};
