import React from 'react';
import { Volume2, Info, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { SLIDES } from '../hooks/useSlideRotation';

/**
 * Notice bar displayed above the footer bar.
 * Contains slide-specific guidance notes and decorative system status badges.
 */
export default function NoticeBar({ slide }) {
    let noticeText = "Please keep noise to a minimum during ongoing lecture sessions in this corridor.";
    let icon = <Volume2 className="w-4 h-4 text-amber-400 flex-shrink-0" />;
    let rightBadge = null;

    if (slide === SLIDES.UPCOMING) {
        noticeText = "Please keep noise to a minimum during ongoing lecture sessions in this corridor.";
        icon = <Volume2 className="w-4 h-4 text-amber-400 flex-shrink-0" />;
        rightBadge = (
            <div className="flex items-center space-x-1.5 bg-slate-800 text-slate-300 border border-slate-700 px-3 py-1 rounded-full text-xs font-semibold">
                <ShieldAlert className="w-3.5 h-3.5 text-blue-400" />
                <span>Corridor Audio Sensors Active</span>
            </div>
        );
    } else if (slide === SLIDES.SESSION_UPDATES) {
        noticeText = "Please check the ScheduleMate student portal for real-time schedule updates and makeup session details.";
        icon = <Info className="w-4 h-4 text-blue-400 flex-shrink-0" />;
        rightBadge = (
            <div className="flex items-center space-x-1.5 bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 px-3 py-1 rounded-full text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Live Synced with Academic Affairs</span>
            </div>
        );
    }

    return (
        <div className="bg-slate-900/90 text-slate-200 border-t border-slate-800 px-8 py-2.5 flex items-center justify-between shadow-inner">
            <div className="flex items-center space-x-3">
                {icon}
                <span className="text-xs font-semibold tracking-wide text-slate-300">{noticeText}</span>
            </div>

            {rightBadge && <div>{rightBadge}</div>}
        </div>
    );
}
