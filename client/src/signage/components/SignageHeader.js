import React from 'react';
import { Calendar, Clock } from 'lucide-react';

/**
 * Top header component for ScheduleMate Digital Signage Display.
 * High contrast, large typography for corridor readability.
 */
export default function SignageHeader({ building, floor, floorSide, formattedTime, formattedDate }) {
    const buildingLabel = building?.building_name || building?.building_code || 'Main Building';
    const floorLabel = floor?.floor_name || (floor?.floor_number !== undefined ? `Level ${String(floor.floor_number).padStart(2, '0')}` : 'Level 01');
    const sideLabel = floorSide?.side_name || 'Corridor';

    return (
        <header className="bg-slate-900 text-white px-8 py-4 border-b border-slate-800 shadow-md flex items-center justify-between">
            {/* Left: Branding & Subtitle */}
            <div className="flex items-center space-x-4">
                <div className="bg-blue-600 text-white font-black text-2xl tracking-wider px-3 py-1.5 rounded-lg shadow-sm">
                    Schedule<span className="text-blue-200">Mate</span>
                </div>
                <div className="h-8 w-px bg-slate-700"></div>
                <div>
                    <h1 className="text-xs uppercase font-bold tracking-widest text-slate-400">
                        LECTURE HALL SIGNAGE
                    </h1>
                    <p className="text-sm font-semibold text-slate-200 tracking-wide">
                        Sparkline Academy
                    </p>
                </div>
            </div>

            {/* Center: Location Chips */}
            <div className="flex items-center space-x-3 bg-slate-950/80 px-4 py-2 rounded-xl border border-slate-800">
                <span className="text-xs font-semibold text-slate-400 bg-slate-800/80 px-3 py-1.5 rounded-lg">
                    {buildingLabel}
                </span>
                <span className="text-slate-600 font-bold">•</span>
                <span className="text-xs font-bold text-white bg-blue-600 px-3.5 py-1.5 rounded-lg shadow-sm border border-blue-400/40">
                    {floorLabel}
                </span>
                <span className="text-slate-600 font-bold">•</span>
                <span className="text-xs font-semibold text-slate-400 bg-slate-800/80 px-3 py-1.5 rounded-lg">
                    {sideLabel}
                </span>
            </div>

            {/* Right: Live Clock & Date */}
            <div className="flex items-center space-x-6">
                <div className="text-right">
                    <div className="flex items-center justify-end space-x-2 text-blue-400 font-mono text-2xl font-black tracking-tight">
                        <Clock className="w-5 h-5 text-blue-400" />
                        <span>{formattedTime}</span>
                    </div>
                    <div className="flex items-center justify-end space-x-1.5 text-slate-400 text-xs font-medium mt-0.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{formattedDate}</span>
                    </div>
                </div>
            </div>
        </header>
    );
}
