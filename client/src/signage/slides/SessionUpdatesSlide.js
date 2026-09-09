import React from 'react';
import SignageSessionCard from '../components/SignageSessionCard';
import { AlertCircle, AlertTriangle } from 'lucide-react';

export default function SessionUpdatesSlide({ cancelledSessions = [], rescheduledSessions = [], displayName = 'CORRIDOR DISPLAY', now = new Date() }) {
    const combinedUpdates = [...cancelledSessions, ...rescheduledSessions];
    const totalCount = combinedUpdates.length;

    return (
        <div className="flex-1 p-8 flex flex-col justify-between overflow-hidden">
            {/* Slide Title Bar */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                    <span className="w-3.5 h-3.5 rounded-full bg-amber-500 shadow-md shadow-amber-500/50 animate-pulse"></span>
                    <h2 className="text-2xl font-black tracking-wider uppercase text-white">
                        SESSION UPDATES
                    </h2>
                    <span className="bg-slate-800 text-slate-300 border border-slate-700 text-xs font-extrabold px-3.5 py-1.5 rounded-full uppercase tracking-wider">
                        {displayName}
                    </span>
                </div>

                {/* Extra Right Header Pill */}
                <div className="bg-amber-950/80 text-amber-200 border border-amber-800/80 text-xs font-bold px-4 py-1.5 rounded-full flex items-center space-x-2 shadow-sm">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                    <span>Today's Schedule Revisions • {totalCount} {totalCount === 1 ? 'Update' : 'Updates'}</span>
                </div>
            </div>

            {/* Content: Grid or Fallback */}
            {combinedUpdates.length > 0 ? (
                <div className="grid grid-cols-3 gap-6 flex-1">
                    {combinedUpdates.slice(0, 3).map((session, idx) => (
                        <SignageSessionCard key={session.session_id || idx} session={session} type="update" now={now} />
                    ))}
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center bg-slate-900/60 border-2 border-dashed border-slate-800 rounded-3xl p-12 text-center">
                    <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/80 mb-4 text-amber-400">
                        <AlertTriangle className="w-12 h-12" />
                    </div>
                    <h3 className="text-2xl font-extrabold text-white mb-2">No Schedule Revisions Today</h3>
                    <p className="text-slate-400 max-w-md text-sm font-medium">
                        All scheduled sessions on this floor are operating normally with no cancellations or reschedules.
                    </p>
                </div>
            )}
        </div>
    );
}
