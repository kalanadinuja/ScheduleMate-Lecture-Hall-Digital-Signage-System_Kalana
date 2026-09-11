const pool = require('../config/database');
const { sendSuccess } = require('../services/responseService');
const { getColomboNowParts, attachComputedStatus } = require('../services/sessionStatusService');

const getDashboardStats = async (req, res, next) => {
    try {
        const { dateStr: currentDate } = getColomboNowParts();

        const [
            buildingsRes,
            hallsRes,
            modulesRes,
            lecturersRes,
            displaysRes,
            todaySessionsRes
        ] = await Promise.all([
            pool.query('SELECT COUNT(*)::int AS count FROM buildings'),
            pool.query('SELECT COUNT(*)::int AS count FROM lecture_halls'),
            pool.query('SELECT COUNT(*)::int AS count FROM modules'),
            pool.query('SELECT COUNT(*)::int AS count FROM lecturers'),
            pool.query(`
                SELECT 
                    COUNT(*)::int AS total,
                    COUNT(CASE WHEN display_status = 'Online' THEN 1 END)::int AS online,
                    COUNT(CASE WHEN display_status = 'Offline' THEN 1 END)::int AS offline,
                    COUNT(CASE WHEN display_status = 'Maintenance' THEN 1 END)::int AS maintenance
                FROM digital_displays
            `),
            pool.query(`
                SELECT s.*, 
                       m.module_code, m.module_name,
                       l.full_name AS lecturer_name,
                       lh.hall_code, lh.hall_name
                FROM lecture_sessions s
                JOIN modules m ON s.module_id = m.module_id
                JOIN lecturers l ON s.lecturer_id = l.lecturer_id
                JOIN lecture_halls lh ON s.hall_id = lh.hall_id
                WHERE s.session_date = $1 OR s.original_session_date = $1
                ORDER BY s.start_time ASC
            `, [currentDate])
        ]);

        const sessionsWithStatus = attachComputedStatus(todaySessionsRes.rows);

        const sessionCounts = {
            ongoing: 0,
            upcoming: 0,
            cancelled: 0,
            rescheduled: 0,
            completed: 0,
            total_today: sessionsWithStatus.length
        };

        const occupiedHalls = new Set();
        const upcomingHalls = new Set();

        sessionsWithStatus.forEach(s => {
            const st = s.computed_status.toLowerCase();
            if (sessionCounts[st] !== undefined) {
                sessionCounts[st]++;
            }

            if (s.computed_status === 'Ongoing') {
                occupiedHalls.add(s.hall_id);
            } else if (s.computed_status === 'Upcoming') {
                upcomingHalls.add(s.hall_id);
            }
        });

        const totalHalls = hallsRes.rows[0].count || 0;
        const occupiedCount = occupiedHalls.size;
        // Upcoming halls exclude occupied halls
        const upcomingOnlyCount = Array.from(upcomingHalls).filter(id => !occupiedHalls.has(id)).length;
        const freeCount = Math.max(0, totalHalls - occupiedCount - upcomingOnlyCount);
        const occupancyRate = totalHalls > 0 ? parseFloat(((occupiedCount / totalHalls) * 100).toFixed(1)) : 0;

        const displayStats = displaysRes.rows[0] || { total: 0, online: 0, offline: 0, maintenance: 0 };

        return sendSuccess(res, {
            total_buildings: buildingsRes.rows[0].count,
            total_halls: totalHalls,
            total_modules: modulesRes.rows[0].count,
            total_lecturers: lecturersRes.rows[0].count,
            displays: {
                total: displayStats.total,
                online: displayStats.online,
                offline: displayStats.offline,
                maintenance: displayStats.maintenance
            },
            today_sessions: sessionCounts,
            room_occupancy: {
                occupied: occupiedCount,
                upcoming: upcomingOnlyCount,
                free: freeCount,
                total: totalHalls,
                occupancy_rate: occupancyRate
            },
            todays_schedule: sessionsWithStatus
        });

    } catch (err) {
        next(err);
    }
};

module.exports = {
    getDashboardStats
};
