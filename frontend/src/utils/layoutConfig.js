// Layout configuration for different device types
export const layoutConfig = {
    desktop: {
        maxWidth: 'max-w-6xl',
        gridCols: {
            stats: 'grid-cols-4',
            actions: 'grid-cols-2'
        },
        padding: 'px-8 py-10',
        spacing: 'gap-6',
        fontSize: {
            hero: 'text-6xl',
            heading: 'text-3xl',
            body: 'text-lg'
        },
        animation: {
            duration: '0.5s',
            staggerDelay: 0.1
        }
    },
    tablet: {
        maxWidth: 'max-w-3xl',
        gridCols: {
            stats: 'grid-cols-3',
            actions: 'grid-cols-2'
        },
        padding: 'px-6 py-8',
        spacing: 'gap-5',
        fontSize: {
            hero: 'text-5xl',
            heading: 'text-2xl',
            body: 'text-base'
        },
        animation: {
            duration: '0.6s',
            staggerDelay: 0.15
        }
    },
    mobile: {
        maxWidth: 'max-w-md',
        gridCols: {
            stats: 'grid-cols-2',
            actions: 'grid-cols-1'
        },
        padding: 'px-4 py-8',
        spacing: 'gap-4',
        fontSize: {
            hero: 'text-5xl',
            heading: 'text-2xl',
            body: 'text-base'
        },
        animation: {
            duration: '0.8s',
            staggerDelay: 0.2
        }
    }
}

// Get layout configuration based on device type
export const getLayoutConfig = (deviceInfo) => {
    if (deviceInfo.isDesktop) return layoutConfig.desktop
    if (deviceInfo.isTablet) return layoutConfig.tablet
    return layoutConfig.mobile
}

// Responsive utility classes
export const getResponsiveClasses = (deviceInfo) => {
    const config = getLayoutConfig(deviceInfo)

    return {
        container: `${config.maxWidth} mx-auto ${config.padding} w-full`,
        statsGrid: `grid ${config.gridCols.stats} ${config.spacing}`,
        actionsGrid: `grid ${config.gridCols.actions} ${config.spacing}`,
        heroText: config.fontSize.hero,
        headingText: config.fontSize.heading,
        bodyText: config.fontSize.body,
        spacing: config.spacing
    }
}

// Animation configuration
export const getAnimationConfig = (deviceInfo) => {
    const config = getLayoutConfig(deviceInfo)
    return config.animation
}
