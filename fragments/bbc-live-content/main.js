/**
 * BBC Live Content Fragment JavaScript
 */
(function() {
    'use strict';

    function initBBCLiveContent(fragmentElement) {
        const liveContent = fragmentElement.querySelector('.bbc-live-content');
        const updatesContainer = liveContent.querySelector('.bbc-live-content__updates');
        const viewerCountElement = liveContent.querySelector('[data-bbc-viewer-count] .bbc-live-content__viewers-count');
        const notifyButton = liveContent.querySelector('[data-bbc-notify-toggle]');
        const lastUpdateElement = liveContent.querySelector('[data-bbc-last-update] time');
        const refreshInterval = parseInt(liveContent.closest('.bbc-fragment').dataset.refreshInterval) || 30;

        let updateInterval;
        let notificationsEnabled = false;

        // Initialize live updates
        function setupLiveUpdates() {
            // Clear loading state after initial delay
            setTimeout(() => {
                const loadingElement = updatesContainer.querySelector('.bbc-live-content__updates-loading');
                if (loadingElement) {
                    loadingElement.style.display = 'none';
                }
                loadInitialUpdates();
            }, 2000);

            // Start periodic updates
            updateInterval = setInterval(() => {
                fetchLiveUpdates();
            }, refreshInterval * 1000);

            // Store interval for cleanup
            liveContent.dataset.updateInterval = updateInterval;
        }

        // Load initial updates (simulated)
        function loadInitialUpdates() {
            // In a real implementation, this would fetch from an API
            // For now, we'll create some sample structure
            const updates = generateSampleUpdates();
            displayUpdates(updates);
            updateLastUpdateTime();
        }

        // Fetch live updates
        function fetchLiveUpdates() {
            // Dispatch event for custom update handling
            const event = new CustomEvent('bbcLiveContentUpdate', {
                detail: {
                    element: liveContent,
                    container: updatesContainer
                }
            });
            document.dispatchEvent(event);

            // Update viewer count
            updateViewerCount();
            updateLastUpdateTime();

            // Track live content engagement
            if (window.BBC && window.BBC.analytics) {
                window.BBC.analytics.track({
                    action: 'live_update',
                    category: 'live_content',
                    label: 'auto_refresh',
                    value: null
                });
            }
        }

        // Display updates in the container
        function displayUpdates(updates) {
            const fragment = document.createDocumentFragment();
            
            updates.forEach((update, index) => {
                const updateElement = createUpdateElement(update);
                updateElement.style.animationDelay = `${index * 0.1}s`;
                fragment.appendChild(updateElement);
            });

            // Clear existing updates and add new ones
            const existingUpdates = updatesContainer.querySelectorAll('.bbc-live-content__update-item');
            existingUpdates.forEach(item => item.remove());
            
            updatesContainer.appendChild(fragment);
        }

        // Create individual update element
        function createUpdateElement(update) {
            const item = document.createElement('div');
            item.className = 'bbc-live-content__update-item';
            
            item.innerHTML = `
                <div class="bbc-live-content__update-time">${update.time}</div>
                <p class="bbc-live-content__update-text">${update.text}</p>
            `;
            
            return item;
        }

        // Generate sample updates (in real implementation, fetch from API)
        function generateSampleUpdates() {
            return [
                {
                    time: 'Just now',
                    text: 'New footage verified showing the aftermath of the overnight strikes.'
                },
                {
                    time: '2 mins ago',
                    text: 'BBC Verify team confirms location of damaged facilities using satellite imagery.'
                },
                {
                    time: '5 mins ago',
                    text: 'Local authorities report emergency services responding to multiple locations.'
                }
            ];
        }

        // Update viewer count
        function updateViewerCount() {
            if (viewerCountElement) {
                // In real implementation, this would come from an API
                const count = Math.floor(Math.random() * 1000) + 5000;
                const formattedCount = count.toLocaleString();
                
                viewerCountElement.textContent = `${formattedCount} watching`;
                
                // Add subtle animation
                viewerCountElement.style.transform = 'scale(1.05)';
                setTimeout(() => {
                    viewerCountElement.style.transform = 'scale(1)';
                }, 200);
            }
        }

        // Update last update timestamp
        function updateLastUpdateTime() {
            if (lastUpdateElement) {
                const now = new Date();
                const timeString = now.toLocaleTimeString('en-GB', {
                    hour: '2-digit',
                    minute: '2-digit'
                });
                
                lastUpdateElement.textContent = timeString;
                lastUpdateElement.setAttribute('datetime', now.toISOString());
            }
        }

        // Setup notification functionality
        function setupNotifications() {
            if (notifyButton) {
                notifyButton.addEventListener('click', async () => {
                    if (!notificationsEnabled) {
                        await enableNotifications();
                    } else {
                        disableNotifications();
                    }
                });

                // Check if notifications are already granted
                if ('Notification' in window && Notification.permission === 'granted') {
                    notificationsEnabled = true;
                    notifyButton.classList.add('active');
                    notifyButton.setAttribute('aria-label', 'Disable notifications');
                }
            }
        }

        // Enable notifications
        async function enableNotifications() {
            if (!('Notification' in window)) {
                console.warn('This browser does not support notifications');
                return;
            }

            try {
                const permission = await Notification.requestPermission();
                
                if (permission === 'granted') {
                    notificationsEnabled = true;
                    notifyButton.classList.add('active');
                    notifyButton.setAttribute('aria-label', 'Disable notifications');
                    
                    // Show confirmation notification
                    new Notification('BBC Live Updates', {
                        body: 'You will now receive notifications for live updates.',
                        icon: '/favicon.ico'
                    });

                    // Track notification enable
                    if (window.BBC && window.BBC.analytics) {
                        window.BBC.analytics.track({
                            action: 'notification_enable',
                            category: 'live_content',
                            label: 'notifications_enabled',
                            value: null
                        });
                    }
                } else {
                    console.warn('Notification permission denied');
                }
            } catch (error) {
                console.error('Error requesting notification permission:', error);
            }
        }

        // Disable notifications
        function disableNotifications() {
            notificationsEnabled = false;
            notifyButton.classList.remove('active');
            notifyButton.setAttribute('aria-label', 'Enable notifications');
            
            // Track notification disable
            if (window.BBC && window.BBC.analytics) {
                window.BBC.analytics.track({
                    action: 'notification_disable',
                    category: 'live_content',
                    label: 'notifications_disabled',
                    value: null
                });
            }
        }

        // Send notification for important updates
        function sendNotification(title, body) {
            if (notificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
                new Notification(title, {
                    body: body,
                    icon: '/favicon.ico',
                    tag: 'bbc-live-update' // Prevents duplicate notifications
                });
            }
        }

        // Setup visibility change handling
        function setupVisibilityHandling() {
            document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                    // Page is hidden, reduce update frequency
                    if (updateInterval) {
                        clearInterval(updateInterval);
                        updateInterval = setInterval(() => {
                            fetchLiveUpdates();
                        }, (refreshInterval * 2) * 1000); // Double the interval
                    }
                } else {
                    // Page is visible, restore normal frequency
                    if (updateInterval) {
                        clearInterval(updateInterval);
                        updateInterval = setInterval(() => {
                            fetchLiveUpdates();
                        }, refreshInterval * 1000);
                    }
                }
            });
        }

        // Enhanced click tracking
        function setupClickTracking() {
            const links = liveContent.querySelectorAll('a');
            
            links.forEach(link => {
                link.addEventListener('click', (e) => {
                    const isMainLink = link.classList.contains('bbc-live-content__link');
                    const isViewButton = link.classList.contains('bbc-live-content__view-btn');
                    
                    const trackingData = {
                        action: 'click',
                        category: 'live_content',
                        label: isMainLink ? 'title_click' : isViewButton ? 'follow_live_click' : 'link_click',
                        value: link.href,
                        customData: {
                            timestamp: new Date().toISOString(),
                            viewersWatching: viewerCountElement ? viewerCountElement.textContent : null,
                            notificationsEnabled: notificationsEnabled
                        }
                    };

                    if (window.BBC && window.BBC.analytics) {
                        window.BBC.analytics.track(trackingData);
                    }

                    // Dispatch custom event
                    const event = new CustomEvent('bbcLiveContentClick', {
                        detail: trackingData
                    });
                    document.dispatchEvent(event);
                });
            });
        }

        // Setup keyboard navigation
        function setupKeyboardNavigation() {
            liveContent.addEventListener('keydown', (e) => {
                if (e.key === 'Space' && e.target === notifyButton) {
                    e.preventDefault();
                    notifyButton.click();
                }
            });
        }

        // Setup accessibility features
        function setupAccessibility() {
            // Add live region for updates
            updatesContainer.setAttribute('aria-live', 'polite');
            updatesContainer.setAttribute('aria-label', 'Live updates');

            // Ensure proper heading hierarchy
            const title = liveContent.querySelector('.bbc-live-content__title');
            if (title && !title.getAttribute('role')) {
                title.setAttribute('role', 'heading');
                title.setAttribute('aria-level', '2');
            }

            // Add status region for viewer count
            if (viewerCountElement) {
                viewerCountElement.setAttribute('aria-live', 'polite');
                viewerCountElement.setAttribute('role', 'status');
            }
        }

        // Cleanup function
        function cleanup() {
            if (updateInterval) {
                clearInterval(updateInterval);
            }
        }

        // Initialize all functionality
        setupLiveUpdates();
        setupNotifications();
        setupVisibilityHandling();
        setupClickTracking();
        setupKeyboardNavigation();
        setupAccessibility();

        // Store cleanup function
        liveContent.cleanup = cleanup;

        // Immediate initial load
        updateViewerCount();
        updateLastUpdateTime();

        // Dispatch initialization event
        const event = new CustomEvent('bbcLiveContentReady', {
            detail: {
                element: liveContent,
                refreshInterval: refreshInterval,
                notificationsSupported: 'Notification' in window
            }
        });
        document.dispatchEvent(event);
    }

    // Cleanup function for removed fragments
    function cleanupBBCLiveContent(fragmentElement) {
        const liveContent = fragmentElement.querySelector('.bbc-live-content');
        if (liveContent && liveContent.cleanup) {
            liveContent.cleanup();
        }
    }

    // Initialize when fragment is loaded
    function init() {
        const liveContentFragments = document.querySelectorAll('.bbc-live-content');
        liveContentFragments.forEach(content => {
            initBBCLiveContent(content.closest('.bbc-fragment'));
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
        if (e.detail && e.detail.fragmentType === 'bbc-live-content') {
            initBBCLiveContent(e.detail.element);
        }
    });

    // Cleanup when fragments are removed
    document.addEventListener('bbcFragmentRemoved', function(e) {
        if (e.detail && e.detail.fragmentType === 'bbc-live-content') {
            cleanupBBCLiveContent(e.detail.element);
        }
    });

})();
