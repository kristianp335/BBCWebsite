/**
 * BBC Header Fragment JavaScript
 */
(function() {
    'use strict';

    function initBBCHeader(fragmentElement) {
        const header = fragmentElement.querySelector('.bbc-header');
        const mobileToggle = header.querySelector('.bbc-header__mobile-toggle');
        const mobileMenu = header.querySelector('.bbc-mobile-menu');
        const searchForm = header.querySelector('.bbc-search-form');
        const searchInput = header.querySelector('.bbc-search-form__input');

        // Mobile menu functionality
        if (mobileToggle && mobileMenu) {
            mobileToggle.addEventListener('click', function() {
                const isOpen = mobileToggle.getAttribute('aria-expanded') === 'true';
                mobileToggle.setAttribute('aria-expanded', !isOpen);
                mobileMenu.classList.toggle('bbc-mobile-menu--open');
                
                // Animate toggle lines
                const lines = mobileToggle.querySelectorAll('.bbc-header__mobile-toggle-line');
                if (!isOpen) {
                    lines[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
                    lines[1].style.opacity = '0';
                    lines[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
                } else {
                    lines[0].style.transform = '';
                    lines[1].style.opacity = '';
                    lines[2].style.transform = '';
                }
            });
        }

        // Close mobile menu when clicking outside
        document.addEventListener('click', function(e) {
            if (mobileMenu && mobileMenu.classList.contains('bbc-mobile-menu--open')) {
                if (!header.contains(e.target)) {
                    mobileToggle.setAttribute('aria-expanded', 'false');
                    mobileMenu.classList.remove('bbc-mobile-menu--open');
                    
                    const lines = mobileToggle.querySelectorAll('.bbc-header__mobile-toggle-line');
                    lines[0].style.transform = '';
                    lines[1].style.opacity = '';
                    lines[2].style.transform = '';
                }
            }
        });

        // Search functionality enhancement
        if (searchInput) {
            let searchTimeout;
            
            searchInput.addEventListener('input', function() {
                clearTimeout(searchTimeout);
                const query = this.value.trim();
                
                if (query.length > 2) {
                    searchTimeout = setTimeout(() => {
                        // Trigger search suggestions
                        const event = new CustomEvent('bbcHeaderSearchSuggestion', {
                            detail: { query, input: searchInput }
                        });
                        document.dispatchEvent(event);
                    }, 300);
                }
            });

            // Clear search on escape
            searchInput.addEventListener('keydown', function(e) {
                if (e.key === 'Escape') {
                    this.value = '';
                    this.blur();
                }
            });
        }

        // Search form submission
        if (searchForm) {
            searchForm.addEventListener('submit', function(e) {
                e.preventDefault();
                const query = searchInput.value.trim();
                
                if (query) {
                    // Dispatch search event
                    const event = new CustomEvent('bbcHeaderSearch', {
                        detail: { query }
                    });
                    document.dispatchEvent(event);
                    
                    // Track search
                    if (window.BBC && window.BBC.analytics) {
                        window.BBC.analytics.track({
                            action: 'search',
                            category: 'header',
                            label: 'search_submit',
                            value: query
                        });
                    }
                }
            });
        }

        // Sticky header behavior enhancement
        if (header.hasAttribute('data-bbc-sticky-header')) {
            let lastScrollTop = 0;
            let scrollThreshold = 100;
            
            function handleScroll() {
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                
                if (scrollTop > scrollThreshold) {
                    if (scrollTop > lastScrollTop) {
                        // Scrolling down
                        header.classList.add('bbc-header--hidden');
                    } else {
                        // Scrolling up
                        header.classList.remove('bbc-header--hidden');
                    }
                } else {
                    // At top of page
                    header.classList.remove('bbc-header--hidden');
                }
                
                lastScrollTop = scrollTop;
            }

            // Use throttled scroll handler from global scripts if available
            if (window.BBC && window.BBC.utils && window.BBC.utils.throttle) {
                window.addEventListener('scroll', window.BBC.utils.throttle(handleScroll, 100));
            } else {
                // Fallback throttle implementation
                let scrollTimeout;
                window.addEventListener('scroll', function() {
                    if (!scrollTimeout) {
                        scrollTimeout = setTimeout(function() {
                            handleScroll();
                            scrollTimeout = null;
                        }, 100);
                    }
                });
            }
        }

        // Active navigation item highlighting
        const navLinks = header.querySelectorAll('.bbc-nav__link, .bbc-mobile-menu__link');
        const currentPath = window.location.pathname;
        
        navLinks.forEach(link => {
            if (link.getAttribute('href') === currentPath) {
                link.classList.add('bbc-nav__link--active');
            }
        });

        // Keyboard navigation support
        header.addEventListener('keydown', function(e) {
            if (e.key === 'Tab') {
                // Ensure proper tab order in mobile menu
                if (mobileMenu && mobileMenu.classList.contains('bbc-mobile-menu--open')) {
                    const focusableElements = mobileMenu.querySelectorAll('a, button, input, select, textarea');
                    const firstElement = focusableElements[0];
                    const lastElement = focusableElements[focusableElements.length - 1];
                    
                    if (e.shiftKey) {
                        if (document.activeElement === firstElement) {
                            lastElement.focus();
                            e.preventDefault();
                        }
                    } else {
                        if (document.activeElement === lastElement) {
                            firstElement.focus();
                            e.preventDefault();
                        }
                    }
                }
            }
        });

        // Dispatch initialization event
        const event = new CustomEvent('bbcHeaderReady', {
            detail: { element: header }
        });
        document.dispatchEvent(event);
    }

    // Initialize when fragment is loaded
    function init() {
        const headerFragments = document.querySelectorAll('.bbc-header');
        headerFragments.forEach(initBBCHeader);
    }

    // Initialize on DOM ready or immediately if already ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Re-initialize when new fragments are added dynamically
    document.addEventListener('bbcFragmentAdded', function(e) {
        if (e.detail && e.detail.fragmentType === 'bbc-header') {
            initBBCHeader(e.detail.element);
        }
    });

})();
