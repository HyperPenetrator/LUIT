import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { guidanceApi } from '../api';

const GuidancePage = () => {
    const navigate = useNavigate();
    const routerLocation = useLocation();
    const query = new URLSearchParams(routerLocation.search);
    const initialType = query.get('type') || 'arsenic';

    const [guidance, setGuidance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [darkMode, setDarkMode] = useState(() => JSON.parse(localStorage.getItem('darkMode') || 'false'));

    useEffect(() => {
        const fetchGuidance = async () => {
            try {
                const res = await guidanceApi.getGuidance(initialType);
                setGuidance(res.data.guidance || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchGuidance();
    }, [initialType]);

    return (
        <div className={`min-h-screen transition-colors ${darkMode ? 'bg-slate-900 text-white' : 'bg-blue-50 text-slate-900'}`}>
            <header className={`p-4 border-b flex justify-between items-center ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-blue-100'}`}>
                <div className="flex items-center gap-2">
                    <span onClick={() => navigate('/')} className="text-2xl cursor-pointer">←</span>
                    <h1 className="text-xl font-black text-blue-600">SAFETY GUIDANCE 🛡️</h1>
                </div>
            </header>

            <main className="max-w-3xl mx-auto p-4 space-y-6">
                {loading ? (
                    <p className="text-center py-20 font-bold opacity-50">Loading safety protocols...</p>
                ) : guidance.length === 0 ? (
                    <p className="text-center py-20 opacity-50 italic">No specific guidance found for {initialType}. Boil water as a general precaution.</p>
                ) : guidance.map((item, i) => (
                    <div key={i} className="space-y-6">
                        {/* Red Alert Card */}
                        <div className="bg-red-600 p-6 rounded-3xl text-white shadow-xl shadow-red-500/20">
                            <h2 className="text-xs font-black uppercase tracking-widest opacity-80 mb-2">Immediate Danger Actions</h2>
                            <ul className="space-y-2">
                                {item.immediateActions.map((act, idx) => (
                                    <li key={idx} className="flex font-bold gap-2">
                                        <span>🚫</span> {act}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Home Treatment */}
                        <div className={`p-6 rounded-3xl border-2 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-blue-100 shadow-xl'}`}>
                            <h3 className="text-xs font-black text-blue-600 uppercase tracking-widest mb-4">🏠 Home Treatment Method</h3>
                            <p className="font-bold leading-relaxed">{item.homeTreatment}</p>
                        </div>

                        {/* Medical Advice */}
                        <div className="p-6 rounded-3xl bg-yellow-400 text-slate-900 shadow-lg">
                            <h3 className="text-xs font-black uppercase tracking-widest mb-2">🧑‍⚕️ Medical Signs to Watch</h3>
                            <p className="font-bold">{item.medicalAdvice}</p>
                        </div>
                    </div>
                ))}

                <button
                    onClick={() => navigate('/labs')}
                    className="w-full py-5 bg-slate-900 text-white font-black rounded-2xl uppercase tracking-widest shadow-xl"
                >
                    Locate Testing Body
                </button>
            </main>
        </div>
    );
};

export default GuidancePage;
