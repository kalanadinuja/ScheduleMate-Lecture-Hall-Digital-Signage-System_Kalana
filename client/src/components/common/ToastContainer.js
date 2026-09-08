import React from 'react';
import { AlertCircle, CheckCircle, X } from 'lucide-react';

const ToastContainer = ({ toasts = [], onDismiss }) => {
    if (toasts.length === 0) return null;

    return (
        <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={`pointer-events-auto p-4 rounded-xl shadow-xl border flex items-start gap-3 transition-all animate-in slide-in-from-bottom-5 duration-200 ${
                        toast.type === 'error'
                            ? 'bg-red-50 text-red-900 border-red-200'
                            : 'bg-emerald-50 text-emerald-900 border-emerald-200'
                    }`}
                >
                    {toast.type === 'error' ? (
                        <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    ) : (
                        <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 text-xs font-semibold leading-relaxed">
                        {toast.message}
                    </div>
                    {onDismiss && (
                        <button
                            type="button"
                            onClick={() => onDismiss(toast.id)}
                            className="text-gray-400 hover:text-gray-600 p-0.5 rounded-md"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
};

export default ToastContainer;
