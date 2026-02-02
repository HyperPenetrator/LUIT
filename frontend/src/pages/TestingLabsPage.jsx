import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { labsApi } from '../api';

const TestingLabsPage = () => {
    const navigate = useNavigate();
    const [labs, setLabs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [darkMode, setDarkMode] = useState(() => JSON.parse(localStorage.getItem('darkMode') || 'false'));

    useEffect(() => {
        const fetchLabs = async () => {
            try {
                const res = await labsApi.getLabs();
                setLabs(res.data.labs || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchLabs();
    }, []);

    const openDirections = (lat, lon) => {
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`);
    };

    return (
        <div className={`min-h-screen transition-colors ${darkMode ? 'bg-slate-900 text-white' : 'bg-blue-50 text-slate-900'}`}>
            <header className={`p-4 border-b flex justify-between items-center ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-blue-100'}`}>
                <div className="flex items-center gap-2">
                    <span onClick={() => navigate('/')} className="text-2xl cursor-pointer">←</span>
                    <h1 className="text-xl font-black text-blue-600">TESTING LABS 🔬</h1>
                </div>
            </header>

            <main className="max-w-4xl mx-auto p-4 space-y-4">
                {loading ? (
                    <p className="text-center py-20 font-bold opacity-50">Searching for certified labs...</p>
                ) : labs.map(lab => (
                    <div key={lab.id} className={`p-6 rounded-3xl border-2 shadow-lg ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-blue-100'}`}>
                        <div className="flex justify-between items-start mb-2">
                            <h2 className="text-lg font-black uppercase tracking-tight">{lab.name}</h2>
                            {lab.governmentApproved && <span className="bg-green-500 text-white text-[9px] font-black px-2 py-1 rounded-md uppercase">Govt Approved</span>}
                        </div>
                        <p className="text-xs opacity-60 mb-4">{lab.address}</p>

                        <div className="flex flex-wrap gap-2 mb-6">
                            {lab.testsOffered.map(t => (
                                <span key={t} className="text-[10px] font-bold px-3 py-1 bg-blue-500/10 text-blue-500 rounded-full uppercase italic">#{t}</span>
                            ))}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => openDirections(lab.latitude, lab.longitude)}
                                className="py-3 rounded-2xl bg-blue-600 text-white text-[10px] font-black uppercase"
                            >
                                Get Directions
                            </button>
                            {lab.contact?.phone && (
                                <a
                                    href={`tel:${lab.contact.phone}`}
                                    className="py-3 rounded-2xl border-2 border-blue-600 text-blue-600 text-[10px] font-black uppercase flex items-center justify-center"
                                >
                                    Call Lab
                                </a>
                            )}
                        </div>
                    </div>
                ))}
            </main>
        </div>
    );
};

export default TestingLabsPage;
