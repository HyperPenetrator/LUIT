import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLocationStore, useAuthStore } from '../store'
import { reportingApi, guidanceApi } from '../api'

export default function WaterReportPage() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const setLocation = useLocationStore((state) => state.setLocation)
  const { latitude, longitude } = useLocationStore()

  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode')
    return saved ? JSON.parse(saved) : false
  })

  // Form State
  const [waterSource, setWaterSource] = useState('')
  const [contaminationType, setContaminationType] = useState('')
  const [village, setVillage] = useState('')
  const [description, setDescription] = useState('')
  const [isAffected, setIsAffected] = useState(false)
  const [affectedPopulation, setAffectedPopulation] = useState(1)

  // Media State
  const [image, setImage] = useState(null)
  const [cloudinaryUrl, setCloudinaryUrl] = useState(null)
  const [cloudinaryPublicId, setCloudinaryPublicId] = useState(null)

  // UI State
  const [step, setStep] = useState(1) // 1: Info, 2: Media/Desc, 3: Guidance
  const [loading, setLoading] = useState(false)
  const [locationLoading, setLocationLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [guidance, setGuidance] = useState(null)

  // Camera Refs
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [cameraActive, setCameraActive] = useState(false)
  const [cameraStarted, setCameraStarted] = useState(false)
  const streamRef = useRef(null)

  useEffect(() => {
    getLocation()
    return () => stopCamera()
  }, [])

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode))
  }, [darkMode])

  const getLocation = () => {
    setLocationLoading(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation(position.coords.latitude, position.coords.longitude, position.coords.accuracy)
          setLocationLoading(false)
          setError('')
        },
        (err) => {
          setError('Failed to get location. Please enable GPS.')
          setLocationLoading(false)
        },
        { enableHighAccuracy: true, timeout: 10000 }
      )
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setCameraActive(false)
  }

  const startCamera = async () => {
    try {
      stopCamera()
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setCameraActive(true)
      }
    } catch (err) {
      setError('Camera access denied or unavailable')
    }
  }

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current
      const video = videoRef.current
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      canvas.getContext('2d').drawImage(video, 0, 0)
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
      setImage(dataUrl)
      stopCamera()
      setCameraStarted(false)
      uploadToCloudinary(dataUrl)
    }
  }

  const uploadToCloudinary = async (base64) => {
    try {
      const res = await reportingApi.uploadImage(base64)
      setCloudinaryUrl(res.data.url)
      setCloudinaryPublicId(res.data.public_id)
    } catch (err) {
      setError('Image upload failed, but you can still submit the report.')
    }
  }

  const handleSubmit = async () => {
    if (!waterSource || !contaminationType || !village) {
      setError('Please fill in required fields (Village, Source, Contamination)')
      return
    }
    if (!latitude || !longitude) {
      setError('Location required. Please enable GPS.')
      return
    }

    setLoading(true)
    try {
      const payload = {
        latitude,
        longitude,
        village,
        contaminationType,
        waterSource,
        severityLevel: contaminationType === 'arsenic' ? 'critical' :
          contaminationType === 'bacteria' ? 'unsafe' : 'caution',
        description,
        imageUrl: cloudinaryUrl,
        imagePublicId: cloudinaryPublicId,
        reportedBy: user?.id || 'anonymous',
        userName: user?.name || 'Anonymous',
        affectedPopulation: isAffected ? affectedPopulation : 0
      }

      const res = await reportingApi.createReport(payload)
      setSuccess('Report submitted successfully!')

      // Fetch guidance
      const gRes = await guidanceApi.getGuidance(contaminationType)
      if (gRes.data.guidance && gRes.data.guidance.length > 0) {
        setGuidance(gRes.data.guidance[0])
      }
      setStep(3)
    } catch (err) {
      setError('Submission failed: ' + (err.response?.data?.detail || err.message))
    } finally {
      setLoading(false)
    }
  }

  const sources = [
    { id: 'well', label: 'Well', icon: '🕳️' },
    { id: 'tubewell', label: 'Tubewell', icon: '🚰' },
    { id: 'pond', label: 'Pond', icon: '🏞️' },
    { id: 'river', label: 'River', icon: '🌊' },
    { id: 'tap', label: 'Tap', icon: '🚿' },
  ]

  const contaminations = [
    { id: 'arsenic', label: 'Arsenic', icon: '🔴', severity: 'Critical' },
    { id: 'fluoride', label: 'Fluoride', icon: '🟡', severity: 'Caution' },
    { id: 'bacteria', label: 'Bacteria', icon: '🟢', severity: 'Unsafe' },
    { id: 'turbidity', label: 'Turbidity', icon: '🔵', severity: 'Caution' },
    { id: 'other', label: 'Other', icon: '⚪', severity: 'Unknown' },
  ]

  return (
    <div className={`min-h-screen flex flex-col transition-colors ${darkMode ? 'bg-slate-900 text-white' : 'bg-blue-50 text-slate-900'
      }`}>
      {/* Header */}
      <header className={`sticky top-0 z-40 p-4 border-b flex justify-between items-center ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-blue-100 shadow-sm'
        }`}>
        <div className="flex items-center gap-3">
          <span className="text-3xl">💧</span>
          <div>
            <h1 className="text-xl font-bold text-blue-600">LUIT Water Guard</h1>
            <p className="text-xs opacity-70">Assam Contamination Alert</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">
            {darkMode ? '☀️' : '🌙'}
          </button>
          <button onClick={() => navigate('/')} className="text-2xl">✕</button>
        </div>
      </header>

      <main className="flex-1 max-w-md mx-auto w-full p-4 overflow-y-auto">
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            {/* Step Indicator */}
            <div className="flex justify-between items-center text-sm font-medium">
              <span className="text-blue-500 font-bold">1. Core Details</span>
              <span className="opacity-40">2. Description</span>
            </div>

            {/* Village Input */}
            <div className="space-y-2">
              <label className="text-sm font-semibold opacity-70">Enter Village Name *</label>
              <input
                type="text"
                placeholder="e.g., Majuli, Kamalabari"
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                className={`w-full p-4 rounded-xl border-2 transition focus:ring-2 focus:ring-blue-400 outline-none ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-blue-100'
                  }`}
              />
            </div>

            {/* Source Selection */}
            <div className="space-y-3">
              <label className="text-sm font-semibold opacity-70">Water Source Type *</label>
              <div className="grid grid-cols-3 gap-2">
                {sources.map(s => (
                  <button
                    key={s.id}
                    onClick={() => setWaterSource(s.id)}
                    className={`p-3 rounded-2xl border-2 flex flex-col items-center transition active:scale-95 ${waterSource === s.id
                      ? 'border-blue-500 bg-blue-500 text-white'
                      : darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-blue-100'
                      }`}
                  >
                    <span className="text-2xl mb-1">{s.icon}</span>
                    <span className="text-[10px] font-bold uppercase">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Contamination Type */}
            <div className="space-y-3">
              <label className="text-sm font-semibold opacity-70">Detected Problem *</label>
              <div className="grid grid-cols-2 gap-3">
                {contaminations.map(c => (
                  <button
                    key={c.id}
                    onClick={() => setContaminationType(c.id)}
                    className={`p-4 rounded-2xl border-2 flex items-center gap-3 transition active:scale-95 ${contaminationType === c.id
                      ? 'border-blue-500 bg-blue-500 text-white'
                      : darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-blue-100'
                      }`}
                  >
                    <span className="text-2xl">{c.icon}</span>
                    <div className="text-left">
                      <p className="text-xs font-bold uppercase">{c.label}</p>
                      <p className={`text-[9px] ${contaminationType === c.id ? 'text-blue-100' : 'opacity-60'}`}>
                        {c.severity}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Population Tracker */}
            <div className={`p-4 rounded-2xl border-2 flex items-center justify-between ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-blue-100'
              }`}>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="affected"
                  checked={isAffected}
                  onChange={(e) => setIsAffected(e.target.checked)}
                  className="w-5 h-5 rounded accent-blue-500"
                />
                <label htmlFor="affected" className="text-sm font-bold">My family is affected</label>
              </div>
              {isAffected && (
                <div className="flex items-center gap-2">
                  <button onClick={() => setAffectedPopulation(Math.max(1, affectedPopulation - 1))} className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700">-</button>
                  <span className="font-bold w-4 text-center">{affectedPopulation}</span>
                  <button onClick={() => setAffectedPopulation(affectedPopulation + 1)} className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700">+</button>
                </div>
              )}
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!waterSource || !contaminationType || !village}
              className="w-full py-5 bg-blue-600 hover:bg-blue-700 disabled:opacity-30 text-white font-black rounded-2xl shadow-xl transition-all"
            >
              CONTINUE →
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div className="flex justify-between items-center text-sm font-medium">
              <button onClick={() => setStep(1)} className="text-blue-500">← Back</button>
              <span className="text-blue-500 font-bold">2. Supporting Evidence</span>
            </div>

            {/* Camera Section */}
            <div className="space-y-3">
              <label className="text-sm font-semibold opacity-70">Add Photo (Optional)</label>
              {!image ? (
                !cameraStarted ? (
                  <button
                    onClick={() => { setCameraStarted(true); startCamera(); }}
                    className={`w-full h-48 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center gap-3 ${darkMode ? 'border-slate-700 bg-slate-800' : 'border-blue-200 bg-blue-50/50'
                      }`}
                  >
                    <span className="text-4xl">📷</span>
                    <span className="text-sm font-bold opacity-50">Click to capture photo</span>
                  </button>
                ) : (
                  <div className="relative rounded-3xl overflow-hidden h-64 bg-black">
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                      <button onClick={captureImage} className="w-16 h-16 bg-white rounded-full border-4 border-slate-300"></button>
                      <button onClick={() => { stopCamera(); setCameraStarted(false); }} className="px-4 py-2 bg-red-500 text-white rounded-xl">Cancel</button>
                    </div>
                  </div>
                )
              ) : (
                <div className="relative h-48 rounded-3xl overflow-hidden border-2 border-blue-500">
                  <img src={image} className="w-full h-full object-cover" />
                  <button onClick={() => setImage(null)} className="absolute top-2 right-2 bg-red-500 text-white w-8 h-8 rounded-full">✕</button>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-semibold opacity-70">Describe context (Optional)</label>
              <textarea
                rows="3"
                placeholder="e.g., Water turned yellow after yesterday's rain..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={`w-full p-4 rounded-xl border-2 transition ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-blue-100'
                  }`}
              />
            </div>

            {/* Location Status */}
            <div className={`p-4 rounded-xl flex items-center justify-between ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-green-500/10'
              }`}>
              <div className="flex items-center gap-3">
                <span className="text-xl">📍</span>
                <div>
                  <p className="text-xs font-bold">Current Location</p>
                  <p className="text-[10px] opacity-60">
                    {latitude ? `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` : 'Wait for GPS...'}
                  </p>
                </div>
              </div>
              <button onClick={getLocation} className="text-xl">🔄</button>
            </div>

            {error && <p className="text-red-500 text-xs font-bold px-2">⚠️ {error}</p>}

            <button
              onClick={handleSubmit}
              disabled={loading || locationLoading}
              className="w-full py-5 bg-green-600 hover:bg-green-700 disabled:opacity-30 text-white font-black rounded-2xl shadow-xl flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-6 h-6 border-4 border-white border-t-transparent animate-spin rounded-full"></div>
              ) : 'SUBMIT ALERT 🚨'}
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in zoom-in-95 duration-300 text-center py-8">
            <div className="w-24 h-24 bg-green-500 text-white rounded-full flex items-center justify-center text-5xl mx-auto mb-6 shadow-xl shadow-green-500/20">
              ✓
            </div>
            <div>
              <h2 className="text-2xl font-bold">Report Received!</h2>
              <p className="opacity-70 mt-2 px-4 italic">"{success}"</p>
            </div>

            {guidance && (
              <div className={`p-6 rounded-3xl text-left space-y-4 border-2 ${darkMode ? 'bg-slate-800 border-blue-500' : 'bg-white border-blue-500 shadow-xl'
                }`}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🛡️</span>
                  <h3 className="text-lg font-black text-blue-600">IMMEDIATE SAFETY GUIDES</h3>
                </div>

                <div className="space-y-3">
                  <h4 className="font-bold text-sm text-red-500 uppercase tracking-wider">Action Required:</h4>
                  <ul className="space-y-2">
                    {guidance.immediateActions?.map((act, i) => (
                      <li key={i} className="flex gap-2 text-sm">
                        <span className="text-blue-500">•</span>
                        {act}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
                  <p className="text-xs font-bold text-yellow-600">Home Remedy Tip:</p>
                  <p className="text-xs mt-1">{guidance.homeRemedies?.[0]}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => navigate('/labs')}
                className="py-4 bg-blue-600 text-white font-bold rounded-2xl text-[10px] uppercase shadow-lg shadow-blue-500/20"
              >
                🔬 Find Testing Lab
              </button>
              <button
                onClick={() => navigate('/')}
                className={`py-4 rounded-2xl font-bold text-[10px] uppercase ${darkMode ? 'bg-slate-800' : 'bg-slate-200'}`}
              >
                Return Home
              </button>
            </div>
          </div>
        )}
      </main>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
