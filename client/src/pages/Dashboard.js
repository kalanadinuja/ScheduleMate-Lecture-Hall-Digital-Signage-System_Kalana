import React, { useState, useEffect } from 'react';
import { dashboardApi } from '../api';
import StatCard from '../components/common/StatCard';
import StatusPill from '../components/common/StatusPill';
import { Building2, School, Users, Calendar, RefreshCw } from 'lucide-react';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchStats = async (isManual = false) => {
        if (isManual) setRefreshing(true);
        try {
            const res = await dashboardApi.getStats();
            if (res.data?.success) {
                setStats(res.data.data);
            }
        } catch (err) {
            console.error('Failed to fetch dashboard stats', err);
        } finally {
            setLoading(false);
            if (isManual) setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="h-8 bg-gray-200 rounded-lg w-48 animate-pulse"></div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-28 bg-white rounded-xl border border-gray-200 animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    const displays = stats?.displays || { total: 0, online: 0, offline: 0, maintenance: 0 };
    const roomOccupancy = stats?.room_occupancy || { occupied: 0, upcoming: 0, free: 0, total: 0, occupancy_rate: 0 };
    const todaySessions = stats?.today_sessions || { ongoing: 0, upcoming: 0, total_today: 0 };
    const schedule = stats?.todays_schedule || [];

    return (
        <div className="space-y-6">
            {/* Title & Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
                    <p className="text-xs text-gray-500 font-medium mt-0.5">
                        Real-time campus digital signage and room utilization engine
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => fetchStats(true)}
                        className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-xs flex items-center gap-2 transition-colors"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                        <span>Sync</span>
                    </button>
                </div>
            </div>

            {/* Stat Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="BUILDINGS"
                    value={stats?.total_buildings || 0}
                    badgeText="100%"
                    badgeColor="blue"
                    icon={Building2}
                />
                <StatCard
                    title="LECTURE HALLS"
                    value={stats?.total_halls || 0}
                    badgeText={`${roomOccupancy.total} Total`}
                    badgeColor="green"
                    icon={School}
                />
                <StatCard
                    title="LECTURERS"
                    value={stats?.total_lecturers || 0}
                    badgeText="Active"
                    badgeColor="green"
                    icon={Users}
                />
                <StatCard
                    title="TODAY'S SESSIONS"
                    value={todaySessions.total_today || 0}
                    badgeText="Live Now"
                    badgeColor="blue"
                    icon={Calendar}
                />
            </div>

            {/* Main Grid Section: Today's Schedule & Side Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left 2 Cols: Today's Schedule */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-base font-bold text-gray-900">Today's Schedule</h2>
                            <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold">
                                {schedule.length} Sessions Today
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/80 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                                        <th className="py-3 px-4">Time</th>
                                        <th className="py-3 px-4">Module</th>
                                        <th className="py-3 px-4">Lecturer</th>
                                        <th className="py-3 px-4">Hall</th>
                                        <th className="py-3 px-4">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-sm">
                                    {schedule.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="py-8 text-center text-xs text-gray-400 font-medium">
                                                No lecture sessions scheduled for today.
                                            </td>
                                        </tr>
                                    ) : (
                                        schedule.map((sess) => (
                                            <tr key={sess.session_id} className="hover:bg-slate-50/60 transition-colors">
                                                <td className="py-3.5 px-4 text-xs font-bold text-gray-900 whitespace-nowrap">
                                                    {sess.start_time?.slice(0, 5)} - {sess.end_time?.slice(0, 5)}
                                                </td>
                                                <td className="py-3.5 px-4 font-semibold text-gray-800">
                                                    <div className="text-xs font-bold text-blue-600">{sess.module_code}</div>
                                                    <div className="text-xs text-gray-500 font-medium truncate max-w-[160px]">{sess.module_name}</div>
                                                </td>
                                                <td className="py-3.5 px-4 text-xs text-gray-700 font-medium whitespace-nowrap">
                                                    {sess.lecturer_name}
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <span className="px-2 py-0.5 bg-gray-100 text-gray-800 rounded font-mono text-xs font-bold border border-gray-200">
                                                        {sess.hall_code}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <StatusPill status={sess.computed_status} />
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Right 1 Col: Occupancy & Display Status */}
                <div className="space-y-6">
                    {/* Room Status Summary Card */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-4">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                            <h3 className="text-sm font-bold text-gray-900">Room Status Summary</h3>
                            <span className="text-xs text-gray-400 font-medium">Total: {roomOccupancy.total} Halls</span>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-xs font-medium">
                                <span className="flex items-center gap-2 text-gray-700">
                                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                                    Occupied
                                </span>
                                <span className="font-bold text-gray-900">{roomOccupancy.occupied}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs font-medium">
                                <span className="flex items-center gap-2 text-gray-700">
                                    <span className="w-2.5 h-2.5 rounded-full bg-blue-300"></span>
                                    Upcoming
                                </span>
                                <span className="font-bold text-gray-900">{roomOccupancy.upcoming}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs font-medium">
                                <span className="flex items-center gap-2 text-gray-700">
                                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                                    Free
                                </span>
                                <span className="font-bold text-gray-900">{roomOccupancy.free}</span>
                            </div>
                        </div>

                        {/* Occupancy Rate Bar */}
                        <div className="pt-2 border-t border-gray-100">
                            <div className="flex justify-between text-xs font-bold mb-1.5">
                                <span className="text-gray-500">Occupancy Rate</span>
                                <span className="text-blue-600">{roomOccupancy.occupancy_rate}% Load</span>
                            </div>
                            <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-600 rounded-full transition-all duration-500"
                                    style={{ width: `${Math.min(100, roomOccupancy.occupancy_rate)}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>

                    {/* Display Status Card */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-4">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                            <h3 className="text-sm font-bold text-gray-900">Display Status</h3>
                            <span className="text-xs text-gray-400 font-medium">TV Hardware</span>
                        </div>

                        <div className="flex items-center gap-6">
                            {/* Simple Donut representation */}
                            <div className="w-24 h-24 rounded-full border-8 border-emerald-500 border-t-amber-500 border-r-red-500 flex flex-col items-center justify-center shrink-0">
                                <span className="text-lg font-extrabold text-gray-900">{displays.total}</span>
                                <span className="text-[10px] font-bold text-gray-400 uppercase">TVs</span>
                            </div>

                            <div className="space-y-2 text-xs flex-1">
                                <div className="flex items-center justify-between">
                                    <span className="flex items-center gap-1.5 font-medium text-gray-700">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Online
                                    </span>
                                    <span className="font-bold text-gray-900">{displays.online}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="flex items-center gap-1.5 font-medium text-gray-700">
                                        <span className="w-2 h-2 rounded-full bg-red-500"></span> Offline
                                    </span>
                                    <span className="font-bold text-gray-900">{displays.offline}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="flex items-center gap-1.5 font-medium text-gray-700">
                                        <span className="w-2 h-2 rounded-full bg-amber-500"></span> Maintenance
                                    </span>
                                    <span className="font-bold text-gray-900">{displays.maintenance}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
