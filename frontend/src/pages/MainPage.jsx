import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store'
import { analyticsApi } from '../api'
import useDeviceDetection from '../hooks/useDeviceDetection'
import { getResponsiveClasses, getAnimationConfig } from '../utils/layoutConfig'

export default function MainPage() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const deviceInfo = useDeviceDetection()
  const responsiveClasses = getResponsiveClasses(deviceInfo)
  const animationConfig = getAnimationConfig(deviceInfo)
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode')
    return saved ? JSON.parse(saved) : false
  })
  const [analytics, setAnalytics] = useState({
    totalReports: 0,
    totalCleanings: 0
  })
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    setShowContent(true)
    fetchGlobalAnalytics()
  }, [])

  // Persist dark mode to localStorage
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode))
  }, [darkMode])

  const fetchGlobalAnalytics = async () => {
    try {
      const response = await analyticsApi.getGlobalAnalytics()
      setAnalytics({
        totalReports: response.data.totalReports,
        totalCleanings: response.data.totalCleanings
      })
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    }
  }

  const facts = [
    "Over 70% of rural Assam's water sources are at risk of seasonal contamination",
    "Arsenic contamination in groundwater is a major health crisis in 21 districts of Assam",
    "LUIT helps communities identify safe drinking water sources in real-time",
    "Early alerts for water contamination can prevent 80% of water-borne diseases",
    "The Brahmaputra basin needs constant monitoring for fluoride and bacterial spikes",
    "Clean water is a fundamental right; reporting helps authorities act faster",
    "Community reporting has identified 500+ contaminated tubewells this month",
    "LUIT connects you to the nearest government-certified testing labs in Assam",
    "Boiling water for 1 minute kills 99.9% of harmful bacteria found in flood waters",
    "Majuli has seen a 60% improvement in water safety awareness through LUIT"
  ]

  return (
    <div className={`min-h-screen flex flex-col transition-colors ${darkMode
      ? 'bg-gradient-to-b from-slate-900 to-slate-800 text-white'
      : 'bg-gradient-to-b from-blue-50 to-cyan-50 text-gray-800'
      }`}>
      {/* Header */}
      <header className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-blue-200'} border-b shadow-sm sticky top-0 z-40 transition-colors animate-slideDown`}>
        <div className={`${responsiveClasses.container} flex justify-between items-center ${deviceInfo.isDesktop ? 'py-4' : 'py-4'}`}>
          <div className="flex items-center gap-2">
            <span className="text-4xl">💧</span>
            <h1 className={`text-2xl font-bold ${darkMode ? 'text-cyan-400' : 'text-blue-600'}`}>LUIT</h1>
          </div>
          <div className="flex gap-2 items-center">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`px-2 py-1 rounded-md text-sm transition transform hover:scale-110 ${darkMode
                ? 'bg-slate-700 text-yellow-300 hover:bg-slate-600'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
            {user ? (
              <button
                onClick={() => navigate('/dashboard')}
                className={`px-4 py-2 ${darkMode ? 'bg-cyan-600 hover:bg-cyan-700' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-lg text-sm font-medium transition transform hover:scale-105`}
              >
                Dashboard
              </button>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className={`px-4 py-2 ${darkMode ? 'bg-cyan-600 hover:bg-cyan-700' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-lg text-sm font-medium transition transform hover:scale-105`}
              >
                Login
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={`flex-1 ${responsiveClasses.container} ${showContent ? 'animate-fadeIn' : 'opacity-0'}`}>
        {/* Hero Section */}
        <section className={`text-center mb-10 ${deviceInfo.isDesktop ? 'p-10' : 'p-8'} rounded-2xl border ${darkMode
          ? 'bg-gradient-to-br from-slate-900 to-cyan-900 border-cyan-700'
          : 'bg-gradient-to-br from-blue-100 via-cyan-100 to-blue-200 border-blue-200'
          } transition-colors animate-slideUp stagger-1 transform hover:-translate-y-1 hover:shadow-xl`}>
          <h2 className={`${responsiveClasses.heroText} font-bold mb-4 ${darkMode ? 'text-cyan-300' : 'text-blue-800'} animate-slideInScale`}>
            🛡️ Protect Your Water
          </h2>
          <p className={`text-lg mb-6 ${darkMode ? 'text-cyan-100' : 'text-gray-700'}`}>
            Assam's early alert system for drinking water contamination. Report issues, get safety guidance, and find safe water sources.
          </p>
          <div className="flex justify-center gap-4 text-xs font-bold uppercase tracking-widest opacity-60">
            <span>• Arsenic</span>
            <span>• Fluoride</span>
            <span>• Bacteria</span>
          </div>
        </section>

        {/* Join the Movement Button */}
        <button
          onClick={() => navigate('/report')}
          className={`w-full py-5 mb-8 rounded-xl text-white font-bold text-xl transition transform hover:scale-105 active:scale-95 animate-slideUp stagger-2 ${darkMode
            ? 'bg-gradient-to-r from-blue-600 to-cyan-700 hover:from-blue-700 hover:to-cyan-800'
            : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700'
            }`}
        >
          🚨 Report Water Issue
        </button>

        {/* Encouraging Facts Section */}
        <section className={`mb-8 animate-slideUp stagger-3`}>
          <h3 className={`${responsiveClasses.headingText} font-bold mb-4 ${darkMode ? 'text-cyan-300' : 'text-gray-800'}`}>
            💡 Water Safety Fact
          </h3>
          <div className={`p-4 rounded-xl mb-4 border ${darkMode ? 'bg-slate-700 border-cyan-700' : 'bg-white border-blue-100 shadow-md'} transition-colors transform hover:scale-105 hover:shadow-xl`}>
            <p className={`text-lg font-semibold ${darkMode ? 'text-cyan-200' : 'text-blue-700'}`}>
              {facts[Math.floor(Math.random() * facts.length)]}
            </p>
          </div>
        </section>

        {/* Action Buttons */}
        <div className={`grid ${deviceInfo.isDesktop ? 'grid-cols-2' : 'grid-cols-1'} ${responsiveClasses.spacing} mb-8`}>
          <button
            onClick={() => navigate('/report')}
            className={`w-full py-4 rounded-xl text-white font-bold text-lg transition transform hover:scale-105 active:scale-95 animate-slideUp stagger-3 ${darkMode
              ? 'bg-gradient-to-r from-sky-700 to-blue-700 hover:from-sky-800 hover:to-blue-800'
              : 'bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600'
              }`}
          >
            🚰 Submit Water Report
          </button>
          <button
            onClick={() => navigate('/analytics')}
            className={`w-full py-4 rounded-xl text-white font-bold text-lg transition transform hover:scale-105 active:scale-95 animate-slideUp stagger-4 ${darkMode
              ? 'bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-800 hover:to-teal-800'
              : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600'
              }`}
          >
            📍 Contamination Map
          </button>
          <button
            onClick={() => navigate('/leaderboard')}
            className={`w-full py-4 rounded-xl text-white font-bold text-lg transition transform hover:scale-105 active:scale-95 animate-slideUp stagger-4 ${darkMode
              ? 'bg-gradient-to-r from-blue-700 to-cyan-700 hover:from-blue-800 hover:to-cyan-800'
              : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600'
              }`}
          >
            🏆 Top Contributors
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className={`w-full py-4 rounded-xl text-white font-bold text-lg transition transform hover:scale-105 active:scale-95 animate-slideUp stagger-4 ${darkMode
              ? 'bg-gradient-to-r from-purple-700 to-pink-700 hover:from-purple-800 hover:to-pink-800'
              : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
              }`}
          >
            🧑‍⚕️ Health Agent View
          </button>
        </div>

        {/* Analytics */}
        <section className={`rounded-xl shadow-md p-6 grid grid-cols-2 gap-4 mb-8 border ${darkMode ? 'bg-gradient-to-br from-slate-800 to-slate-700 border-slate-600' : 'bg-gradient-to-br from-white to-blue-50 border-blue-100'
          } transition-colors animate-slideUp stagger-5 transform hover:-translate-y-1 hover:shadow-xl`}>
          <div className="text-center transform hover:scale-110 transition">
            <p className={`text-3xl font-bold ${darkMode ? 'text-cyan-300' : 'text-blue-700'}`}>
              2,840
            </p>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Active Alerts</p>
          </div>
          <div className="text-center transform hover:scale-110 transition">
            <p className={`text-3xl font-bold ${darkMode ? 'text-emerald-300' : 'text-emerald-700'}`}>
              582
            </p>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Verified Safe Sources</p>
          </div>
        </section>

        {/* Info Section */}
        <section className={`mb-12 p-6 rounded-xl border ${darkMode ? 'bg-slate-700 border-cyan-700' : 'bg-white border-blue-200 shadow-md'}`}>
          <h3 className={`${responsiveClasses.headingText} font-bold mb-6 ${darkMode ? 'text-cyan-300' : 'text-gray-800'}`}>
            How LUIT Protects You
          </h3>
          <div className="space-y-4">
            <div className={`flex gap-4 p-4 rounded-xl border ${darkMode ? 'bg-slate-700 border-cyan-700' : 'bg-white border-blue-50 shadow-sm'} transition-colors transform hover:scale-105 hover:-translate-y-1 hover:shadow-xl animate-slideUp stagger-3`}>
              <div className={`flex-shrink-0 w-10 h-10 ${darkMode ? 'bg-blue-600' : 'bg-blue-600'} text-white rounded-full flex items-center justify-center font-bold text-lg animate-bounce-gentle`}>1</div>
              <div>
                <p className={`font-semibold ${darkMode ? 'text-cyan-200' : 'text-gray-800'}`}>Report Contamination</p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Identify issues like Arsenic or high turbidity in your local water source</p>
              </div>
            </div>
            <div className={`flex gap-4 p-4 rounded-xl border ${darkMode ? 'bg-slate-700 border-cyan-700' : 'bg-white border-blue-50 shadow-sm'} transition-colors transform hover:scale-105 hover:-translate-y-1 hover:shadow-xl animate-slideUp stagger-4`}>
              <div className={`flex-shrink-0 w-10 h-10 ${darkMode ? 'bg-blue-600' : 'bg-blue-600'} text-white rounded-full flex items-center justify-center font-bold text-lg animate-bounce-gentle`}>2</div>
              <div>
                <p className={`font-semibold ${darkMode ? 'text-cyan-200' : 'text-gray-800'}`}>Rule Engine Analysis</p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Our system detects clusters to trigger automatic community-wide alerts</p>
              </div>
            </div>
            <div className={`flex gap-4 p-4 rounded-xl border ${darkMode ? 'bg-slate-700 border-cyan-700' : 'bg-white border-blue-50 shadow-sm'} transition-colors transform hover:scale-105 hover:-translate-y-1 hover:shadow-xl animate-slideUp stagger-5`}>
              <div className={`flex-shrink-0 w-10 h-10 ${darkMode ? 'bg-blue-600' : 'bg-blue-600'} text-white rounded-full flex items-center justify-center font-bold text-lg animate-bounce-gentle`}>3</div>
              <div>
                <p className={`font-semibold ${darkMode ? 'text-cyan-200' : 'text-gray-800'}`}>Get Guidance</p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Receive immediate safety actions and find the nearest verified safe source</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className={`border-t ${darkMode ? 'border-slate-700 bg-slate-800' : 'border-blue-100 bg-white'} py-6 text-center transition-colors animate-slideUp`}>
        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Made with 💙 by <span className={`font-bold ${darkMode ? 'text-cyan-400' : 'text-blue-600'}`}>LuitLabs</span>
        </p>
        <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
          © 2026 LUIT Team • Water Safety Mission
        </p>
      </footer>
    </div>
  )
}
