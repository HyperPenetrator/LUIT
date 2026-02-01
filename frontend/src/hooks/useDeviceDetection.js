import { useState, useEffect, useRef } from 'react'

export default function useDeviceDetection() {
  const [deviceInfo, setDeviceInfo] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isAndroid: false,
    isIOS: false,
    isWindows: false,
    isMac: false,
    screenSize: 'lg',
    orientation: 'landscape'
  })

  const debounceTimerRef = useRef(null)

  useEffect(() => {
    const detectDevice = () => {
      const ua = navigator.userAgent.toLowerCase()
      const width = window.innerWidth
      const height = window.innerHeight

      // Detect platform
      const isAndroid = /android/.test(ua)
      const isIOS = /iphone|ipad|ipod/.test(ua)
      const isWindows = /windows/.test(ua)
      const isMac = /macintosh|mac os x/.test(ua)

      // Detect device type
      const isMobileDevice = /mobile|android|iphone|ipod/.test(ua) || width < 768
      const isTabletDevice = /tablet|ipad/.test(ua) || (width >= 768 && width < 1024)
      const isDesktopDevice = !isMobileDevice && !isTabletDevice

      // Determine screen size
      let screenSize = 'sm'
      if (width >= 1536) screenSize = 'xl'
      else if (width >= 1280) screenSize = 'lg'
      else if (width >= 768) screenSize = 'md'

      // Determine orientation
      const orientation = width > height ? 'landscape' : 'portrait'

      const newDeviceInfo = {
        isMobile: isMobileDevice,
        isTablet: isTabletDevice,
        isDesktop: isDesktopDevice,
        isAndroid,
        isIOS,
        isWindows,
        isMac,
        screenSize,
        orientation
      }

      // Only update state if values actually changed (memoization)
      setDeviceInfo(prev => {
        const hasChanged =
          prev.isMobile !== newDeviceInfo.isMobile ||
          prev.isTablet !== newDeviceInfo.isTablet ||
          prev.isDesktop !== newDeviceInfo.isDesktop ||
          prev.screenSize !== newDeviceInfo.screenSize ||
          prev.orientation !== newDeviceInfo.orientation

        return hasChanged ? newDeviceInfo : prev
      })
    }

    // Debounced resize handler (150ms delay)
    const handleResize = () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
      debounceTimerRef.current = setTimeout(detectDevice, 150)
    }

    // Initial detection (no debounce)
    detectDevice()

    // Listen for resize events with debouncing
    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', detectDevice) // No debounce for orientation

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', detectDevice)
    }
  }, [])

  return deviceInfo
}
