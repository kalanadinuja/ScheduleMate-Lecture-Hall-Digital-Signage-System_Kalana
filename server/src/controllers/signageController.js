const pool = require('../config/database');
const { sendSuccess, sendError } = require('../services/responseService');
const { getColomboNowParts, attachComputedStatus, formatDateString } = require('../services/sessionStatusService');

const UPCOMING_THRESHOLD_MINUTES = 30; // Configurable threshold for 'Upcoming Soon' room status

/**
 * Helper to find display by numeric ID or display_code
 */
async function findDisplay(displayIdParam) {
    let query = `
        SELECT d.*, fs.floor_side_id, fs.side_name, f.floor_id, f.floor_number, f.floor_name, b.building_id, b.building_code, b.building_name
        FROM digital_displays d
        JOIN floor_sides fs ON d.floor_side_id = fs.floor_side_id
        JOIN floors f ON fs.floor_id = f.floor_id
        JOIN buildings b ON f.building_id = b.building_id
    `;
    
    if (/^\d+$/.test(String(displayIdParam).trim())) {
        query += ' WHERE d.display_id = $1 OR LOWER(d.display_code) = LOWER($2)';
        const displayIdNum = parseInt(displayIdParam, 10);
        const displayCodeStr = String(displayIdParam).trim();
        const result = await pool.query(query, [displayIdNum, displayCodeStr]);
        return result.rows.length > 0 ? result.rows[0] : null;
    } else {
        query += ' WHERE LOWER(d.display_code) = LOWER($1)';
        const displayCodeStr = String(displayIdParam).trim();
        const result = await pool.query(query, [displayCodeStr]);
        return result.rows.length > 0 ? result.rows[0] : null;
    }
}

/**
 * Public Signage API: GET /api/signage/:displayId
 */
const getSignageData = async (req, res, next) => {
    try {
        const { displayId } = req.params;
        const display = await findDisplay(displayId);

        if (!display) {
            return sendError(res, 'Digital display not found', 404);
        }

        const { dateStr: currentDate, timeStr: currentTime } = getColomboNowParts();

        // Query all sessions relevant for today on this display's floor side
        const sessionQuery = `
            SELECT s.*, 
                   m.module_code, m.module_name,
                   l.full_name AS lecturer_name, l.title AS lecturer_title,
                   lh.hall_code, lh.hall_name,
                   oh.hall_code AS original_hall_code, oh.hall_name AS original_hall_name
            FROM lecture_sessions s
            JOIN modules m ON s.module_id = m.module_id
            JOIN lecturers l ON s.lecturer_id = l.lecturer_id
            JOIN lecture_halls lh ON s.hall_id = lh.hall_id
            LEFT JOIN lecture_halls oh ON s.original_hall_id = oh.hall_id
            WHERE lh.floor_side_id = $1 
              AND (s.session_date = $2 OR s.original_session_date = $2)
            ORDER BY s.start_time ASC
        `;

        const sessionsResult = await pool.query(sessionQuery, [display.floor_side_id, currentDate]);
        const sessionsWithStatus = attachComputedStatus(sessionsResult.rows);

        const ongoingSessions = [];
        const upcomingSessions = [];
        const cancelledSessions = [];
        const rescheduledSessions = [];

        for (const sess of sessionsWithStatus) {
            if (sess.computed_status === 'Ongoing') {
                ongoingSessions.push(sess);
            } else if (sess.computed_status === 'Upcoming') {
                upcomingSessions.push(sess);
            } else if (sess.computed_status === 'Cancelled') {
                cancelledSessions.push(sess);
            } else if (sess.computed_status === 'Rescheduled') {
                rescheduledSessions.push(sess);
            }
        }

        // Upcoming sessions capped at top 5 for digital signage display readability
        const cappedUpcomingSessions = upcomingSessions.slice(0, 5);

        // Update display last_updated heartbeat
        pool.query('UPDATE digital_displays SET last_updated = NOW() WHERE display_id = $1', [display.display_id]).catch(err => {
            console.error('Failed to update display heartbeat:', err.message);
        });

        return sendSuccess(res, {
            building: {
                building_id: display.building_id,
                building_code: display.building_code,
                building_name: display.building_name
            },
            floor: {
                floor_id: display.floor_id,
                floor_number: display.floor_number,
                floor_name: display.floor_name
            },
            floor_side: {
                floor_side_id: display.floor_side_id,
                side_name: display.side_name
            },
            current_date: currentDate,
            current_time: currentTime,
            ongoing_sessions: ongoingSessions,
            upcoming_sessions: cappedUpcomingSessions,
            cancelled_sessions: cancelledSessions,
            rescheduled_sessions: rescheduledSessions,
            refresh_interval_seconds: display.refresh_interval_seconds || 30
        });

    } catch (err) {
        next(err);
    }
};

/**
 * Public Signage API: GET /api/signage/:displayId/room-status
 */
const getRoomStatusData = async (req, res, next) => {
    try {
        const { displayId } = req.params;
        const display = await findDisplay(displayId);

        if (!display) {
            return sendError(res, 'Digital display not found', 404);
        }

        const { dateStr: currentDate, timeStr: currentTime } = getColomboNowParts();

        // Get all lecture halls for this floor side
        const hallsResult = await pool.query(
            'SELECT * FROM lecture_halls WHERE floor_side_id = $1 ORDER BY hall_code',
            [display.floor_side_id]
        );

        // Get all sessions today for these halls
        const sessionQuery = `
            SELECT s.*, 
                   m.module_code, m.module_name,
                   l.full_name AS lecturer_name, l.title AS lecturer_title,
                   lh.hall_code, lh.hall_name
            FROM lecture_sessions s
            JOIN modules m ON s.module_id = m.module_id
            JOIN lecturers l ON s.lecturer_id = l.lecturer_id
            JOIN lecture_halls lh ON s.hall_id = lh.hall_id
            WHERE lh.floor_side_id = $1 AND s.session_date = $2
            ORDER BY s.start_time ASC
        `;

        const sessionsResult = await pool.query(sessionQuery, [display.floor_side_id, currentDate]);
        const sessionsWithStatus = attachComputedStatus(sessionsResult.rows);

        const currentMinutes = timeToMinutes(currentTime);

        const roomStatuses = hallsResult.rows.map(hall => {
            if (hall.hall_status !== 'Active') {
                return {
                    hall_id: hall.hall_id,
                    hall_code: hall.hall_code,
                    hall_name: hall.hall_name,
                    hall_status: hall.hall_status,
                    capacity: hall.capacity,
                    live_room_status: 'Temporarily Unavailable',
                    current_session: null,
                    next_session: null
                };
            }

            const hallSessions = sessionsWithStatus.filter(s => s.hall_id === hall.hall_id);
            const ongoingSession = hallSessions.find(s => s.computed_status === 'Ongoing');

            if (ongoingSession) {
                return {
                    hall_id: hall.hall_id,
                    hall_code: hall.hall_code,
                    hall_name: hall.hall_name,
                    hall_status: hall.hall_status,
                    capacity: hall.capacity,
                    live_room_status: 'Ongoing Now',
                    current_session: ongoingSession,
                    next_session: null
                };
            }

            const upcomingSessions = hallSessions.filter(s => s.computed_status === 'Upcoming');

            if (upcomingSessions.length > 0) {
                const nextSess = upcomingSessions[0];
                const startMins = timeToMinutes(nextSess.start_time);
                const minutesUntilStart = startMins - currentMinutes;

                if (minutesUntilStart >= 0 && minutesUntilStart <= UPCOMING_THRESHOLD_MINUTES) {
                    return {
                        hall_id: hall.hall_id,
                        hall_code: hall.hall_code,
                        hall_name: hall.hall_name,
                        hall_status: hall.hall_status,
                        capacity: hall.capacity,
                        live_room_status: 'Upcoming Soon',
                        current_session: null,
                        next_session: nextSess
                    };
                }

                return {
                    hall_id: hall.hall_id,
                    hall_code: hall.hall_code,
                    hall_name: hall.hall_name,
                    hall_status: hall.hall_status,
                    capacity: hall.capacity,
                    live_room_status: 'Available',
                    current_session: null,
                    next_session: nextSess
                };
            }

            const activeOrCompletedToday = hallSessions.filter(s => s.computed_status === 'Completed');
            if (activeOrCompletedToday.length > 0 && hallSessions.every(s => s.computed_status === 'Completed' || s.computed_status === 'Cancelled')) {
                return {
                    hall_id: hall.hall_id,
                    hall_code: hall.hall_code,
                    hall_name: hall.hall_name,
                    hall_status: hall.hall_status,
                    capacity: hall.capacity,
                    live_room_status: 'Session Finished',
                    current_session: null,
                    next_session: null
                };
            }

            return {
                hall_id: hall.hall_id,
                hall_code: hall.hall_code,
                hall_name: hall.hall_name,
                hall_status: hall.hall_status,
                capacity: hall.capacity,
                live_room_status: 'Available',
                current_session: null,
                next_session: null
            };
        });

        return sendSuccess(res, roomStatuses);

    } catch (err) {
        next(err);
    }
};

function timeToMinutes(timeStr) {
    if (!timeStr) return 0;
    const parts = String(timeStr).split(':');
    return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
}

module.exports = {
    getSignageData,
    getRoomStatusData
};
