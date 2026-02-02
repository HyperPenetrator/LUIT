import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { healthAgentApi, alertsApi } from '../api';

const HealthAgentDashboard = () => {
    const navigate = useNavigate();
    const [darkMode, setDarkMode] = useState(() => JSON.parse(localStorage.getItem('darkMode') || 'false'));
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    // Data state
    const [summary, setSummary] = useState({});
    const [reports, setReports] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [analytics, setAnalytics] = useState({});

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const res = await healthAgentApi.getDashboard();
            setSummary(res.data.summary);
            setReports(res.data.reports);
            setAlerts(res.data.alerts);
            setAnalytics(res.data.analytics);
        } catch (err) {
            console.error('Master sync failed', err);
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (id, status) => {
        try {
            await healthAgentApi.verifyReport(id, status);
            fetchDashboardData();
            alert(`Report ${status ? 'Verified' : 'Dismissed'}`);
        } catch (err) { alert('Action failed'); }
    };

    const handleAlertDismiss = async (alertId) => {
        const reason = prompt("Reason for dismissal?");
        if (!reason) return;
        try {
            await alertsApi.dismissAlert(alertId, reason);
            fetchDashboardData();
        } catch (err) { alert('Dismiss failed'); }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white font-black italic animate-pulse">
            Establishing Secure Command Connection...
        </div>
    );

    return (
        <div className={`min-h-screen transition-colors ${darkMode ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-800'}`}>
            {/* Command Header */}
            <header className={`p-4 border-b flex justify-between items-center ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-xl z-50'}`}>
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black">HA</div>
                    <div>
                        <h1 className="text-sm font-black uppercase tracking-tighter">Health Agent Command Center</h1>
                        <p className="text-[10px] opacity-50 font-bold uppercase tracking-widest text-blue-500">Official Portal • District: Majuli</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => setDarkMode(!darkMode)} className="p-2">{darkMode ? '☀️' : '🌙'}</button>
                    <button onClick={() => navigate('/')} className="px-4 py-2 bg-slate-200 dark:bg-slate-700 rounded-lg text-xs font-bold uppercase">Exit</button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-4 gap-6">

                {/* Side Navigation */}
                <aside className="lg:col-span-1 space-y-4">
                    {['overview', 'map', 'reports', 'alerts', 'analytics'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`w-full text-left p-4 rounded-2xl text-xs font-black uppercase transition-all tracking-widest ${activeTab === tab ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'hover:bg-slate-200 dark:hover:bg-slate-800 opacity-60'}`}
                        >
                            {tab === 'overview' && '🏠 Dashboard'}
                            {tab === 'map' && '📍 Intelligence Map'}
                            {tab === 'reports' && '📝 Report Queue'}
                            {tab === 'alerts' && '🚨 Active Alerts'}
                            {tab === 'analytics' && '📊 Health Insights'}
                        </button>
                    ))}

                    <div className={`mt-10 p-6 rounded-3xl border-2 ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-blue-50 border-blue-100'}`}>
                        <h4 className="text-[10px] font-black uppercase opacity-40 mb-3">Today's Summary</h4>
                        <div className="space-y-4">
                            <div>
                                <p className="text-2xl font-black text-red-500">{summary.activeAlerts}</p>
                                <p className="text-[10px] font-bold opacity-60 uppercase">High Risk Alerts</p>
                            </div>
                            <div>
                                <p className="text-2xl font-black text-orange-500">{summary.pendingVerification}</p>
                                <p className="text-[10px] font-bold opacity-60 uppercase">Pending Review</p>
                            </div>
                            <div>
                                <p className="text-2xl font-black text-blue-500">{summary.totalAffected}</p>
                                <p className="text-[10px] font-bold opacity-60 uppercase">Citizens Affected</p>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Content Area */}
                <div className="lg:col-span-3 space-y-6">
                    {activeTab === 'overview' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                            <h2 className="text-xl font-black italic uppercase">Operational Overview</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className={`p-8 rounded-3xl border-2 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-xl'}`}>
                                    <span className="text-3xl mb-4 block">📢</span>
                                    <h3 className="font-black uppercase mb-2">Broadcast Alert</h3>
                                    <p className="text-xs opacity-60 mb-6">Manually trigger area-wide contamination alerts to the public via LUIT network.</p>
                                    <button onClick={() => setActiveTab('alerts')} className="w-full py-3 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase">Create New Alert</button>
                                </div>
                                <div className={`p-8 rounded-3xl border-2 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-xl'}`}>
                                    <span className="text-3xl mb-4 block">🩺</span>
                                    <h3 className="font-black uppercase mb-2">Verify Reports</h3>
                                    <p className="text-xs opacity-60 mb-6">Review incoming citizen reports and confirm contamination with test results.</p>
                                    <button onClick={() => setActiveTab('reports')} className="w-full py-3 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase">Review {summary.pendingVerification} Items</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'reports' && (
                        <div className="space-y-4 animate-in fade-in">
                            <h2 className="text-xl font-black italic uppercase">Incoming Report Queue</h2>
                            {reports.map(r => (
                                <div key={r.id} className={`p-6 rounded-3xl border-2 flex flex-col md:flex-row gap-6 items-start md:items-center ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-sm'}`}>
                                    <div className="w-20 h-20 bg-slate-200 dark:bg-slate-700 rounded-2xl flex-shrink-0 flex items-center justify-center text-3xl">
                                        {r.imageUrl ? <img src={r.imageUrl} className="w-full h-full object-cover rounded-2xl" /> : '💧'}
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-[9px] font-black rounded uppercase">{r.contaminationType}</span>
                                            <span className="text-[10px] font-bold opacity-30">ID: {r.id.slice(-6)}</span>
                                        </div>
                                        <h4 className="font-black text-lg uppercase">{r.village} - {r.waterSource}</h4>
                                        <p className="text-xs opacity-60 italic">"{r.description || 'No description provided.'}"</p>
                                        <p className="text-[9px] font-bold text-blue-500 mt-2 uppercase">Reported By: {r.userName} • {new Date(r.reportedAt).toLocaleString()}</p>
                                    </div>
                                    <div className="flex gap-2 w-full md:w-auto">
                                        {!r.verified && (
                                            <>
                                                <button onClick={() => handleVerify(r.id, true)} className="flex-1 md:flex-none px-6 py-3 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase">Verify</button>
                                                <button onClick={() => handleVerify(r.id, false)} className="flex-1 md:flex-none px-6 py-3 bg-slate-200 dark:bg-slate-700 rounded-xl text-[10px] font-black uppercase">Dismiss</button>
                                            </>
                                        )}
                                        {r.verified && <span className="text-xs font-black text-emerald-500 uppercase px-4">✓ Verified</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'alerts' && (
                        <div className="space-y-4 animate-in fade-in">
                            <h2 className="text-xl font-black italic uppercase">Active Public Alerts</h2>
                            {alerts.map(a => (
                                <div key={a.id} className={`p-6 rounded-3xl border-2 border-red-500/20 ${darkMode ? 'bg-slate-800/50' : 'bg-red-50 shadow-sm'}`}>
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h4 className="font-black text-lg uppercase text-red-600">{a.contaminationType} ALERT - {a.village}</h4>
                                            <p className="text-xs font-bold opacity-60 mt-1">{a.message}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xl font-black text-red-600">{a.affectedUsers?.length || 0}</p>
                                            <p className="text-[9px] font-black uppercase opacity-40">Marked Affected</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <button onClick={() => handleAlertDismiss(a.id)} className="px-5 py-2.5 bg-white dark:bg-slate-800 border-2 border-red-200 text-red-600 rounded-xl text-[10px] font-black uppercase">Dismiss Alert</button>
                                        <button className="px-5 py-2.5 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase shadow-lg shadow-red-500/20">Log Action</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'analytics' && (
                        <div className="space-y-6 animate-in fade-in">
                            <h2 className="text-xl font-black italic uppercase">Epidemiological Intelligence</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className={`p-8 rounded-3xl border-2 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-xl'}`}>
                                    <h4 className="text-[10px] font-black uppercase opacity-40 mb-6">Contamination Intensity</h4>
                                    <div className="space-y-4">
                                        {Object.entries(analytics.contaminationBreakdown || {}).map(([type, count]) => (
                                            <div key={type}>
                                                <div className="flex justify-between text-[10px] font-black uppercase mb-1">
                                                    <span>{type}</span>
                                                    <span>{count} Case(s)</span>
                                                </div>
                                                <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                                    <div className="h-full bg-blue-500" style={{ width: `${(count / summary.totalReports) * 100}%` }}></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className={`p-8 rounded-3xl border-2 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-xl'}`}>
                                    <h4 className="text-[10px] font-black uppercase opacity-40 mb-4">Response Efficiency</h4>
                                    <div className="text-center py-6">
                                        <p className="text-4xl font-black text-blue-600">84%</p>
                                        <p className="text-xs font-bold opacity-60 mt-2 uppercase">Verification Rate</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 mt-4 border-t pt-6 border-slate-100 dark:border-slate-700">
                                        <div className="text-center">
                                            <p className="text-lg font-black italic">14m</p>
                                            <p className="text-[9px] font-bold opacity-40 uppercase">Avg Response</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-lg font-black italic">5km</p>
                                            <p className="text-[9px] font-bold opacity-40 uppercase">Safety Radius</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'map' && (
                        <div className="h-[600px] w-full bg-slate-200 dark:bg-slate-800 rounded-3xl border-4 border-blue-600/10 flex items-center justify-center relative overflow-hidden animate-in zoom-in-95">
                            <div className="text-center space-y-2 z-10">
                                <span className="text-5xl">🗺️</span>
                                <p className="text-xs font-black uppercase opacity-40">Intelligence Map Active</p>
                                <p className="text-[9px] font-bold opacity-20 italic">Layer: Public Water Reports + Active Clusters</p>
                            </div>
                            {/* Marker Mocks */}
                            {reports.map((r, i) => (
                                <div key={i} className="absolute w-4 h-4 bg-blue-500 rounded-full border-2 border-white animate-bounce shadow-xl" style={{ top: `${30 + (i * 10) % 40}%`, left: `${20 + (i * 15) % 60}%` }}></div>
                            ))}
                            {alerts.map((a, i) => (
                                <div key={i} className="absolute w-24 h-24 bg-red-500/20 rounded-full border-2 border-red-500 animate-pulse" style={{ top: '40%', left: '50%' }}></div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default HealthAgentDashboard;
