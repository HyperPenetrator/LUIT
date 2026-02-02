import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { alertsApi } from '../api';
import { useLocationStore } from '../store';

const AlertsPage = () => {
    const navigate = useNavigate();
    const { latitude, longitude } = useLocationStore();
    const [darkMode, setDarkMode] = useState(() => JSON.parse(localStorage.getItem('darkMode') || 'false'));
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [affectedStatus, setAffectedStatus] = useState({});

    useEffect(() => {
        fetchAlerts();
    }, [latitude, longitude]);

    const fetchAlerts = async () => {
        try {
            setLoading(true);
            const res = await alertsApi.getAlerts(latitude, longitude, 20000);
            setAlerts(res.data.alerts || []);
        } catch (err) {
            console.error('Failed to fetch alerts', err);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAffected = async (alertId) => {
        try {
            // Mock user ID for now
            const userId = "user_" + Math.random().toString(36).substr(2, 9);
            const res = await alertsApi.updateStatus(alertId, 'affected', { user_id: userId });
            setAffectedStatus(prev => ({ ...prev, [alertId]: true }));
            alert('Your status has been recorded for population tracking.');
        } catch (err) {
            console.error('Failed to mark affected', err);
        }
    };

    const shareAlert = (alert) => {
        const text = `⚠️ LUIT ALERT: ${alert.contaminationType} contamination detected in ${alert.village || 'your area'}. Severity: ${alert.severityLevel}. Guidance: ${alert.message} Check details on LUIT app.`;
        if (navigator.share) {
            navigator.share({ title: 'LUIT Water Alert', text }).catch(() => { });
        } else {
            window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
        }
    };

    const getSeverityColor = (severity) => {
        switch (severity?.toLowerCase()) {
            case 'critical': return 'bg-red-600 border-red-800';
            case 'unsafe': return 'bg-orange-600 border-orange-800';
            case 'caution': return 'bg-yellow-500 border-yellow-700';
            default: return 'bg-blue-600 border-blue-800';
        }
    };

    const filteredAlerts = filter === 'all' ? alerts : alerts.filter(a => a.severityLevel === filter);

    return (
        <div className={`min-h-screen transition-colors ${darkMode ? 'bg-slate-900 text-white' : 'bg-blue-50 text-slate-900'}`}>
            <header className={`p-4 border-b sticky top-0 z-50 flex justify-between items-center ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-blue-100 shadow-sm'}`}>
                <div className="flex items-center gap-2">
                    <span onClick={() => navigate('/')} className="text-2xl cursor-pointer">←</span>
                    <h1 className="text-xl font-black text-blue-600">ACTIVE ALERTS 🚨</h1>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">
                        {darkMode ? '☀️' : '🌙'}
                    </button>
                    <button onClick={fetchAlerts} className="p-2">🔄</button>
                </div>
            </header>

            <main className="max-w-4xl mx-auto p-4 space-y-6">
                {/* Proximity Warning */}
                {!latitude && (
                    <div className="p-4 rounded-2xl bg-yellow-500/10 border-2 border-yellow-500/20 text-sm italic">
                        📍 Enable location to see alerts near you.
                    </div>
                )}

                {/* Filters */}
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                    {['all', 'critical', 'unsafe', 'caution'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-full text-xs font-bold uppercase border-2 transition ${filter === f ? 'bg-blue-600 border-blue-600 text-white' : (darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-blue-100')
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-50">
                        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent animate-spin rounded-full"></div>
                        <p className="font-bold">Syncing live alerts...</p>
                    </div>
                ) : filteredAlerts.length === 0 ? (
                    <div className="text-center py-20 space-y-4 opacity-50">
                        <span className="text-6xl">🛡️</span>
                        <h2 className="text-xl font-bold">No High-Risk Alerts Found</h2>
                        <p className="text-sm">Your area seems safe for now.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredAlerts.map(alert => (
                            <div key={alert.id} className={`p-6 rounded-3xl border-2 shadow-xl transition transform hover:scale-[1.02] ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-blue-50 shadow-blue-500/5'
                                }`}>
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`px-3 py-1 rounded-full text-[10px] font-black text-white uppercase ${getSeverityColor(alert.severityLevel)}`}>
                                        {alert.severityLevel}
                                    </div>
                                    <span className="text-[10px] opacity-40 font-bold uppercase">
                                        {new Date(alert.createdAt).toLocaleDateString()}
                                    </span>
                                </div>

                                <h3 className="text-lg font-black mb-2 flex items-center gap-2">
                                    <span>{alert.contaminationType === 'arsenic' ? '🔴' : alert.contaminationType === 'bacteria' ? '🟢' : '🟡'}</span>
                                    {alert.contaminationType.toUpperCase()} ALERT
                                </h3>

                                <p className="text-sm opacity-80 mb-6 leading-relaxed">
                                    {alert.message}
                                </p>

                                {alert.distance && (
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-blue-500 mb-6 px-3 py-1 bg-blue-500/5 rounded-lg w-fit">
                                        📍 {Math.round(alert.distance / 100) / 10} km from your spot
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => handleMarkAffected(alert.id)}
                                        disabled={affectedStatus[alert.id]}
                                        className={`py-3 rounded-2xl text-[10px] font-black uppercase transition ${affectedStatus[alert.id]
                                            ? 'bg-green-500 text-white'
                                            : (darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-100 hover:bg-slate-200')
                                            }`}
                                    >
                                        {affectedStatus[alert.id] ? '✓ RECORDED' : "I'm Affected"}
                                    </button>
                                    <button
                                        onClick={() => shareAlert(alert)}
                                        className="py-3 rounded-2xl bg-blue-600 text-white text-[10px] font-black uppercase hover:bg-blue-700 shadow-lg shadow-blue-600/20"
                                    >
                                        Share Alert
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                <div className="pt-8 pb-12">
                    <button
                        onClick={() => navigate('/safe-sources')}
                        className="w-full py-5 bg-emerald-600 text-white font-black rounded-3xl uppercase tracking-tighter shadow-xl shadow-emerald-500/20 active:scale-95 transition"
                    >
                        💧 Find Nearest Safe Water Source
                    </button>
                </div>
            </main>
        </div>
    );
};

export default AlertsPage;
