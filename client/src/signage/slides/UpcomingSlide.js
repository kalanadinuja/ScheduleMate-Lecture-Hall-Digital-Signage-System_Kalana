import React from 'react';
import SignageSessionCard from '../components/SignageSessionCard';
import { Clock } from 'lucide-react';

export default function UpcomingSlide({
    sessions = [],
    displayName = 'CORRIDOR DISPLAY',
    now = new Date(),
    currentPage = 0,
    totalPages = 1
}) {
    const pageIndex = typeof currentPage === 'number' ? currentPage : 0;
    const startIndex = pageIndex * 3;
    const pagedSessions = sessions.slice(startIndex, startIndex + 3);

    const windowString = (() => {
        try {
            const end = new Date(now.getTime() + 3 * 60 * 60 * 1000);
            const startStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
            const endStr = end.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
            return `Display Window: Next 3 Hours (${startStr} – ${endStr})`;
        } catch (e) {
            return 'Display Window: Next 3 Hours';
        }
    })();

    return (
        <div className="flex-1 p-8 flex flex-col justify-between overflow-hidden">
            {/* Slide Title Bar */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                    <span className="w-3.5 h-3.5 rounded-full bg-blue-500 shadow-md shadow-blue-500/50 animate-pulse"></span>
                    <h2 className="text-2xl font-black tracking-wider uppercase text-white">
                        UPCOMING SESSIONS
                    </h2>
                    <span className="bg-slate-800 text-slate-300 border border-slate-700 text-xs font-extrabold px-3.5 py-1.5 rounded-full uppercase tracking-wider">
                        {displayName}
                    </span>
                    {totalPages > 1 && (
                        <span className="bg-slate-800 text-blue-400 border border-slate-700 text-xs font-extrabold px-3.5 py-1.5 rounded-full uppercase tracking-wider">
                            PAGE {pageIndex + 1} / {totalPages}
                        </span>
                    )}
                </div>

                {/* Extra Right Header Pill */}
                <div className="bg-blue-950/80 text-blue-200 border border-blue-800/80 text-xs font-bold px-4 py-1.5 rounded-full flex items-center space-x-2 shadow-sm">
                    <Clock className="w-3.5 h-3.5 text-blue-400" />
                    <span>{windowString}</span>
                </div>
            </div>

            {/* Content Grid or Empty State */}
            {sessions.length > 0 ? (
                <div className="grid grid-cols-3 gap-6 flex-1">
                    {pagedSessions.map((session, idx) => (
                        <SignageSessionCard key={session.session_id || `${startIndex + idx}`} session={session} type="upcoming" now={now} />
                    ))}
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center bg-slate-900/60 border-2 border-dashed border-slate-800 rounded-3xl p-12 text-center">
                    <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/80 mb-4 text-blue-400">
                        <Clock className="w-12 h-12" />
                    </div>
                    <h3 className="text-2xl font-extrabold text-white mb-2">No Upcoming Sessions Scheduled</h3>
                    <p className="text-slate-400 max-w-md text-sm font-medium">
                        There are no lecture sessions starting within the next 3 hours on this floor.
                    </p>
                </div>
            )}
        </div>
    );
}
