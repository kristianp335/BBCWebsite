/**
 * BBC Hero Banner Fragment JavaScript
 */
(function() {
    'use strict';

    function initBBCHeroBanner(fragmentElement) {
        const heroBanner = fragmentElement.querySelector('.bbc-hero-banner');
        const backgroundElement = heroBanner.querySelector('.bbc-hero-banner__background');
        const link = heroBanner.querySelector('.bbc-hero-banner__link');
        const overlay = heroBanner.querySelector('.bbc-hero-banner__overlay');

        // Lazy loading for background images
        function setupLazyLoading() {
            if (backgroundElement && backgroundElement.style.backgroundImage) {
                const imageUrl = backgroundElement.style.backgroundImage.slice(5, -2); // Remove url(" and ")
                
                if (imageUrl && 'IntersectionObserver' in window) {
                    const observer = new IntersectionObserver((entries) => {
                        entries.forEach(entry => {
                            if (entry.isIntersecting) {
                                // Preload the image
                                const img = new Image();
                                img.onload = () => {
                                    backgroundElement.classList.add('bbc-hero-banner__background--loaded');
                                    
                                    // Track image load
                                    if (window.BBC && window.BBC.analytics) {
                                        window.BBC.analytics.track({
                                            action: 'image_load',
                                            category: 'hero',
                                            label: 'background_image',
                                            value: imageUrl
                                        });
                                    }
                                };
                                img.onerror = () => {
                                    backgroundElement.classList.add('bbc-hero-banner__background--error');
                                    console.warn('Hero banner background image failed to load:', imageUrl);
                                };
                                img.src = imageUrl;
                                
                                observer.unobserve(entry.target);
                            }
                        });
                    }, {
                        rootMargin: '50px'
                    });

                    observer.observe(heroBanner);
                }
            }
        }

        // Enhanced click tracking with timing
        function setupClickTracking() {
            if (link) {
                let clickStartTime;
                
                link.addEventListener('mousedown', () => {
                    clickStartTime = performance.now();
                });

                link.addEventListener('click', (e) => {
                    const clickDuration = clickStartTime ? performance.now() - clickStartTime : 0;
                    const headline = heroBanner.querySelector('.bbc-hero-banner__headline');
                    const category = heroBanner.querySelector('.bbc-hero-banner__category .bbc-label');
                    const isLive = heroBanner.querySelector('.bbc-hero-banner__live');
                    
                    // Enhanced tracking data
                    const trackingData = {
                        action: 'click',
                        category: 'hero',
                        label: 'banner_click',
                        value: link.href,
                        customData: {
                            headline: headline ? headline.textContent.trim() : '',
                            category: category ? category.textContent.trim() : '',
                            isLive: !!isLive,
                            clickDuration: Math.round(clickDuration),
                            timestamp: new Date().toISOString()
                        }
                    };

                    if (window.BBC && window.BBC.analytics) {
                        window.BBC.analytics.track(trackingData);
                    }

                    // Dispatch custom event
                    const event = new CustomEvent('bbcHeroBannerClick', {
                        detail: trackingData
                    });
                    document.dispatchEvent(event);
                });
            }
        }

        // Keyboard navigation enhancements
        function setupKeyboardNavigation() {
            if (link) {
                link.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        
                        // Add visual feedback
                        link.style.transform = 'scale(0.98)';
                        setTimeout(() => {
                            link.style.transform = '';
                            link.click();
                        }, 150);
                    }
                });
            }
        }

        // Hover effects with smooth transitions
        function setupHoverEffects() {
            if (link && overlay) {
                let hoverTimeout;
                
                link.addEventListener('mouseenter', () => {
                    clearTimeout(hoverTimeout);
                    overlay.style.transition = 'opacity 0.3s ease';
                    
                    // Track hover events for engagement analysis
                    if (window.BBC && window.BBC.analytics) {
                        window.BBC.analytics.track({
                            action: 'hover',
                            category: 'hero',
                            label: 'banner_hover_start',
                            value: null
                        });
                    }
                });

                link.addEventListener('mouseleave', () => {
                    hoverTimeout = setTimeout(() => {
                        overlay.style.transition = 'opacity 0.3s ease';
                    }, 100);
                });
            }
        }

        // Live content indicator animation
        function setupLiveIndicator() {
            const liveIndicator = heroBanner.querySelector('.bbc-hero-banner__live');
            if (liveIndicator) {
                // Enhanced live indicator with pulsing animation
                liveIndicator.style.setProperty('--pulse-animation', 'bbc-pulse 2s infinite');
                
                // Auto-refresh for live content (every 30 seconds)
                const refreshInterval = setInterval(() => {
                    // Dispatch event for potential content refresh
                    const event = new CustomEvent('bbcLiveContentRefresh', {
                        detail: {
                            element: heroBanner,
                            url: link ? link.href : null
                        }
                    });
                    document.dispatchEvent(event);
                }, 30000);

                // Store interval for cleanup
                heroBanner.dataset.refreshInterval = refreshInterval;
            }
        }

        // Responsive image handling
        function setupResponsiveImages() {
            if (backgroundElement) {
                function updateImageForViewport() {
                    const currentBreakpoint = window.BBC && window.BBC.utils ? 
                        window.BBC.utils.getCurrentBreakpoint() : 
                        getSimpleBreakpoint();
                    
                    // You could implement different image sizes for different breakpoints
                    const imageUrl = backgroundElement.style.backgroundImage;
                    if (imageUrl && imageUrl.includes('url(')) {
                        // Example: Replace image URLs for different sizes
                        // This would typically be configured through the fragment configuration
                        console.log('Current breakpoint:', currentBreakpoint);
                    }
                }

                function getSimpleBreakpoint() {
                    const width = window.innerWidth;
                    if (width < 480) return 'mobile';
                    if (width < 768) return 'tablet';
                    if (width < 1024) return 'desktop-small';
                    return 'desktop';
                }

                // Update on resize with debouncing
                let resizeTimeout;
                window.addEventListener('resize', () => {
                    clearTimeout(resizeTimeout);
                    resizeTimeout = setTimeout(updateImageForViewport, 250);
                });

                // Initial update
                updateImageForViewport();
            }
        }

        // Accessibility enhancements
        function setupAccessibility() {
            // Add ARIA labels if missing
            if (link && !link.getAttribute('aria-label')) {
                const headline = heroBanner.querySelector('.bbc-hero-banner__headline');
                if (headline) {
                    link.setAttribute('aria-label', headline.textContent.trim());
                }
            }

            // Add role and live region for live content
            const liveIndicator = heroBanner.querySelector('.bbc-hero-banner__live');
            if (liveIndicator) {
                liveIndicator.setAttribute('aria-live', 'polite');
                liveIndicator.setAttribute('role', 'status');
            }

            // Ensure proper heading hierarchy
            const headline = heroBanner.querySelector('.bbc-hero-banner__headline');
            if (headline && !headline.getAttribute('role')) {
                headline.setAttribute('role', 'heading');
                headline.setAttribute('aria-level', '1');
            }
        }

        // Performance monitoring
        function setupPerformanceMonitoring() {
            const startTime = performance.now();
            
            // Monitor initialization time
            const initEndTime = performance.now();
            const initTime = initEndTime - startTime;
            
            if (initTime > 100) { // Log if initialization takes more than 100ms
                console.warn('BBC Hero Banner initialization took longer than expected:', initTime + 'ms');
            }

            // Track performance metrics
            if (window.BBC && window.BBC.analytics) {
                window.BBC.analytics.track({
                    action: 'performance',
                    category: 'hero',
                    label: 'initialization_time',
                    value: Math.round(initTime)
                });
            }
        }

        // Initialize all functionality
        setupLazyLoading();
        setupClickTracking();
        setupKeyboardNavigation();
        setupHoverEffects();
        setupLiveIndicator();
        setupResponsiveImages();
        setupAccessibility();
        setupPerformanceMonitoring();

        // Dispatch initialization event
        const event = new CustomEvent('bbcHeroBannerReady', {
            detail: { 
                element: heroBanner,
                hasBackgroundImage: !!backgroundElement.style.backgroundImage,
                isLive: !!heroBanner.querySelector('.bbc-hero-banner__live')
            }
        });
        document.dispatchEvent(event);
    }

    // Cleanup function for when fragments are removed
    function cleanupBBCHeroBanner(fragmentElement) {
        const heroBanner = fragmentElement.querySelector('.bbc-hero-banner');
        if (heroBanner && heroBanner.dataset.refreshInterval) {
            clearInterval(parseInt(heroBanner.dataset.refreshInterval));
        }
    }

    // Initialize when fragment is loaded
    function init() {
        const heroBannerFragments = document.querySelectorAll('.bbc-hero-banner');
        heroBannerFragments.forEach(fragment => {
            initBBCHeroBanner(fragment.closest('.bbc-fragment'));
        });
    }

    // Initialize on DOM ready or immediately if already ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Re-initialize when new fragments are added dynamically
    document.addEventListener('bbcFragmentAdded', function(e) {
        if (e.detail && e.detail.fragmentType === 'bbc-hero-banner') {
            initBBCHeroBanner(e.detail.element);
        }
    });

    // Cleanup when fragments are removed
    document.addEventListener('bbcFragmentRemoved', function(e) {
        if (e.detail && e.detail.fragmentType === 'bbc-hero-banner') {
            cleanupBBCHeroBanner(e.detail.element);
        }
    });

})();
