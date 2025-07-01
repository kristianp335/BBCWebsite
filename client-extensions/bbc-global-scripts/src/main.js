/**
 * BBC Global Scripts - JavaScript Client Extension
 * Provides shared functionality for all BBC-inspired fragments
 */

(function(window, document) {
    'use strict';

    // BBC Global namespace
    const BBC = window.BBC || {};
    window.BBC = BBC;

    // Utility functions
    BBC.utils = {
        /**
         * Debounce function to limit function calls
         */
        debounce: function(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        },

        /**
         * Throttle function to limit function calls
         */
        throttle: function(func, limit) {
            let inThrottle;
            return function() {
                const args = arguments;
                const context = this;
                if (!inThrottle) {
                    func.apply(context, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            };
        },

        /**
         * Check if element is in viewport
         */
        isInViewport: function(element) {
            const rect = element.getBoundingClientRect();
            return (
                rect.top >= 0 &&
                rect.left >= 0 &&
                rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
                rect.right <= (window.innerWidth || document.documentElement.clientWidth)
            );
        },

        /**
         * Get current breakpoint
         */
        getBreakpoint: function() {
            const width = window.innerWidth;
            if (width >= 1200) return 'xl';
            if (width >= 992) return 'lg';
            if (width >= 768) return 'md';
            if (width >= 576) return 'sm';
            return 'xs';
        },

        /**
         * Format date in BBC style
         */
        formatDate: function(date, options = {}) {
            const now = new Date();
            const diff = now - date;
            const diffHours = Math.floor(diff / (1000 * 60 * 60));
            const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));

            if (diffHours < 1) return 'Just now';
            if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
            if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
            
            return date.toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: diffDays > 365 ? 'numeric' : undefined
            });
        }
    };

    // Image carousel functionality
    BBC.carousel = {
        init: function(element) {
            const images = element.querySelectorAll('.bbc-carousel__image');
            const indicators = element.querySelectorAll('.bbc-carousel-indicator');
            let currentIndex = 0;

            function showImage(index) {
                images.forEach((img, i) => {
                    img.style.display = i === index ? 'block' : 'none';
                });
                indicators.forEach((indicator, i) => {
                    indicator.classList.toggle('active', i === index);
                });
            }

            indicators.forEach((indicator, index) => {
                indicator.addEventListener('click', () => {
                    currentIndex = index;
                    showImage(currentIndex);
                });
            });

            // Show first image initially
            if (images.length > 0) {
                showImage(0);
            }
        }
    };

    // Initialize BBC functionality when DOM is ready
    function init() {
        // Initialize carousels
        document.querySelectorAll('.bbc-carousel').forEach(carousel => {
            BBC.carousel.init(carousel);
        });

        // Add responsive behavior
        let currentBreakpoint = BBC.utils.getBreakpoint();
        window.addEventListener('resize', BBC.utils.debounce(() => {
            const newBreakpoint = BBC.utils.getBreakpoint();
            if (newBreakpoint !== currentBreakpoint) {
                currentBreakpoint = newBreakpoint;
                document.body.className = document.body.className.replace(/\bbbc-breakpoint-\w+/g, '');
                document.body.classList.add(`bbc-breakpoint-${newBreakpoint}`);
            }
        }, 250));

        // Set initial breakpoint class
        document.body.classList.add(`bbc-breakpoint-${currentBreakpoint}`);
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})(window, document);