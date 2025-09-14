// AI Choreographer Frontend JavaScript
// Using CDN version - no import needed

class AIChoreographer {
    constructor() {
        this.currentSection = 'hero';
        this.isGenerating = false;
        this.isPlaying = false;
        this.currentProgress = 0;
        this.currentTime = 0;
        this.totalTime = 225; // 3:45 in seconds
        this.mirrorMode = false;
        this.currentSpeed = 1;
        this.currentProject = null;
        this.isAuthenticated = false;
        
        this.init();
    }

    async init() {
        await this.checkAuthentication();
        this.setupEventListeners();
        this.setupFileUpload();
        this.setupProgressSimulation();
        this.setupStudioControls();
        this.setupGestureHints();
        this.animateOnScroll();
        this.setupSupabaseSubscriptions();
    }

    async checkAuthentication() {
        const user = await window.choreographyService.getCurrentUser();
        this.isAuthenticated = !!user;
        this.updateAuthUI();
    }

    updateAuthUI() {
        const nav = document.querySelector('.nav');
        if (this.isAuthenticated) {
            nav.innerHTML = `
                <a href="#projects" class="nav-link">Projects</a>
                <a href="#profile" class="nav-link">Profile</a>
                <button class="btn btn-outline" id="logoutBtn">Logout</button>
            `;
        } else {
            nav.innerHTML = `
                <button class="btn btn-outline" id="loginBtn">Login</button>
                <button class="btn btn-primary" id="signupBtn">Sign Up</button>
            `;
        }
    }

    setupEventListeners() {
        // Navigation buttons
        document.getElementById('uploadMusicBtn').addEventListener('click', () => this.showUploadSection('music'));
        document.getElementById('trySampleBtn').addEventListener('click', () => this.trySample());
        
        // Upload tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // Generate button
        document.getElementById('generateBtn').addEventListener('click', () => this.startGeneration());

        // Progress controls
        document.getElementById('cancelBtn').addEventListener('click', () => this.cancelGeneration());
        document.getElementById('modifyBtn').addEventListener('click', () => this.modifySettings());

        // Studio controls
        document.getElementById('playBtn').addEventListener('click', () => this.togglePlayback());
        document.getElementById('rewindBtn').addEventListener('click', () => this.rewind());
        document.getElementById('forwardBtn').addEventListener('click', () => this.forward());
        document.getElementById('mirrorToggle').addEventListener('click', () => this.toggleMirror());

        // Speed controls
        document.querySelectorAll('.speed-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.changeSpeed(parseFloat(e.target.dataset.speed)));
        });

        // Camera presets
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.changeCameraAngle(e.target.dataset.angle));
        });

        // Timeline scrubbing
        this.setupTimelineScrubbing();


        // Export buttons
        document.querySelectorAll('.export-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleExport(e.target.textContent.trim()));
        });

        // Authentication buttons (will be added dynamically)
        document.addEventListener('click', (e) => {
            if (e.target.id === 'loginBtn') {
                this.showLoginModal();
            } else if (e.target.id === 'signupBtn') {
                this.showSignupModal();
            } else if (e.target.id === 'logoutBtn') {
                this.logout();
            }
        });
    }

    setupFileUpload() {
        const musicUploadArea = document.getElementById('musicUploadArea');
        const musicFileInput = document.getElementById('musicFileInput');

        // Music upload
        musicUploadArea.addEventListener('click', () => musicFileInput.click());
        musicUploadArea.addEventListener('dragover', (e) => this.handleDragOver(e, musicUploadArea));
        musicUploadArea.addEventListener('dragleave', (e) => this.handleDragLeave(e, musicUploadArea));
        musicUploadArea.addEventListener('drop', (e) => this.handleDrop(e, musicFileInput));
        musicFileInput.addEventListener('change', (e) => this.handleFileSelect(e, 'music'));
    }

    setupProgressSimulation() {
        this.progressInterval = null;
    }

    setupStudioControls() {
        this.playbackInterval = null;
    }

    setupTimelineScrubbing() {
        const timeline = document.getElementById('timeline');
        const scrubber = document.getElementById('timelineScrubber');
        let isDragging = false;

        timeline.addEventListener('click', (e) => {
            const rect = timeline.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const percentage = clickX / rect.width;
            this.seekTo(percentage);
        });

        scrubber.addEventListener('mousedown', (e) => {
            isDragging = true;
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                const rect = timeline.getBoundingClientRect();
                const mouseX = e.clientX - rect.left;
                const percentage = Math.max(0, Math.min(1, mouseX / rect.width));
                this.seekTo(percentage);
            }
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });
    }

    setupGestureHints() {
        // This would integrate with MediaPipe for gesture recognition
        // For now, we'll simulate gesture controls with keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (this.currentSection === 'studio') {
                switch(e.key) {
                    case 'ArrowLeft':
                        e.preventDefault();
                        this.rewind();
                        break;
                    case 'ArrowRight':
                        e.preventDefault();
                        this.forward();
                        break;
                    case ' ':
                        e.preventDefault();
                        this.togglePlayback();
                        break;
                    case 'm':
                        e.preventDefault();
                        this.toggleMirror();
                        break;
                }
            }
        });
    }

    animateOnScroll() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in-up');
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('section').forEach(section => {
            observer.observe(section);
        });
    }

    // Navigation methods
    showUploadSection(type) {
        this.hideAllSections();
        document.getElementById('uploadSection').style.display = 'block';
        this.currentSection = 'upload';
        this.switchTab('music');
        this.scrollToSection('uploadSection');
    }

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}Tab`).classList.add('active');
    }

    async trySample() {
        // Try to use pre-uploaded sample file from Supabase, with fallback
        this.showNotification('Loading sample track...', 'info');
        
        try {
            // First, try to verify the sample file exists in Supabase
            const sampleUrl = 'https://likdbicjuoqqwwrfjial.supabase.co/storage/v1/object/sign/audio-files/samples/rick-astley-sample.mp3?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iZjk2NDUxYS0zNGFmLTQyNTUtOGVlZC1mNzhhMGZhYjM1MzgiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhdWRpby1maWxlcy9zYW1wbGVzL3JpY2stYXN0bGV5LXNhbXBsZS5tcDMiLCJpYXQiOjE3NTc4MDcxMzksImV4cCI6MTc4OTM0MzEzOX0._JaN2HA_ds8f8VvIkeKGr1SIxSYP6MFDWQY68DLIhIY';
            
            // Test if the sample file is accessible
            const testResponse = await fetch(sampleUrl, { method: 'HEAD' });
            
            let sampleFileInfo;
            
            if (testResponse.ok) {
                // Sample file exists in Supabase, use it
                sampleFileInfo = {
                    name: 'Rick Astley - Never Gonna Give You Up.mp3',
                    size: 3.2 * 1024 * 1024, // 3.2 MB
                    type: 'audio/mpeg',
                    path: 'samples/rick-astley-sample.mp3',
                    url: sampleUrl,
                    source: 'supabase'
                };
                console.log('Using Supabase sample file');
            } else {
                // Fallback to mock sample
                sampleFileInfo = {
                    name: 'Sample Track (Demo)',
                    size: 3.2 * 1024 * 1024, // 3.2 MB
                    type: 'audio/mpeg',
                    path: 'demo/sample-track.mp3',
                    url: null,
                    source: 'demo'
                };
                console.log('Using demo sample (Supabase file not found)');
            }

            // Create a sample project
            const projectData = {
                title: sampleFileInfo.name,
                audio_file_name: sampleFileInfo.name,
                audio_file_size: sampleFileInfo.size,
                audio_file_type: sampleFileInfo.type,
                audio_file_path: sampleFileInfo.path,
                audio_file_url: sampleFileInfo.url,
                status: 'uploaded',
                is_sample: 1
            };

            const { data: project, error: projectError } = await window.choreographyService.createProject(projectData);
            if (projectError) throw projectError;

            this.currentProject = project;

            // Show success message based on source
            const successMessage = sampleFileInfo.source === 'supabase' 
                ? 'Sample track loaded! Starting generation...'
                : 'Demo sample loaded! Starting generation...';
            
            this.showNotification(successMessage, 'success');
            
            // Start generation immediately
            setTimeout(() => {
                this.startGeneration();
            }, 1000);

        } catch (error) {
            console.error('Sample loading error:', error);
            
            // Final fallback - create a basic demo project
            try {
                this.showNotification('Creating demo sample...', 'info');
                
                const demoProjectData = {
                    title: 'Demo Sample Track',
                    audio_file_name: 'demo-track.mp3',
                    audio_file_size: 2.5 * 1024 * 1024,
                    audio_file_type: 'audio/mpeg',
                    status: 'uploaded',
                    is_sample: 1
                };

                const { data: project, error: projectError } = await window.choreographyService.createProject(demoProjectData);
                if (projectError) throw projectError;

                this.currentProject = project;
                this.showNotification('Demo sample created! Starting generation...', 'success');
                
                setTimeout(() => {
                    this.startGeneration();
                }, 1000);
                
            } catch (fallbackError) {
                console.error('Fallback error:', fallbackError);
                this.showNotification('Failed to create sample: ' + fallbackError.message, 'error');
            }
        }
    }


    // File upload methods
    handleDragOver(e, element) {
        e.preventDefault();
        element.classList.add('dragover');
    }

    handleDragLeave(e, element) {
        e.preventDefault();
        element.classList.remove('dragover');
    }

    handleDrop(e, fileInput) {
        e.preventDefault();
        const element = e.currentTarget;
        element.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            fileInput.files = files;
            this.handleFileSelect({ target: fileInput }, fileInput.id.includes('music') ? 'music' : 'video');
        }
    }

    async handleFileSelect(e, type) {
        const file = e.target.files[0];
        if (file) {
            if (!this.isAuthenticated) {
                this.showNotification('Please sign in to upload files', 'error');
                return;
            }

            const uploadArea = document.getElementById(`${type}UploadArea`);
            const icon = uploadArea.querySelector('.upload-icon i');
            const title = uploadArea.querySelector('h3');
            const subtitle = uploadArea.querySelector('p');

            // Show uploading state
            icon.className = 'fas fa-spinner fa-spin';
            icon.style.color = 'var(--accent-cyan)';
            title.textContent = 'Uploading...';
            subtitle.textContent = 'Please wait';

            try {
                // Create project first
                const projectData = {
                    title: file.name.split('.')[0],
                    audio_file_name: file.name,
                    audio_file_size: file.size,
                    audio_file_type: file.type,
                    status: 'uploaded'
                };

                const { data: project, error: projectError } = await window.choreographyService.createProject(projectData);
                if (projectError) throw projectError;

                this.currentProject = project;

                // Upload file to Supabase Storage
                const uploadResult = await window.choreographyService.uploadAudioFile(file, project.id);
                
                // Update project with file path
                await window.choreographyService.updateProject(project.id, {
                    audio_file_path: uploadResult.path
                });

                // Update UI to show success
                icon.className = 'fas fa-check-circle';
                title.textContent = file.name;
                subtitle.textContent = `${(file.size / 1024 / 1024).toFixed(2)} MB - Ready to generate`;

                // Add glow effect
                uploadArea.classList.add('glow-cyan');

                this.showNotification(`${type.charAt(0).toUpperCase() + type.slice(1)} file uploaded successfully!`, 'success');
            } catch (error) {
                console.error('Upload error:', error);
                
                // Reset UI on error
                icon.className = 'fas fa-cloud-upload-alt';
                icon.style.color = 'var(--accent-cyan)';
                title.textContent = `Drop your ${type} file here`;
                subtitle.textContent = 'or browse files';

                this.showNotification(`Failed to upload ${type} file: ${error.message}`, 'error');
            }
        }
    }

    // Generation methods
    async startGeneration() {
        if (this.isGenerating) return;
        if (!this.currentProject) {
            this.showNotification('Please upload a file first', 'error');
            return;
        }

        this.isGenerating = true;
        this.hideAllSections();
        document.getElementById('progressSection').style.display = 'block';
        this.currentSection = 'progress';
        this.scrollToSection('progressSection');

        // Start progress simulation immediately
        this.simulateProgress();

        try {
            // Start AI generation process
            await window.choreographyService.startChoreographyGeneration(this.currentProject.id, {});

            // Subscribe to real-time updates
            this.subscribeToProjectUpdates();
        } catch (error) {
            console.error('Generation error:', error);
            this.showNotification('Failed to start generation: ' + error.message, 'error');
            this.cancelGeneration();
        }
    }

    simulateProgress() {
        this.currentProgress = 0;
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        
        // Clear any existing interval
        if (this.progressInterval) {
            clearInterval(this.progressInterval);
        }
        
        this.progressInterval = setInterval(() => {
            this.currentProgress += Math.random() * 2 + 1; // 1-3% per update
            if (this.currentProgress > 100) {
                this.currentProgress = 100;
                clearInterval(this.progressInterval);
                this.completeGeneration();
            }
            
            if (progressFill && progressText) {
                progressFill.style.width = `${this.currentProgress}%`;
                progressText.textContent = `${Math.round(this.currentProgress)}%`;
            }
        }, 300); // Update every 300ms
    }

    completeGeneration() {
        clearInterval(this.progressInterval);
        this.isGenerating = false;
        
        setTimeout(() => {
            this.hideAllSections();
            document.getElementById('studioSection').style.display = 'block';
            document.getElementById('exportSection').style.display = 'block';
            this.currentSection = 'studio';
            this.scrollToSection('studioSection');
            
            this.showNotification('Choreography generated successfully!', 'success');
        }, 1000);
    }

    cancelGeneration() {
        if (this.progressInterval) {
            clearInterval(this.progressInterval);
        }
        this.isGenerating = false;
        this.showUploadSection('music');
        this.showNotification('Generation cancelled', 'info');
    }

    modifySettings() {
        this.showUploadSection('music');
        this.showNotification('Settings panel opened', 'info');
    }

    // Studio control methods
    togglePlayback() {
        this.isPlaying = !this.isPlaying;
        const playBtn = document.getElementById('playBtn');
        const icon = playBtn.querySelector('i');
        
        if (this.isPlaying) {
            icon.className = 'fas fa-pause';
            this.startPlayback();
        } else {
            icon.className = 'fas fa-play';
            this.pausePlayback();
        }
    }

    startPlayback() {
        this.playbackInterval = setInterval(() => {
            this.currentTime += 1 / this.currentSpeed;
            if (this.currentTime >= this.totalTime) {
                this.currentTime = this.totalTime;
                this.pausePlayback();
            }
            this.updateTimeline();
        }, 1000);
    }

    pausePlayback() {
        if (this.playbackInterval) {
            clearInterval(this.playbackInterval);
            this.playbackInterval = null;
        }
    }

    rewind() {
        this.currentTime = Math.max(0, this.currentTime - 10);
        this.updateTimeline();
        this.showNotification('Rewound 10 seconds', 'info');
    }

    forward() {
        this.currentTime = Math.min(this.totalTime, this.currentTime + 10);
        this.updateTimeline();
        this.showNotification('Forwarded 10 seconds', 'info');
    }

    seekTo(percentage) {
        this.currentTime = percentage * this.totalTime;
        this.updateTimeline();
    }

    updateTimeline() {
        const progress = (this.currentTime / this.totalTime) * 100;
        const timelineProgress = document.getElementById('timelineProgress');
        const timelineScrubber = document.getElementById('timelineScrubber');
        const currentTimeEl = document.getElementById('currentTime');
        
        timelineProgress.style.width = `${progress}%`;
        timelineScrubber.style.left = `${progress}%`;
        currentTimeEl.textContent = this.formatTime(this.currentTime);
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    changeSpeed(speed) {
        this.currentSpeed = speed;
        
        // Update speed buttons
        document.querySelectorAll('.speed-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-speed="${speed}"]`).classList.add('active');
        
        this.showNotification(`Speed changed to ${speed}x`, 'info');
    }

    toggleMirror() {
        this.mirrorMode = !this.mirrorMode;
        const mirrorBtn = document.getElementById('mirrorToggle');
        const avatar3d = document.querySelector('.avatar-3d');
        
        if (this.mirrorMode) {
            mirrorBtn.classList.add('active');
            avatar3d.style.transform = 'scaleX(-1)';
        } else {
            mirrorBtn.classList.remove('active');
            avatar3d.style.transform = 'scaleX(1)';
        }
        
        this.showNotification(`Mirror mode ${this.mirrorMode ? 'enabled' : 'disabled'}`, 'info');
    }

    changeCameraAngle(angle) {
        // Update camera preset buttons
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-angle="${angle}"]`).classList.add('active');
        
        // Apply camera transformation
        const avatar3d = document.querySelector('.avatar-3d');
        switch(angle) {
            case 'front':
                avatar3d.style.transform = 'rotateY(0deg)';
                break;
            case 'side':
                avatar3d.style.transform = 'rotateY(90deg)';
                break;
            case '3d':
                avatar3d.style.transform = 'rotateY(45deg) rotateX(10deg)';
                break;
            case 'top':
                avatar3d.style.transform = 'rotateX(90deg)';
                break;
        }
        
        this.showNotification(`Camera angle: ${angle}`, 'info');
    }

    // Export methods
    handleExport(action) {
        switch(action) {
            case 'Download Video':
                this.downloadVideo();
                break;
            case 'Export GLB':
                this.exportGLB();
                break;
            case 'Share Link':
                this.shareLink();
                break;
        }
    }

    downloadVideo() {
        this.showNotification('Preparing video download...', 'info');
        // Simulate download
        setTimeout(() => {
            this.showNotification('Video downloaded successfully!', 'success');
        }, 2000);
    }

    exportGLB() {
        this.showNotification('Exporting 3D model...', 'info');
        // Simulate export
        setTimeout(() => {
            this.showNotification('GLB file exported successfully!', 'success');
        }, 1500);
    }

    shareLink() {
        // Copy link to clipboard
        const link = `${window.location.origin}/choreography/${Date.now()}`;
        navigator.clipboard.writeText(link).then(() => {
            this.showNotification('Share link copied to clipboard!', 'success');
        }).catch(() => {
            this.showNotification('Failed to copy link', 'error');
        });
    }

    // Utility methods
    hideAllSections() {
        const sections = ['uploadSection', 'progressSection', 'studioSection', 'exportSection'];
        sections.forEach(sectionId => {
            document.getElementById(sectionId).style.display = 'none';
        });
    }

    scrollToSection(sectionId) {
        document.getElementById(sectionId).scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;

        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 1rem 1.5rem;
            color: var(--text-primary);
            z-index: 10000;
            transform: translateX(400px);
            transition: transform 0.3s ease;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        `;

        // Add type-specific styling
        if (type === 'success') {
            notification.style.borderColor = 'var(--accent-cyan)';
            notification.style.boxShadow = '0 4px 20px var(--cyan-glow)';
        } else if (type === 'error') {
            notification.style.borderColor = '#ff4444';
            notification.style.boxShadow = '0 4px 20px rgba(255, 68, 68, 0.3)';
        }

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    getNotificationIcon(type) {
        switch(type) {
            case 'success': return 'check-circle';
            case 'error': return 'exclamation-circle';
            case 'info': return 'info-circle';
            default: return 'info-circle';
        }
    }

    // Supabase integration methods
    setupSupabaseSubscriptions() {
        // Subscribe to auth state changes
        window.choreographyService.supabase.auth.onAuthStateChange((event, session) => {
            this.isAuthenticated = !!session;
            this.updateAuthUI();
        });
    }

    subscribeToProjectUpdates() {
        if (!this.currentProject) return;

        this.projectSubscription = window.choreographyService.subscribeToProjectUpdates(
            this.currentProject.id,
            (payload) => {
                console.log('Project update:', payload);
                this.handleProjectUpdate(payload.new);
            }
        );
    }

    handleProjectUpdate(project) {
        // Update progress bar
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        
        if (progressFill && progressText) {
            progressFill.style.width = `${project.processing_progress}%`;
            progressText.textContent = `${project.processing_progress}%`;
        }

        // Handle status changes
        if (project.status === 'completed') {
            this.completeGeneration(project);
        } else if (project.status === 'failed') {
            this.handleGenerationError(project.error_message);
        }
    }

    async completeGeneration(project) {
        clearInterval(this.progressInterval);
        this.isGenerating = false;
        
        // Unsubscribe from updates
        if (this.projectSubscription) {
            this.projectSubscription.unsubscribe();
        }

        // Update current project
        this.currentProject = project;
        
        setTimeout(() => {
            this.hideAllSections();
            document.getElementById('studioSection').style.display = 'block';
            document.getElementById('exportSection').style.display = 'block';
            this.currentSection = 'studio';
            this.scrollToSection('studioSection');
            
            this.showNotification('Choreography generated successfully!', 'success');
        }, 1000);
    }

    handleGenerationError(errorMessage) {
        clearInterval(this.progressInterval);
        this.isGenerating = false;
        
        if (this.projectSubscription) {
            this.projectSubscription.unsubscribe();
        }

        this.showNotification(`Generation failed: ${errorMessage}`, 'error');
        this.cancelGeneration();
    }

    // Authentication methods
    async showLoginModal() {
        this.createAuthModal('login');
    }

    async showSignupModal() {
        this.createAuthModal('signup');
    }

    createAuthModal(type) {
        // Remove existing modal if any
        const existingModal = document.getElementById('authModal');
        if (existingModal) {
            existingModal.remove();
        }

        const isLogin = type === 'login';
        const modal = document.createElement('div');
        modal.id = 'authModal';
        modal.className = 'auth-modal';
        modal.innerHTML = `
            <div class="auth-modal-overlay">
                <div class="auth-modal-content">
                    <div class="auth-modal-header">
                        <h2>${isLogin ? 'Welcome Back' : 'Create Account'}</h2>
                        <button class="auth-modal-close" id="closeAuthModal">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="auth-modal-body">
                        <form id="authForm" class="auth-form">
                            ${!isLogin ? `
                                <div class="form-group">
                                    <label for="fullName">Full Name</label>
                                    <input type="text" id="fullName" name="fullName" required>
                                </div>
                            ` : ''}
                            <div class="form-group">
                                <label for="email">Email</label>
                                <input type="email" id="email" name="email" required>
                            </div>
                            <div class="form-group">
                                <label for="password">Password</label>
                                <input type="password" id="password" name="password" required>
                            </div>
                            ${isLogin ? `
                                <div class="form-group">
                                    <label class="checkbox-label">
                                        <input type="checkbox" id="rememberMe">
                                        <span class="checkmark"></span>
                                        Remember me
                                    </label>
                                </div>
                            ` : ''}
                            <button type="submit" class="btn btn-primary auth-submit-btn">
                                <i class="fas fa-${isLogin ? 'sign-in-alt' : 'user-plus'}"></i>
                                ${isLogin ? 'Sign In' : 'Create Account'}
                            </button>
                        </form>
                        <div class="auth-modal-footer">
                            <p>
                                ${isLogin ? "Don't have an account?" : "Already have an account?"}
                                <button class="auth-switch-btn" id="switchAuthType">
                                    ${isLogin ? 'Sign up' : 'Sign in'}
                                </button>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Add event listeners
        document.getElementById('closeAuthModal').addEventListener('click', () => this.closeAuthModal());
        document.getElementById('switchAuthType').addEventListener('click', () => {
            this.closeAuthModal();
            this.createAuthModal(isLogin ? 'signup' : 'login');
        });
        document.getElementById('authForm').addEventListener('submit', (e) => this.handleAuthSubmit(e, isLogin));

        // Close on overlay click
        modal.querySelector('.auth-modal-overlay').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.closeAuthModal();
            }
        });

        // Animate in
        setTimeout(() => modal.classList.add('show'), 10);
    }

    closeAuthModal() {
        const modal = document.getElementById('authModal');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => modal.remove(), 300);
        }
    }

    async handleAuthSubmit(e, isLogin) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const email = formData.get('email');
        const password = formData.get('password');
        const fullName = formData.get('fullName');

        const submitBtn = e.target.querySelector('.auth-submit-btn');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        submitBtn.disabled = true;

        try {
            if (isLogin) {
                const { error } = await window.choreographyService.signIn(email, password);
                if (error) throw error;
                this.showNotification('Logged in successfully!', 'success');
            } else {
                const { error } = await window.choreographyService.signUp(email, password, fullName);
                if (error) throw error;
                this.showNotification('Account created! Please check your email and click the verification link to activate your account.', 'success');
            }
            this.closeAuthModal();
            await this.checkAuthentication();
        } catch (error) {
            this.showNotification(`${isLogin ? 'Login' : 'Signup'} failed: ${error.message}`, 'error');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    async logout() {
        try {
            await window.choreographyService.signOut();
            this.showNotification('Logged out successfully!', 'success');
            await this.checkAuthentication();
        } catch (error) {
            this.showNotification('Logout failed: ' + error.message, 'error');
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AIChoreographer();
});

// Add some additional CSS for notifications
const notificationStyles = `
    .notification-content {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .notification-content i {
        font-size: 1.2rem;
    }
    
    .notification-success .notification-content i {
        color: var(--accent-cyan);
    }
    
    .notification-error .notification-content i {
        color: #ff4444;
    }
    
    .notification-info .notification-content i {
        color: var(--accent-pink);
    }
`;

// Inject notification styles
const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);
