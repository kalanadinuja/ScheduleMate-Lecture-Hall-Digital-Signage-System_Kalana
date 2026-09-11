import React from 'react';

const statusStyles = {
    // Green variants
    Active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Ongoing: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Online: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Ongoing Now': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Available: 'bg-emerald-50 text-emerald-700 border-emerald-200',

    // Blue variants
    Upcoming: 'bg-blue-50 text-blue-700 border-blue-200',
    'Upcoming Soon': 'bg-blue-50 text-blue-700 border-blue-200',
    Scheduled: 'bg-blue-50 text-blue-700 border-blue-200',
    Core: 'bg-blue-50 text-blue-700 border-blue-200',

    // Red variants
    Cancelled: 'bg-red-50 text-red-700 border-red-200',
    Offline: 'bg-red-50 text-red-700 border-red-200',
    Inactive: 'bg-red-50 text-red-700 border-red-200',
    'Temporarily Unavailable': 'bg-red-50 text-red-700 border-red-200',

    // Amber variants
    Rescheduled: 'bg-amber-50 text-amber-700 border-amber-200',
    Maintenance: 'bg-amber-50 text-amber-700 border-amber-200',
    Elective: 'bg-purple-50 text-purple-700 border-purple-200',
    'Session Finished': 'bg-gray-100 text-gray-700 border-gray-200'
};

const StatusPill = ({ status, text }) => {
    const label = text || status || 'Active';
    const styleClass = statusStyles[label] || statusStyles[status] || 'bg-gray-100 text-gray-700 border-gray-200';

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${styleClass}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
            <span>{label}</span>
        </span>
    );
};

export default StatusPill;
