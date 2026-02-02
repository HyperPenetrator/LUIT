import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { alertsApi, reportingApi } from '../api';
import { useAuthStore } from '../store';

const HealthAgentDashboard = () => {
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);
    const [darkMode, setDarkMode] = useState(() => JSON.parse(localStorage.getItem('darkMode') || 'false'));
    const [activeAlerts, setActiveAlerts] = useState([]);
    const [pendingReports, setPendingReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('alerts');

    // Manual Alert Form
    const [showManualForm, setShowManualForm] = useState(false);
    const [manualData, setManualData] = useState({
        latitude: 26.1445, longitude: 91.7362,
        contaminationType: 'arsenic', severityLevel: 'critical',
        message: '', radius: 5000
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [alertsRes, reportsRes] = await Promise.all([
                alertsApi.getAlerts(),
                reportingApi.getReports()
            ]);
            setActiveAlerts(alertsRes.data.alerts || []);
            // Filter only pending/unverified reports
            setPendingReports((reportsRes.data.reports || []).filter(r => !r.verified));
        } catch (err) {
            console.error('Failed to sync health dashboard', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDismiss = async (alertId) => {
        const reason = prompt("Enter reason for dismissal (e.g., False positive, Resolved):");
        if (!reason) return;
        try {
            await alertsApi.dismissAlert(alert_id, reason);
            setActiveAlerts(prev => prev.filter(a => a.id !== alertId));
            alert('Alert dismissed.');
        } catch (err) {
            alert('Dismissal failed.');
        }
    };

    const handleManualSubmit = async (e) => {
        e.preventDefault();
        try {
            await alertsApi.createManualAlert(manualData);
            setShowManualForm(false);
            fetchData();
            alert('Manual alert broadcasted!');
        } catch (err) {
            alert('Broadcast failed.');
        }
    };

    return (
        <div className={`min-h-screen transition-colors ${darkMode ? 'bg-slate-900 text-white' : 'bg-blue-50 text-slate-900'}`}>
            <header className={`p-4 border-b sticky top-0 z-50 flex justify-between items-center ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-blue-100 shadow-sm'}`}>
                <div className="flex items-center gap-3">
                    <span className="text-3xl">🧑‍⚕️</span>
                    <div>
                        <h1 className="text-lg font-black text-blue-600">HEALTH AGENT COMMAND</h1>
                        <p className="text-[10px] opacity-60 font-bold uppercase tracking-widest">Official Verification Portal</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">
                        {darkMode ? '☀️' : '🌙'}
                    </button>
                    <button onClick={() => navigate('/')} className="text-xl">✕</button>
                </div>
            </header>

            <main className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
                {/* Stats Overview */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Active Alerts', val: activeAlerts.length, color: 'text-red-500' },
                        { label: 'Pending Verification', val: pendingReports.length, color: 'text-orange-500' },
                        { label: 'Population Affected', val: activeAlerts.reduce((acc, a) => acc + (a.affectedUsers?.length || 0), 0), color: 'text-blue-500' },
                        { label: 'Verified Sources', val: 582, color: 'text-green-500' },
                    ].map(s => (
                        <div key={s.label} className={`p-4 rounded-3xl border-2 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-blue-100'}`}>
                            <p className="text-[10px] font-bold opacity-50 uppercase">{s.label}</p>
                            <p className={`text-2xl font-black ${s.color}`}>{s.val}</p>
                        </div>
                    ))}
                </div>

                {/* Tabs */}
                <div className="flex border-b border-blue-200/20">
                    {['alerts', 'reports', 'broadcast'].map(t => (
                        <button
                            key={t}
                            onClick={() => {
                                if (t === 'broadcast') setShowManualForm(true);
                                else { setActiveTab(t); setShowManualForm(false); }
                            }}
                            className={`px-6 py-3 text-xs font-bold uppercase transition-all border-b-2 ${(activeTab === t && !showManualForm) || (t === 'broadcast' && showManualForm)
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent opacity-40'
                                }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>

                {!showManualForm ? (
                    <div className="space-y-4">
                        {activeTab === 'alerts' ? (
                            activeAlerts.map(alert => (
                                <div key={alert.id} className={`p-5 rounded-3xl border-2 flex flex-col md:flex-row justify-between items-center gap-4 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-blue-100'}`}>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className={`w-3 h-3 rounded-full ${alert.severityLevel === 'critical' ? 'bg-red-500' : 'bg-orange-500'} animate-pulse`}></span>
                                            <h3 className="font-black uppercase text-sm">{alert.contaminationType} Alert</h3>
                                            <span className="text-[9px] font-bold opacity-40">ID: {alert.id}</span>
                                        </div>
                                        <p className="text-xs opacity-70 italic">"{alert.message}"</p>
                                        <p className="text-[10px] font-bold text-blue-500 uppercase tracking-tighter">Loc: {alert.latitude.toFixed(4)}, {alert.longitude.toFixed(4)} | Radius: {alert.affectedArea.radius}m</p>
                                    </div>
                                    <div className="flex gap-2 w-full md:w-auto">
                                        <button onClick={() => handleDismiss(alert.id)} className="flex-1 px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-[10px] font-bold uppercase transition hover:bg-red-500 hover:text-white">Dismiss</button>
                                        <button className="flex-1 px-4 py-2 rounded-xl bg-blue-600 text-white text-[10px] font-bold uppercase hover:bg-blue-700">Deploy Response</button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            pendingReports.map(report => (
                                <div key={report.id} className={`p-5 rounded-3xl border-2 flex gap-4 items-center ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-blue-100'}`}>
                                    <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-2xl overflow-hidden flex-shrink-0">
                                        {report.imageUrl ? <img src={report.imageUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xl">💧</div>}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-bold uppercase">{report.village}</p>
                                        <p className="text-[10px] opacity-60 uppercase">{report.contaminationType} from {report.waterSource}</p>
                                        <p className="text-[9px] mt-1 opacity-40">{new Date(report.reportedAt).toLocaleString()}</p>
                                    </div>
                                    <button className="px-4 py-2 rounded-xl bg-green-500 text-white text-[10px] font-black uppercase shadow-lg shadow-green-500/10">Verify</button>
                                </div>
                            ))
                        )}
                        {((activeTab === 'alerts' && activeAlerts.length === 0) || (activeTab === 'reports' && pendingReports.length === 0)) && (
                            <div className="py-20 text-center opacity-30 italic text-sm">No items found for queue.</div>
                        )}
                    </div>
                ) : (
                    <form onSubmit={handleManualSubmit} className={`p-8 rounded-3xl border-2 space-y-4 max-w-2xl mx-auto shadow-2xl ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-blue-200'}`}>
                        <h2 className="text-xl font-black text-blue-600 mb-4">BROADCAST MANUAL ALERT 🛰️</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase opacity-50">Contamination</label>
                                <select
                                    value={manualData.contaminationType}
                                    onChange={e => setManualData({ ...manualData, contaminationType: e.target.value })}
                                    className={`w-full p-3 rounded-xl border ${darkMode ? 'bg-slate-700 border-slate-600' : 'bg-blue-50 border-blue-100'}`}
                                >
                                    <option value="arsenic">Arsenic</option>
                                    <option value="fluoride">Fluoride</option>
                                    <option value="bacteria">Bacteria</option>
                                    <option value="turbidity">Turbidity</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase opacity-50">Severity</label>
                                <select
                                    value={manualData.severityLevel}
                                    onChange={e => setManualData({ ...manualData, severityLevel: e.target.value })}
                                    className={`w-full p-3 rounded-xl border ${darkMode ? 'bg-slate-700 border-slate-600' : 'bg-blue-50 border-blue-100'}`}
                                >
                                    <option value="critical">Critical</option>
                                    <option value="unsafe">Unsafe</option>
                                    <option value="caution">Caution</option>
                                </select>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase opacity-50">Message To Public</label>
                            <textarea
                                rows="3"
                                placeholder="E.g., Tanker service deployed to Majuli. Test kits available at PHC..."
                                value={manualData.message}
                                onChange={e => setManualData({ ...manualData, message: e.target.value })}
                                className={`w-full p-3 rounded-xl border ${darkMode ? 'bg-slate-700 border-slate-600' : 'bg-blue-50 border-blue-100'}`}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase opacity-50">Latitude</label>
                                <input type="number" step="0.0001" value={manualData.latitude} onChange={e => setManualData({ ...manualData, latitude: parseFloat(e.target.value) })} className={`w-full p-3 rounded-xl border ${darkMode ? 'bg-slate-700 border-slate-600' : 'bg-blue-50 border-blue-100'}`} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase opacity-50">Longitude</label>
                                <input type="number" step="0.0001" value={manualData.longitude} onChange={e => setManualData({ ...manualData, longitude: parseFloat(e.target.value) })} className={`w-full p-3 rounded-xl border ${darkMode ? 'bg-slate-700 border-slate-600' : 'bg-blue-50 border-blue-100'}`} />
                            </div>
                        </div>
                        <button type="submit" className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl shadow-blue-600/20 transition-all uppercase tracking-widest mt-4">
                            Broadcast Alert 📢
                        </button>
                    </form>
                )}
            </main>
        </div>
    );
};

export default HealthAgentDashboard;
