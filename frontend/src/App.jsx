import React, { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store'

// Lazy load pages for code splitting
const MainPage = lazy(() => import('./pages/MainPage'))
const LoginRegister = lazy(() => import('./pages/LoginRegister'))
const UserDashboard = lazy(() => import('./pages/UserDashboard'))
const NgoDashboard = lazy(() => import('./pages/NgoDashboard'))
const ReportingPage = lazy(() => import('./pages/WaterReportPage'))
const CleanerPage = lazy(() => import('./pages/CleanerPage'))
const CleaningPage = lazy(() => import('./pages/CleaningPage'))
const LeaderboardPage = lazy(() => import('./pages/LeaderboardPage'))
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'))
const AlertsPage = lazy(() => import('./pages/AlertsPage'))
const HealthAgentDashboard = lazy(() => import('./pages/HealthAgentDashboard'))
const SMSBotPage = lazy(() => import('./pages/SMSBotPage'))
const TestingLabsPage = lazy(() => import('./pages/TestingLabsPage'))
const GuidancePage = lazy(() => import('./pages/GuidancePage'))
const SafeSourcesPage = lazy(() => import('./pages/SafeSourcesPage'))

// Water Quality Monitor Pages
const WaterQualityHome = lazy(() => import('./pages/WaterQualityHome'))
const WaterQualityReport = lazy(() => import('./pages/WaterQualityReport'))
const WaterQualityLogin = lazy(() => import('./pages/WaterQualityLogin'))
const PHCDashboard = lazy(() => import('./pages/PHCDashboard'))
const WaterLabDashboard = lazy(() => import('./pages/WaterLabDashboard'))

// Loading fallback component
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-green-50">
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
      <p className="text-gray-600 font-medium">Loading...</p>
    </div>
  </div>
)

import BottomNav from './components/BottomNav'
import OfflineNotice from './components/OfflineNotice'
import { useUIStore } from './store'
import { useOfflineSync } from './hooks/useOfflineSync'

function App() {
  const user = useAuthStore((state) => state.user)
  const userType = useAuthStore((state) => state.userType)
  const hydrated = useAuthStore((state) => state.hydrated)
  const { fontSize, highContrast } = useUIStore()

  // Initialize offline sync
  useOfflineSync()

  if (!hydrated) return null

  const rootClasses = `
    min-h-screen transition-all duration-300 pb-24 md:pb-0
    ${fontSize === 1.5 ? 'text-lg' : fontSize === 2 ? 'text-xl' : 'text-base'}
    ${highContrast ? 'contrast-125 saturate-150 brightness-110' : ''}
  `

  return (
    <Router>
      <div className={rootClasses}>
        <OfflineNotice />
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={user ? <Navigate to="/dashboard" /> : <MainPage />} />
            <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginRegister />} />
            <Route path="/report" element={<ReportingPage />} />

            {/* Protected User Routes */}
            {user && userType === 'individual' && (
              <>
                <Route path="/dashboard" element={<UserDashboard />} />
                <Route path="/cleaner" element={<CleanerPage />} />
                <Route path="/cleaning/:reportId" element={<CleaningPage />} />
              </>
            )}

            {/* Protected NGO Routes */}
            {user && userType === 'ngo' && (
              <>
                <Route path="/dashboard" element={<NgoDashboard />} />
                <Route path="/cleaner" element={<CleanerPage />} />
                <Route path="/cleaning/:reportId" element={<CleaningPage />} />
              </>
            )}

            {/* Leaderboard - Public */}
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/health-dashboard" element={<HealthAgentDashboard />} />
            <Route path="/sms-simulator" element={<SMSBotPage />} />
            <Route path="/labs" element={<TestingLabsPage />} />
            <Route path="/guidance" element={<GuidancePage />} />
            <Route path="/safe-sources" element={<SafeSourcesPage />} />

            {/* Water Quality Monitor Routes */}
            <Route path="/water-quality" element={<WaterQualityHome />} />
            <Route path="/water-quality/report" element={<WaterQualityReport />} />
            <Route path="/water-quality/login" element={<WaterQualityLogin />} />
            <Route path="/water-quality/phc-dashboard" element={<PHCDashboard />} />
            <Route path="/water-quality/lab-dashboard" element={<WaterLabDashboard />} />

            {/* Admin Route */}
            <Route path="/admin" element={<AdminDashboard />} />

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Suspense>
        <BottomNav />
      </div>
    </Router>
  )
}

export default App
