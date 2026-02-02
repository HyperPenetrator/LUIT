import React, { useState, useEffect } from 'react';

const OfflineNotice = () => {
    const [isOffline, setIsOffline] = useState(!navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    if (!isOffline) return null;

    return (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-red-600 text-white p-3 text-center text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3 animate-slideDown">
            <span className="animate-pulse">⚠️</span>
            Working Offline - Changes will sync when reconnected
            <span className="animate-pulse">⚠️</span>
        </div>
    );
};

export default OfflineNotice;
