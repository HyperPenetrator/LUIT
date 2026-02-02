import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { safeSourcesApi } from '../api';

const SafeSourcesPage = () => {
    const navigate = useNavigate();
    const [sources, setSources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [darkMode, setDarkMode] = useState(() => JSON.parse(localStorage.getItem('darkMode') || 'false'));

    useEffect(() => {
        const fetchSources = async () => {
            try {
                const res = await safeSourcesApi.getSafeSources();
                setSources(res.data.sources || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchSources();
    }, []);

    return (
        <div className={`min-h-screen transition-colors ${darkMode ? 'bg-slate-900 text-white' : 'bg-blue-50 text-slate-900'}`}>
            <header className={`p-4 border-b flex justify-between items-center ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-blue-100 shadow-sm'}`}>
                <div className="flex items-center gap-2">
                    <span onClick={() => navigate('/')} className="text-2xl cursor-pointer">←</span>
                    <h1 className="text-xl font-black text-blue-600 italic uppercase tracking-tighter">Verified Safe Points 💧</h1>
                </div>
            </header>

            <main className="max-w-4xl mx-auto p-4 space-y-4">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-50">
                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent animate-spin rounded-full"></div>
                        <p className="font-bold">Locating safe extraction points...</p>
                    </div>
                ) : sources.length === 0 ? (
                    <div className="text-center py-20 opacity-30 italic">No verified sources nearby yet.</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {sources.map(source => (
                            <div key={source.id} className={`p-6 rounded-3xl border-2 flex flex-col justify-between ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-blue-50 shadow-blue-500/5'}`}>
                                <div>
                                    <div className="flex justify-between items-center mb-3">
                                        <div className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase text-white ${source.isGovernmentVerified ? 'bg-blue-600' : 'bg-emerald-500'}`}>
                                            {source.isGovernmentVerified ? 'Govt Verified' : 'Community Reported'}
                                        </div>
                                        <span className="text-[10px] font-bold opacity-40 uppercase">Ref: #{source.id.slice(-5)}</span>
                                    </div>
                                    <h3 className="text-lg font-black mb-1">{source.name}</h3>
                                    <p className="text-xs opacity-60 mb-4">{source.description}</p>

                                    <div className="space-y-2 mb-6">
                                        <div className="flex justify-between items-center text-[10px] font-bold uppercase opacity-80">
                                            <span>Last Tested:</span>
                                            <span>{new Date(source.lastTested).toLocaleDateString()}</span>
                                        </div>
                                        <div className="h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                            <div className="h-full bg-green-500 w-[100%]"></div>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${source.latitude},${source.longitude}`)}
                                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl uppercase text-xs transition shadow-lg shadow-blue-600/20"
                                >
                                    GET DIRECTIONS
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default SafeSourcesPage;
