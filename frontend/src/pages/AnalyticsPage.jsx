import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { analyticsApi } from '../api'

export default function AnalyticsPage() {
  const navigate = useNavigate()
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode')
    return saved ? JSON.parse(saved) : false
  })
  const [loading, setLoading] = useState(true)
  const [global, setGlobal] = useState({
    totalReports: 0,
    totalCleanings: 0,
    activeReports: 0,
    wasteBreakdown: { plastic: 0, organic: 0, mixed: 0, toxic: 0, sewage: 0 }
  })
  const [buckets, setBuckets] = useState({
    reports: { week: 0, month: 0, year: 0 },
    cleanings: { week: 0, month: 0, year: 0 }
  })

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode))
  }, [darkMode])

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const [g, t] = await Promise.all([
          analyticsApi.getGlobalAnalytics(),
          analyticsApi.getTimeBuckets()
        ])
        setGlobal(g.data || {})
        setBuckets(t.data || {})
      } catch (e) {
        console.error('Failed to load analytics', e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const wasteItems = Object.entries(global.wasteBreakdown || {})
  const maxWaste = Math.max(1, ...wasteItems.map(([, v]) => v || 0))

  return (
    <div className={`min-h-screen flex flex-col transition-colors ${
      darkMode ? 'bg-gradient-to-b from-slate-900 to-cyan-900' : 'bg-gradient-to-b from-blue-50 to-green-50'
    }`}>
      <header className={`sticky top-0 z-40 border-b transition-colors ${
        darkMode ? 'bg-slate-800 border-cyan-700' : 'bg-white border-cyan-200 shadow-sm'
      }`}>
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-3xl">📊</span>
            <div>
              <h1 className={`text-2xl font-bold ${darkMode ? 'text-cyan-400' : 'text-blue-600'}`}>Analytics</h1>
              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>Platform insights</p>
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`px-2 py-1 rounded-md text-sm transition transform hover:scale-110 ${
                darkMode ? 'bg-slate-700 text-yellow-300 hover:bg-slate-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
            <button
              onClick={() => navigate('/')}
              className={`${darkMode ? 'bg-cyan-600 hover:bg-cyan-500' : 'bg-blue-600 hover:bg-blue-500'} text-white px-3 py-2 rounded-lg text-sm font-semibold`}
            >
              Home
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto px-4 py-8 w-full space-y-8">
        <section className={`rounded-2xl border p-6 ${
          darkMode ? 'bg-slate-800 border-cyan-700' : 'bg-white border-cyan-200 shadow-md'
        }`}>
          {loading ? (
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Loading analytics...</p>
          ) : (
            <div className="grid md:grid-cols-4 gap-4">
              {[{
                title: 'Total Reports', value: global.totalReports, icon: '📝'
              },{
                title: 'Total Cleanings', value: global.totalCleanings, icon: '🧹'
              },{
                title: 'Active Reports', value: global.activeReports, icon: '⚠️'
              },{
                title: 'Most Reported Waste', value: (() => {
                  const entries = Object.entries(global.wasteBreakdown || {})
                  if (!entries.length) return 'N/A'
                  const top = entries.sort((a,b)=>b[1]-a[1])[0]
                  return `${top[0]} (${top[1]})`
                })(), icon: '🏷️'
              }].map((c) => (
                <div key={c.title} className={`p-5 rounded-xl border ${darkMode ? 'bg-slate-700/70 border-cyan-700 text-white' : 'bg-cyan-50 border-cyan-200 text-slate-900'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{c.title}</p>
                    <span className="text-2xl">{c.icon}</span>
                  </div>
                  <p className={`${darkMode ? 'text-cyan-300' : 'text-blue-700'} text-3xl font-bold`}>{typeof c.value === 'number' ? c.value.toLocaleString() : c.value}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className={`rounded-2xl border p-6 ${darkMode ? 'bg-slate-800 border-cyan-700' : 'bg-white border-cyan-200 shadow-md'}`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className={`${darkMode ? 'text-cyan-300' : 'text-blue-600'} font-semibold text-sm uppercase tracking-wide`}>Activity</p>
              <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>This Week / Month / Year</h3>
            </div>
            <span className="text-2xl">⏱️</span>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {[{
              title: 'This Week', reports: buckets.reports.week, cleanings: buckets.cleanings.week
            },{
              title: 'This Month', reports: buckets.reports.month, cleanings: buckets.cleanings.month
            },{
              title: 'This Year', reports: buckets.reports.year, cleanings: buckets.cleanings.year
            }].map((b) => (
              <div key={b.title} className={`p-5 rounded-xl border ${darkMode ? 'bg-slate-700/70 border-cyan-700 text-white' : 'bg-emerald-50 border-emerald-200 text-slate-900'}`}>
                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{b.title}</p>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <div>
                    <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} text-xs`}>Reports</p>
                    <p className={`${darkMode ? 'text-cyan-300' : 'text-blue-700'} text-3xl font-bold`}>{b.reports?.toLocaleString?.() || b.reports}</p>
                  </div>
                  <div>
                    <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} text-xs`}>Cleanings</p>
                    <p className={`${darkMode ? 'text-emerald-300' : 'text-emerald-700'} text-3xl font-bold`}>{b.cleanings?.toLocaleString?.() || b.cleanings}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className={`rounded-2xl border p-6 ${darkMode ? 'bg-slate-800 border-cyan-700' : 'bg-white border-cyan-200 shadow-md'}`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className={`${darkMode ? 'text-cyan-300' : 'text-blue-600'} font-semibold text-sm uppercase tracking-wide`}>Waste Types</p>
              <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Reports by waste category</h3>
            </div>
            <span className="text-2xl">📈</span>
          </div>
          <div className="space-y-3">
            {wasteItems.map(([label, value]) => (
              <div key={label}>
                <div className="flex items-center justify-between mb-1">
                  <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} text-sm capitalize`}>{label}</p>
                  <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} text-xs`}>{value}</p>
                </div>
                <div className={`w-full h-3 rounded-full ${darkMode ? 'bg-slate-700' : 'bg-gray-200'}`}>
                  <div
                    className={`h-3 rounded-full ${darkMode ? 'bg-cyan-500' : 'bg-blue-600'}`}
                    style={{ width: `${(Math.max(0, value) / maxWaste) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            {!wasteItems.length && (
              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>No data</p>
            )}
          </div>
        </section>
      </main>

      <footer className={`border-t mt-12 py-6 text-center transition-colors ${darkMode ? 'border-slate-700 bg-slate-800' : 'border-gray-200 bg-white'}`}>
        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Made with 💙 by <span className={`${darkMode ? 'text-cyan-400' : 'text-blue-600'} font-bold`}>LuitLabs</span>
        </p>
      </footer>
    </div>
  )
}
