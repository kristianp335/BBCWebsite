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
        getCurrentBreakpoint: function() {
            const width = window.innerWidth;
            if (width < 480) return 'mobile';
            if (width < 768) return 'tablet';
            if (width < 1024) return 'desktop-small';
            return 'desktop';
        },

        /**
         * Format date in BBC style
         */
        formatDate: function(date, format = 'relative') {
            const now = new Date();
            const diff = now - date;
            const minutes = Math.floor(diff / 60000);
            const hours = Math.floor(diff / 3600000);
            const days = Math.floor(diff / 86400000);

            if (format === 'relative') {
                if (minutes < 1) return 'Just now';
                if (minutes < 60) return `${minutes} min${minutes === 1 ? '' : 's'} ago`;
                if (hours < 24) return `${hours} hr${hours === 1 ? '' : 's'} ago`;
                if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
            }

            return date.toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
            });
        }
    };

    // Navigation functionality
    BBC.navigation = {
        init: function() {
            this.setupMobileMenu();
            this.setupDropdowns();
            this.setupSearch();
            this.setupScrollBehavior();
        },

        setupMobileMenu: function() {
            const mobileMenuButtons = document.querySelectorAll('[data-bbc-mobile-menu-toggle]');
            const mobileMenus = document.querySelectorAll('[data-bbc-mobile-menu]');

            mobileMenuButtons.forEach(button => {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    const targetId = button.getAttribute('aria-controls');
                    const menu = document.getElementById(targetId);
                    
                    if (menu) {
                        const isOpen = button.getAttribute('aria-expanded') === 'true';
                        button.setAttribute('aria-expanded', !isOpen);
                        menu.classList.toggle('bbc-mobile-menu--open');
                        
                        // Trap focus when menu is open
                        if (!isOpen) {
                            this.trapFocus(menu);
                        }
                    }
                });
            });

            // Close mobile menu on escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    mobileMenus.forEach(menu => {
                        if (menu.classList.contains('bbc-mobile-menu--open')) {
                            const button = document.querySelector(`[aria-controls="${menu.id}"]`);
                            if (button) {
                                button.setAttribute('aria-expanded', 'false');
                                menu.classList.remove('bbc-mobile-menu--open');
                                button.focus();
                            }
                        }
                    });
                }
            });
        },

        setupDropdowns: function() {
            const dropdownButtons = document.querySelectorAll('[data-bbc-dropdown-toggle]');
            
            dropdownButtons.forEach(button => {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    const targetId = button.getAttribute('aria-controls');
                    const dropdown = document.getElementById(targetId);
                    
                    if (dropdown) {
                        const isOpen = button.getAttribute('aria-expanded') === 'true';
                        
                        // Close all other dropdowns
                        dropdownButtons.forEach(otherButton => {
                            if (otherButton !== button) {
                                otherButton.setAttribute('aria-expanded', 'false');
                                const otherId = otherButton.getAttribute('aria-controls');
                                const otherDropdown = document.getElementById(otherId);
                                if (otherDropdown) {
                                    otherDropdown.classList.remove('bbc-dropdown--open');
                                }
                            }
                        });
                        
                        button.setAttribute('aria-expanded', !isOpen);
                        dropdown.classList.toggle('bbc-dropdown--open');
                    }
                });
            });

            // Close dropdowns when clicking outside
            document.addEventListener('click', (e) => {
                if (!e.target.closest('[data-bbc-dropdown-toggle]') && 
                    !e.target.closest('[data-bbc-dropdown]')) {
                    dropdownButtons.forEach(button => {
                        button.setAttribute('aria-expanded', 'false');
                        const targetId = button.getAttribute('aria-controls');
                        const dropdown = document.getElementById(targetId);
                        if (dropdown) {
                            dropdown.classList.remove('bbc-dropdown--open');
                        }
                    });
                }
            });
        },

        setupSearch: function() {
            const searchForms = document.querySelectorAll('[data-bbc-search-form]');
            const searchInputs = document.querySelectorAll('[data-bbc-search-input]');
            
            searchInputs.forEach(input => {
                input.addEventListener('input', BBC.utils.debounce((e) => {
                    const query = e.target.value.trim();
                    if (query.length > 2) {
                        this.handleSearchSuggestions(input, query);
                    }
                }, 300));
            });

            searchForms.forEach(form => {
                form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    const input = form.querySelector('[data-bbc-search-input]');
                    if (input && input.value.trim()) {
                        this.handleSearch(input.value.trim());
                    }
                });
            });
        },

        setupScrollBehavior: function() {
            let lastScrollTop = 0;
            const headers = document.querySelectorAll('[data-bbc-sticky-header]');
            
            window.addEventListener('scroll', BBC.utils.throttle(() => {
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                
                headers.forEach(header => {
                    if (scrollTop > lastScrollTop && scrollTop > 100) {
                        // Scrolling down
                        header.classList.add('bbc-header--hidden');
                    } else {
                        // Scrolling up
                        header.classList.remove('bbc-header--hidden');
                    }
                });
                
                lastScrollTop = scrollTop;
            }, 100));
        },

        trapFocus: function(element) {
            const focusableElements = element.querySelectorAll(
                'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select'
            );
            const firstFocusableElement = focusableElements[0];
            const lastFocusableElement = focusableElements[focusableElements.length - 1];

            element.addEventListener('keydown', (e) => {
                if (e.key === 'Tab') {
                    if (e.shiftKey) {
                        if (document.activeElement === firstFocusableElement) {
                            lastFocusableElement.focus();
                            e.preventDefault();
                        }
                    } else {
                        if (document.activeElement === lastFocusableElement) {
                            firstFocusableElement.focus();
                            e.preventDefault();
                        }
                    }
                }
            });

            firstFocusableElement.focus();
        },

        handleSearchSuggestions: function(input, query) {
            // This would typically make an API call to get search suggestions
            console.log('Search suggestions for:', query);
            
            // Dispatch custom event for fragments to handle
            const event = new CustomEvent('bbcSearchSuggestions', {
                detail: { query, input }
            });
            document.dispatchEvent(event);
        },

        handleSearch: function(query) {
            // This would typically redirect to search results page
            console.log('Searching for:', query);
            
            // Dispatch custom event for fragments to handle
            const event = new CustomEvent('bbcSearch', {
                detail: { query }
            });
            document.dispatchEvent(event);
        }
    };

    // Analytics functionality
    BBC.analytics = {
        init: function() {
            this.setupClickTracking();
            this.setupViewTracking();
            this.setupFormTracking();
        },

        setupClickTracking: function() {
            document.addEventListener('click', (e) => {
                const element = e.target.closest('[data-bbc-track-click]');
                if (element) {
                    const trackingData = {
                        action: 'click',
                        category: element.getAttribute('data-bbc-track-category') || 'general',
                        label: element.getAttribute('data-bbc-track-label') || element.textContent.trim(),
                        value: element.getAttribute('data-bbc-track-value') || null
                    };
                    this.track(trackingData);
                }
            });
        },

        setupViewTracking: function() {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const element = entry.target;
                        const trackingData = {
                            action: 'view',
                            category: element.getAttribute('data-bbc-track-category') || 'content',
                            label: element.getAttribute('data-bbc-track-label') || 'section_view',
                            value: element.getAttribute('data-bbc-track-value') || null
                        };
                        this.track(trackingData);
                        observer.unobserve(element);
                    }
                });
            }, { threshold: 0.5 });

            document.querySelectorAll('[data-bbc-track-view]').forEach(element => {
                observer.observe(element);
            });
        },

        setupFormTracking: function() {
            document.addEventListener('submit', (e) => {
                const form = e.target.closest('[data-bbc-track-form]');
                if (form) {
                    const trackingData = {
                        action: 'form_submit',
                        category: form.getAttribute('data-bbc-track-category') || 'form',
                        label: form.getAttribute('data-bbc-track-label') || 'form_submission',
                        value: form.getAttribute('data-bbc-track-value') || null
                    };
                    this.track(trackingData);
                }
            });
        },

        track: function(data) {
            // This would typically send data to analytics service
            console.log('Analytics tracking:', data);
            
            // Dispatch custom event for other systems to handle
            const event = new CustomEvent('bbcAnalyticsTrack', {
                detail: data
            });
            document.dispatchEvent(event);
        }
    };

    // Content functionality
    BBC.content = {
        init: function() {
            this.setupLazyLoading();
            this.setupVideoPlayers();
            this.setupImageGalleries();
        },

        setupLazyLoading: function() {
            if ('IntersectionObserver' in window) {
                const imageObserver = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const img = entry.target;
                            if (img.dataset.src) {
                                img.src = img.dataset.src;
                                img.classList.remove('bbc-lazy');
                                imageObserver.unobserve(img);
                            }
                        }
                    });
                });

                document.querySelectorAll('img[data-src]').forEach(img => {
                    img.classList.add('bbc-lazy');
                    imageObserver.observe(img);
                });
            }
        },

        setupVideoPlayers: function() {
            const videoPlayers = document.querySelectorAll('[data-bbc-video-player]');
            
            videoPlayers.forEach(player => {
                const playButton = player.querySelector('[data-bbc-video-play]');
                const video = player.querySelector('video');
                
                if (playButton && video) {
                    playButton.addEventListener('click', () => {
                        if (video.paused) {
                            video.play();
                            playButton.style.display = 'none';
                        }
                    });
                    
                    video.addEventListener('click', () => {
                        if (video.paused) {
                            video.play();
                            playButton.style.display = 'none';
                        } else {
                            video.pause();
                            playButton.style.display = 'block';
                        }
                    });
                }
            });
        },

        setupImageGalleries: function() {
            const galleries = document.querySelectorAll('[data-bbc-gallery]');
            
            galleries.forEach(gallery => {
                const images = gallery.querySelectorAll('[data-bbc-gallery-item]');
                const prevButton = gallery.querySelector('[data-bbc-gallery-prev]');
                const nextButton = gallery.querySelector('[data-bbc-gallery-next]');
                let currentIndex = 0;

                function showImage(index) {
                    images.forEach((img, i) => {
                        img.style.display = i === index ? 'block' : 'none';
                    });
                }

                if (prevButton) {
                    prevButton.addEventListener('click', () => {
                        currentIndex = (currentIndex - 1 + images.length) % images.length;
                        showImage(currentIndex);
                    });
                }

                if (nextButton) {
                    nextButton.addEventListener('click', () => {
                        currentIndex = (currentIndex + 1) % images.length;
                        showImage(currentIndex);
                    });
                }

                // Initialize
                if (images.length > 0) {
                    showImage(0);
                }
            });
        }
    };

    // Initialize all modules when DOM is ready
    function init() {
        BBC.navigation.init();
        BBC.analytics.init();
        BBC.content.init();
        
        // Dispatch initialization complete event
        const event = new CustomEvent('bbcGlobalScriptsReady');
        document.dispatchEvent(event);
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Expose BBC object globally
    window.BBC = BBC;

})(window, document);
