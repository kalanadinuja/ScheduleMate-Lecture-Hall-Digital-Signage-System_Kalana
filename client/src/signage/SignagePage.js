import React from 'react';
import { useParams } from 'react-router-dom';
import { useSignagePolling } from './hooks/useSignagePolling';
import { useLiveClock } from './hooks/useLiveClock';
import {
    useSlideRotation,
    SLIDES,
    SLIDE_DURATION_MS,
    PAGE_DURATION_MS
} from './hooks/useSlideRotation';

export { SLIDE_DURATION_MS, PAGE_DURATION_MS, SLIDES };

import SignageHeader from './components/SignageHeader';
import SignageFooter from './components/SignageFooter';
import NoticeBar from './components/NoticeBar';

import OngoingSlide from './slides/OngoingSlide';
import UpcomingSlide from './slides/UpcomingSlide';
import RoomStatusSlide from './slides/RoomStatusSlide';
import SessionUpdatesSlide from './slides/SessionUpdatesSlide';

import { Tv, AlertCircle, RefreshCw } from 'lucide-react';

export default function SignagePage() {
    const { displayCode } = useParams();

    const {
        data,
        roomStatus,
        loading,
        error,
        isReconnecting,
        notFound
    } = useSignagePolling(displayCode);

    const { now, formattedTime, formattedDate } = useLiveClock(
        data?.current_date,
        data?.current_time
    );

    const ongoingSessions = data?.ongoing_sessions || [];
    const upcomingSessions = data?.upcoming_sessions || [];
    const cancelledSessions = data?.cancelled_sessions || [];
    const rescheduledSessions = data?.rescheduled_sessions || [];

    const {
        currentSlide,
        currentPage,
        totalPages
    } = useSlideRotation({
        ongoingCount: ongoingSessions.length,
        upcomingCount: upcomingSessions.length,
        cancelledCount: cancelledSessions.length,
        rescheduledCount: rescheduledSessions.length
    });

    // Initial Loading State
    if (loading && !data) {
        return (
            <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-8 select-none">
                <div className="bg-blue-600 text-white font-black text-3xl tracking-wider px-5 py-2.5 rounded-2xl shadow-lg mb-6 animate-pulse">
                    Schedule<span className="text-blue-200">Mate</span>
                </div>
                <div className="flex items-center space-x-3 text-slate-300 font-semibold text-lg">
                    <RefreshCw className="w-6 h-6 text-blue-500 animate-spin" />
                    <span>Connecting to Lecture Hall Digital Signage...</span>
                </div>
            </div>
        );
    }

    // Display Not Configured (404) State
    if (notFound) {
        return (
            <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-8 select-none text-center">
                <div className="bg-slate-900 border-2 border-slate-800 p-10 rounded-3xl max-w-lg shadow-2xl flex flex-col items-center">
                    <div className="bg-rose-950/80 p-5 rounded-2xl border border-rose-800/80 mb-6 text-rose-400">
                        <Tv className="w-12 h-12" />
                    </div>
                    <h2 className="text-2xl font-black text-white mb-3 tracking-wide">
                        Display Not Configured
                    </h2>
                    <p className="text-slate-400 text-sm font-medium leading-relaxed mb-6">
                        The display code <code className="bg-slate-800 text-amber-300 px-2 py-1 rounded font-mono text-base font-bold">{displayCode}</code> could not be found. Please check the URL code printed on the physical display or contact IT Admin.
                    </p>
                    <div className="text-xs text-slate-500 font-medium">
                        ScheduleMate Digital Signage • Sparkline Academy
                    </div>
                </div>
            </div>
        );
    }

    // Initial Connection Error State (if no cached data available)
    if (error && !data) {
        return (
            <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-8 select-none text-center">
                <div className="bg-slate-900 border-2 border-slate-800 p-10 rounded-3xl max-w-lg shadow-2xl flex flex-col items-center">
                    <div className="bg-amber-950/80 p-5 rounded-2xl border border-amber-800/80 mb-6 text-amber-400">
                        <AlertCircle className="w-12 h-12" />
                    </div>
                    <h2 className="text-2xl font-black text-white mb-3 tracking-wide">
                        Connection Unavailable
                    </h2>
                    <p className="text-slate-400 text-sm font-medium leading-relaxed mb-6">
                        {error}
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-all shadow-md flex items-center space-x-2"
                    >
                        <RefreshCw className="w-4 h-4" />
                        <span>Retry Connection</span>
                    </button>
                </div>
            </div>
        );
    }

    const displayInfo = data?.display || {};
    const displayName = displayInfo.display_name || `${data?.floor_side?.side_name || 'CORRIDOR'} DISPLAY`;

    return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between select-none overflow-hidden font-sans">
            {/* Header Chrome */}
            <SignageHeader
                building={data?.building}
                floor={data?.floor}
                floorSide={data?.floor_side}
                formattedTime={formattedTime}
                formattedDate={formattedDate}
            />

            {/* Active Slide Rendering */}
            <main className="flex-1 flex flex-col min-h-0">
                {currentSlide === SLIDES.ONGOING && (
                    <OngoingSlide
                        sessions={ongoingSessions}
                        displayName={displayName}
                        now={now}
                        currentPage={currentPage}
                        totalPages={totalPages}
                    />
                )}

                {currentSlide === SLIDES.UPCOMING && (
                    <UpcomingSlide
                        sessions={upcomingSessions}
                        displayName={displayName}
                        now={now}
                        currentPage={currentPage}
                        totalPages={totalPages}
                    />
                )}

                {currentSlide === SLIDES.ROOM_STATUS && (
                    <RoomStatusSlide
                        roomStatuses={roomStatus}
                        displayName={displayName}
                    />
                )}

                {currentSlide === SLIDES.SESSION_UPDATES && (
                    <SessionUpdatesSlide
                        cancelledSessions={cancelledSessions}
                        rescheduledSessions={rescheduledSessions}
                        displayName={displayName}
                        now={now}
                        currentPage={currentPage}
                        totalPages={totalPages}
                    />
                )}
            </main>

            {/* Notice Bar */}
            <NoticeBar slide={currentSlide} />

            {/* Footer Chrome */}
            <SignageFooter
                refreshInterval={data?.refresh_interval_seconds || 30}
                isReconnecting={isReconnecting}
            />
        </div>
    );
}
