import React from 'react';
import { RefreshCw, WifiOff } from 'lucide-react';

/**
 * Shared footer bar for ScheduleMate Digital Signage Display.
 * Displays copyright info, refresh interval status, and offline reconnecting indicator.
 */
export default function SignageFooter({ refreshInterval = 30, isReconnecting = false }) {
    return (
        <footer className="bg-slate-950 text-slate-400 px-8 py-3 border-t border-slate-800 flex items-center justify-between text-xs font-medium">
            {/* Left: Copyright */}
            <div className="flex items-center space-x-3">
                <span className="text-slate-300 font-semibold">© 2026 ScheduleMate</span>
                <span className="text-slate-700">•</span>
                <span className="text-slate-400">Digital Signage System</span>
            </div>

            {/* Middle: Reconnecting Alert Badge */}
            {isReconnecting && (
                <div className="flex items-center space-x-2 bg-amber-500/20 text-amber-300 border border-amber-500/40 px-3 py-1 rounded-full animate-pulse">
                    <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                    <span className="font-semibold text-xs">Reconnecting to server... (showing cached schedule)</span>
                </div>
            )}

            {/* Right: Refresh Status */}
            <div className="flex items-center space-x-2 text-slate-400">
                <RefreshCw className={`w-3.5 h-3.5 text-blue-400 ${isReconnecting ? 'animate-spin' : ''}`} />
                <span>Auto refresh in <strong className="text-slate-200 font-bold">{refreshInterval}s</strong></span>
            </div>
        </footer>
    );
}
