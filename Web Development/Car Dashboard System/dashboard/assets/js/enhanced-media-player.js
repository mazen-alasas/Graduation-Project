class EnhancedMediaPlayer {
    constructor() {
        this.initializeElements();
        this.initializeState();
        this.setupEventListeners();
        this.loadPlaylistFromStorage();
        this.setupKeyboardShortcuts();
    }

    initializeElements() {
        this.playlist = document.querySelector('.playlist');
        this.uploadMediaBtn = document.querySelector('.upload-media');
        this.mediaUploadInput = document.getElementById('media-upload');
        this.audioView = document.querySelector('.audio-view');
        this.videoView = document.querySelector('.video-view');
        this.videoPlayer = document.getElementById('video-player');
        this.audioPlayer = document.getElementById('audio-player');

        this.playPauseBtn = document.querySelector('.play-pause');
        this.prevBtn = document.querySelector('.prev');
        this.nextBtn = document.querySelector('.next');
        this.volumeSlider = document.querySelector('.volume-slider');
        this.volumeIcon = document.querySelector('.volume-control i');
        this.shuffleBtn = document.querySelector('.shuffle-btn');
        this.repeatBtn = document.querySelector('.repeat-btn');
        this.clearPlaylistBtn = document.querySelector('.clear-playlist');
        this.fullscreenBtn = document.querySelector('.fullscreen-btn');
        this.pipBtn = document.querySelector('.picture-in-picture-btn');
        this.volumePercentage = document.querySelector('.volume-percentage');

        this.progressBar = document.querySelector('.progress-bar');
        this.progressFill = document.querySelector('.progress');
        this.currentTimeDisplay = document.querySelector('.current-time');
        this.totalTimeDisplay = document.querySelector('.total-time');

        this.miniPlayer = document.querySelector('.mini-player');
        this.miniPlayPauseBtn = document.querySelector('.mini-control-btn.play-pause');
        this.miniPrevBtn = document.querySelector('.mini-control-btn.prev');
        this.miniNextBtn = document.querySelector('.mini-control-btn.next');
        this.miniVolumeBtn = document.querySelector('.mini-volume-btn');
        this.miniVolumeSlider = document.querySelector('.mini-volume-slider');
        this.miniMediaImg = document.getElementById('mini-media-img');
        this.miniVideo = document.getElementById('mini-video');
        this.miniTrackName = document.querySelector('.mini-track-name');
        this.miniProgress = document.querySelector('.mini-progress');

        this.modal = document.getElementById('mediaPlayerModal');
        this.modalVideoPlayer = document.getElementById('modal-video-player');
        this.modalAudioPlayer = document.getElementById('modal-audio-player');
        this.closeModalBtn = document.querySelector('.close-modal');

        this.playlistTracksContainer = document.querySelector('.playlist-tracks');
        this.modalPlaylistTracksContainer = document.querySelector('.modal-playlist-tracks');
    }

    initializeState() {
        this.isPlaying = false;
        this.currentTrackIndex = 0;
        this.isAudioMode = true;
        this.currentPlaylist = [];
        this.currentTime = 0;
        this.duration = 0;
        this.isMuted = false;
        this.previousVolume = 80;
        this.isShuffleMode = false;
        this.isRepeatMode = 'none'; 
        this.isDragging = false;

        if (this.volumeSlider) {
            this.volumeSlider.value = this.previousVolume;
            this.updateVolume(this.previousVolume);
        }
        if (this.miniVolumeSlider) {
            this.miniVolumeSlider.value = this.previousVolume;
        }

        if (this.playlist && !this.playlist.classList.contains('collapsed')) {
            this.playlist.classList.add('collapsed');
        }
    }

    setupEventListeners() {
        if (this.uploadMediaBtn && this.mediaUploadInput) {
            this.uploadMediaBtn.addEventListener('click', () => {
                this.mediaUploadInput.click();
            });

            this.mediaUploadInput.setAttribute('multiple', 'true');
            this.mediaUploadInput.addEventListener('change', (e) => {
                this.handleFileUpload(e);
            });
        }

        this.setupDragAndDrop();

        if (this.playPauseBtn) {
            this.playPauseBtn.addEventListener('click', () => this.togglePlayPause());
        }
        if (this.miniPlayPauseBtn) {
            this.miniPlayPauseBtn.addEventListener('click', () => this.togglePlayPause());
        }
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => this.playPreviousTrack());
        }
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.playNextTrack());
        }
        if (this.miniPrevBtn) {
            this.miniPrevBtn.addEventListener('click', () => this.playPreviousTrack());
        }
        if (this.miniNextBtn) {
            this.miniNextBtn.addEventListener('click', () => this.playNextTrack());
        }

        if (this.volumeSlider) {
            this.volumeSlider.addEventListener('input', (e) => {
                this.updateVolume(e.target.value);
            });
        }
        if (this.volumeIcon) {
            this.volumeIcon.addEventListener('click', () => this.toggleMute());
        }

        if (this.miniVolumeSlider) {
            this.miniVolumeSlider.addEventListener('input', (e) => {
                this.updateVolume(e.target.value);
                if (this.volumeSlider) {
                    this.volumeSlider.value = e.target.value;
                }
            });
        }
        if (this.miniVolumeBtn) {
            this.miniVolumeBtn.addEventListener('click', () => this.toggleMute());
        }

        if (this.shuffleBtn) {
            this.shuffleBtn.addEventListener('click', () => this.toggleShuffle());
        }
        if (this.repeatBtn) {
            this.repeatBtn.addEventListener('click', () => this.toggleRepeat());
        }
        if (this.clearPlaylistBtn) {
            this.clearPlaylistBtn.addEventListener('click', () => this.clearPlaylist());
        }
        if (this.fullscreenBtn) {
            this.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
        }
        if (this.pipBtn) {
            this.pipBtn.addEventListener('click', () => this.togglePictureInPicture());
        }

        if (this.progressBar) {
            this.progressBar.addEventListener('click', (e) => this.seekTo(e));
            this.progressBar.addEventListener('mousedown', () => this.isDragging = true);
            document.addEventListener('mouseup', () => this.isDragging = false);
        }

        if (this.miniPlayer) {
            this.miniPlayer.addEventListener('click', (e) => {
                if (!e.target.closest('.mini-control-btn') && !e.target.closest('.mini-volume-control')) {
                    if (!this.isAudioMode) {
                        this.openMediaPlayerModal();
                    } else {
                        this.expandPlaylist();
                    }
                }
            });
        }

        if (this.closeModalBtn) {
            this.closeModalBtn.addEventListener('click', () => this.closeMediaPlayerModal());
        }
        if (this.modal) {
            this.modal.addEventListener('click', (e) => {
                if (e.target === this.modal) {
                    this.closeMediaPlayerModal();
                }
            });
        }

        this.setupMediaPlayerEvents();
    }

    setupMediaPlayerEvents() {
        if (this.audioPlayer) {
            this.audioPlayer.addEventListener('loadedmetadata', () => this.updateDuration());
            this.audioPlayer.addEventListener('timeupdate', () => this.updateProgress());
            this.audioPlayer.addEventListener('ended', () => this.handleTrackEnd());
            this.audioPlayer.addEventListener('play', () => this.onPlay());
            this.audioPlayer.addEventListener('pause', () => this.onPause());
        }

        if (this.videoPlayer) {
            this.videoPlayer.addEventListener('loadedmetadata', () => this.updateDuration());
            this.videoPlayer.addEventListener('timeupdate', () => this.updateProgress());
            this.videoPlayer.addEventListener('ended', () => this.handleTrackEnd());
            this.videoPlayer.addEventListener('play', () => this.onPlay());
            this.videoPlayer.addEventListener('pause', () => this.onPause());
        }

        if (this.modalVideoPlayer) {
            this.modalVideoPlayer.addEventListener('loadedmetadata', () => this.updateDuration());
            this.modalVideoPlayer.addEventListener('timeupdate', () => this.updateProgress());
            this.modalVideoPlayer.addEventListener('ended', () => this.handleTrackEnd());
            this.modalVideoPlayer.addEventListener('play', () => this.onPlay());
            this.modalVideoPlayer.addEventListener('pause', () => this.onPause());
        }
    }

    setupDragAndDrop() {
        const dropZone = this.playlist;
        const dragOverlay = document.querySelector('.drag-drop-overlay');
        if (!dropZone) return;

        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => {
                dropZone.classList.add('drag-over');
                if (dragOverlay) dragOverlay.style.display = 'flex';
            });
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => {
                dropZone.classList.remove('drag-over');
                if (dragOverlay) dragOverlay.style.display = 'none';
            });
        });

        dropZone.addEventListener('drop', (e) => {
            const files = Array.from(e.dataTransfer.files);
            this.handleMultipleFiles(files);
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            switch(e.code) {
                case 'Space':
                    e.preventDefault();
                    this.togglePlayPause();
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    this.seekRelative(-10);
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.seekRelative(10);
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    this.adjustVolume(5);
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    this.adjustVolume(-5);
                    break;
                case 'KeyM':
                    e.preventDefault();
                    this.toggleMute();
                    break;
                case 'KeyN':
                    e.preventDefault();
                    this.playNextTrack();
                    break;
                case 'KeyP':
                    e.preventDefault();
                    this.playPreviousTrack();
                    break;
                case 'Escape':
                    this.closeMediaPlayerModal();
                    break;
            }
        });
    }

    handleFileUpload(e) {
        const files = Array.from(e.target.files);
        this.handleMultipleFiles(files);
    }

    handleMultipleFiles(files) {
        const validFiles = files.filter(file =>
            file.type.startsWith('audio/') || file.type.startsWith('video/')
        );

        if (validFiles.length === 0) {
            this.showNotification('No valid audio or video files selected', 'error');
            return;
        }

        validFiles.forEach(file => {
            const fileData = {
                file: file,
                url: URL.createObjectURL(file),
                name: file.name,
                type: file.type,
                size: file.size,
                duration: 0,
                id: Date.now() + Math.random()
            };

            this.currentPlaylist.push(fileData);
        });

        if (this.currentPlaylist.length === validFiles.length) {
            this.currentTrackIndex = 0;
            this.loadTrack(0);
        }

        this.updatePlaylistUI();
        this.savePlaylistToStorage();
        this.showNotification(`Added ${validFiles.length} file(s) to playlist`, 'success');
    }

    loadTrack(index) {
        if (index < 0 || index >= this.currentPlaylist.length) return;

        const track = this.currentPlaylist[index];
        this.currentTrackIndex = index;

        if (track.type.startsWith('audio/')) {
            this.loadAudioTrack(track);
        } else if (track.type.startsWith('video/')) {
            this.loadVideoTrack(track);
        }

        this.updateTrackInfo(track);
        this.updateActiveTrack();
    }

    loadAudioTrack(track) {
        this.isAudioMode = true;
        this.audioPlayer.src = track.url;
        this.audioView.classList.add('active');
        this.videoView.classList.remove('active');

        const headerTitle = document.querySelector('.playlist-header h3');
        if (headerTitle) {
            headerTitle.innerHTML = '<i class="fas fa-music"></i> Car Audio Player';
        }

        if (this.miniMediaImg) this.miniMediaImg.style.display = 'block';
        if (this.miniVideo) this.miniVideo.style.display = 'none';

        this.playlist.classList.add('collapsed');
        this.playlist.classList.remove('expanded');
    }

    loadVideoTrack(track) {
        this.isAudioMode = false;
        this.videoPlayer.src = track.url;
        this.audioView.classList.remove('active');
        this.videoView.classList.add('active');

        const headerTitle = document.querySelector('.playlist-header h3');
        if (headerTitle) {
            headerTitle.innerHTML = '<i class="fas fa-video"></i> Car Video Player';
        }

        if (this.miniMediaImg) this.miniMediaImg.style.display = 'none';
        if (this.miniVideo) {
            this.miniVideo.style.display = 'block';
            this.miniVideo.src = track.url;
        }

        this.playlist.classList.add('collapsed');
        this.playlist.classList.remove('expanded');

        setTimeout(() => {
            this.openMediaPlayerModal();
            setTimeout(() => {
                if (this.modalVideoPlayer) {
                    this.modalVideoPlayer.src = track.url;
                    this.modalVideoPlayer.load();
                }
            }, 200);
        }, 300);
    }

    updateTrackInfo(track) {
        const trackName = track.name.replace(/\.[^/.]+$/, "");

        const mainTrackName = document.querySelector('.track-name');
        if (mainTrackName) mainTrackName.textContent = trackName;

        if (this.miniTrackName) this.miniTrackName.textContent = trackName;

        const modalTrackName = document.querySelector('.modal-track-name');
        if (modalTrackName) modalTrackName.textContent = trackName;
    }

    togglePlayPause() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }

    play() {
        const player = this.getCurrentPlayer();
        if (player) {
            player.play().then(() => {
                this.isPlaying = true;
                this.updatePlayPauseIcon();
            }).catch(e => {
                console.error('Play failed:', e);
                this.showNotification('Playback failed', 'error');
            });
        }
    }

    pause() {
        const player = this.getCurrentPlayer();
        if (player) {
            player.pause();
            this.isPlaying = false;
            this.updatePlayPauseIcon();
        }
    }

    getCurrentPlayer() {
        if (this.modal && this.modal.classList.contains('show')) {
            return this.isAudioMode ? this.modalAudioPlayer : this.modalVideoPlayer;
        }
        return this.isAudioMode ? this.audioPlayer : this.videoPlayer;
    }

    playNextTrack() {
        if (this.currentPlaylist.length === 0) return;

        let nextIndex;
        if (this.isShuffleMode) {
            nextIndex = Math.floor(Math.random() * this.currentPlaylist.length);
        } else {
            nextIndex = (this.currentTrackIndex + 1) % this.currentPlaylist.length;
        }

        this.loadTrack(nextIndex);
        if (this.isPlaying) {
            setTimeout(() => this.play(), 100);
        }
    }

    playPreviousTrack() {
        if (this.currentPlaylist.length === 0) return;

        const prevIndex = (this.currentTrackIndex - 1 + this.currentPlaylist.length) % this.currentPlaylist.length;
        this.loadTrack(prevIndex);
        if (this.isPlaying) {
            setTimeout(() => this.play(), 100);
        }
    }

    handleTrackEnd() {
        if (this.isRepeatMode === 'one') {
            this.seekTo(0);
            this.play();
        } else if (this.isRepeatMode === 'all' || this.currentTrackIndex < this.currentPlaylist.length - 1) {
            this.playNextTrack();
        } else {
            this.isPlaying = false;
            this.updatePlayPauseIcon();
        }
    }

    updateVolume(value) {
        const volume = value / 100;
        if (this.audioPlayer) this.audioPlayer.volume = volume;
        if (this.videoPlayer) this.videoPlayer.volume = volume;
        if (this.modalVideoPlayer) this.modalVideoPlayer.volume = volume;
        if (this.modalAudioPlayer) this.modalAudioPlayer.volume = volume;

        this.updateVolumeIcon(value);
        this.updateVolumePercentage(value);
        if (value > 0) {
            this.previousVolume = value;
            this.isMuted = false;
        }
    }

    updateVolumePercentage(value) {
        if (this.volumePercentage) {
            this.volumePercentage.textContent = `${Math.round(value)}%`;
        }
        const modalVolumePercentage = document.querySelector('.modal-volume-percentage');
        if (modalVolumePercentage) {
            modalVolumePercentage.textContent = `${Math.round(value)}%`;
        }
    }

    updateVolumeIcon(value) {
        const icons = [this.volumeIcon];
        if (this.miniVolumeBtn) {
            icons.push(this.miniVolumeBtn.querySelector('i'));
        }

        icons.forEach(icon => {
            if (!icon) return;

            if (value === 0 || this.isMuted) {
                icon.className = 'fas fa-volume-mute';
            } else if (value < 50) {
                icon.className = 'fas fa-volume-down';
            } else {
                icon.className = 'fas fa-volume-up';
            }
        });
    }

    toggleMute() {
        if (this.isMuted) {
            this.updateVolume(this.previousVolume);
            if (this.volumeSlider) this.volumeSlider.value = this.previousVolume;
            if (this.miniVolumeSlider) this.miniVolumeSlider.value = this.previousVolume;
            this.isMuted = false;
        } else {
            this.previousVolume = this.volumeSlider ? this.volumeSlider.value : this.miniVolumeSlider.value;
            this.updateVolume(0);
            if (this.volumeSlider) this.volumeSlider.value = 0;
            if (this.miniVolumeSlider) this.miniVolumeSlider.value = 0;
            this.isMuted = true;
        }
    }

    adjustVolume(delta) {
        const currentVolume = parseInt(this.volumeSlider ? this.volumeSlider.value : this.miniVolumeSlider.value);
        const newVolume = Math.max(0, Math.min(100, currentVolume + delta));
        if (this.volumeSlider) this.volumeSlider.value = newVolume;
        if (this.miniVolumeSlider) this.miniVolumeSlider.value = newVolume;
        this.updateVolume(newVolume);
    }

    seekTo(position) {
        const player = this.getCurrentPlayer();
        if (!player || !player.duration) return;

        let seekTime;
        if (typeof position === 'number') {
            seekTime = position;
        } else {
            const rect = this.progressBar.getBoundingClientRect();
            const percent = (position.clientX - rect.left) / rect.width;
            seekTime = percent * player.duration;
        }

        player.currentTime = Math.max(0, Math.min(player.duration, seekTime));
    }

    seekRelative(seconds) {
        const player = this.getCurrentPlayer();
        if (!player) return;

        const newTime = player.currentTime + seconds;
        player.currentTime = Math.max(0, Math.min(player.duration || 0, newTime));
    }

    updateDuration() {
        const player = this.getCurrentPlayer();
        if (!player) return;

        this.duration = player.duration;
        if (this.totalTimeDisplay) {
            this.totalTimeDisplay.textContent = this.formatTime(this.duration);
        }
    }

    updateProgress() {
        const player = this.getCurrentPlayer();
        if (!player || this.isDragging) return;

        this.currentTime = player.currentTime;
        const progress = (this.currentTime / this.duration) * 100;

        if (this.progressFill) {
            this.progressFill.style.width = `${progress}%`;
        }
        if (this.miniProgress) {
            this.miniProgress.style.width = `${progress}%`;
        }

        const modalProgress = document.querySelector('.modal-progress');
        if (modalProgress) {
            modalProgress.style.width = `${progress}%`;
        }

        if (this.currentTimeDisplay) {
            this.currentTimeDisplay.textContent = this.formatTime(this.currentTime);
        }
    }

    updatePlayPauseIcon() {
        const icons = document.querySelectorAll('.play-pause i, .mini-control-btn.play-pause i, .modal-control-btn.play-pause i');
        icons.forEach(icon => {
            icon.className = this.isPlaying ? 'fas fa-pause' : 'fas fa-play';
        });
    }

    updateActiveTrack() {
        const tracks = document.querySelectorAll('.playlist-track, .modal-playlist-track');
        tracks.forEach((track, index) => {
            if (index === this.currentTrackIndex) {
                track.classList.add('active');
            } else {
                track.classList.remove('active');
            }
        });
    }

    updatePlaylistUI() {
        this.renderPlaylistTracks();
        this.renderModalPlaylistTracks();
    }

    renderPlaylistTracks() {
        if (!this.playlistTracksContainer) return;

        this.playlistTracksContainer.innerHTML = '';

        if (this.currentPlaylist.length === 0) {
            this.playlistTracksContainer.innerHTML = `
                <div class="empty-playlist">
                    <i class="fas fa-music"></i>
                    <h3>No tracks in playlist</h3>
                    <p>Upload audio or video files to get started</p>
                </div>
            `;
        } else {
            this.currentPlaylist.forEach((track, index) => {
                const trackElement = this.createTrackElement(track, index);
                this.playlistTracksContainer.appendChild(trackElement);
            });
        }
    }

    renderModalPlaylistTracks() {
        if (!this.modalPlaylistTracksContainer) return;

        this.modalPlaylistTracksContainer.innerHTML = '';

        if (this.currentPlaylist.length === 0) {
            this.modalPlaylistTracksContainer.innerHTML = `
                <div class="empty-playlist">
                    <i class="fas fa-music"></i>
                    <h3>No tracks in playlist</h3>
                    <p>Upload audio or video files to get started</p>
                </div>
            `;
        } else {
            this.currentPlaylist.forEach((track, index) => {
                const trackElement = this.createTrackElement(track, index, true);
                this.modalPlaylistTracksContainer.appendChild(trackElement);
            });
        }
    }

    createTrackElement(track, index, isModal = false) {
        const trackDiv = document.createElement('div');
        trackDiv.className = `${isModal ? 'modal-' : ''}playlist-track`;
        if (index === this.currentTrackIndex) {
            trackDiv.classList.add('active');
        }

        const trackName = track.name.replace(/\.[^/.]+$/, "");
        const fileSize = this.formatFileSize(track.size);
        const fileType = track.type.startsWith('audio/') ? 'Audio' : 'Video';

        trackDiv.innerHTML = `
            <div class="${isModal ? 'modal-' : ''}track-number">${index + 1}</div>
            <div class="${isModal ? 'modal-' : ''}track-details">
                <div class="${isModal ? 'modal-' : ''}track-title">${trackName}</div>
                <div class="${isModal ? 'modal-' : ''}track-artist">${fileType} • ${fileSize}</div>
            </div>
            <div class="${isModal ? 'modal-' : ''}track-duration">
                <button class="remove-track" data-index="${index}" title="Remove track">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        trackDiv.addEventListener('click', (e) => {
            if (!e.target.closest('.remove-track')) {
                this.loadTrack(index);
                if (this.isPlaying) {
                    setTimeout(() => this.play(), 100);
                }
            }
        });

        const removeBtn = trackDiv.querySelector('.remove-track');
        if (removeBtn) {
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.removeTrack(index);
            });
        }

        return trackDiv;
    }

    removeTrack(index) {
        if (index < 0 || index >= this.currentPlaylist.length) return;

        URL.revokeObjectURL(this.currentPlaylist[index].url);

        this.currentPlaylist.splice(index, 1);

        if (index < this.currentTrackIndex) {
            this.currentTrackIndex--;
        } else if (index === this.currentTrackIndex) {
            if (this.currentTrackIndex >= this.currentPlaylist.length) {
                this.currentTrackIndex = 0;
            }
            if (this.currentPlaylist.length > 0) {
                this.loadTrack(this.currentTrackIndex);
            } else {
                this.clearPlayer();
            }
        }

        this.updatePlaylistUI();
        this.savePlaylistToStorage();
        this.showNotification('Track removed from playlist', 'info');
    }

    clearPlayer() {
        this.pause();
        if (this.audioPlayer) this.audioPlayer.src = '';
        if (this.videoPlayer) this.videoPlayer.src = '';
        if (this.modalVideoPlayer) this.modalVideoPlayer.src = '';
        if (this.modalAudioPlayer) this.modalAudioPlayer.src = '';

        if (this.progressFill) this.progressFill.style.width = '0%';
        if (this.miniProgress) this.miniProgress.style.width = '0%';
        if (this.currentTimeDisplay) this.currentTimeDisplay.textContent = '0:00';
        if (this.totalTimeDisplay) this.totalTimeDisplay.textContent = '0:00';
    }

    expandPlaylist() {
        this.playlist.classList.remove('collapsed');
        this.playlist.classList.add('expanded');
    }

    openMediaPlayerModal() {
        if (!this.modal) return;

        this.modal.classList.add('show');
        this.modal.style.display = 'block';
        document.body.style.overflow = 'hidden';

        this.initializeModalState();
    }

    closeMediaPlayerModal() {
        if (!this.modal) return;

        this.modal.classList.add('closing');
        setTimeout(() => {
            this.modal.style.display = 'none';
            this.modal.classList.remove('closing', 'show');
            document.body.style.overflow = 'auto';
        }, 300);

        if (this.modalAudioPlayer) this.modalAudioPlayer.pause();
        if (this.modalVideoPlayer) this.modalVideoPlayer.pause();
    }

    initializeModalState() {
        const modalHeaderTitle = document.querySelector('.media-modal-header h3');
        if (modalHeaderTitle) {
            if (this.isAudioMode) {
                modalHeaderTitle.innerHTML = '<i class="fas fa-music"></i> Car Audio Player';
            } else {
                modalHeaderTitle.innerHTML = '<i class="fas fa-video"></i> Car Video Player';
            }
        }
        const modalAudioView = document.querySelector('.modal-audio-view');
        const modalVideoView = document.querySelector('.modal-video-view');

        if (this.isAudioMode) {
            modalAudioView?.classList.add('active');
            modalVideoView?.classList.remove('active');
        } else {
            modalAudioView?.classList.remove('active');
            modalVideoView?.classList.add('active');
        }

        if (this.currentPlaylist.length > 0) {
            const currentTrack = this.currentPlaylist[this.currentTrackIndex];
            if (this.modalVideoPlayer && !this.isAudioMode) {
                this.modalVideoPlayer.src = currentTrack.url;
                this.modalVideoPlayer.currentTime = this.getCurrentPlayer()?.currentTime || 0;
            }
        }
    }

    onPlay() {
        this.isPlaying = true;
        this.updatePlayPauseIcon();
    }

    onPause() {
        this.isPlaying = false;
        this.updatePlayPauseIcon();
    }

    formatTime(seconds) {
        if (!seconds || isNaN(seconds)) return '0:00';

        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `media-notification ${type}`;
        notification.textContent = message;

        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 20px',
            borderRadius: '8px',
            color: 'white',
            fontWeight: 'bold',
            zIndex: '10000',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease',
            backgroundColor: type === 'error' ? '#e74c3c' :
                           type === 'success' ? '#27ae60' : '#3498db'
        });

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    savePlaylistToStorage() {
        try {
            const playlistData = this.currentPlaylist.map(track => ({
                name: track.name,
                type: track.type,
                size: track.size,
                id: track.id
            }));
            localStorage.setItem('carMediaPlaylist', JSON.stringify(playlistData));
        } catch (e) {
            console.warn('Could not save playlist to localStorage:', e);
        }
    }

    loadPlaylistFromStorage() {
        try {
            const saved = localStorage.getItem('carMediaPlaylist');
            if (saved) {

                console.log('Playlist metadata found in storage');
            }
        } catch (e) {
            console.warn('Could not load playlist from localStorage:', e);
        }
    }

    toggleShuffle() {
        this.isShuffleMode = !this.isShuffleMode;
        if (this.shuffleBtn) {
            this.shuffleBtn.classList.toggle('active', this.isShuffleMode);
        }
        this.showNotification(
            `Shuffle ${this.isShuffleMode ? 'enabled' : 'disabled'}`,
            'info'
        );
    }

    toggleRepeat() {
        const modes = ['none', 'all', 'one'];
        const currentIndex = modes.indexOf(this.isRepeatMode);
        const nextIndex = (currentIndex + 1) % modes.length;
        this.isRepeatMode = modes[nextIndex];

        if (this.repeatBtn) {
            this.repeatBtn.classList.remove('active', 'repeat-one');
            if (this.isRepeatMode === 'all') {
                this.repeatBtn.classList.add('active');
            } else if (this.isRepeatMode === 'one') {
                this.repeatBtn.classList.add('active', 'repeat-one');
            }
        }

        const modeText = this.isRepeatMode === 'none' ? 'disabled' :
                        this.isRepeatMode === 'all' ? 'all tracks' : 'current track';
        this.showNotification(`Repeat ${modeText}`, 'info');
    }

    clearPlaylist() {
        if (this.currentPlaylist.length === 0) {
            this.showNotification('Playlist is already empty', 'info');
            return;
        }

        if (confirm('Are you sure you want to clear the entire playlist?')) {
            this.currentPlaylist.forEach(track => {
                URL.revokeObjectURL(track.url);
            });

            this.currentPlaylist = [];
            this.currentTrackIndex = 0;
            this.clearPlayer();
            this.updatePlaylistUI();
            this.savePlaylistToStorage();
            this.showNotification('Playlist cleared', 'success');
        }
    }

    toggleFullscreen() {
        const player = this.getCurrentPlayer();
        if (!player || this.isAudioMode) return;

        if (!document.fullscreenElement) {
            player.requestFullscreen().catch(err => {
                console.error('Error attempting to enable fullscreen:', err);
                this.showNotification('Fullscreen not supported', 'error');
            });
        } else {
            document.exitFullscreen();
        }
    }

    togglePictureInPicture() {
        const player = this.getCurrentPlayer();
        if (!player || this.isAudioMode) return;

        if ('pictureInPictureEnabled' in document) {
            if (document.pictureInPictureElement) {
                document.exitPictureInPicture();
            } else {
                player.requestPictureInPicture().catch(err => {
                    console.error('Error attempting to enable PiP:', err);
                    this.showNotification('Picture-in-Picture not supported', 'error');
                });
            }
        } else {
            this.showNotification('Picture-in-Picture not supported', 'error');
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    window.enhancedMediaPlayer = new EnhancedMediaPlayer();
});
