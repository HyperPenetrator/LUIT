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

// Loading fallback component
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-green-50">
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
      <p className="text-gray-600 font-medium">Loading...</p>
    </div>
  </div>
)

function App() {
  const user = useAuthStore((state) => state.user)
  const userType = useAuthStore((state) => state.userType)
  const hydrated = useAuthStore((state) => state.hydrated)

  if (!hydrated) return null

  return (
    <Router>
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

          {/* Admin Route */}
          <Route path="/admin" element={<AdminDashboard />} />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Suspense>
    </Router>
  )
}

export default App
