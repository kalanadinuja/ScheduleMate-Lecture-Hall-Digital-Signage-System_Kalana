import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Inbox } from 'lucide-react';

const DataTable = ({ columns, data = [], loading = false, emptyMessage = 'No records found.' }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    const totalEntries = data.length;
    const totalPages = Math.ceil(totalEntries / pageSize) || 1;
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedData = data.slice(startIndex, startIndex + pageSize);

    if (loading) {
        return (
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs p-6 space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse"></div>
                ))}
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/80 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                            <th className="py-3.5 px-4 w-12 text-center">#</th>
                            {columns.map((col, idx) => (
                                <th key={idx} className={`py-3.5 px-4 ${col.className || ''}`}>
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                        {paginatedData.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length + 1} className="py-12 text-center text-gray-400">
                                    <div className="flex flex-col items-center gap-2">
                                        <Inbox className="w-8 h-8 text-gray-300 stroke-1" />
                                        <span className="text-xs font-medium">{emptyMessage}</span>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            paginatedData.map((row, rowIdx) => (
                                <tr key={row.id || rowIdx} className="hover:bg-slate-50/60 transition-colors">
                                    <td className="py-3.5 px-4 text-xs font-semibold text-gray-400 text-center">
                                        {startIndex + rowIdx + 1}
                                    </td>
                                    {columns.map((col, colIdx) => (
                                        <td key={colIdx} className={`py-3.5 px-4 ${col.className || ''}`}>
                                            {col.cell ? col.cell(row) : row[col.accessor]}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination footer */}
            {totalEntries > 0 && (
                <div className="px-6 py-3.5 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 font-medium">
                    <div>
                        Showing <span className="font-bold text-gray-800">{startIndex + 1}</span> to{' '}
                        <span className="font-bold text-gray-800">{Math.min(startIndex + pageSize, totalEntries)}</span> of{' '}
                        <span className="font-bold text-gray-800">{totalEntries}</span> entries
                    </div>
                    <div className="flex items-center gap-1.5">
                        <button
                            type="button"
                            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                            disabled={currentPage === 1}
                            className="p-1.5 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-30 transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="px-3 py-1 bg-blue-600 text-white rounded-md font-bold text-xs">
                            {currentPage}
                        </span>
                        <button
                            type="button"
                            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                            disabled={currentPage >= totalPages}
                            className="p-1.5 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-30 transition-colors"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DataTable;
