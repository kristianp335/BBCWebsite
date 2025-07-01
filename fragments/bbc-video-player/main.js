/**
 * BBC Video Player Fragment JavaScript
 */
(function() {
    'use strict';

    function initBBCVideoPlayer(fragmentElement) {
        const videoPlayer = fragmentElement.querySelector('.bbc-video-player');
        const videoContainer = videoPlayer.querySelector('[data-bbc-video-container]');
        const videoElement = videoPlayer.querySelector('[data-bbc-video]');
        const controls = videoPlayer.querySelector('[data-bbc-video-controls]');
        const playButton = videoPlayer.querySelector('[data-bbc-video-play]');
        const loading = videoPlayer.querySelector('[data-bbc-video-loading]');
        const progressContainer = videoPlayer.querySelector('[data-bbc-video-progress-container]');
        const progressFill = videoPlayer.querySelector('[data-bbc-video-progress]');
        const progressBuffer = videoPlayer.querySelector('[data-bbc-video-buffer]');
        const progressHandle = videoPlayer.querySelector('[data-bbc-video-handle]');
        const currentTimeElement = videoPlayer.querySelector('[data-bbc-video-current]');
        const durationElement = videoPlayer.querySelector('[data-bbc-video-duration]');
        const volumeButton = videoPlayer.querySelector('[data-bbc-video-volume-toggle]');
        const volumeSlider = videoPlayer.querySelector('[data-bbc-video-volume-slider]');
        const volumeFill = videoPlayer.querySelector('[data-bbc-video-volume-fill]');
        const captionsButton = videoPlayer.querySelector('[data-bbc-video-captions-toggle]');
        const shareButton = videoPlayer.querySelector('[data-bbc-video-share]');
        const fullscreenButton = videoPlayer.querySelector('[data-bbc-video-fullscreen]');
        const dateElement = videoPlayer.querySelector('.bbc-video-player__date');

        let isPlaying = false;
        let isMuted = false;
        let volume = 1;
        let currentTime = 0;
        let duration = 0;
        let isDragging = false;
        let captionsEnabled = false;
        let controlsTimeout;

        // Setup video player
        function setupVideoPlayer() {
            if (!videoElement) return;

            // Video event listeners
            videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);
            videoElement.addEventListener('timeupdate', handleTimeUpdate);
            videoElement.addEventListener('progress', handleProgress);
            videoElement.addEventListener('play', handlePlay);
            videoElement.addEventListener('pause', handlePause);
            videoElement.addEventListener('ended', handleEnded);
            videoElement.addEventListener('waiting', handleWaiting);
            videoElement.addEventListener('canplay', handleCanPlay);
            videoElement.addEventListener('error', handleError);
            videoElement.addEventListener('volumechange', handleVolumeChange);

            // Click to play/pause
            videoElement.addEventListener('click', togglePlayback);
            if (controls) {
                controls.addEventListener('click', (e) => {
                    if (e.target === controls || e.target === videoElement) {
                        togglePlayback();
                    }
                });
            }

            // Keyboard controls
            videoContainer.addEventListener('keydown', handleKeyboard);
            videoContainer.setAttribute('tabindex', '0');
        }

        // Setup control buttons
        function setupControls() {
            if (playButton) {
                playButton.addEventListener('click', (e) => {
                    e.stopPropagation();
                    togglePlayback();
                });
            }

            if (volumeButton) {
                volumeButton.addEventListener('click', toggleMute);
            }

            if (volumeSlider) {
                setupVolumeSlider();
            }

            if (progressContainer) {
                setupProgressBar();
            }

            if (captionsButton) {
                captionsButton.addEventListener('click', toggleCaptions);
            }

            if (shareButton) {
                shareButton.addEventListener('click', shareVideo);
            }

            if (fullscreenButton) {
                fullscreenButton.addEventListener('click', toggleFullscreen);
            }

            // Auto-hide controls
            setupControlsAutoHide();
        }

        // Handle loaded metadata
        function handleLoadedMetadata() {
            duration = videoElement.duration;
            updateDurationDisplay();
            
            // Set initial volume
            videoElement.volume = volume;
            updateVolumeDisplay();
        }

        // Handle time update
        function handleTimeUpdate() {
            if (!isDragging) {
                currentTime = videoElement.currentTime;
                updateProgressDisplay();
                updateCurrentTimeDisplay();
            }
        }

        // Handle progress (buffering)
        function handleProgress() {
            if (videoElement.buffered.length > 0) {
                const buffered = videoElement.buffered.end(videoElement.buffered.length - 1);
                const bufferedPercent = (buffered / duration) * 100;
                
                if (progressBuffer) {
                    progressBuffer.style.width = `${bufferedPercent}%`;
                }
            }
        }

        // Handle play
        function handlePlay() {
            isPlaying = true;
            updatePlayButton();
            showControls();
            
            // Track play event
            if (window.BBC && window.BBC.analytics) {
                window.BBC.analytics.track({
                    action: 'play',
                    category: 'video',
                    label: 'video_play',
                    value: getVideoTitle()
                });
            }
        }

        // Handle pause
        function handlePause() {
            isPlaying = false;
            updatePlayButton();
            showControls();
            
            // Track pause event
            if (window.BBC && window.BBC.analytics) {
                window.BBC.analytics.track({
                    action: 'pause',
                    category: 'video',
                    label: 'video_pause',
                    value: Math.round(currentTime)
                });
            }
        }

        // Handle ended
        function handleEnded() {
            isPlaying = false;
            updatePlayButton();
            showControls();
            
            // Track completion
            if (window.BBC && window.BBC.analytics) {
                window.BBC.analytics.track({
                    action: 'complete',
                    category: 'video',
                    label: 'video_complete',
                    value: Math.round(duration)
                });
            }
        }

        // Handle waiting (buffering)
        function handleWaiting() {
            showLoading();
        }

        // Handle can play
        function handleCanPlay() {
            hideLoading();
        }

        // Handle error
        function handleError(e) {
            console.error('Video error:', e);
            hideLoading();
            showErrorMessage('Failed to load video. Please try again.');
        }

        // Handle volume change
        function handleVolumeChange() {
            volume = videoElement.volume;
            isMuted = videoElement.muted;
            updateVolumeDisplay();
        }

        // Toggle playback
        function togglePlayback() {
            if (!videoElement) return;

            if (isPlaying) {
                videoElement.pause();
            } else {
                const playPromise = videoElement.play();
                if (playPromise !== undefined) {
                    playPromise.catch(error => {
                        console.error('Play failed:', error);
                        showErrorMessage('Failed to play video. Please try again.');
                    });
                }
            }
        }

        // Toggle mute
        function toggleMute() {
            if (!videoElement) return;

            videoElement.muted = !videoElement.muted;
            isMuted = videoElement.muted;
            updateVolumeButton();
        }

        // Setup volume slider
        function setupVolumeSlider() {
            volumeSlider.addEventListener('click', (e) => {
                const rect = volumeSlider.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const newVolume = clickX / rect.width;
                
                setVolume(Math.max(0, Math.min(1, newVolume)));
            });

            volumeSlider.addEventListener('mousedown', (e) => {
                const handleVolumeDrag = (e) => {
                    const rect = volumeSlider.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    const newVolume = clickX / rect.width;
                    
                    setVolume(Math.max(0, Math.min(1, newVolume)));
                };

                const handleVolumeEnd = () => {
                    document.removeEventListener('mousemove', handleVolumeDrag);
                    document.removeEventListener('mouseup', handleVolumeEnd);
                };

                document.addEventListener('mousemove', handleVolumeDrag);
                document.addEventListener('mouseup', handleVolumeEnd);
            });
        }

        // Set volume
        function setVolume(newVolume) {
            if (!videoElement) return;

            volume = newVolume;
            videoElement.volume = volume;
            
            if (volume === 0) {
                videoElement.muted = true;
                isMuted = true;
            } else if (isMuted) {
                videoElement.muted = false;
                isMuted = false;
            }
            
            updateVolumeDisplay();
            updateVolumeButton();
        }

        // Setup progress bar
        function setupProgressBar() {
            progressContainer.addEventListener('click', (e) => {
                if (!videoElement || isDragging) return;

                const rect = progressContainer.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const newTime = (clickX / rect.width) * duration;
                
                videoElement.currentTime = newTime;
            });

            if (progressHandle) {
                progressHandle.addEventListener('mousedown', (e) => {
                    isDragging = true;
                    
                    const handleProgressDrag = (e) => {
                        const rect = progressContainer.getBoundingClientRect();
                        const clickX = e.clientX - rect.left;
                        const newTime = (clickX / rect.width) * duration;
                        
                        currentTime = Math.max(0, Math.min(duration, newTime));
                        updateProgressDisplay();
                        updateCurrentTimeDisplay();
                    };

                    const handleProgressEnd = () => {
                        if (videoElement) {
                            videoElement.currentTime = currentTime;
                        }
                        isDragging = false;
                        document.removeEventListener('mousemove', handleProgressDrag);
                        document.removeEventListener('mouseup', handleProgressEnd);
                    };

                    document.addEventListener('mousemove', handleProgressDrag);
                    document.addEventListener('mouseup', handleProgressEnd);
                });
            }
        }

        // Toggle captions
        function toggleCaptions() {
            if (!videoElement) return;

            const tracks = videoElement.textTracks;
            if (tracks.length > 0) {
                const track = tracks[0];
                
                if (captionsEnabled) {
                    track.mode = 'hidden';
                    captionsEnabled = false;
                    captionsButton.classList.remove('active');
                } else {
                    track.mode = 'showing';
                    captionsEnabled = true;
                    captionsButton.classList.add('active');
                }

                // Track captions toggle
                if (window.BBC && window.BBC.analytics) {
                    window.BBC.analytics.track({
                        action: 'captions_toggle',
                        category: 'video',
                        label: captionsEnabled ? 'captions_on' : 'captions_off',
                        value: null
                    });
                }
            }
        }

        // Share video
        function shareVideo() {
            const title = getVideoTitle();
            const url = window.location.href;
            
            if (navigator.share) {
                navigator.share({
                    title: title,
                    url: url
                }).then(() => {
                    // Track successful share
                    if (window.BBC && window.BBC.analytics) {
                        window.BBC.analytics.track({
                            action: 'share',
                            category: 'video',
                            label: 'native_share',
                            value: title
                        });
                    }
                }).catch((error) => {
                    if (error.name !== 'AbortError') {
                        console.error('Share failed:', error);
                        fallbackShare(url);
                    }
                });
            } else {
                fallbackShare(url);
            }
        }

        // Fallback share
        function fallbackShare(url) {
            if (navigator.clipboard) {
                navigator.clipboard.writeText(url).then(() => {
                    showFeedback('Video link copied to clipboard');
                    
                    // Track clipboard share
                    if (window.BBC && window.BBC.analytics) {
                        window.BBC.analytics.track({
                            action: 'share',
                            category: 'video',
                            label: 'clipboard_share',
                            value: getVideoTitle()
                        });
                    }
                }).catch((error) => {
                    console.error('Failed to copy to clipboard:', error);
                });
            }
        }

        // Toggle fullscreen
        function toggleFullscreen() {
            if (!document.fullscreenElement) {
                enterFullscreen();
            } else {
                exitFullscreen();
            }
        }

        // Enter fullscreen
        function enterFullscreen() {
            if (videoContainer.requestFullscreen) {
                videoContainer.requestFullscreen();
            } else if (videoContainer.webkitRequestFullscreen) {
                videoContainer.webkitRequestFullscreen();
            } else if (videoContainer.mozRequestFullScreen) {
                videoContainer.mozRequestFullScreen();
            } else if (videoContainer.msRequestFullscreen) {
                videoContainer.msRequestFullscreen();
            }
        }

        // Exit fullscreen
        function exitFullscreen() {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        }

        // Handle keyboard controls
        function handleKeyboard(e) {
            if (!videoElement) return;

            switch (e.key) {
                case ' ':
                case 'k':
                    e.preventDefault();
                    togglePlayback();
                    break;
                case 'm':
                    e.preventDefault();
                    toggleMute();
                    break;
                case 'f':
                    e.preventDefault();
                    toggleFullscreen();
                    break;
                case 'c':
                    e.preventDefault();
                    if (captionsButton) toggleCaptions();
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    videoElement.currentTime = Math.max(0, videoElement.currentTime - 10);
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    videoElement.currentTime = Math.min(duration, videoElement.currentTime + 10);
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    setVolume(Math.min(1, volume + 0.1));
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    setVolume(Math.max(0, volume - 0.1));
                    break;
            }
        }

        // Setup controls auto-hide
        function setupControlsAutoHide() {
            if (!controls) return;

            const showControlsTemporarily = () => {
                showControls();
                clearTimeout(controlsTimeout);
                
                if (isPlaying) {
                    controlsTimeout = setTimeout(() => {
                        hideControls();
                    }, 3000);
                }
            };

            videoContainer.addEventListener('mousemove', showControlsTemporarily);
            videoContainer.addEventListener('touchstart', showControlsTemporarily);
            
            // Keep controls visible when hovering over them
            controls.addEventListener('mouseenter', () => {
                clearTimeout(controlsTimeout);
            });
            
            controls.addEventListener('mouseleave', () => {
                if (isPlaying) {
                    controlsTimeout = setTimeout(() => {
                        hideControls();
                    }, 3000);
                }
            });
        }

        // Show controls
        function showControls() {
            if (controls) {
                controls.classList.add('visible');
            }
        }

        // Hide controls
        function hideControls() {
            if (controls) {
                controls.classList.remove('visible');
            }
        }

        // Update play button
        function updatePlayButton() {
            if (!playButton) return;

            if (isPlaying) {
                playButton.classList.add('playing');
                playButton.setAttribute('aria-label', 'Pause video');
            } else {
                playButton.classList.remove('playing');
                playButton.setAttribute('aria-label', 'Play video');
            }
        }

        // Update volume button
        function updateVolumeButton() {
            if (!volumeButton) return;

            if (isMuted || volume === 0) {
                volumeButton.classList.add('muted');
                volumeButton.setAttribute('aria-label', 'Unmute');
            } else {
                volumeButton.classList.remove('muted');
                volumeButton.setAttribute('aria-label', 'Mute');
            }
        }

        // Update volume display
        function updateVolumeDisplay() {
            if (volumeFill) {
                const displayVolume = isMuted ? 0 : volume;
                volumeFill.style.width = `${displayVolume * 100}%`;
            }
        }

        // Update progress display
        function updateProgressDisplay() {
            if (progressFill && duration > 0) {
                const percentage = (currentTime / duration) * 100;
                progressFill.style.width = `${percentage}%`;
                
                if (progressHandle) {
                    progressHandle.style.left = `${percentage}%`;
                }
            }
        }

        // Update current time display
        function updateCurrentTimeDisplay() {
            if (currentTimeElement) {
                currentTimeElement.textContent = formatTime(currentTime);
            }
        }

        // Update duration display
        function updateDurationDisplay() {
            if (durationElement && duration > 0) {
                durationElement.textContent = formatTime(duration);
            }
        }

        // Format time
        function formatTime(seconds) {
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            const secs = Math.floor(seconds % 60);
            
            if (hours > 0) {
                return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
            } else {
                return `${minutes}:${secs.toString().padStart(2, '0')}`;
            }
        }

        // Show loading
        function showLoading() {
            if (loading) {
                loading.style.display = 'block';
            }
        }

        // Hide loading
        function hideLoading() {
            if (loading) {
                loading.style.display = 'none';
            }
        }

        // Show error message
        function showErrorMessage(message) {
            showFeedback(message, 'error');
        }

        // Show feedback
        function showFeedback(message, type = 'info') {
            const feedback = document.createElement('div');
            feedback.className = `bbc-video-player__feedback bbc-video-player__feedback--${type}`;
            feedback.textContent = message;
            feedback.style.cssText = `
                position: fixed;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: ${type === 'error' ? 'var(--bbc-red)' : 'var(--bbc-black)'};
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

            // Remove after delay
            setTimeout(() => {
                feedback.style.opacity = '0';
                setTimeout(() => {
                    feedback.remove();
                }, 300);
            }, type === 'error' ? 5000 : 3000);
        }

        // Setup date formatting
        function setupDateFormatting() {
            if (dateElement) {
                const datetime = dateElement.getAttribute('datetime');
                if (datetime) {
                    try {
                        const date = new Date(datetime);
                        if (!isNaN(date.getTime())) {
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

        // Get video title
        function getVideoTitle() {
            const titleElement = videoPlayer.querySelector('.bbc-video-player__title');
            return titleElement ? titleElement.textContent.trim() : '';
        }

        // Setup fullscreen change listener
        function setupFullscreenListener() {
            const fullscreenChangeHandler = () => {
                const isFullscreen = !!document.fullscreenElement;
                
                if (fullscreenButton) {
                    if (isFullscreen) {
                        fullscreenButton.classList.add('fullscreen');
                        fullscreenButton.setAttribute('aria-label', 'Exit fullscreen');
                    } else {
                        fullscreenButton.classList.remove('fullscreen');
                        fullscreenButton.setAttribute('aria-label', 'Enter fullscreen');
                    }
                }
            };

            document.addEventListener('fullscreenchange', fullscreenChangeHandler);
            document.addEventListener('webkitfullscreenchange', fullscreenChangeHandler);
            document.addEventListener('mozfullscreenchange', fullscreenChangeHandler);
            document.addEventListener('MSFullscreenChange', fullscreenChangeHandler);
        }

        // Setup accessibility
        function setupAccessibility() {
            // Add proper ARIA labels
            const title = videoPlayer.querySelector('.bbc-video-player__title');
            if (title) {
                title.setAttribute('role', 'heading');
                title.setAttribute('aria-level', '2');
            }

            // Add video description
            if (videoElement) {
                const description = videoPlayer.querySelector('.bbc-video-player__description');
                if (description) {
                    videoElement.setAttribute('aria-describedby', 'video-description');
                    description.setAttribute('id', 'video-description');
                }
            }

            // Ensure controls are focusable
            if (videoContainer) {
                videoContainer.setAttribute('role', 'application');
                videoContainer.setAttribute('aria-label', 'Video player');
            }
        }

        // Cleanup function
        function cleanup() {
            if (videoElement) {
                videoElement.pause();
                videoElement.currentTime = 0;
            }
            
            clearTimeout(controlsTimeout);
            
            if (document.fullscreenElement === videoContainer) {
                exitFullscreen();
            }
        }

        // Initialize all functionality
        setupVideoPlayer();
        setupControls();
        setupDateFormatting();
        setupFullscreenListener();
        setupAccessibility();

        // Store cleanup function
        videoPlayer.cleanup = cleanup;

        // Dispatch initialization event
        const event = new CustomEvent('bbcVideoPlayerReady', {
            detail: {
                element: videoPlayer,
                hasVideo: !!videoElement && !!videoElement.src,
                hasControls: !!controls,
                hasCaptions: !!captionsButton,
                title: getVideoTitle()
            }
        });
        document.dispatchEvent(event);
    }

    // Cleanup function for removed fragments
    function cleanupBBCVideoPlayer(fragmentElement) {
        const videoPlayer = fragmentElement.querySelector('.bbc-video-player');
        if (videoPlayer && videoPlayer.cleanup) {
            videoPlayer.cleanup();
        }
    }

    // Initialize when fragment is loaded
    function init() {
        const videoPlayerFragments = document.querySelectorAll('.bbc-video-player');
        videoPlayerFragments.forEach(player => {
            initBBCVideoPlayer(player.closest('.bbc-fragment'));
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
        if (e.detail && e.detail.fragmentType === 'bbc-video-player') {
            initBBCVideoPlayer(e.detail.element);
        }
    });

    // Cleanup when fragments are removed
    document.addEventListener('bbcFragmentRemoved', function(e) {
        if (e.detail && e.detail.fragmentType === 'bbc-video-player') {
            cleanupBBCVideoPlayer(e.detail.element);
        }
    });

})();
