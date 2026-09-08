import React, { useState, useRef, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Bell, ChevronDown, LogOut, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const routeNames = {
    '/': 'Dashboard',
    '/buildings': 'Buildings',
    '/floors': 'Floors',
    '/floor-sides': 'Floor Sides',
    '/lecture-halls': 'Lecture Halls',
    '/modules': 'Modules',
    '/lecturers': 'Lecturers',
    '/lecture-sessions': 'Lecture Sessions',
    '/digital-displays': 'Digital Displays',
    '/reports': 'Reports'
};

const Topbar = () => {
    const location = useLocation();
    const { admin, logout } = useAuth();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const currentPageName = routeNames[location.pathname] || 'Admin';

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const adminName = admin?.name || 'Admin User';
    const adminRole = admin?.role || 'Super Administrator';
    const initials = adminName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'AD';

    return (
        <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between sticky top-0 z-20 shadow-xs">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm">
                <Link to="/" className="text-gray-500 hover:text-gray-800 font-medium">ScheduleMate</Link>
                <span className="text-gray-400">/</span>
                <span className="text-gray-900 font-semibold">{currentPageName}</span>
            </div>

            {/* Right section controls */}
            <div className="flex items-center gap-4">
                {/* Static Live Signage Sync Status Pill */}
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-xs font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Live Digital Signage Sync</span>
                </div>

                {/* Static Notification Bell */}
                <button
                    type="button"
                    onClick={() => alert('No unread notifications.')}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full relative transition-colors"
                    title="Notifications"
                >
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
                </button>

                <div className="h-6 w-px bg-gray-200"></div>

                {/* Admin Profile Dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        type="button"
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-bold text-sm flex items-center justify-center border border-blue-200">
                            {initials}
                        </div>
                        <div className="hidden md:block text-left">
                            <div className="text-xs font-bold text-gray-900 leading-tight">{adminName}</div>
                            <div className="text-[11px] text-gray-500 font-medium">{adminRole}</div>
                        </div>
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                    </button>

                    {dropdownOpen && (
                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                            <div className="px-4 py-2.5 border-b border-gray-100">
                                <p className="text-xs font-semibold text-gray-900">{adminName}</p>
                                <p className="text-xs text-gray-500 truncate">{admin?.email || 'admin@sparkline.lk'}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    setDropdownOpen(false);
                                    logout();
                                }}
                                className="w-full px-4 py-2 text-left text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                <span>Logout</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Topbar;
