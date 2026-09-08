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
                    COUNT(CASE WHEN display_status = 'Maintenance' OR display_status = 'Offline' THEN 1 END)::int AS maintenance
                FROM digital_displays
            `),
            pool.query('SELECT * FROM lecture_sessions WHERE session_date = $1 OR original_session_date = $1', [currentDate])
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

        sessionsWithStatus.forEach(s => {
            const st = s.computed_status.toLowerCase();
            if (sessionCounts[st] !== undefined) {
                sessionCounts[st]++;
            }
        });

        const displayStats = displaysRes.rows[0] || { total: 0, online: 0, maintenance: 0 };

        return sendSuccess(res, {
            total_buildings: buildingsRes.rows[0].count,
            total_halls: hallsRes.rows[0].count,
            total_modules: modulesRes.rows[0].count,
            total_lecturers: lecturersRes.rows[0].count,
            displays: {
                total: displayStats.total,
                online: displayStats.online,
                maintenance: displayStats.maintenance
            },
            today_sessions: sessionCounts
        });

    } catch (err) {
        next(err);
    }
};

module.exports = {
    getDashboardStats
};
