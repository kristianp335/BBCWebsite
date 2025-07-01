/**
 * BBC News Card Fragment JavaScript
 */
(function() {
    'use strict';

    function initBBCNewsCard(fragmentElement) {
        const newsCard = fragmentElement.querySelector('.bbc-news-card');
        const link = newsCard.querySelector('.bbc-news-card__link');
        const image = newsCard.querySelector('.bbc-news-card__image');
        const headline = newsCard.querySelector('.bbc-news-card__headline');
        const timeElement = newsCard.querySelector('.bbc-news-card__time');

        // Enhanced lazy loading for images
        function setupLazyLoading() {
            if (image && image.hasAttribute('data-bbc-lazy-image')) {
                if ('IntersectionObserver' in window) {
                    const imageObserver = new IntersectionObserver((entries) => {
                        entries.forEach(entry => {
                            if (entry.isIntersecting) {
                                const img = entry.target;
                                img.classList.add('loading');
                                
                                // Create a new image to preload
                                const tempImg = new Image();
                                tempImg.onload = () => {
                                    img.src = tempImg.src;
                                    img.classList.remove('loading');
                                    img.classList.add('loaded');
                                    
                                    // Track successful image load
                                    if (window.BBC && window.BBC.analytics) {
                                        window.BBC.analytics.track({
                                            action: 'image_load',
                                            category: 'news_card',
                                            label: 'image_loaded',
                                            value: img.src
                                        });
                                    }
                                };
                                tempImg.onerror = () => {
                                    img.classList.remove('loading');
                                    img.classList.add('error');
                                    console.warn('Failed to load news card image:', img.src);
                                };
                                tempImg.src = img.src;
                                
                                imageObserver.unobserve(img);
                            }
                        });
                    }, {
                        rootMargin: '50px'
                    });

                    imageObserver.observe(image);
                }
            }
        }

        // Enhanced click tracking with engagement metrics
            if (link) {
                let mouseDownTime;
                let isMouseDown = false;
                
                link.addEventListener('mousedown', () => {
                    mouseDownTime = performance.now();
                    isMouseDown = true;
                });

                link.addEventListener('mouseup', () => {
                    isMouseDown = false;
                });

                link.addEventListener('click', (e) => {
                    const clickDuration = mouseDownTime ? performance.now() - mouseDownTime : 0;
                    const category = newsCard.querySelector('.bbc-news-card__category');
                    const cardSize = newsCard.classList.contains('bbc-news-card--large') ? 'large' : 
                                   newsCard.classList.contains('bbc-news-card--small') ? 'small' : 'medium';
                    const layout = newsCard.classList.contains('bbc-news-card--horizontal') ? 'horizontal' :
                                 newsCard.classList.contains('bbc-news-card--overlay') ? 'overlay' : 'vertical';
                    
                    const trackingData = {
                        action: 'click',
                        category: 'news_card',
                        label: 'card_click',
                        value: link.href,
                        customData: {
                            headline: headline ? headline.textContent.trim() : '',
                            category: category ? category.textContent.trim() : '',
                            cardSize: cardSize,
                            layout: layout,
                            clickDuration: Math.round(clickDuration),
                            hasImage: !!image,
                            timestamp: new Date().toISOString()
                        }
                    };

                    if (window.BBC && window.BBC.analytics) {
                        window.BBC.analytics.track(trackingData);
                    }

                    // Dispatch custom event
                    const event = new CustomEvent('bbcNewsCardClick', {
                        detail: trackingData
                    });
                    document.dispatchEvent(event);
                });

                // Track hover events for engagement analysis
                link.addEventListener('mouseenter', () => {
                    if (window.BBC && window.BBC.analytics) {
                        window.BBC.analytics.track({
                            action: 'hover',
                            category: 'news_card',
                            label: 'card_hover_start',
                            value: null
                        });
                    }
                });
            }
        }

        // Time formatting and updates
        function setupTimeHandling() {
            if (timeElement) {
                const datetime = timeElement.getAttribute('datetime');
                
                // Try to parse and format the time
                if (datetime && datetime !== timeElement.textContent) {
                    try {
                        const date = new Date(datetime);
                        if (!isNaN(date.getTime())) {
                            // Use BBC utility if available, otherwise fallback
                            if (window.BBC && window.BBC.utils && window.BBC.utils.formatDate) {
                                timeElement.textContent = window.BBC.utils.formatDate(date);
                            } else {
                                timeElement.textContent = formatRelativeTime(date);
                            }
                        }
                    } catch (e) {
                        console.warn('Invalid datetime format in news card:', datetime);
                    }
                }

                // Update relative times every minute for recent content
                if (isRecentContent(timeElement.textContent)) {
                    const updateInterval = setInterval(() => {
                        try {
                            const date = new Date(datetime || Date.now());
                            if (window.BBC && window.BBC.utils && window.BBC.utils.formatDate) {
                                timeElement.textContent = window.BBC.utils.formatDate(date);
                            } else {
                                timeElement.textContent = formatRelativeTime(date);
                            }
                            
                            // Stop updating if it's more than a day old
                            if (!isRecentContent(timeElement.textContent)) {
                                clearInterval(updateInterval);
                            }
                        } catch (e) {
                            clearInterval(updateInterval);
                        }
                    }, 60000); // Update every minute

                    // Store interval for cleanup
                    newsCard.dataset.timeUpdateInterval = updateInterval;
                }
            }
        }

        // Utility functions
        function formatRelativeTime(date) {
            const now = new Date();
            const diff = now - date;
            const minutes = Math.floor(diff / 60000);
            const hours = Math.floor(diff / 3600000);
            const days = Math.floor(diff / 86400000);

            if (minutes < 1) return 'Just now';
            if (minutes < 60) return `${minutes} min${minutes === 1 ? '' : 's'} ago`;
            if (hours < 24) return `${hours} hr${hours === 1 ? '' : 's'} ago`;
            if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
            
            return date.toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
            });
        }

        function isRecentContent(timeText) {
            return timeText.includes('min') || timeText.includes('hr') || timeText === 'Just now';
        }

        // Keyboard navigation enhancement
        function setupKeyboardNavigation() {
            if (link) {
                link.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        
                        // Add visual feedback
                        newsCard.style.transform = 'translateY(-1px) scale(0.98)';
                        setTimeout(() => {
                            newsCard.style.transform = '';
                            link.click();
                        }, 100);
                    }
                });
            }
        }

        // Live content handling
        function setupLiveContent() {
            const liveIndicator = newsCard.querySelector('.bbc-news-card__live');
            if (liveIndicator) {
                // Add pulsing animation for live content
                liveIndicator.style.animation = 'bbc-pulse 2s infinite';
                
                // Auto-refresh live content periodically
                const refreshInterval = setInterval(() => {
                    // Dispatch event for potential content refresh
                    const event = new CustomEvent('bbcLiveContentRefresh', {
                        detail: {
                            element: newsCard,
                            url: link ? link.href : null,
                            type: 'news_card'
                        }
                    });
                    document.dispatchEvent(event);
                }, 30000); // Refresh every 30 seconds

                // Store interval for cleanup
                newsCard.dataset.liveRefreshInterval = refreshInterval;
            }
        }

        // Accessibility enhancements
        function setupAccessibility() {
            // Ensure proper ARIA labels
            if (link && !link.getAttribute('aria-label')) {
                let ariaLabel = '';
                if (headline) {
                    ariaLabel += headline.textContent.trim();
                }
                const category = newsCard.querySelector('.bbc-news-card__category');
                if (category) {
                    ariaLabel += ` in ${category.textContent.trim()}`;
                }
                if (timeElement) {
                    ariaLabel += `, published ${timeElement.textContent.trim()}`;
                }
                link.setAttribute('aria-label', ariaLabel);
            }

            // Add semantic role to the card
            if (!newsCard.getAttribute('role')) {
                newsCard.setAttribute('role', 'div');
            }

            // Ensure headline has proper heading role
            if (headline && !headline.getAttribute('role')) {
                headline.setAttribute('role', 'heading');
                headline.setAttribute('aria-level', '2');
            }

            // Make time element more accessible
            if (timeElement && !timeElement.getAttribute('aria-label')) {
                timeElement.setAttribute('aria-label', `Published ${timeElement.textContent.trim()}`);
            }
        }

        // Responsive behavior
        function setupResponsiveBehavior() {
            let currentBreakpoint = getCurrentBreakpoint();
            
            function handleBreakpointChange() {
                const newBreakpoint = getCurrentBreakpoint();
                if (newBreakpoint !== currentBreakpoint) {
                    currentBreakpoint = newBreakpoint;
                    
                    // Dispatch breakpoint change event
                    const event = new CustomEvent('bbcCardBreakpointChange', {
                        detail: {
                            element: newsCard,
                            breakpoint: newBreakpoint,
                            previousBreakpoint: currentBreakpoint
                        }
                    });
                    document.dispatchEvent(event);
                }
            }

            function getCurrentBreakpoint() {
                const width = window.innerWidth;
                if (width < 480) return 'mobile';
                if (width < 768) return 'tablet';
                if (width < 1024) return 'desktop-small';
                return 'desktop';
            }

            // Throttled resize handler
            let resizeTimeout;
            window.addEventListener('resize', () => {
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(handleBreakpointChange, 250);
            });
        }

        // Performance monitoring
        function setupPerformanceMonitoring() {
            const startTime = performance.now();
            
            // Monitor paint timing
            if ('PerformanceObserver' in window) {
                try {
                    const observer = new PerformanceObserver((list) => {
                        list.getEntries().forEach((entry) => {
                            if (entry.name === 'first-contentful-paint') {
                                const paintTime = entry.startTime;
                                if (window.BBC && window.BBC.analytics) {
                                    window.BBC.analytics.track({
                                        action: 'performance',
                                        category: 'news_card',
                                        label: 'first_contentful_paint',
                                        value: Math.round(paintTime)
                                    });
                                }
                            }
                        });
                    });
                    observer.observe({ entryTypes: ['paint'] });
                } catch (e) {
                    // Observer not supported in this environment
                }
            }
            
            // Track initialization time
            const initTime = performance.now() - startTime;
            if (initTime > 50) { // Log if initialization takes more than 50ms
                console.warn('BBC News Card initialization took longer than expected:', initTime + 'ms');
            }
        }

        // Initialize all functionality
        setupLazyLoading();
        setupTimeHandling();
        setupKeyboardNavigation();
        setupLiveContent();
        setupAccessibility();
        setupResponsiveBehavior();
        setupPerformanceMonitoring();

        // Dispatch initialization event
        const event = new CustomEvent('bbcNewsCardReady', {
            detail: {
                element: newsCard,
                hasImage: !!image,
                isLive: !!newsCard.querySelector('.bbc-news-card__live'),
                layout: newsCard.classList.contains('bbc-news-card--horizontal') ? 'horizontal' :
                       newsCard.classList.contains('bbc-news-card--overlay') ? 'overlay' : 'vertical'
            }
        });
        document.dispatchEvent(event);
    }

    // Cleanup function
    function cleanupBBCNewsCard(fragmentElement) {
        const newsCard = fragmentElement.querySelector('.bbc-news-card');
        if (newsCard) {
            // Clear time update interval
            if (newsCard.dataset.timeUpdateInterval) {
                clearInterval(parseInt(newsCard.dataset.timeUpdateInterval));
            }
            
            // Clear live refresh interval
            if (newsCard.dataset.liveRefreshInterval) {
                clearInterval(parseInt(newsCard.dataset.liveRefreshInterval));
            }
        }
    }

    // Initialize when fragment is loaded
    function init() {
        const newsCardFragments = document.querySelectorAll('.bbc-news-card');
        newsCardFragments.forEach(card => {
            initBBCNewsCard(card.closest('.bbc-fragment'));
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
        if (e.detail && e.detail.fragmentType === 'bbc-news-card') {
            initBBCNewsCard(e.detail.element);
        }
    });

    // Cleanup when fragments are removed
    document.addEventListener('bbcFragmentRemoved', function(e) {
        if (e.detail && e.detail.fragmentType === 'bbc-news-card') {
            cleanupBBCNewsCard(e.detail.element);
        }
    });

})();
