/**
 * BBC Sidebar Content Fragment JavaScript
 */
(function() {
    'use strict';

    function initBBCSidebarContent(fragmentElement) {
        const sidebarContent = fragmentElement.querySelector('.bbc-sidebar-content');
        const itemsContainer = sidebarContent.querySelector('[data-bbc-sidebar-items]');
        const loadMoreButton = sidebarContent.querySelector('[data-bbc-load-more]');
        const weatherWidget = sidebarContent.querySelector('[data-bbc-weather-widget]');
        const contentType = getContentType();
        const maxItems = parseInt(sidebarContent.dataset.maxItems) || 5;

        let currentItemCount = 0;
        let allItems = [];
        let isLoading = false;

        // Get content type from fragment configuration
        function getContentType() {
            // In a real implementation, this would come from the fragment configuration
            // For now, detect from the DOM or use default
            const typeIndicator = sidebarContent.querySelector('.bbc-sidebar-content__type-indicator .bbc-label');
            if (typeIndicator) {
                const text = typeIndicator.textContent.trim().toLowerCase();
                switch (text) {
                    case 'related': return 'related_stories';
                    case 'trending': return 'trending';
                    case 'most read': return 'most_read';
                    case 'latest': return 'latest_news';
                    case 'weather': return 'weather_widget';
                    default: return 'custom_content';
                }
            }
            return 'related_stories';
        }

        // Initialize content loading
        function setupContentLoading() {
            // Count existing items
            const existingItems = itemsContainer.querySelectorAll('.bbc-sidebar-content__item');
            currentItemCount = existingItems.length;

            // Store existing items data for potential refresh
            existingItems.forEach((item, index) => {
                const link = item.querySelector('.bbc-sidebar-content__item-link');
                const title = item.querySelector('.bbc-sidebar-content__item-title');
                const category = item.querySelector('.bbc-sidebar-content__category');
                const time = item.querySelector('.bbc-sidebar-content__time');
                const image = item.querySelector('.bbc-sidebar-content__image');

                if (link && title) {
                    allItems.push({
                        url: link.href,
                        title: title.textContent.trim(),
                        category: category ? category.textContent.trim() : '',
                        time: time ? time.textContent.trim() : '',
                        image: image ? image.src : '',
                        element: item
                    });
                }
            });

            // Setup periodic refresh for dynamic content types
            if (['trending', 'most_read', 'latest_news'].includes(contentType)) {
                setupPeriodicRefresh();
            }
        }

        // Setup load more functionality
        function setupLoadMore() {
            if (loadMoreButton) {
                loadMoreButton.addEventListener('click', async (e) => {
                    e.preventDefault();
                    
                    if (isLoading) return;
                    
                    isLoading = true;
                    loadMoreButton.disabled = true;
                    loadMoreButton.textContent = 'Loading...';

                    try {
                        await loadMoreItems();
                        
                        // Track load more interaction
                        if (window.BBC && window.BBC.analytics) {
                            window.BBC.analytics.track({
                                action: 'load_more',
                                category: 'sidebar',
                                label: `load_more_${contentType}`,
                                value: currentItemCount
                            });
                        }
                    } catch (error) {
                        console.error('Failed to load more items:', error);
                        showErrorMessage('Failed to load more content. Please try again.');
                    } finally {
                        isLoading = false;
                        loadMoreButton.disabled = false;
                        loadMoreButton.innerHTML = `
                            Load More
                            <svg class="bbc-sidebar-content__load-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M16.01 11H4v2h12.01v3L20 12l-3.99-4z"/>
                            </svg>
                        `;
                    }
                });
            }
        }

        // Load more items
        async function loadMoreItems() {
            // Show loading state
            showLoadingState();

            // Simulate API call - in real implementation, this would fetch from actual API
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Generate new items based on content type
            const newItems = await fetchMoreItems();
            
            if (newItems.length > 0) {
                appendItems(newItems);
                currentItemCount += newItems.length;
                
                // Hide load more if we've reached the limit
                if (currentItemCount >= 20) { // Arbitrary limit
                    hideLoadMore();
                }
            } else {
                hideLoadMore();
                showMessage('No more content available.');
            }

            hideLoadingState();
        }

        // Fetch more items (simulated - replace with real API calls)
        async function fetchMoreItems() {
            // In real implementation, this would make API calls based on contentType
            const sampleItems = generateSampleItems(3);
            return sampleItems;
        }

        // Generate sample items (for demonstration - replace with real API)
        function generateSampleItems(count) {
            const sampleTitles = [
                'Breaking: Major development in international relations',
                'Technology breakthrough promises revolutionary changes',
                'Climate summit reaches historic agreement',
                'Sports championship delivers unexpected results',
                'Economic indicators show positive trends',
                'Cultural festival celebrates diversity and inclusion'
            ];

            const sampleCategories = ['World', 'Technology', 'Environment', 'Sport', 'Business', 'Culture'];
            
            return Array.from({ length: count }, (_, index) => ({
                title: sampleTitles[Math.floor(Math.random() * sampleTitles.length)],
                url: `/news/story-${Date.now()}-${index}`,
                category: sampleCategories[Math.floor(Math.random() * sampleCategories.length)],
                time: `${Math.floor(Math.random() * 12) + 1} hr${Math.floor(Math.random() * 12) + 1 === 1 ? '' : 's'} ago`,
                image: `https://via.placeholder.com/80x60/cccccc/666666?text=News`
            }));
        }

        // Append new items to the container
        function appendItems(items) {
            const fragment = document.createDocumentFragment();
            
            items.forEach((item, index) => {
                const itemElement = createItemElement(item);
                itemElement.style.opacity = '0';
                itemElement.style.transform = 'translateY(20px)';
                fragment.appendChild(itemElement);
                
                // Animate in with delay
                setTimeout(() => {
                    itemElement.style.transition = 'all 0.3s ease';
                    itemElement.style.opacity = '1';
                    itemElement.style.transform = 'translateY(0)';
                }, index * 100);
            });

            itemsContainer.appendChild(fragment);
            allItems.push(...items);
        }

        // Create item element
        function createItemElement(item) {
            const item = document.createElement('div');
            item.className = 'bbc-sidebar-content__item';

            item.innerHTML = `
                    ${item.image ? `
                        <div class="bbc-sidebar-content__item-image">
                            <img src="${item.image}" alt="${item.title}" loading="lazy" class="bbc-sidebar-content__image">
                        </div>
                    ` : ''}
                    <div class="bbc-sidebar-content__item-content">
                        <div class="bbc-sidebar-content__item-meta">
                            ${item.category ? `<span class="bbc-label bbc-sidebar-content__category">${item.category}</span>` : ''}
                            ${item.time ? `<time class="bbc-sidebar-content__time">${item.time}</time>` : ''}
                        </div>
                        <h3 class="bbc-sidebar-content__item-title">${item.title}</h3>
                        ${item.description ? `<p class="bbc-sidebar-content__item-description">${item.description}</p>` : ''}
                    </div>
                </a>
            `;

            return item;
        }

        // Show loading state
        function showLoadingState() {
            const loadingElement = sidebarContent.querySelector('.bbc-sidebar-content__loading');
            if (loadingElement) {
                loadingElement.style.display = 'block';
            }
        }

        // Hide loading state
        function hideLoadingState() {
            const loadingElement = sidebarContent.querySelector('.bbc-sidebar-content__loading');
            if (loadingElement) {
                loadingElement.style.display = 'none';
            }
        }

        // Hide load more button
        function hideLoadMore() {
            if (loadMoreButton) {
                loadMoreButton.style.display = 'none';
            }
        }

        // Show message
        function showMessage(message) {
            const messageElement = document.createElement('div');
            messageElement.className = 'bbc-sidebar-content__message';
            messageElement.textContent = message;
            messageElement.style.cssText = `
                text-align: center;
                padding: var(--bbc-spacing-md);
                color: var(--bbc-grey-3);
                font-size: 0.875rem;
                border-top: 1px solid var(--bbc-grey-6);
                margin-top: var(--bbc-spacing-md);
            `;
            
            if (loadMoreButton) {
                loadMoreButton.parentNode.appendChild(messageElement);
            } else {
                itemsContainer.appendChild(messageElement);
            }
        }

        // Show error message
        function showErrorMessage(message) {
            const errorElement = document.createElement('div');
            errorElement.className = 'bbc-sidebar-content__error';
            errorElement.textContent = message;
            errorElement.style.cssText = `
                text-align: center;
                padding: var(--bbc-spacing-md);
                color: var(--bbc-red);
                font-size: 0.875rem;
                border: 1px solid var(--bbc-red);
                border-radius: 4px;
                background: rgba(187, 25, 25, 0.1);
                margin-top: var(--bbc-spacing-md);
            `;
            
            if (loadMoreButton) {
                loadMoreButton.parentNode.appendChild(errorElement);
            } else {
                itemsContainer.appendChild(errorElement);
            }

            // Remove error message after 5 seconds
            setTimeout(() => {
                errorElement.remove();
            }, 5000);
        }

        // Setup periodic refresh for dynamic content
        function setupPeriodicRefresh() {
            const refreshInterval = setInterval(() => {
                if (document.visibilityState === 'visible') {
                    refreshContent();
                }
            }, 5 * 60 * 1000); // Refresh every 5 minutes

            // Store interval for cleanup
            sidebarContent.dataset.refreshInterval = refreshInterval;
        }

        // Refresh content
        async function refreshContent() {
            try {
                // In real implementation, fetch latest items from API
                const latestItems = await fetchLatestItems();
                
                if (latestItems.length > 0) {
                    updateItems(latestItems);
                    
                    // Track content refresh
                    if (window.BBC && window.BBC.analytics) {
                        window.BBC.analytics.track({
                            action: 'content_refresh',
                            category: 'sidebar',
                            label: `refresh_${contentType}`,
                            value: latestItems.length
                        });
                    }
                }
            } catch (error) {
                console.error('Failed to refresh content:', error);
            }
        }

        // Fetch latest items
        async function fetchLatestItems() {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 500));
            return generateSampleItems(2);
        }

        // Update existing items with new content
        function updateItems(newItems) {
            // Replace first few items with new ones
            const existingItems = itemsContainer.querySelectorAll('.bbc-sidebar-content__item');
            
            newItems.forEach((newItem, index) => {
                if (existingItems[index]) {
                    const newElement = createItemElement(newItem);
                    newElement.style.opacity = '0';
                    
                    existingItems[index].parentNode.insertBefore(newElement, existingItems[index]);
                    
                    // Fade out old, fade in new
                    existingItems[index].style.transition = 'opacity 0.3s ease';
                    existingItems[index].style.opacity = '0';
                    
                    setTimeout(() => {
                        existingItems[index].remove();
                        newElement.style.transition = 'opacity 0.3s ease';
                        newElement.style.opacity = '1';
                    }, 300);
                }
            });
        }

        // Setup weather widget functionality
        function setupWeatherWidget() {
            if (weatherWidget) {
                const locationButton = weatherWidget.querySelector('[data-bbc-weather-location]');
                
                if (locationButton) {
                    locationButton.addEventListener('click', () => {
                        // In real implementation, open location picker
                        const newLocation = prompt('Enter location:', locationButton.textContent.trim());
                        if (newLocation) {
                            locationButton.textContent = newLocation;
                            updateWeatherData(newLocation);
                        }
                    });
                }

                // Update weather data periodically
                const weatherInterval = setInterval(() => {
                    if (document.visibilityState === 'visible') {
                        updateWeatherData();
                    }
                }, 15 * 60 * 1000); // Update every 15 minutes

                weatherWidget.dataset.weatherInterval = weatherInterval;
            }
        }

        // Update weather data
        function updateWeatherData(location) {
            // In real implementation, fetch from weather API
            console.log('Updating weather data for:', location || 'current location');
            
            // Track weather interaction
            if (window.BBC && window.BBC.analytics) {
                window.BBC.analytics.track({
                    action: 'weather_update',
                    category: 'sidebar',
                    label: 'weather_widget_update',
                    value: location || null
                });
            }
        }

        // Setup click tracking for all items
            sidebarContent.addEventListener('click', (e) => {
                const itemLink = e.target.closest('.bbc-sidebar-content__item-link');
                
                if (itemLink) {
                    const item = itemLink.closest('.bbc-sidebar-content__item');
                    const title = item.querySelector('.bbc-sidebar-content__item-title');
                    const category = item.querySelector('.bbc-sidebar-content__category');
                    
                    const trackingData = {
                        action: 'click',
                        category: 'sidebar',
                        label: `item_click_${contentType}`,
                        value: itemLink.href,
                        customData: {
                            title: title ? title.textContent.trim() : '',
                            category: category ? category.textContent.trim() : '',
                            position: Array.from(itemsContainer.children).indexOf(item) + 1,
                            contentType: contentType,
                            timestamp: new Date().toISOString()
                        }
                    };

                    if (window.BBC && window.BBC.analytics) {
                        window.BBC.analytics.track(trackingData);
                    }

                    // Dispatch custom event
                    const event = new CustomEvent('bbcSidebarItemClick', {
                        detail: trackingData
                    });
                    document.dispatchEvent(event);
                }
            });
        }

        // Setup accessibility features
        function setupAccessibility() {
            // Add proper ARIA labels and roles
            const title = sidebarContent.querySelector('.bbc-sidebar-content__title');
            if (title) {
                title.setAttribute('role', 'heading');
                title.setAttribute('aria-level', '2');
            }

            // Make items container a live region for dynamic updates
            if (itemsContainer) {
                itemsContainer.setAttribute('aria-live', 'polite');
                itemsContainer.setAttribute('aria-label', 'Sidebar content items');
            }

            // Ensure proper heading hierarchy for item titles
            const itemTitles = sidebarContent.querySelectorAll('.bbc-sidebar-content__item-title');
            itemTitles.forEach(title => {
                title.setAttribute('role', 'heading');
                title.setAttribute('aria-level', '3');
            });
        }

        // Cleanup function
        function cleanup() {
            // Clear intervals
            if (sidebarContent.dataset.refreshInterval) {
                clearInterval(parseInt(sidebarContent.dataset.refreshInterval));
            }
            if (weatherWidget && weatherWidget.dataset.weatherInterval) {
                clearInterval(parseInt(weatherWidget.dataset.weatherInterval));
            }
        }

        // Initialize all functionality
        setupContentLoading();
        setupLoadMore();
        setupWeatherWidget();
        setupAccessibility();

        // Store cleanup function
        sidebarContent.cleanup = cleanup;

        // Dispatch initialization event
        const event = new CustomEvent('bbcSidebarContentReady', {
            detail: {
                element: sidebarContent,
                contentType: contentType,
                itemCount: currentItemCount,
                hasLoadMore: !!loadMoreButton,
                hasWeatherWidget: !!weatherWidget
            }
        });
        document.dispatchEvent(event);
    }

    // Cleanup function for removed fragments
    function cleanupBBCSidebarContent(fragmentElement) {
        const sidebarContent = fragmentElement.querySelector('.bbc-sidebar-content');
        if (sidebarContent && sidebarContent.cleanup) {
            sidebarContent.cleanup();
        }
    }

    // Initialize when fragment is loaded
    function init() {
        const sidebarContentFragments = document.querySelectorAll('.bbc-sidebar-content');
        sidebarContentFragments.forEach(sidebar => {
            initBBCSidebarContent(sidebar.closest('.bbc-fragment'));
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
        if (e.detail && e.detail.fragmentType === 'bbc-sidebar-content') {
            initBBCSidebarContent(e.detail.element);
        }
    });

    // Cleanup when fragments are removed
    document.addEventListener('bbcFragmentRemoved', function(e) {
        if (e.detail && e.detail.fragmentType === 'bbc-sidebar-content') {
            cleanupBBCSidebarContent(e.detail.element);
        }
    });

})();
