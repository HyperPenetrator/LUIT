import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

export default function WaterRippleAnimation({ onComplete }) {
  const [ripples, setRipples] = useState([])

  useEffect(() => {
    // Create ripples at intervals
    const rippleIntervals = [
      setTimeout(() => setRipples(r => [...r, { id: 1, delay: 0 }]), 1500),
      setTimeout(() => setRipples(r => [...r, { id: 2, delay: 0.3 }]), 1800),
      setTimeout(() => setRipples(r => [...r, { id: 3, delay: 0.6 }]), 2100),
    ]

    // Navigate after 5 seconds
    const navigationTimer = setTimeout(() => {
      onComplete()
    }, 5000)

    return () => {
      rippleIntervals.forEach(clearTimeout)
      clearTimeout(navigationTimer)
    }
  }, [onComplete])

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50 backdrop-blur-sm">
      <div className="relative w-40 h-40 flex items-center justify-center">
        {/* Water surface indicator */}
        <div className="absolute bottom-0 w-full h-1 bg-gradient-to-r from-blue-300 via-cyan-300 to-blue-300 rounded-full blur-sm"></div>

        {/* Falling water droplet */}
        <motion.div
          initial={{ y: -100, opacity: 1, scale: 1 }}
          animate={{ y: 60, opacity: 0.8, scale: 0.9 }}
          transition={{ duration: 1.5, ease: 'easeIn' }}
          className="absolute z-10"
        >
          <div className="w-6 h-8 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full shadow-lg"></div>
        </motion.div>

        {/* Ripple circles */}
        {ripples.map((ripple) => (
          <motion.div
            key={ripple.id}
            initial={{ scale: 0, opacity: 0.8 }}
            animate={{ scale: 4, opacity: 0 }}
            transition={{
              duration: 1.2,
              delay: ripple.delay,
              ease: 'easeOut',
            }}
            className="absolute w-10 h-10 border-2 border-cyan-400 rounded-full"
            style={{ bottom: '0%' }}
          />
        ))}

        {/* Success message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3.5, duration: 1 }}
          className="absolute bottom-0 translate-y-20 text-center"
        >
          <p className="text-white font-bold text-lg">🎉 Great job!</p>
          <p className="text-cyan-200 text-sm">Redirecting...</p>
        </motion.div>
      </div>
    </div>
  )
}
