const pool = require('../config/database');

/**
 * Checks for a scheduling conflict in a lecture hall.
 * Two sessions overlap if:
 * hall_id is same, date is same, status is NOT 'Cancelled', and
 * (new_start < existing_end AND new_end > existing_start)
 * 
 * @param {number} hallId 
 * @param {string} sessionDate YYYY-MM-DD
 * @param {string} startTime HH:MM or HH:MM:SS
 * @param {string} endTime HH:MM or HH:MM:SS
 * @param {number|null} excludeSessionId Session ID to exclude (e.g. self during updates)
 * @returns {Promise<{ hasConflict: boolean, conflictingSession?: Object }>}
 */
async function checkSessionOverlap(hallId, sessionDate, startTime, endTime, excludeSessionId = null) {
    let query = `
        SELECT s.session_id, s.start_time, s.end_time, m.module_code, m.module_name
        FROM lecture_sessions s
        JOIN modules m ON s.module_id = m.module_id
        WHERE s.hall_id = $1 
          AND s.session_date = $2 
          AND s.status <> 'Cancelled'
          AND (s.start_time < $3 AND s.end_time > $4)
    `;

    const params = [hallId, sessionDate, endTime, startTime];

    if (excludeSessionId) {
        query += ` AND s.session_id <> $${params.length + 1}`;
        params.push(excludeSessionId);
    }

    const result = await pool.query(query, params);

    if (result.rows.length > 0) {
        return {
            hasConflict: true,
            conflictingSession: result.rows[0]
        };
    }

    return { hasConflict: false };
}

module.exports = {
    checkSessionOverlap
};
