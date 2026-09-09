import React from 'react';
import SignageSessionCard from '../components/SignageSessionCard';
import { CalendarX } from 'lucide-react';

export default function OngoingSlide({ sessions = [], displayName = 'CORRIDOR DISPLAY', now = new Date() }) {
    return (
        <div className="flex-1 p-8 flex flex-col justify-between overflow-hidden">
            {/* Slide Title Bar */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                    <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 shadow-md shadow-emerald-500/50 animate-pulse"></span>
                    <h2 className="text-2xl font-black tracking-wider uppercase text-white">
                        ONGOING SESSIONS
                    </h2>
                    <span className="bg-slate-800 text-slate-300 border border-slate-700 text-xs font-extrabold px-3.5 py-1.5 rounded-full uppercase tracking-wider">
                        {displayName}
                    </span>
                </div>
            </div>

            {/* Content: Grid or Empty State */}
            {sessions.length > 0 ? (
                <div className="grid grid-cols-3 gap-6 flex-1">
                    {sessions.slice(0, 3).map((session, idx) => (
                        <SignageSessionCard key={session.session_id || idx} session={session} type="ongoing" now={now} />
                    ))}
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center bg-slate-900/60 border-2 border-dashed border-slate-800 rounded-3xl p-12 text-center">
                    <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/80 mb-4 text-emerald-400">
                        <CalendarX className="w-12 h-12" />
                    </div>
                    <h3 className="text-2xl font-extrabold text-white mb-2">No Ongoing Sessions Right Now</h3>
                    <p className="text-slate-400 max-w-md text-sm font-medium">
                        There are currently no active lecture or tutorial sessions running in this corridor. Please check upcoming sessions on the next screen.
                    </p>
                </div>
            )}
        </div>
    );
}
