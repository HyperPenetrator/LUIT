import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const BottomNav = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const navItems = [
        { id: 'home', label: 'Home', icon: '🏠', path: '/' },
        { id: 'report', label: 'Report', icon: '📝', path: '/report' },
        { id: 'alerts', label: 'Alerts', icon: '🚨', path: '/alerts' },
        { id: 'help', label: 'Help', icon: '❓', path: '/guidance' }
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] md:hidden">
            <div className="flex justify-around items-center h-20 px-2">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => navigate(item.path)}
                        className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-all active:scale-95 ${isActive(item.path)
                                ? 'text-blue-600 dark:text-blue-400'
                                : 'text-slate-400 opacity-60'
                            }`}
                        style={{ minWidth: '48px', minHeight: '48px' }}
                    >
                        <span className="text-2xl">{item.icon}</span>
                        <span className="text-[10px] font-black uppercase tracking-tighter">{item.label}</span>
                        {isActive(item.path) && (
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 absolute bottom-2"></div>
                        )}
                    </button>
                ))}
            </div>
        </nav>
    );
};

export default BottomNav;
