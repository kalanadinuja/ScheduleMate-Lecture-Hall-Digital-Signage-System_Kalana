import React from 'react';
import Modal from './Modal';
import { AlertTriangle } from 'lucide-react';

const ConfirmDialog = ({
    isOpen,
    onClose,
    onConfirm,
    title = 'Confirm Action',
    message = 'Are you sure you want to delete this item? This action cannot be undone.',
    confirmText = 'Delete',
    loading = false,
    errorMessage = null
}) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
            <div className="flex flex-col gap-4">
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm text-gray-600">{message}</p>
                    </div>
                </div>

                {errorMessage && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs font-semibold text-red-700">
                        ⚠️ {errorMessage}
                    </div>
                )}

                <div className="flex justify-end gap-3 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={loading}
                        className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm shadow-red-600/30 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading ? 'Processing...' : confirmText}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default ConfirmDialog;
