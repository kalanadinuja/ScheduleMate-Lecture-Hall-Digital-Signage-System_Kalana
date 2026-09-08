/**
 * Session Status Computation Service
 * Computes live status in Asia/Colombo time zone.
 */

function getColomboNowParts(referenceDate = new Date()) {
    const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Colombo',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
    
    const parts = formatter.formatToParts(referenceDate);
    const map = {};
    parts.forEach(p => { map[p.type] = p.value; });

    let hour = map.hour === '24' ? '00' : map.hour;
    
    const dateStr = `${map.year}-${map.month}-${map.day}`;
    const timeStr = `${hour}:${map.minute}:${map.second}`;
    
    return { dateStr, timeStr };
}

function formatDateString(dateVal) {
    if (!dateVal) return null;
    if (typeof dateVal === 'string') {
        return dateVal.split('T')[0];
    }
    if (dateVal instanceof Date) {
        const year = dateVal.getFullYear();
        const month = String(dateVal.getMonth() + 1).padStart(2, '0');
        const day = String(dateVal.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    return String(dateVal);
}

function normalizeTime(timeStr) {
    if (!timeStr) return '00:00:00';
    const parts = String(timeStr).split(':');
    const h = String(parts[0] || '00').padStart(2, '0');
    const m = String(parts[1] || '00').padStart(2, '0');
    const s = String(parts[2] || '00').padStart(2, '0');
    return `${h}:${m}:${s}`;
}

/**
 * Derives computed status for a lecture session.
 * @param {Object} session Session row from DB
 * @param {Date} [referenceDate] Optional reference date for testing
 * @returns {'Ongoing'|'Upcoming'|'Completed'|'Cancelled'|'Rescheduled'}
 */
function computeSessionStatus(session, referenceDate = new Date()) {
    if (!session) return 'Completed';

    // Stored explicit statuses take precedence
    if (session.status === 'Cancelled') return 'Cancelled';
    if (session.status === 'Rescheduled') return 'Rescheduled';
    if (session.status === 'Completed') return 'Completed';

    const { dateStr: todayDate, timeStr: currentTime } = getColomboNowParts(referenceDate);

    const sessionDate = formatDateString(session.session_date);
    const startTime = normalizeTime(session.start_time);
    const endTime = normalizeTime(session.end_time);

    if (!sessionDate) return 'Completed';

    if (sessionDate < todayDate) {
        return 'Completed';
    }

    if (sessionDate > todayDate) {
        return 'Upcoming';
    }

    // Session is today
    if (currentTime < startTime) {
        return 'Upcoming';
    } else if (currentTime >= startTime && currentTime <= endTime) {
        return 'Ongoing';
    } else {
        return 'Completed';
    }
}

/**
 * Attaches computed status to session row(s).
 */
function attachComputedStatus(sessions, referenceDate = new Date()) {
    if (!sessions) return sessions;
    const processRow = (row) => ({
        ...row,
        session_date: formatDateString(row.session_date),
        original_session_date: formatDateString(row.original_session_date),
        computed_status: computeSessionStatus(row, referenceDate),
        // For convenience, display status
        display_status: computeSessionStatus(row, referenceDate)
    });

    if (Array.isArray(sessions)) {
        return sessions.map(processRow);
    }
    return processRow(sessions);
}

module.exports = {
    getColomboNowParts,
    formatDateString,
    normalizeTime,
    computeSessionStatus,
    attachComputedStatus
};
