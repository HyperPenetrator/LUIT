import { useState, useEffect } from 'react'

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
      
      setDeviceInfo({
        isMobile: isMobileDevice,
        isTablet: isTabletDevice,
        isDesktop: isDesktopDevice,
        isAndroid,
        isIOS,
        isWindows,
        isMac,
        screenSize,
        orientation
      })
    }

    // Initial detection
    detectDevice()

    // Listen for resize events
    window.addEventListener('resize', detectDevice)
    window.addEventListener('orientationchange', detectDevice)

    return () => {
      window.removeEventListener('resize', detectDevice)
      window.removeEventListener('orientationchange', detectDevice)
    }
  }, [])

  return deviceInfo
}
