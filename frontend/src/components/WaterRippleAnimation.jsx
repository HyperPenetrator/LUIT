import React, { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// A higher-fidelity water drop animation:
// - Teardrop SVG with glossy gradient and subtle squash on impact
// - Splash droplets arc out and fade
// - Multiple expanding ripples with blur and fade
// - Gentle water surface shimmer and ambient gradient background

export default function WaterRippleAnimation({ onComplete, durationMs = 5000 }) {
  const [impact, setImpact] = useState(false)
  const [ripples, setRipples] = useState([])
  const [show, setShow] = useState(true)

  useEffect(() => {
    const impactTimer = setTimeout(() => setImpact(true), 1200)
    const r1 = setTimeout(() => setRipples(r => [...r, { id: 1, delay: 0 }]), 1250)
    const r2 = setTimeout(() => setRipples(r => [...r, { id: 2, delay: 150 }]), 1400)
    const r3 = setTimeout(() => setRipples(r => [...r, { id: 3, delay: 300 }]), 1550)

    const endTimer = setTimeout(() => {
      setShow(false)
      onComplete && onComplete()
    }, durationMs)

    return () => {
      clearTimeout(impactTimer)
      clearTimeout(r1)
      clearTimeout(r2)
      clearTimeout(r3)
      clearTimeout(endTimer)
    }
  }, [durationMs, onComplete])

  const DropSVG = useMemo(() => (
    <svg width="42" height="60" viewBox="0 0 42 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="dropGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7dd3fc"/>
          <stop offset="60%" stopColor="#38bdf8"/>
          <stop offset="100%" stopColor="#0ea5e9"/>
        </linearGradient>
        <radialGradient id="gloss" cx="0.3" cy="0.2" r="0.6">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9"/>
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0"/>
        </radialGradient>
      </defs>
      {/* Teardrop */}
      <path d="M21 0 C 26 14, 42 24, 42 36 C 42 49.2548 32.2548 59 19 59 C 5.74517 59 -4 49.2548 -4 36 C -4 24 16 14 21 0 Z"
            transform="translate(4,1)" fill="url(#dropGrad)"/>
      {/* Gloss highlight */}
      <ellipse cx="18" cy="16" rx="8" ry="10" fill="url(#gloss)"/>
    </svg>
  ), [])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-auto"
          style={{
            background:
              'radial-gradient(1200px 600px at 50% 75%, rgba(14,165,233,0.20), rgba(2,6,23,0.85) 70%)',
            backdropFilter: 'blur(6px)'
          }}
        >
          <div className="relative w-[280px] h-[280px] flex items-end justify-center">
            {/* Ambient shimmer */}
            <div className="absolute inset-0 opacity-40">
              <div className="absolute -inset-10 blur-3xl bg-gradient-to-br from-cyan-500/20 via-sky-400/10 to-blue-600/10 rounded-full" />
            </div>

            {/* Water pool */}
            <div className="absolute bottom-6 w-56 h-28 rounded-[50%]"
                 style={{
                   background:
                     'radial-gradient(closest-side, rgba(56,189,248,0.45), rgba(12,74,110,0.35) 55%, rgba(2,6,23,0.0) 65%)',
                   filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.3))'
                 }}
            />

            {/* Waterline */}
            <div className="absolute bottom-16 w-64 h-[2px] rounded-full bg-gradient-to-r from-sky-300 via-cyan-200 to-sky-300 opacity-70" />

            {/* Falling drop */}
            <motion.div
              initial={{ y: -180, scaleY: 1, scaleX: 1, filter: 'blur(0px)' }}
              animate={impact
                ? { y: 0, scaleY: 0.78, scaleX: 1.12, filter: 'blur(0.2px)' }
                : { y: -6, scaleY: 1.04, scaleX: 0.98, filter: 'blur(0px)' }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-20"
            >
              <div className="drop-shadow-[0_8px_20px_rgba(14,165,233,0.5)]">
                {DropSVG}
              </div>
              {/* Drop reflection */}
              <motion.div
                initial={{ opacity: 0, scaleX: 0.8 }}
                animate={{ opacity: impact ? 0.5 : 0, scaleX: impact ? 1 : 0.8 }}
                transition={{ duration: 0.5 }}
                className="absolute left-1/2 -translate-x-1/2 -bottom-3 w-16 h-3 rounded-full bg-gradient-to-r from-cyan-300/60 to-sky-400/60 blur-md"
              />
            </motion.div>

            {/* Splash droplets */}
            <AnimatePresence>
              {impact && [
                { id: 'a', x: -38, c: '#67e8f9' },
                { id: 'b', x: 0,   c: '#7dd3fc' },
                { id: 'c', x: 38,  c: '#38bdf8' }
              ].map((d) => (
                <motion.div
                  key={d.id}
                  initial={{ x: 0, y: 0, opacity: 0 }}
                  animate={{ x: d.x, y: -34, opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.45, ease: 'easeOut' }}
                  className="absolute bottom-[72px]"
                >
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.c }} />
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Ripples */}
            {ripples.map((r) => (
              <motion.div
                key={r.id}
                initial={{ scale: 0.6, opacity: 0.6, filter: 'blur(0.5px)' }}
                animate={{ scale: 2.8, opacity: 0, filter: 'blur(1.2px)' }}
                transition={{ duration: 1.2, delay: r.delay / 1000, ease: 'easeOut' }}
                className="absolute bottom-16 w-24 h-24 rounded-full"
                style={{
                  border: '2px solid rgba(125,211,252,0.8)',
                  boxShadow: '0 0 0 2px rgba(56,189,248,0.25) inset'
                }}
              />
            ))}

            {/* Success text */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 3.2, duration: 0.6 }}
              className="absolute bottom-2 text-center"
            >
              <div className="text-white/90 font-semibold">Area Cleaned</div>
              <div className="text-cyan-200 text-xs">Sending you back…</div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
