import React from 'react';

const StatCard = ({ title, value, badgeText, badgeColor = 'blue', icon: Icon, subtitle }) => {
    const badgeStyleMap = {
        blue: 'bg-blue-50 text-blue-700 border-blue-200',
        green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        amber: 'bg-amber-50 text-amber-700 border-amber-200',
        red: 'bg-red-50 text-red-700 border-red-200'
    };

    const iconBgMap = {
        blue: 'bg-blue-100 text-blue-600',
        green: 'bg-emerald-100 text-emerald-600',
        amber: 'bg-amber-100 text-amber-600',
        red: 'bg-red-100 text-red-600'
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-4">
                {Icon && (
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconBgMap[badgeColor] || iconBgMap.blue}`}>
                        <Icon className="w-6 h-6" />
                    </div>
                )}
                <div>
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">{title}</div>
                    <div className="text-2xl font-extrabold text-gray-900 mt-1">{value}</div>
                    {subtitle && <div className="text-xs text-gray-400 mt-0.5">{subtitle}</div>}
                </div>
            </div>

            {badgeText && (
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${badgeStyleMap[badgeColor] || badgeStyleMap.blue}`}>
                    {badgeText}
                </span>
            )}
        </div>
    );
};

export default StatCard;
