import React from 'react';
import { Users, Clock, Wrench, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { formatTime12h, getDeterministicTag } from './SignageSessionCard';

/**
 * Card component for Room Status slide.
 */
export default function RoomStatusCard({ room }) {
    const rawStatus = room.live_room_status || 'Available';

    let statusPillText = 'FREE';
    let borderColor = 'border-emerald-500/40 bg-slate-900/90';
    let statusPillStyle = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';

    if (rawStatus === 'Ongoing Now') {
        statusPillText = 'ONGOING';
        borderColor = 'border-emerald-500/50 bg-slate-900/90';
        statusPillStyle = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    } else if (rawStatus === 'Upcoming Soon' || rawStatus === 'Upcoming') {
        statusPillText = 'UPCOMING';
        borderColor = 'border-blue-500/50 bg-slate-900/90';
        statusPillStyle = 'bg-blue-500/20 text-blue-300 border-blue-500/40';
    } else if (rawStatus === 'Cancelled') {
        statusPillText = 'CANCELLED';
        borderColor = 'border-rose-500/50 bg-slate-900/90';
        statusPillStyle = 'bg-rose-500/20 text-rose-300 border-rose-500/40';
    } else if (rawStatus === 'Temporarily Unavailable') {
        statusPillText = 'MAINTENANCE';
        borderColor = 'border-slate-700 bg-slate-900/70';
        statusPillStyle = 'bg-slate-700/50 text-slate-300 border-slate-600';
    } else {
        // Available or Session Finished -> FREE
        statusPillText = 'FREE';
        borderColor = 'border-emerald-500/40 bg-slate-900/90';
        statusPillStyle = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    }

    const hallCode = room.hall_code || 'LH';
    const hallName = room.hall_name || `Lecture Hall ${hallCode}`;
    const capacity = room.capacity || 120;
    const hallType = room.hall_type || 'Lecture';
    const tagPill = getDeterministicTag(statusPillText === 'MAINTENANCE' ? 'Maintenance' : (statusPillText === 'CANCELLED' ? 'Cancelled' : statusPillText), hallType);

    const currentSess = room.current_session;
    const nextSess = room.next_session;

    return (
        <div className={`rounded-2xl border-2 p-5 shadow-lg flex flex-col justify-between transition-all duration-300 ${borderColor}`}>
            <div>
                {/* Header Row: Hall Code & Status Pill */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <span className="bg-slate-800 text-white font-black text-lg px-3 py-1 rounded-xl border border-slate-700">
                            {hallCode}
                        </span>
                        <div>
                            <span className="text-sm font-bold text-slate-200">{hallName}</span>
                        </div>
                    </div>

                    <div className={`px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase border ${statusPillStyle}`}>
                        {statusPillText}
                    </div>
                </div>

                <div className="h-px bg-slate-800 my-3.5"></div>

                {/* Body Content according to room status */}
                {rawStatus === 'Ongoing Now' && currentSess && (
                    <div>
                        <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400 mb-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Ongoing: {formatTime12h(currentSess.start_time)} - {formatTime12h(currentSess.end_time)}</span>
                        </div>
                        <h4 className="text-base font-bold text-white leading-tight line-clamp-1">
                            {currentSess.module_code} • {currentSess.module_name || 'Lecture Session'}
                        </h4>
                        <p className="text-xs font-medium text-slate-400 mt-1">
                            {currentSess.lecturer_name ? `${currentSess.lecturer_title || ''} ${currentSess.lecturer_name}`.trim() : 'Academic Staff'}
                        </p>
                    </div>
                )}

                {(rawStatus === 'Upcoming Soon' || (rawStatus === 'Available' && nextSess)) && nextSess && (
                    <div>
                        <div className="flex items-center space-x-2 text-xs font-bold text-blue-400 mb-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Next: {formatTime12h(nextSess.start_time)} - {formatTime12h(nextSess.end_time)}</span>
                        </div>
                        <h4 className="text-base font-bold text-white leading-tight line-clamp-1">
                            {nextSess.module_code} • {nextSess.module_name || 'Upcoming Session'}
                        </h4>
                        <p className="text-xs font-medium text-slate-400 mt-1">
                            {nextSess.lecturer_name ? `${nextSess.lecturer_title || ''} ${nextSess.lecturer_name}`.trim() : 'Academic Staff'}
                        </p>
                    </div>
                )}

                {rawStatus === 'Cancelled' && (
                    <div className="bg-rose-950/50 border border-rose-800/60 rounded-xl p-3 text-rose-200">
                        <div className="flex items-center space-x-2 text-xs font-bold text-rose-300 mb-1">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                            <span>Session Cancelled for Today</span>
                        </div>
                        <p className="text-xs font-medium text-rose-200">
                            {room.cancellation_reason || 'Lecturer unavailable for scheduled session.'}
                        </p>
                    </div>
                )}

                {rawStatus === 'Temporarily Unavailable' && (
                    <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-slate-300">
                        <div className="flex items-center space-x-2 text-xs font-bold text-slate-300 mb-1">
                            <Wrench className="w-3.5 h-3.5 text-slate-400" />
                            <span>Maintenance In Progress</span>
                        </div>
                        <p className="text-xs font-medium text-slate-400">
                            {room.status_note || 'Hall temporarily unavailable'}
                        </p>
                        {room.status_until && (
                            <p className="text-xs font-semibold text-slate-300 mt-1">
                                Expected ready by {formatTime12h(room.status_until)}
                            </p>
                        )}
                    </div>
                )}

                {(rawStatus === 'Available' && !nextSess) || rawStatus === 'Session Finished' ? (
                    <div className="bg-emerald-950/30 border border-emerald-900/40 rounded-xl p-3 text-emerald-300">
                        <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400 mb-0.5">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Hall Open & Available</span>
                        </div>
                        <p className="text-xs font-medium text-slate-400">
                            {rawStatus === 'Session Finished' ? 'Today\'s scheduled sessions finished' : 'No active session running right now'}
                        </p>
                    </div>
                ) : null}
            </div>

            {/* Footer Row: Capacity & Deterministic Tag */}
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center space-x-1.5 text-slate-400 text-xs font-semibold">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>{capacity} Seats</span>
                </div>

                <div className="bg-slate-800 text-slate-300 text-xs font-semibold px-2.5 py-0.5 rounded-lg border border-slate-700">
                    {tagPill}
                </div>
            </div>
        </div>
    );
}
