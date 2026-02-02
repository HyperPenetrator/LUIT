import axios from 'axios'

// Use environment variable or default to Railway production URL
const API_BASE = process.env.NODE_ENV === 'production'
  ? 'https://web-production-1a99b.up.railway.app'
  : 'http://localhost:5000'

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000  // 30 second timeout for large image uploads
})

// Add request interceptor
api.interceptors.request.use(
  config => {
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// Add response interceptor
api.interceptors.response.use(
  response => {
    return response
  },
  error => {
    return Promise.reject(error)
  }
)

// Auth endpoints
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout')
}

// Reporting endpoints
export const reportingApi = {
  uploadImage: (imageBase64) => api.post('/reporting/upload-image', { image_base_64: imageBase64 }),
  createReport: (data) => api.post('/reporting/report', data),
  getReports: (contaminationType, limit) => api.get('/reporting/reports', {
    params: { contaminationType, limit }
  }),
  getReport: (reportId) => api.get(`/reporting/reports/${reportId}`)
}

// Alerts endpoints
export const alertsApi = {
  getAlerts: (status = 'active') => api.get('/alerts', { params: { status } }),
  getAlert: (alertId) => api.get(`/alerts/${alertId}`),
  updateStatus: (alertId, status) => api.patch(`/alerts/${alertId}/status`, { status })
}

// Testing Labs endpoints
export const labsApi = {
  getLabs: () => api.get('/labs')
}

// Safe Sources endpoints
export const safeSourcesApi = {
  getSafeSources: () => api.get('/safe-sources')
}

// Guidance endpoints
export const guidanceApi = {
  getGuidance: (contaminationType, language = 'en') => api.get('/guidance', {
    params: { contaminationType, language }
  })
}

// Cleaning endpoints
export const cleaningApi = {
  verifyCleaning: (data) => api.post('/cleaning/verify', data),
  markCleaned: (data) => api.post('/cleaning/mark-cleaned', data),
  getAvailableCleanings: (wasteType, userType) => api.get('/cleaning/available', {
    params: { wasteType, userType }
  })
}

// Analytics endpoints
export const analyticsApi = {
  getUserAnalytics: (userId) => api.get(`/analytics/user/${userId}`),
  getNgoAnalytics: (ngoId) => api.get(`/analytics/ngo/${ngoId}`),
  getGlobalAnalytics: () => api.get('/analytics/global'),
  getTimeBuckets: () => api.get('/analytics/time-buckets'),
  getUsersLeaderboard: (category = 'overall', limit = 20) =>
    api.get('/analytics/leaderboard/users', { params: { category, limit } }),
  getNgosLeaderboard: (category = 'overall', limit = 20) =>
    api.get('/analytics/leaderboard/ngos', { params: { category, limit } })
}

// Location endpoints
export const locationApi = {
  getNearbyReports: (latitude, longitude, radius = 100) =>
    api.get('/location/nearby-reports', { params: { latitude, longitude, radius } }),
  validateCoordinates: (latitude, longitude) =>
    api.get('/location/validate-coordinates', { params: { latitude, longitude } }),
  checkDuplicateLocation: (latitude, longitude, radius = 100) =>
    api.post('/location/check-duplicate', { latitude, longitude, radius })
}
