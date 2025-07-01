/**
 * BBC Podcast Card Fragment JavaScript
 */
(function() {
    'use strict';

    function initBBCPodcastCard(fragmentElement) {
        const podcastCard = fragmentElement.querySelector('.bbc-podcast-card');
        const playButton = podcastCard.querySelector('[data-bbc-audio-play]');
        const saveButton = podcastCard.querySelector('[data-bbc-save-toggle]');
        const shareButton = podcastCard.querySelector('[data-bbc-share-toggle]');
        const audioElement = podcastCard.querySelector('[data-bbc-audio]');
        const progressContainer = podcastCard.querySelector('[data-bbc-audio-progress]');
        const progressFill = podcastCard.querySelector('.bbc-podcast-card__progress-fill');
        const currentTimeElement = podcastCard.querySelector('.bbc-podcast-card__current-time');
        const totalTimeElement = podcastCard.querySelector('.bbc-podcast-card__total-time');
        const dateElement = podcastCard.querySelector('.bbc-podcast-card__date');

        let isPlaying = false;
        let isSaved = false;

        // Setup audio player
        function setupAudioPlayer() {
            if (audioElement && playButton) {
                // Play/pause button handler
                playButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    togglePlayback();
                });

                // Audio event listeners
                audioElement.addEventListener('loadedmetadata', () => {
                    updateTotalTime();
                });

                audioElement.addEventListener('timeupdate', () => {
                    updateProgress();
                });

                audioElement.addEventListener('ended', () => {
                    resetPlayer();
                });

                audioElement.addEventListener('error', (e) => {
                    console.error('Audio playback error:', e);
                    showError('Failed to load audio. Please try again.');
                });

                audioElement.addEventListener('loadstart', () => {
                    showLoadingState();
                });

                audioElement.addEventListener('canplay', () => {
                    hideLoadingState();
                });

                // Click on progress bar to seek
                if (progressContainer) {
                    const progressBar = progressContainer.querySelector('.bbc-podcast-card__progress-bar');
                    if (progressBar) {
                        progressBar.addEventListener('click', (e) => {
                            if (audioElement.duration) {
                                const rect = progressBar.getBoundingClientRect();
                                const clickX = e.clientX - rect.left;
                                const percentage = clickX / rect.width;
                                const newTime = percentage * audioElement.duration;
                                audioElement.currentTime = newTime;
                            }
                        });
                    }
                }
            }
        }

        // Toggle playback
        function togglePlayback() {
            if (!audioElement) return;

            if (isPlaying) {
                pauseAudio();
            } else {
                playAudio();
            }
        }

        // Play audio
        async function playAudio() {
            if (!audioElement) return;

            try {
                // Pause any other playing audio first
                pauseOtherAudio();

                await audioElement.play();
                isPlaying = true;
                updatePlayButton();
                showProgress();

                // Track play event
                if (window.BBC && window.BBC.analytics) {
                    window.BBC.analytics.track({
                        action: 'play',
                        category: 'podcast',
                        label: 'audio_play',
                        value: audioElement.src
                    });
                }

                // Dispatch custom event
                const event = new CustomEvent('bbcPodcastPlay', {
                    detail: {
                        element: podcastCard,
                        audioUrl: audioElement.src,
                        title: getEpisodeTitle()
                    }
                });
                document.dispatchEvent(event);

            } catch (error) {
                console.error('Failed to play audio:', error);
                showError('Failed to play audio. Please check your connection.');
            }
        }

        // Pause audio
        function pauseAudio() {
            if (!audioElement) return;

            audioElement.pause();
            isPlaying = false;
            updatePlayButton();

            // Track pause event
            if (window.BBC && window.BBC.analytics) {
                window.BBC.analytics.track({
                    action: 'pause',
                    category: 'podcast',
                    label: 'audio_pause',
                    value: Math.round(audioElement.currentTime)
                });
            }
        }

        // Pause other audio players
        function pauseOtherAudio() {
            const otherAudioElements = document.querySelectorAll('.bbc-podcast-card__audio');
            otherAudioElements.forEach(audio => {
                if (audio !== audioElement && !audio.paused) {
                    audio.pause();
                    
                    // Update other players' UI
                    const otherCard = audio.closest('.bbc-podcast-card');
                    if (otherCard) {
                        const otherPlayButton = otherCard.querySelector('[data-bbc-audio-play]');
                        if (otherPlayButton) {
                            otherPlayButton.classList.remove('playing');
                        }
                    }
                }
            });
        }

        // Reset player
        function resetPlayer() {
            isPlaying = false;
            updatePlayButton();
            
            if (audioElement) {
                audioElement.currentTime = 0;
            }
            
            updateProgress();

            // Track completion
            if (window.BBC && window.BBC.analytics) {
                window.BBC.analytics.track({
                    action: 'complete',
                    category: 'podcast',
                    label: 'audio_complete',
                    value: audioElement ? Math.round(audioElement.duration) : 0
                });
            }
        }

        // Update play button appearance
        function updatePlayButton() {
            if (!playButton) return;

            if (isPlaying) {
                playButton.classList.add('playing');
                playButton.setAttribute('aria-label', 'Pause episode');
            } else {
                playButton.classList.remove('playing');
                playButton.setAttribute('aria-label', 'Play episode');
            }
        }

        // Show progress container
        function showProgress() {
            if (progressContainer) {
                progressContainer.style.display = 'block';
            }
        }

        // Update progress bar and time
        function updateProgress() {
            if (!audioElement || !progressFill || !currentTimeElement) return;

            const currentTime = audioElement.currentTime;
            const duration = audioElement.duration;

            if (duration > 0) {
                const percentage = (currentTime / duration) * 100;
                progressFill.style.width = `${percentage}%`;
                currentTimeElement.textContent = formatTime(currentTime);
            }
        }

        // Update total time display
        function updateTotalTime() {
            if (!audioElement || !totalTimeElement) return;

            const duration = audioElement.duration;
            if (duration > 0) {
                totalTimeElement.textContent = formatTime(duration);
            }
        }

        // Format time in MM:SS format
        function formatTime(seconds) {
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = Math.floor(seconds % 60);
            return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
        }

        // Show loading state
        function showLoadingState() {
            if (playButton) {
                playButton.style.opacity = '0.7';
                playButton.disabled = true;
            }
        }

        // Hide loading state
        function hideLoadingState() {
            if (playButton) {
                playButton.style.opacity = '1';
                playButton.disabled = false;
            }
        }

        // Show error message
        function showError(message) {
            const errorElement = document.createElement('div');
            errorElement.className = 'bbc-podcast-card__error';
            errorElement.textContent = message;
            errorElement.style.cssText = `
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: var(--bbc-red);
                color: var(--bbc-white);
                padding: var(--bbc-spacing-xs) var(--bbc-spacing-sm);
                border-radius: 4px;
                font-size: 0.75rem;
                z-index: 10;
            `;

            const cover = podcastCard.querySelector('.bbc-podcast-card__cover');
            if (cover) {
                cover.style.position = 'relative';
                cover.appendChild(errorElement);
                
                // Remove error after 3 seconds
                setTimeout(() => {
                    errorElement.remove();
                }, 3000);
            }
        }

        // Setup save functionality
        function setupSaveButton() {
            if (saveButton) {
                saveButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    toggleSave();
                });
            }
        }

        // Toggle save state
        function toggleSave() {
            isSaved = !isSaved;
            updateSaveButton();

            const action = isSaved ? 'save' : 'unsave';
            
            // Track save/unsave
            if (window.BBC && window.BBC.analytics) {
                window.BBC.analytics.track({
                    action: action,
                    category: 'podcast',
                    label: 'episode_save',
                    value: getEpisodeTitle()
                });
            }

            // Dispatch custom event
            const event = new CustomEvent('bbcPodcastSave', {
                detail: {
                    element: podcastCard,
                    saved: isSaved,
                    title: getEpisodeTitle(),
                    url: getPodcastUrl()
                }
            });
            document.dispatchEvent(event);

            // Show feedback
            showSaveFeedback(isSaved);
        }

        // Update save button appearance
        function updateSaveButton() {
            if (!saveButton) return;

            const saveText = saveButton.querySelector('.bbc-podcast-card__save-text');
            
            if (isSaved) {
                saveButton.classList.add('saved');
                saveButton.setAttribute('aria-label', 'Remove from saved');
                if (saveText) saveText.textContent = 'Saved';
            } else {
                saveButton.classList.remove('saved');
                saveButton.setAttribute('aria-label', 'Save episode');
                if (saveText) saveText.textContent = 'Save';
            }
        }

        // Show save feedback
        function showSaveFeedback(saved) {
            const feedback = document.createElement('div');
            feedback.className = 'bbc-podcast-card__feedback';
            feedback.textContent = saved ? 'Episode saved' : 'Episode removed from saved';
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

            // Remove after 2 seconds
            setTimeout(() => {
                feedback.style.opacity = '0';
                setTimeout(() => {
                    feedback.remove();
                }, 300);
            }, 2000);
        }

        // Setup share functionality
        function setupShareButton() {
            if (shareButton) {
                shareButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    shareEpisode();
                });
            }
        }

        // Share episode
        function shareEpisode() {
            const title = getEpisodeTitle();
            const url = getPodcastUrl();
            
            if (navigator.share) {
                // Use native sharing if available
                navigator.share({
                    title: title,
                    url: window.location.origin + url
                }).then(() => {
                    // Track successful share
                    if (window.BBC && window.BBC.analytics) {
                        window.BBC.analytics.track({
                            action: 'share',
                            category: 'podcast',
                            label: 'native_share',
                            value: title
                        });
                    }
                }).catch((error) => {
                    console.log('Share cancelled or failed:', error);
                });
            } else {
                // Fallback to copying URL
                copyToClipboard(window.location.origin + url);
                showShareFeedback();
                
                // Track clipboard share
                if (window.BBC && window.BBC.analytics) {
                    window.BBC.analytics.track({
                        action: 'share',
                        category: 'podcast',
                        label: 'clipboard_share',
                        value: title
                    });
                }
            }
        }

        // Copy text to clipboard
        function copyToClipboard(text) {
            if (navigator.clipboard) {
                navigator.clipboard.writeText(text).catch((error) => {
                    console.error('Failed to copy to clipboard:', error);
                });
            } else {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = text;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
            }
        }

        // Show share feedback
        function showShareFeedback() {
            const feedback = document.createElement('div');
            feedback.className = 'bbc-podcast-card__feedback';
            feedback.textContent = 'Link copied to clipboard';
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

            // Remove after 2 seconds
            setTimeout(() => {
                feedback.style.opacity = '0';
                setTimeout(() => {
                    feedback.remove();
                }, 300);
            }, 2000);
        }

        // Setup date formatting
        function setupDateFormatting() {
            if (dateElement) {
                const datetime = dateElement.getAttribute('datetime');
                if (datetime) {
                    try {
                        const date = new Date(datetime);
                        if (!isNaN(date.getTime())) {
                            // Format as relative time if BBC utils available
                            if (window.BBC && window.BBC.utils && window.BBC.utils.formatDate) {
                                dateElement.textContent = window.BBC.utils.formatDate(date);
                            } else {
                                dateElement.textContent = formatRelativeDate(date);
                            }
                        }
                    } catch (error) {
                        console.warn('Invalid date format:', datetime);
                    }
                }
            }
        }

        // Format relative date
        function formatRelativeDate(date) {
            const now = new Date();
            const diff = now - date;
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            
            if (days === 0) return 'Today';
            if (days === 1) return 'Yesterday';
            if (days < 7) return `${days} days ago`;
            
            return date.toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short'
            });
        }

        // Get episode title
        function getEpisodeTitle() {
            const titleElement = podcastCard.querySelector('.bbc-podcast-card__episode-title');
            return titleElement ? titleElement.textContent.trim() : '';
        }

        // Get podcast URL
        function getPodcastUrl() {
            const linkElement = podcastCard.querySelector('.bbc-podcast-card__episode-link');
            return linkElement ? linkElement.getAttribute('href') : '';
        }

        // Setup keyboard navigation
        function setupKeyboardNavigation() {
            podcastCard.addEventListener('keydown', (e) => {
                if (e.target === playButton) {
                    if (e.key === ' ') {
                        e.preventDefault();
                        togglePlayback();
                    }
                }
            });
        }

        // Setup accessibility
        function setupAccessibility() {
            // Add proper ARIA labels
            const podcastTitle = podcastCard.querySelector('.bbc-podcast-card__podcast-title');
            const episodeTitle = podcastCard.querySelector('.bbc-podcast-card__episode-title');
            
            if (podcastTitle) {
                podcastTitle.setAttribute('role', 'heading');
                podcastTitle.setAttribute('aria-level', '3');
            }
            
            if (episodeTitle) {
                episodeTitle.setAttribute('role', 'heading');
                episodeTitle.setAttribute('aria-level', '4');
            }

            // Add audio description
            if (audioElement) {
                audioElement.setAttribute('aria-label', `Audio player for ${getEpisodeTitle()}`);
            }
        }

        // Cleanup function
        function cleanup() {
            if (audioElement) {
                audioElement.pause();
                audioElement.currentTime = 0;
            }
        }

        // Initialize all functionality
        setupAudioPlayer();
        setupSaveButton();
        setupShareButton();
        setupDateFormatting();
        setupKeyboardNavigation();
        setupAccessibility();

        // Store cleanup function
        podcastCard.cleanup = cleanup;

        // Dispatch initialization event
        const event = new CustomEvent('bbcPodcastCardReady', {
            detail: {
                element: podcastCard,
                hasAudio: !!audioElement,
                canPlay: audioElement && audioElement.canPlayType('audio/mpeg'),
                title: getEpisodeTitle()
            }
        });
        document.dispatchEvent(event);
    }

    // Cleanup function for removed fragments
    function cleanupBBCPodcastCard(fragmentElement) {
        const podcastCard = fragmentElement.querySelector('.bbc-podcast-card');
        if (podcastCard && podcastCard.cleanup) {
            podcastCard.cleanup();
        }
    }

    // Initialize when fragment is loaded
    function init() {
        const podcastCardFragments = document.querySelectorAll('.bbc-podcast-card');
        podcastCardFragments.forEach(card => {
            initBBCPodcastCard(card.closest('.bbc-fragment'));
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
        if (e.detail && e.detail.fragmentType === 'bbc-podcast-card') {
            initBBCPodcastCard(e.detail.element);
        }
    });

    // Cleanup when fragments are removed
    document.addEventListener('bbcFragmentRemoved', function(e) {
        if (e.detail && e.detail.fragmentType === 'bbc-podcast-card') {
            cleanupBBCPodcastCard(e.detail.element);
        }
    });

})();
