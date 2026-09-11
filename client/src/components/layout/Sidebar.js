import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Building2,
    Layers,
    ArrowLeftRight,
    School,
    BookOpen,
    Users,
    Calendar,
    Tv,
    BarChart3,
    Monitor
} from 'lucide-react';

const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Buildings', path: '/buildings', icon: Building2 },
    { name: 'Floors', path: '/floors', icon: Layers },
    { name: 'Floor Sides', path: '/floor-sides', icon: ArrowLeftRight },
    { name: 'Lecture Halls', path: '/lecture-halls', icon: School },
    { name: 'Modules', path: '/modules', icon: BookOpen },
    { name: 'Lecturers', path: '/lecturers', icon: Users },
    { name: 'Lecture Sessions', path: '/lecture-sessions', icon: Calendar },
    { name: 'Digital Displays', path: '/digital-displays', icon: Tv },
    { name: 'Reports', path: '/reports', icon: BarChart3 }
];

const Sidebar = () => {
    return (
        <aside className="w-64 bg-navy-900 text-slate-300 flex flex-col h-screen sticky top-0 border-r border-slate-800 z-30 select-none">
            {/* Header / Logo */}
            <div className="p-5 flex items-center gap-3 border-b border-slate-800/80">
                <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                    <Monitor className="w-5 h-5" />
                </div>
                <div>
                    <h1 className="font-bold text-white text-lg tracking-tight leading-none">ScheduleMate</h1>
                    <span className="text-xs text-slate-400 font-medium">Lecture Hall Digital Signage</span>
                </div>
            </div>

            {/* Navigation items */}
            <div className="flex-1 py-4 px-3 overflow-y-auto space-y-1">
                <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 tracking-wider uppercase">
                    Navigation
                </div>
                {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.path === '/'}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                                    isActive
                                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30 font-semibold'
                                        : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                                }`
                            }
                        >
                            <Icon className="w-4 h-4 shrink-0" />
                            <span>{item.name}</span>
                        </NavLink>
                    );
                })}
            </div>

        </aside>
    );
};

export default Sidebar;
