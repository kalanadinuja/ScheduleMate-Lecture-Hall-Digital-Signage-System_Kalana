import React, { useState, useEffect } from 'react';
import { sessionsApi } from '../api';
import DataTable from '../components/common/DataTable';
import ToastContainer from '../components/common/ToastContainer';
import StatusPill from '../components/common/StatusPill';
import StatCard from '../components/common/StatCard';
import CascadingLocationSelect from '../components/common/CascadingLocationSelect';
import { BarChart3, Download, Filter, Calendar, Clock, CheckCircle, Ban } from 'lucide-react';

const Reports = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const pastWeekStr = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const [dateFrom, setDateFrom] = useState(pastWeekStr);
    const [dateTo, setDateTo] = useState(todayStr);
    const [filterLoc, setFilterLoc] = useState({
        building_id: '',
        floor_id: '',
        hall_id: ''
    });

    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [toasts, setToasts] = useState([]);

    const showToast = (message, type = 'success') => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 4000);
    };

    const fetchReport = async () => {
        setLoading(true);
        try {
            const params = {
                date_from: dateFrom,
                date_to: dateTo
            };
            if (filterLoc.building_id) params.building_id = filterLoc.building_id;
            if (filterLoc.floor_id) params.floor_id = filterLoc.floor_id;
            if (filterLoc.hall_id) params.hall_id = filterLoc.hall_id;

            const res = await sessionsApi.getAll(params);
            if (res.data?.success) {
                setSessions(res.data.data);
            }
        } catch (err) {
            showToast('Failed to generate report data', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport();
    }, []);

    const handleGenerate = (e) => {
        e.preventDefault();
        fetchReport();
    };

    const handleExportCSV = () => {
        if (sessions.length === 0) {
            showToast('No report rows available to export', 'error');
            return;
        }

        const headers = ['Session Date', 'Start Time', 'End Time', 'Module Code', 'Module Name', 'Lecturer', 'Hall Code', 'Building', 'Status', 'Session Type'];
        const rows = sessions.map((s) => [
            s.session_date,
            s.start_time,
            s.end_time,
            `"${s.module_code}"`,
            `"${s.module_name}"`,
            `"${s.lecturer_name}"`,
            `"${s.hall_code}"`,
            `"${s.building_name}"`,
            `"${s.computed_status}"`,
            `"${s.session_type || 'Lecture'}"`
        ]);

        const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `ScheduleMate_Report_${dateFrom}_to_${dateTo}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showToast('Report CSV downloaded successfully', 'success');
    };

    const completedCount = sessions.filter((s) => s.computed_status === 'Completed' || s.computed_status === 'Ongoing').length;
    const cancelledCount = sessions.filter((s) => s.computed_status === 'Cancelled').length;
    const rescheduledCount = sessions.filter((s) => s.computed_status === 'Rescheduled').length;

    const columns = [
        {
            header: 'Date & Time',
            accessor: 'session_date',
            cell: (row) => (
                <div className="text-xs space-y-0.5">
                    <div className="font-bold text-gray-900">{row.session_date}</div>
                    <div className="text-blue-600 font-semibold">{row.start_time?.slice(0, 5)} - {row.end_time?.slice(0, 5)}</div>
                </div>
            )
        },
        {
            header: 'Module Code & Name',
            accessor: 'module_code',
            cell: (row) => (
                <div>
                    <div className="font-bold text-blue-600 text-xs">{row.module_code}</div>
                    <div className="font-semibold text-gray-900 text-xs">{row.module_name}</div>
                </div>
            )
        },
        {
            header: 'Lecturer',
            accessor: 'lecturer_name',
            cell: (row) => <span className="text-xs font-semibold text-gray-800">{row.lecturer_name}</span>
        },
        {
            header: 'Venue',
            accessor: 'hall_code',
            cell: (row) => (
                <div className="text-xs font-medium">
                    <span className="px-2 py-0.5 bg-gray-100 font-mono font-bold rounded text-gray-900 border border-gray-200">
                        {row.hall_code}
                    </span>
                    <div className="text-[11px] text-gray-500 mt-0.5">{row.building_code}</div>
                </div>
            )
        },
        {
            header: 'Status',
            accessor: 'computed_status',
            cell: (row) => <StatusPill status={row.computed_status} />
        }
    ];

    return (
        <div className="space-y-6">
            <ToastContainer toasts={toasts} onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Reports & Analytics</h1>
                    <p className="text-xs text-gray-500 font-medium mt-0.5">
                        Generate and export lecture utilization reports across custom date ranges and venues
                    </p>
                </div>
                <button
                    type="button"
                    onClick={handleExportCSV}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/30 flex items-center gap-2 transition-all"
                >
                    <Download className="w-4 h-4" />
                    <span>Export CSV Report</span>
                </button>
            </div>

            {/* Date Range & Location Filter Form */}
            <form onSubmit={handleGenerate} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-700 uppercase tracking-wider">
                    <Filter className="w-4 h-4 text-blue-600" />
                    <span>Report Generation Parameters</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">From Date</label>
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-medium"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">To Date</label>
                        <input
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-medium"
                            required
                        />
                    </div>

                    <div className="lg:col-span-3">
                        <CascadingLocationSelect
                            selectedBuildingId={filterLoc.building_id}
                            selectedFloorId={filterLoc.floor_id}
                            selectedHallId={filterLoc.hall_id}
                            showFloorSide={false}
                            onChange={(loc) => setFilterLoc((prev) => ({ ...prev, ...loc }))}
                        />
                    </div>

                    <div className="flex items-end">
                        <button
                            type="submit"
                            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
                        >
                            <BarChart3 className="w-4 h-4" />
                            <span>Generate Report</span>
                        </button>
                    </div>
                </div>
            </form>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <StatCard title="TOTAL SESSIONS" value={sessions.length} badgeText="Range" badgeColor="blue" icon={Calendar} />
                <StatCard title="COMPLETED / ACTIVE" value={completedCount} badgeText="Delivered" badgeColor="green" icon={CheckCircle} />
                <StatCard title="RESCHEDULED" value={rescheduledCount} badgeText="Updated" badgeColor="amber" icon={Clock} />
                <StatCard title="CANCELLED" value={cancelledCount} badgeText="Notices" badgeColor="red" icon={Ban} />
            </div>

            {/* Report Results Table */}
            <DataTable
                columns={columns}
                data={sessions}
                loading={loading}
                emptyMessage="No sessions found for selected date range and venue parameters."
            />
        </div>
    );
};

export default Reports;
