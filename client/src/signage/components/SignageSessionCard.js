import React from 'react';
import { Clock, Users, AlertTriangle, ArrowRightLeft } from 'lucide-react';

/**
 * Formats HH:MM:SS or HH:MM string into 12-hour AM/PM string (e.g. "10:00 AM")
 */
export function formatTime12h(timeStr) {
    if (!timeStr) return '';
    const parts = String(timeStr).split(':');
    let hours = parseInt(parts[0], 10);
    const minutes = parts[1] || '00';
    if (isNaN(hours)) return timeStr;

    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
}

/**
 * Computes live countdown string until session start time.
 */
export function getCountdownString(now, sessionDateStr, startTimeStr) {
    if (!now || !startTimeStr) return null;
    try {
        const parts = String(startTimeStr).split(':');
        const hours = parseInt(parts[0], 10);
        const minutes = parseInt(parts[1], 10);
        const seconds = parseInt(parts[2] || '0', 10);

        const targetDate = new Date(now);
        if (sessionDateStr) {
            const dateParts = sessionDateStr.split('-');
            targetDate.setFullYear(parseInt(dateParts[0], 10), parseInt(dateParts[1], 10) - 1, parseInt(dateParts[2], 10));
        }
        targetDate.setHours(hours, minutes, seconds, 0);

        const diffMs = targetDate.getTime() - now.getTime();
        if (diffMs <= 0) return 'Starts now';

        const totalMin = Math.floor(diffMs / 60000);
        const hrs = Math.floor(totalMin / 60);
        const mins = totalMin % 60;

        if (hrs > 0) {
            return `Starts in ${hrs}h ${mins}m`;
        }
        return `Starts in ${mins}m`;
    } catch (e) {
        return null;
    }
}

/**
 * Deterministic tag pill generator (§3c lookup table)
 */
export function getDeterministicTag(status, hallType) {
    const s = String(status || '').toLowerCase();
    if (s.includes('cancelled')) return 'Notify Academic Affairs';
    if (s.includes('maintenance') || s.includes('unavailable')) return 'IT Support';
    if (s.includes('free') || s.includes('available') || s.includes('finished')) return 'Open Access';

    const ht = String(hallType || '').toLowerCase();
    if (ht.includes('lab')) return 'Lab Tutorial';
    return 'Lecture Session';
}

/**
 * Reusable session card component for digital signage slides.
 */
export default function SignageSessionCard({ session, type = 'ongoing', now = new Date() }) {
    const status = session.computed_status || session.status || 'Ongoing';

    let borderColor = 'border-emerald-500/40 bg-slate-900/90';
    let statusPillStyle = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    let statusText = 'ONGOING';
    let statusDot = 'bg-emerald-400';

    if (status === 'Upcoming') {
        borderColor = 'border-blue-500/40 bg-slate-900/90';
        statusPillStyle = 'bg-blue-500/20 text-blue-300 border-blue-500/40';
        statusText = 'UPCOMING';
        statusDot = null;
    } else if (status === 'Cancelled') {
        borderColor = 'border-rose-500/50 bg-slate-900/90';
        statusPillStyle = 'bg-rose-500/20 text-rose-300 border-rose-500/40';
        statusText = 'CANCELLED';
        statusDot = null;
    } else if (status === 'Rescheduled') {
        borderColor = 'border-amber-500/50 bg-slate-900/90';
        statusPillStyle = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
        statusText = 'RESCHEDULED';
        statusDot = null;
    }

    const hallCode = session.hall_code || 'LH';
    const hallName = session.hall_name || `Lecture Hall ${hallCode}`;
    const moduleCode = session.module_code || 'MODULE';
    const moduleName = session.module_name || session.session_title || 'Scheduled Session';
    const lecturerName = session.lecturer_name ? `${session.lecturer_title || ''} ${session.lecturer_name}`.trim() : 'Academic Staff';
    const capacity = session.capacity || 120;
    const hallType = session.hall_type || 'Lecture';
    const tagPill = getDeterministicTag(status, hallType);

    const startTimeFormatted = formatTime12h(session.start_time);
    const endTimeFormatted = formatTime12h(session.end_time);
    const origStartTimeFormatted = formatTime12h(session.original_start_time || session.start_time);
    const origEndTimeFormatted = formatTime12h(session.original_end_time || session.end_time);

    const countdownText = status === 'Upcoming' ? getCountdownString(now, session.session_date, session.start_time) : null;

    return (
        <div className={`rounded-2xl border-2 p-6 shadow-xl flex flex-col justify-between transition-all duration-300 ${borderColor}`}>
            {/* Top Bar: Hall Badge & Status Pill */}
            <div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <span className="bg-slate-800 text-white font-black text-xl px-3.5 py-1.5 rounded-xl border border-slate-700 shadow-sm">
                            {hallCode}
                        </span>
                        <div>
                            <span className="text-base font-bold text-slate-200">{hallName}</span>
                        </div>
                    </div>

                    <div className={`px-3.5 py-1 rounded-full text-sm font-black tracking-wider uppercase border flex items-center space-x-1.5 ${statusPillStyle}`}>
                        {statusDot && <span className={`w-2 h-2 rounded-full ${statusDot}`}></span>}
                        <span>{statusText}</span>
                    </div>
                </div>

                <div className="h-px bg-slate-800 my-4"></div>

                {/* Session Time & Module Badge */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                        <span className="bg-blue-950/80 text-blue-300 font-extrabold text-sm px-2.5 py-1 rounded-md border border-blue-800/80 uppercase">
                            {moduleCode}
                        </span>
                        <div className="flex items-center space-x-1.5 text-slate-300 text-base font-semibold">
                            <Clock className="w-5 h-5 text-blue-400" />
                            {status === 'Rescheduled' ? (
                                <span><strong className="text-amber-300 font-bold">NEW:</strong> {startTimeFormatted} - {endTimeFormatted}</span>
                            ) : (
                                <span>{startTimeFormatted} - {endTimeFormatted}</span>
                            )}
                        </div>
                    </div>

                    {/* Live Countdown for Upcoming */}
                    {countdownText && (
                        <div className="bg-blue-500/20 text-blue-200 border border-blue-500/40 px-3 py-0.5 rounded-full text-sm font-bold animate-pulse">
                            {countdownText}
                        </div>
                    )}
                </div>

                {/* Session Title & Lecturer */}
                <h3 className="text-2xl font-bold text-white leading-tight mb-2 tracking-wide line-clamp-2">
                    {moduleName}
                </h3>
                <p className="text-base font-medium text-slate-400">
                    {lecturerName}
                </p>

                {/* Message Boxes for Cancelled & Rescheduled */}
                {status === 'Cancelled' && (
                    <div className="mt-4 bg-rose-950/60 border border-rose-800/80 rounded-xl p-3.5 flex items-start space-x-3 text-rose-200">
                        <AlertTriangle className="w-6 h-6 text-rose-400 flex-shrink-0 mt-0.5" />
                        <div className="text-sm">
                            <strong className="font-bold text-rose-300 block mb-0.5">Session Cancelled for Today</strong>
                            <p className="text-rose-200 font-medium">Reason: {session.cancellation_reason || 'Lecturer unavailable.'}</p>
                        </div>
                    </div>
                )}

                {status === 'Rescheduled' && (
                    <div className="mt-4 bg-amber-950/60 border border-amber-800/80 rounded-xl p-3.5 flex items-start space-x-3 text-amber-200">
                        <ArrowRightLeft className="w-6 h-6 text-amber-400 flex-shrink-0 mt-0.5" />
                        <div className="text-sm">
                            <strong className="font-bold text-amber-300 block mb-0.5">Session Rescheduled</strong>
                            <p className="text-amber-100 font-medium">
                                Rescheduled from {origStartTimeFormatted} to {startTimeFormatted} in {session.hall_code || hallCode}.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Footer Row: Capacity & Deterministic Tag Pill */}
            <div className="mt-6 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center space-x-1.5 text-slate-400 text-sm font-semibold">
                    <Users className="w-4 h-4 text-slate-400" />
                    <span>{capacity} Seats</span>
                </div>

                <div className="bg-slate-800 text-slate-300 text-sm font-semibold px-3 py-1 rounded-lg border border-slate-700">
                    {tagPill}
                </div>
            </div>
        </div>
    );
}
