/**
 * BBC Footer Fragment JavaScript
 */
(function() {
    'use strict';

    function initBBCFooter(fragmentElement) {
        const footer = fragmentElement.querySelector('.bbc-footer');
        const socialLinks = footer.querySelectorAll('.bbc-footer__social-link');
        const footerLinks = footer.querySelectorAll('.bbc-footer__section-link');

        // Enhanced link tracking
        footerLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                const linkText = this.textContent.trim();
                const section = this.closest('.bbc-footer__section');
                const sectionTitle = section ? section.querySelector('.bbc-footer__section-title').textContent.trim() : 'Unknown';
                
                // Track footer link clicks
                if (window.BBC && window.BBC.analytics) {
                    window.BBC.analytics.track({
                        action: 'click',
                        category: 'footer',
                        label: `${sectionTitle.toLowerCase()}_${linkText.toLowerCase()}`,
                        value: this.href
                    });
                }
            });
        });

        // Social link tracking with platform detection
        socialLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                const platform = this.getAttribute('aria-label') || 'Unknown';
                
                // Track social link clicks
                if (window.BBC && window.BBC.analytics) {
                    window.BBC.analytics.track({
                        action: 'click',
                        category: 'social',
                        label: platform.toLowerCase(),
                        value: this.href
                    });
                }
            });

            // Add hover effects for social icons
            link.addEventListener('mouseenter', function() {
                const icon = this.querySelector('.bbc-footer__social-icon');
                if (icon) {
                    icon.style.transform = 'scale(1.1)';
                }
            });

            link.addEventListener('mouseleave', function() {
                const icon = this.querySelector('.bbc-footer__social-icon');
                if (icon) {
                    icon.style.transform = 'scale(1)';
                }
            });
        });

        // Keyboard navigation enhancements
        footer.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                const target = e.target;
                if (target.tagName === 'A') {
                    // Let default behavior handle link activation
                    return;
                }
            }
        });

        // Intersection Observer for footer visibility tracking
        if ('IntersectionObserver' in window) {
            const footerObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        // Track footer view
                        if (window.BBC && window.BBC.analytics) {
                            window.BBC.analytics.track({
                                action: 'view',
                                category: 'footer',
                                label: 'footer_visible',
                                value: null
                            });
                        }
                        
                        // Only track once
                        footerObserver.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.5
            });

            footerObserver.observe(footer);
        }

        // Add smooth scrolling for anchor links within footer
        const anchorLinks = footer.querySelectorAll('a[href^="#"]');
        anchorLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (href && href !== '#') {
                    const target = document.querySelector(href);
                    if (target) {
                        e.preventDefault();
                        target.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                }
            });
        });

        // Add focus management for better accessibility
        const focusableElements = footer.querySelectorAll(
            'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        focusableElements.forEach((element, index) => {
            element.addEventListener('keydown', function(e) {
                if (e.key === 'Tab') {
                    // Implement custom tab order if needed
                    const isShiftTab = e.shiftKey;
                    const firstElement = focusableElements[0];
                    const lastElement = focusableElements[focusableElements.length - 1];

                    if (isShiftTab && this === firstElement) {
                        // Moving to previous element from first - wrap to last
                        lastElement.focus();
                        e.preventDefault();
                    } else if (!isShiftTab && this === lastElement) {
                        // Moving to next element from last - wrap to first
                        firstElement.focus();
                        e.preventDefault();
                    }
                }
            });
        });

        // Dynamic copyright year update
        const copyrightText = footer.querySelector('.bbc-footer__copyright-text');
        if (copyrightText) {
            const currentYear = new Date().getFullYear();
            const text = copyrightText.textContent;
            
            // Update year if it appears to be outdated
            const yearMatch = text.match(/©\s*(\d{4})/);
            if (yearMatch && parseInt(yearMatch[1]) < currentYear) {
                copyrightText.textContent = text.replace(yearMatch[1], currentYear.toString());
            }
        }

        // External link handling
        const externalLinks = footer.querySelectorAll('a[href^="http"]');
        externalLinks.forEach(link => {
            // Ensure external links have proper attributes
            if (!link.hasAttribute('target')) {
                link.setAttribute('target', '_blank');
            }
            if (!link.hasAttribute('rel')) {
                link.setAttribute('rel', 'noopener noreferrer');
            }

            // Add external link indicator
            if (!link.querySelector('.external-link-icon')) {
                const icon = document.createElement('span');
                icon.className = 'external-link-icon bbc-visually-hidden';
                icon.textContent = ' (opens in new window)';
                link.appendChild(icon);
            }
        });

        // Newsletter signup enhancement (if present)
        const newsletterForm = footer.querySelector('[data-newsletter-form]');
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const email = this.querySelector('input[type="email"]');
                if (email && email.value) {
                    // Track newsletter signup
                    if (window.BBC && window.BBC.analytics) {
                        window.BBC.analytics.track({
                            action: 'submit',
                            category: 'newsletter',
                            label: 'footer_signup',
                            value: null
                        });
                    }
                    
                    // Dispatch custom event for handling
                    const event = new CustomEvent('bbcNewsletterSignup', {
                        detail: { email: email.value }
                    });
                    document.dispatchEvent(event);
                }
            });
        }

        // Dispatch initialization event
        const event = new CustomEvent('bbcFooterReady', {
            detail: { element: footer }
        });
        document.dispatchEvent(event);
    }

    // Initialize when fragment is loaded
    function init() {
        const footerFragments = document.querySelectorAll('.bbc-footer');
        footerFragments.forEach(initBBCFooter);
    }

    // Initialize on DOM ready or immediately if already ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Re-initialize when new fragments are added dynamically
    document.addEventListener('bbcFragmentAdded', function(e) {
        if (e.detail && e.detail.fragmentType === 'bbc-footer') {
            initBBCFooter(e.detail.element);
        }
    });

})();
