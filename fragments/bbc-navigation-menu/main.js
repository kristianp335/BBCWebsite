/**
 * BBC Navigation Menu Fragment JavaScript
 */
(function() {
    'use strict';

    function initBBCNavigationMenu(fragmentElement) {
        const navMenu = fragmentElement.querySelector('.bbc-navigation-menu');
        const toggleButton = navMenu.querySelector('[data-bbc-nav-toggle]');
        const mobileMenu = navMenu.querySelector('[data-bbc-nav-menu]');
        const dropdownToggle = navMenu.querySelectorAll('[data-bbc-dropdown-toggle]');
        const searchForm = navMenu.querySelector('[data-bbc-search-form]');
        const searchInput = navMenu.querySelector('[data-bbc-search-input]');

        // Setup mobile menu functionality
        function setupMobileMenu() {
            if (toggleButton && mobileMenu) {
                toggleButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    const isOpen = toggleButton.getAttribute('aria-expanded') === 'true';
                    
                    toggleButton.setAttribute('aria-expanded', !isOpen);
                    mobileMenu.classList.toggle('bbc-mobile-menu--open');
                    
                    // Animate toggle lines
                    const lines = toggleButton.querySelectorAll('.bbc-navigation-menu__toggle-line');
                    if (!isOpen) {
                        lines[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
                        lines[1].style.opacity = '0';
                        lines[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
                    } else {
                        lines[0].style.transform = '';
                        lines[1].style.opacity = '';
                        lines[2].style.transform = '';
                    }

                    // Track mobile menu toggle
                    if (window.BBC && window.BBC.analytics) {
                        window.BBC.analytics.track({
                            action: isOpen ? 'close' : 'open',
                            category: 'navigation',
                            label: 'mobile_menu_toggle',
                            value: null
                        });
                    }
                });

                // Close mobile menu when clicking outside
                document.addEventListener('click', (e) => {
                    if (mobileMenu.classList.contains('bbc-mobile-menu--open')) {
                        if (!navMenu.contains(e.target)) {
                            toggleButton.setAttribute('aria-expanded', 'false');
                            mobileMenu.classList.remove('bbc-mobile-menu--open');
                            
                            const lines = toggleButton.querySelectorAll('.bbc-navigation-menu__toggle-line');
                            lines[0].style.transform = '';
                            lines[1].style.opacity = '';
                            lines[2].style.transform = '';
                        }
                    }
                });

                // Close mobile menu on escape key
                document.addEventListener('keydown', (e) => {
                    if (e.key === 'Escape' && mobileMenu.classList.contains('bbc-mobile-menu--open')) {
                        toggleButton.setAttribute('aria-expanded', 'false');
                        mobileMenu.classList.remove('bbc-mobile-menu--open');
                        toggleButton.focus();
                        
                        const lines = toggleButton.querySelectorAll('.bbc-navigation-menu__toggle-line');
                        lines[0].style.transform = '';
                        lines[1].style.opacity = '';
                        lines[2].style.transform = '';
                    }
                });
            }
        }

        // Setup dropdown functionality
        function setupDropdowns() {
            dropdownToggle.forEach(toggle => {
                const targetId = toggle.getAttribute('aria-controls');
                const dropdown = document.getElementById(targetId);
                
                if (dropdown) {
                    // Click handler
                    toggle.addEventListener('click', (e) => {
                        if (window.innerWidth > 768) {
                            e.preventDefault();
                        }
                        
                        const isOpen = toggle.getAttribute('aria-expanded') === 'true';
                        
                        // Close all other dropdowns
                        dropdownToggle.forEach(otherToggle => {
                            if (otherToggle !== toggle) {
                                otherToggle.setAttribute('aria-expanded', 'false');
                                const otherId = otherToggle.getAttribute('aria-controls');
                                const otherDropdown = document.getElementById(otherId);
                                if (otherDropdown) {
                                    otherDropdown.classList.remove('bbc-dropdown--open');
                                }
                            }
                        });
                        
                        toggle.setAttribute('aria-expanded', !isOpen);
                        dropdown.classList.toggle('bbc-dropdown--open');

                        // Track dropdown interaction
                        if (window.BBC && window.BBC.analytics) {
                            window.BBC.analytics.track({
                                action: isOpen ? 'close' : 'open',
                                category: 'navigation',
                                label: 'dropdown_toggle',
                                value: toggle.textContent.trim()
                            });
                        }
                    });

                    // Hover handlers for desktop
                    if (window.innerWidth > 768) {
                        const item = toggle.closest('.bbc-navigation-menu__item');
                        let hoverTimeout;

                        item.addEventListener('mouseenter', () => {
                            clearTimeout(hoverTimeout);
                            hoverTimeout = setTimeout(() => {
                                toggle.setAttribute('aria-expanded', 'true');
                                dropdown.classList.add('bbc-dropdown--open');
                            }, 150);
                        });

                        item.addEventListener('mouseleave', () => {
                            clearTimeout(hoverTimeout);
                            hoverTimeout = setTimeout(() => {
                                toggle.setAttribute('aria-expanded', 'false');
                                dropdown.classList.remove('bbc-dropdown--open');
                            }, 300);
                        });
                    }
                }
            });

            // Close dropdowns when clicking outside
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.bbc-navigation-menu__item--has-submenu')) {
                    dropdownToggle.forEach(toggle => {
                        toggle.setAttribute('aria-expanded', 'false');
                        const targetId = toggle.getAttribute('aria-controls');
                        const dropdown = document.getElementById(targetId);
                        if (dropdown) {
                            dropdown.classList.remove('bbc-dropdown--open');
                        }
                    });
                }
            });
        }

        // Setup search functionality
        function setupSearch() {
            if (searchForm && searchInput) {
                let searchTimeout;

                // Search input handler
                searchInput.addEventListener('input', (e) => {
                    clearTimeout(searchTimeout);
                    const query = e.target.value.trim();
                    
                    if (query.length > 2) {
                        searchTimeout = setTimeout(() => {
                            // Dispatch search suggestions event
                            const event = new CustomEvent('bbcNavigationSearch', {
                                detail: { 
                                    query, 
                                    input: searchInput,
                                    type: 'suggestion'
                                }
                            });
                            document.dispatchEvent(event);
                        }, 300);
                    }
                });

                // Search form submission
                searchForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    const query = searchInput.value.trim();
                    
                    if (query) {
                        // Track search
                        if (window.BBC && window.BBC.analytics) {
                            window.BBC.analytics.track({
                                action: 'search',
                                category: 'navigation',
                                label: 'search_submit',
                                value: query
                            });
                        }

                        // Dispatch search event
                        const event = new CustomEvent('bbcNavigationSearch', {
                            detail: { 
                                query,
                                type: 'submit'
                            }
                        });
                        document.dispatchEvent(event);
                    }
                });

                // Clear search on escape
                searchInput.addEventListener('keydown', (e) => {
                    if (e.key === 'Escape') {
                        searchInput.value = '';
                        searchInput.blur();
                    }
                });
            }
        }

        // Setup current page highlighting
        function setupCurrentPageHighlighting() {
            const currentPath = window.location.pathname;
            const navLinks = navMenu.querySelectorAll('.bbc-navigation-menu__link, .bbc-navigation-menu__submenu-link');
            
            navLinks.forEach(link => {
                const linkPath = new URL(link.href, window.location.origin).pathname;
                
                if (linkPath === currentPath) {
                    link.classList.add('bbc-navigation-menu__link--active');
                    
                    // If it's a submenu link, also highlight the parent
                    const parentItem = link.closest('.bbc-navigation-menu__item--has-submenu');
                    if (parentItem) {
                        const parentLink = parentItem.querySelector('.bbc-navigation-menu__link');
                        if (parentLink) {
                            parentLink.classList.add('bbc-navigation-menu__link--active');
                        }
                    }
                } else if (currentPath.startsWith(linkPath) && linkPath !== '/') {
                    // Highlight parent sections
                    link.classList.add('bbc-navigation-menu__link--active');
                }
            });
        }

        // Setup sticky navigation
        function setupStickyNavigation() {
            if (navMenu.hasAttribute('data-bbc-sticky-nav')) {
                let lastScrollTop = 0;
                const scrollThreshold = 100;
                
                function handleScroll() {
                    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                    
                    if (scrollTop > scrollThreshold) {
                        if (scrollTop > lastScrollTop) {
                            // Scrolling down
                            navMenu.classList.add('bbc-navigation-menu--hidden');
                        } else {
                            // Scrolling up
                            navMenu.classList.remove('bbc-navigation-menu--hidden');
                        }
                    } else {
                        // At top of page
                        navMenu.classList.remove('bbc-navigation-menu--hidden');
                    }
                    
                    lastScrollTop = scrollTop;
                }

                // Use throttled scroll handler
                if (window.BBC && window.BBC.utils && window.BBC.utils.throttle) {
                    window.addEventListener('scroll', window.BBC.utils.throttle(handleScroll, 100));
                } else {
                    // Fallback throttle
                    let scrollTimeout;
                    window.addEventListener('scroll', () => {
                        if (!scrollTimeout) {
                            scrollTimeout = setTimeout(() => {
                                handleScroll();
                                scrollTimeout = null;
                            }, 100);
                        }
                    });
                }
            }
        }

        // Setup keyboard navigation
        function setupKeyboardNavigation() {
            navMenu.addEventListener('keydown', (e) => {
                const focusableElements = navMenu.querySelectorAll(
                    'a, button, input, [tabindex]:not([tabindex="-1"])'
                );
                const currentIndex = Array.from(focusableElements).indexOf(document.activeElement);
                
                switch (e.key) {
                    case 'ArrowRight':
                        if (navMenu.classList.contains('bbc-navigation-menu--horizontal')) {
                            e.preventDefault();
                            const nextIndex = (currentIndex + 1) % focusableElements.length;
                            focusableElements[nextIndex].focus();
                        }
                        break;
                        
                    case 'ArrowLeft':
                        if (navMenu.classList.contains('bbc-navigation-menu--horizontal')) {
                            e.preventDefault();
                            const prevIndex = (currentIndex - 1 + focusableElements.length) % focusableElements.length;
                            focusableElements[prevIndex].focus();
                        }
                        break;
                        
                    case 'ArrowDown':
                        if (e.target.hasAttribute('data-bbc-dropdown-toggle')) {
                            e.preventDefault();
                            const targetId = e.target.getAttribute('aria-controls');
                            const dropdown = document.getElementById(targetId);
                            if (dropdown) {
                                e.target.setAttribute('aria-expanded', 'true');
                                dropdown.classList.add('bbc-dropdown--open');
                                const firstLink = dropdown.querySelector('a');
                                if (firstLink) firstLink.focus();
                            }
                        }
                        break;
                        
                    case 'ArrowUp':
                        if (e.target.closest('.bbc-navigation-menu__submenu')) {
                            e.preventDefault();
                            const submenu = e.target.closest('.bbc-navigation-menu__submenu');
                            const parentToggle = navMenu.querySelector(`[aria-controls="${submenu.id}"]`);
                            if (parentToggle) {
                                parentToggle.setAttribute('aria-expanded', 'false');
                                submenu.classList.remove('bbc-dropdown--open');
                                parentToggle.focus();
                            }
                        }
                        break;
                        
                    case 'Escape':
                        // Close any open dropdowns
                        dropdownToggle.forEach(toggle => {
                            toggle.setAttribute('aria-expanded', 'false');
                            const targetId = toggle.getAttribute('aria-controls');
                            const dropdown = document.getElementById(targetId);
                            if (dropdown) {
                                dropdown.classList.remove('bbc-dropdown--open');
                            }
                        });
                        break;
                }
            });
        }

        // Setup click tracking for all navigation links
        function setupClickTracking() {
            const allLinks = navMenu.querySelectorAll('a');
            
            allLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    const isMainNav = link.classList.contains('bbc-navigation-menu__link');
                    const isSubNav = link.classList.contains('bbc-navigation-menu__submenu-link');
                    const linkText = link.textContent.trim();
                    
                    const trackingData = {
                        action: 'click',
                        category: 'navigation',
                        label: isMainNav ? `main_nav_${linkText.toLowerCase()}` :
                               isSubNav ? `sub_nav_${linkText.toLowerCase()}` : 
                               'nav_link',
                        value: link.href,
                        customData: {
                            linkText: linkText,
                            isMainNav: isMainNav,
                            isSubNav: isSubNav,
                            timestamp: new Date().toISOString()
                        }
                    };

                    if (window.BBC && window.BBC.analytics) {
                        window.BBC.analytics.track(trackingData);
                    }

                    // Dispatch custom event
                    const event = new CustomEvent('bbcNavigationClick', {
                        detail: trackingData
                    });
                    document.dispatchEvent(event);
                });
            });
        }

        // Setup responsive behavior
        function setupResponsiveBehavior() {
            let currentBreakpoint = getCurrentBreakpoint();
            
            function handleBreakpointChange() {
                const newBreakpoint = getCurrentBreakpoint();
                if (newBreakpoint !== currentBreakpoint) {
                    const oldBreakpoint = currentBreakpoint;
                    currentBreakpoint = newBreakpoint;
                    
                    // Close mobile menu when switching to desktop
                    if (newBreakpoint !== 'mobile' && mobileMenu.classList.contains('bbc-mobile-menu--open')) {
                        toggleButton.setAttribute('aria-expanded', 'false');
                        mobileMenu.classList.remove('bbc-mobile-menu--open');
                        
                        const lines = toggleButton.querySelectorAll('.bbc-navigation-menu__toggle-line');
                        lines[0].style.transform = '';
                        lines[1].style.opacity = '';
                        lines[2].style.transform = '';
                    }
                    
                    // Re-setup dropdowns for new breakpoint
                    setupDropdowns();
                    
                    // Dispatch breakpoint change event
                    const event = new CustomEvent('bbcNavigationBreakpointChange', {
                        detail: {
                            element: navMenu,
                            newBreakpoint: newBreakpoint,
                            oldBreakpoint: oldBreakpoint
                        }
                    });
                    document.dispatchEvent(event);
                }
            }

            function getCurrentBreakpoint() {
                const width = window.innerWidth;
                if (width <= 768) return 'mobile';
                if (width <= 1024) return 'tablet';
                return 'desktop';
            }

            // Throttled resize handler
            let resizeTimeout;
            window.addEventListener('resize', () => {
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(handleBreakpointChange, 250);
            });
        }

        // Initialize all functionality
        setupMobileMenu();
        setupDropdowns();
        setupSearch();
        setupCurrentPageHighlighting();
        setupStickyNavigation();
        setupKeyboardNavigation();
        setupClickTracking();
        setupResponsiveBehavior();

        // Dispatch initialization event
        const event = new CustomEvent('bbcNavigationMenuReady', {
            detail: {
                element: navMenu,
                hasSearch: !!searchForm,
                isSticky: navMenu.hasAttribute('data-bbc-sticky-nav'),
                layout: navMenu.classList.contains('bbc-navigation-menu--vertical') ? 'vertical' :
                       navMenu.classList.contains('bbc-navigation-menu--compact') ? 'compact' : 'horizontal'
            }
        });
        document.dispatchEvent(event);
    }

    // Initialize when fragment is loaded
    function init() {
        const navMenuFragments = document.querySelectorAll('.bbc-navigation-menu');
        navMenuFragments.forEach(nav => {
            initBBCNavigationMenu(nav.closest('.bbc-fragment'));
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
        if (e.detail && e.detail.fragmentType === 'bbc-navigation-menu') {
            initBBCNavigationMenu(e.detail.element);
        }
    });

})();
