import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const SMSBotPage = () => {
    const navigate = useNavigate();
    const [phone, setPhone] = useState('9876543210');
    const [message, setMessage] = useState('WATER KAMALABARI ARSENIC TUBEWELL');
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState([]);
    const [darkMode, setDarkMode] = useState(() => JSON.parse(localStorage.getItem('darkMode') || 'false'));

    const simulateSMS = async () => {
        if (!message) return;
        setLoading(true);
        try {
            const API_BASE = process.env.NODE_ENV === 'production'
                ? 'https://web-production-1a99b.up.railway.app'
                : 'http://localhost:5000';

            const res = await axios.post(`${API_BASE}/sms/simulate`, { phone, message });

            setHistory(prev => [
                { type: 'incoming', text: message, time: new Date().toLocaleTimeString() },
                { type: 'outgoing', text: res.data.reply, time: new Date().toLocaleTimeString() },
                ...prev
            ]);
            setMessage('');
        } catch (err) {
            alert('Simulation failed. Check if backend is running.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`min-h-screen flex flex-col transition-colors ${darkMode ? 'bg-slate-900 text-white' : 'bg-blue-50 text-slate-900'}`}>
            <header className={`p-4 border-b flex justify-between items-center ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-blue-100 shadow-sm'}`}>
                <div className="flex items-center gap-2">
                    <span onClick={() => navigate('/')} className="text-2xl cursor-pointer">←</span>
                    <h1 className="text-xl font-black text-blue-600 italic">SMS GATEWAY MOCK 🛰️</h1>
                </div>
                <button onClick={() => setDarkMode(!darkMode)} className="p-2">
                    {darkMode ? '☀️' : '🌙'}
                </button>
            </header>

            <main className="flex-1 max-w-2xl mx-auto w-full p-4 flex flex-col gap-6">
                {/* Control Panel */}
                <div className={`p-6 rounded-3xl border-2 space-y-4 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-blue-200 shadow-xl'}`}>
                    <div>
                        <label className="text-[10px] font-bold uppercase opacity-50">Mobile Number (Sender)</label>
                        <input
                            value={phone}
                            onChange={e => setPhone(e.target.value)}
                            className={`w-full p-3 rounded-xl border mt-1 ${darkMode ? 'bg-slate-700 border-slate-600' : 'bg-blue-50 border-blue-100'}`}
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold uppercase opacity-50">SMS Content</label>
                        <input
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            placeholder="WATER <VILLAGE> <TYPE> <SOURCE>"
                            className={`w-full p-3 rounded-xl border mt-1 font-mono uppercase ${darkMode ? 'bg-slate-700 border-slate-600' : 'bg-blue-50 border-blue-100'}`}
                        />
                    </div>
                    <button
                        onClick={simulateSMS}
                        disabled={loading}
                        className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-lg shadow-blue-600/20 transition uppercase"
                    >
                        {loading ? 'Transmitting...' : 'Send Incoming SMS'}
                    </button>
                </div>

                {/* History */}
                <div className="flex-1 space-y-4 overflow-y-auto pb-10">
                    <h2 className="text-xs font-bold uppercase opacity-40 px-2 tracking-widest">Signal Log</h2>
                    {history.length === 0 && (
                        <div className="text-center py-20 opacity-20 italic">No signals detected.</div>
                    )}
                    {history.map((h, i) => (
                        <div key={i} className={`flex ${h.type === 'incoming' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] p-4 rounded-2xl shadow-md ${h.type === 'incoming'
                                    ? (darkMode ? 'bg-blue-600' : 'bg-blue-600 text-white rounded-tr-none')
                                    : (darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-blue-100 rounded-tl-none')
                                }`}>
                                <p className="text-sm font-medium whitespace-pre-wrap">{h.text}</p>
                                <p className="text-[9px] mt-1 opacity-50 font-bold uppercase">{h.time} • {h.type === 'incoming' ? 'MOB_SIM_01' : 'LUIT_GATEWAY'}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default SMSBotPage;
