/**
 * BBC Section Header Fragment JavaScript
 */
(function() {
    'use strict';

    function initBBCSectionHeader(fragmentElement) {
        const sectionHeader = fragmentElement.querySelector('.bbc-section-header');
        const actionButtons = sectionHeader.querySelectorAll('.bbc-section-header__action-btn');
        const lastUpdatedElement = sectionHeader.querySelector('.bbc-section-header__last-updated');
        const breadcrumbLinks = sectionHeader.querySelectorAll('.bbc-breadcrumb-link');

        // Setup action buttons
        function setupActionButtons() {
            actionButtons.forEach(button => {
                const actionType = button.getAttribute('data-bbc-action');
                
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    handleAction(actionType, button);
                });
            });
        }

        // Handle different action types
        function handleAction(actionType, button) {
            switch (actionType) {
                case 'follow':
                    handleFollow(button);
                    break;
                case 'share':
                    handleShare(button);
                    break;
                case 'bookmark':
                    handleBookmark(button);
                    break;
                case 'notification':
                    handleNotification(button);
                    break;
                default:
                    console.log('Unknown action type:', actionType);
            }

            // Track action
            if (window.BBC && window.BBC.analytics) {
                window.BBC.analytics.track({
                    action: actionType,
                    category: 'section_header',
                    label: `header_action_${actionType}`,
                    value: getSectionTitle()
                });
            }
        }

        // Handle follow action
        function handleFollow(button) {
            const isFollowing = button.classList.contains('following');
            const newState = !isFollowing;
            
            button.classList.toggle('following', newState);
            
            const textElement = button.querySelector('.bbc-section-header__action-text');
            if (textElement) {
                if (newState) {
                    textElement.textContent = textElement.textContent.replace('Follow', 'Follow');
                    button.setAttribute('aria-label', 'Unfollow section');
                } else {
                    textElement.textContent = textElement.textContent.replace('Following', 'Follow');
                    button.setAttribute('aria-label', 'Follow section');
                }
            }

            // Show feedback
            showActionFeedback(newState ? 'Following section' : 'Unfollowed section');

            // Dispatch custom event
            const event = new CustomEvent('bbcSectionFollow', {
                detail: {
                    element: sectionHeader,
                    following: newState,
                    section: getSectionTitle()
                }
            });
            document.dispatchEvent(event);
        }

        // Handle share action
        function handleShare(button) {
            const sectionTitle = getSectionTitle();
            const currentUrl = window.location.href;
            
            if (navigator.share) {
                // Use native sharing if available
                navigator.share({
                    title: sectionTitle,
                    url: currentUrl
                }).then(() => {
                    // Track successful share
                    if (window.BBC && window.BBC.analytics) {
                        window.BBC.analytics.track({
                            action: 'share_success',
                            category: 'section_header',
                            label: 'native_share',
                            value: sectionTitle
                        });
                    }
                }).catch((error) => {
                    if (error.name !== 'AbortError') {
                        console.error('Share failed:', error);
                        fallbackShare(currentUrl);
                    }
                });
            } else {
                fallbackShare(currentUrl);
            }
        }

        // Fallback share implementation
        function fallbackShare(url) {
            // Copy URL to clipboard
            if (navigator.clipboard) {
                navigator.clipboard.writeText(url).then(() => {
                    showActionFeedback('Link copied to clipboard');
                }).catch((error) => {
                    console.error('Failed to copy to clipboard:', error);
                    showShareDialog(url);
                });
            } else {
                showShareDialog(url);
            }
        }

        // Show share dialog
        function showShareDialog(url) {
            const dialog = document.createElement('div');
            dialog.className = 'bbc-section-header__share-dialog';
            dialog.innerHTML = `
                <div class="bbc-section-header__share-backdrop"></div>
                <div class="bbc-section-header__share-content">
                    <h3>Share this section</h3>
                    <div class="bbc-section-header__share-url">
                        <input type="text" value="${url}" readonly>
                        <button type="button" class="bbc-section-header__copy-btn">Copy</button>
                    </div>
                    <button type="button" class="bbc-section-header__close-btn">Close</button>
                </div>
            `;
            
            dialog.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
            `;

            const backdrop = dialog.querySelector('.bbc-section-header__share-backdrop');
            backdrop.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
            `;

            const content = dialog.querySelector('.bbc-section-header__share-content');
            content.style.cssText = `
                background: var(--bbc-white);
                padding: var(--bbc-spacing-lg);
                border-radius: 8px;
                max-width: 400px;
                width: 90%;
                position: relative;
                z-index: 1;
            `;

            document.body.appendChild(dialog);

            // Handle copy button
            const copyBtn = dialog.querySelector('.bbc-section-header__copy-btn');
            const urlInput = dialog.querySelector('input');
            
            copyBtn.addEventListener('click', () => {
                urlInput.select();
                document.execCommand('copy');
                showActionFeedback('Link copied to clipboard');
                dialog.remove();
            });

            // Handle close
            const closeBtn = dialog.querySelector('.bbc-section-header__close-btn');
            closeBtn.addEventListener('click', () => {
                dialog.remove();
            });

            backdrop.addEventListener('click', () => {
                dialog.remove();
            });
        }

        // Handle bookmark action
        function handleBookmark(button) {
            const isBookmarked = button.classList.contains('bookmarked');
            const newState = !isBookmarked;
            
            button.classList.toggle('bookmarked', newState);
            
            const textElement = button.querySelector('.bbc-section-header__action-text');
            if (textElement) {
                textElement.textContent = newState ? 'Bookmarked' : 'Bookmark';
            }

            showActionFeedback(newState ? 'Section bookmarked' : 'Bookmark removed');

            // Dispatch custom event
            const event = new CustomEvent('bbcSectionBookmark', {
                detail: {
                    element: sectionHeader,
                    bookmarked: newState,
                    section: getSectionTitle()
                }
            });
            document.dispatchEvent(event);
        }

        // Handle notification action
        async function handleNotification(button) {
            if (!('Notification' in window)) {
                showActionFeedback('Notifications not supported in this browser');
                return;
            }

            const isEnabled = button.classList.contains('enabled');
            
            if (!isEnabled) {
                try {
                    const permission = await Notification.requestPermission();
                    
                    if (permission === 'granted') {
                        button.classList.add('enabled');
                        const textElement = button.querySelector('.bbc-section-header__action-text');
                        if (textElement) {
                            textElement.textContent = 'Notifications On';
                        }
                        
                        showActionFeedback('Notifications enabled');
                        
                        // Show test notification
                        new Notification(`${getSectionTitle()} Updates`, {
                            body: 'You will now receive notifications for this section.',
                            icon: '/favicon.ico'
                        });
                    } else {
                        showActionFeedback('Notification permission denied');
                    }
                } catch (error) {
                    console.error('Notification permission error:', error);
                    showActionFeedback('Failed to enable notifications');
                }
            } else {
                button.classList.remove('enabled');
                const textElement = button.querySelector('.bbc-section-header__action-text');
                if (textElement) {
                    textElement.textContent = 'Get Notifications';
                }
                showActionFeedback('Notifications disabled');
            }
        }

        // Show action feedback
        function showActionFeedback(message) {
            const feedback = document.createElement('div');
            feedback.className = 'bbc-section-header__feedback';
            feedback.textContent = message;
            feedback.style.cssText = `
                position: fixed;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: var(--bbc-black);
                color: var(--bbc-white);
                padding: var(--bbc-spacing-sm) var(--bbc-spacing-md);
                border-radius: 4px;
                font-size: 0.875rem;
                z-index: 1000;
                opacity: 0;
                transition: opacity 0.3s ease;
            `;

            document.body.appendChild(feedback);
            
            // Animate in
            setTimeout(() => {
                feedback.style.opacity = '1';
            }, 100);

            // Remove after 3 seconds
            setTimeout(() => {
                feedback.style.opacity = '0';
                setTimeout(() => {
                    feedback.remove();
                }, 300);
            }, 3000);
        }

        // Setup last updated time formatting
        function setupLastUpdated() {
            if (lastUpdatedElement) {
                const datetime = lastUpdatedElement.getAttribute('datetime');
                if (datetime) {
                    try {
                        const date = new Date(datetime);
                        if (!isNaN(date.getTime())) {
                            // Use BBC utility if available
                            if (window.BBC && window.BBC.utils && window.BBC.utils.formatDate) {
                                const formattedDate = window.BBC.utils.formatDate(date);
                                lastUpdatedElement.textContent = `Last updated: ${formattedDate}`;
                            } else {
                                const formattedDate = formatLastUpdated(date);
                                lastUpdatedElement.textContent = `Last updated: ${formattedDate}`;
                            }
                        }
                    } catch (error) {
                        console.warn('Invalid datetime format:', datetime);
                    }
                }
            }
        }

        // Format last updated time
        function formatLastUpdated(date) {
            const now = new Date();
            const diff = now - date;
            const minutes = Math.floor(diff / 60000);
            const hours = Math.floor(diff / 3600000);
            const days = Math.floor(diff / 86400000);

            if (minutes < 1) return 'just now';
            if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
            if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
            if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
            
            return date.toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
            });
        }

        // Setup breadcrumb navigation
        function setupBreadcrumbs() {
            breadcrumbLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    const linkText = link.textContent.trim();
                    
                    // Track breadcrumb click
                    if (window.BBC && window.BBC.analytics) {
                        window.BBC.analytics.track({
                            action: 'click',
                            category: 'breadcrumb',
                            label: `breadcrumb_${linkText.toLowerCase()}`,
                            value: link.href
                        });
                    }
                });
            });
        }

        // Setup keyboard navigation
        function setupKeyboardNavigation() {
            sectionHeader.addEventListener('keydown', (e) => {
                // Handle action button keyboard interaction
                if (e.target.classList.contains('bbc-section-header__action-btn')) {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        e.target.click();
                    }
                }
            });
        }

        // Setup accessibility features
        function setupAccessibility() {
            // Ensure proper heading hierarchy
            const title = sectionHeader.querySelector('.bbc-section-header__title');
            if (title) {
                title.setAttribute('role', 'heading');
                title.setAttribute('aria-level', '1');
            }

            // Add proper ARIA labels to action buttons
            actionButtons.forEach(button => {
                const actionType = button.getAttribute('data-bbc-action');
                const textElement = button.querySelector('.bbc-section-header__action-text');
                
                if (!button.getAttribute('aria-label') && textElement) {
                    button.setAttribute('aria-label', textElement.textContent.trim());
                }
            });

            // Ensure breadcrumb navigation is properly labeled
            const breadcrumbNav = sectionHeader.querySelector('.bbc-section-header__breadcrumbs');
            if (breadcrumbNav && !breadcrumbNav.getAttribute('aria-label')) {
                breadcrumbNav.setAttribute('aria-label', 'Breadcrumb navigation');
            }
        }

        // Get section title
        function getSectionTitle() {
            const titleElement = sectionHeader.querySelector('.bbc-section-header__title');
            return titleElement ? titleElement.textContent.trim() : '';
        }

        // Setup view tracking
            // Track header view
            if (window.BBC && window.BBC.analytics) {
                window.BBC.analytics.track({
                    action: 'view',
                    category: 'section_header',
                    label: 'header_view',
                    value: getSectionTitle()
                });
            }

            // Track scroll depth for featured headers
            if (sectionHeader.classList.contains('bbc-section-header--featured')) {
                let scrollTracked = false;
                
                    if (!scrollTracked && window.pageYOffset > 100) {
                        scrollTracked = true;
                        
                        if (window.BBC && window.BBC.analytics) {
                            window.BBC.analytics.track({
                                action: 'scroll',
                                category: 'section_header',
                                label: 'featured_header_scroll',
                                value: getSectionTitle()
                            });
                        }
                        
                    }
                }
                
            }
        }

        // Initialize all functionality
        setupActionButtons();
        setupLastUpdated();
        setupBreadcrumbs();
        setupKeyboardNavigation();
        setupAccessibility();

        // Dispatch initialization event
        const event = new CustomEvent('bbcSectionHeaderReady', {
            detail: {
                element: sectionHeader,
                title: getSectionTitle(),
                style: sectionHeader.className.includes('--featured') ? 'featured' :
                       sectionHeader.className.includes('--minimal') ? 'minimal' :
                       sectionHeader.className.includes('--dark') ? 'dark' : 'default',
                hasActions: actionButtons.length > 0,
                hasBreadcrumbs: breadcrumbLinks.length > 0
            }
        });
        document.dispatchEvent(event);
    }

    // Initialize when fragment is loaded
    function init() {
        const sectionHeaderFragments = document.querySelectorAll('.bbc-section-header');
        sectionHeaderFragments.forEach(header => {
            initBBCSectionHeader(header.closest('.bbc-fragment'));
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
        if (e.detail && e.detail.fragmentType === 'bbc-section-header') {
            initBBCSectionHeader(e.detail.element);
        }
    });

})();
