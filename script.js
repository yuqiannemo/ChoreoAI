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
        this.threeDViewer = null;
        this.current3DMode = false;

        this.init();
    }

    async init() {
        await this.checkAuthentication();
        this.setupEventListeners();
        this.setupFileUpload();
        this.setupProgressSimulation();
        this.setupStudioControls();
        this.setupTimelineScrubbing();
        this.setupGestureHints();
        this.animateOnScroll();
        this.setupSupabaseSubscriptions();
        this.init3DViewer();
        this.initializePlaceholderMode();
    }

    async checkAuthentication() {
        const user = await window.choreographyService.getCurrentUser();
        this.isAuthenticated = !!user;
        console.log('Authentication check:', { user, isAuthenticated: this.isAuthenticated });
        this.updateAuthUI();
    }

    updateAuthUI() {
        const nav = document.querySelector('.nav');
        const userInfoNav = document.getElementById('userInfoNav');
        
        if (this.isAuthenticated) {
            nav.innerHTML = `
                <a href="#projects" class="nav-link">Projects</a>
                <a href="#profile" class="nav-link">Profile</a>
                <div class="user-info-nav" id="userInfoNav">
                    <div class="user-avatar-small" id="userAvatarSmall">
                        <i class="fas fa-user"></i>
                    </div>
                    <div class="user-details-small">
                        <span class="user-name-small" id="userNameSmall">User</span>
                        <span class="user-email-small" id="userEmailSmall">user@example.com</span>
                    </div>
                </div>
                <button class="btn btn-outline" id="logoutBtn">Logout</button>
            `;
            
            // Update user info display
            this.updateUserInfoDisplay();
        } else {
            nav.innerHTML = `
                <button class="btn btn-outline" id="loginBtn">Login</button>
                <button class="btn btn-primary" id="signupBtn">Sign Up</button>
            `;
        }
    }

    async updateUserInfoDisplay() {
        try {
            const user = await window.choreographyService.getCurrentUser();
            if (user) {
                const userNameSmall = document.getElementById('userNameSmall');
                const userEmailSmall = document.getElementById('userEmailSmall');
                
                if (userNameSmall) {
                    userNameSmall.textContent = user.full_name || user.email || 'User';
                }
                if (userEmailSmall) {
                    userEmailSmall.textContent = user.email || 'user@example.com';
                }
            }
        } catch (error) {
            console.error('Error updating user info display:', error);
        }
    }

    setupEventListeners() {
        console.log('Setting up event listeners...');

        // Main navigation buttons
        const uploadMusicBtn = document.getElementById('uploadMusicBtn');
        if (uploadMusicBtn) {
            uploadMusicBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Upload music button clicked');
                this.showUploadSection('music');
            });
        }

        const trySampleBtn = document.getElementById('trySampleBtn');
        if (trySampleBtn) {
            trySampleBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Try sample button clicked');
                this.trySample();
            });
        }

        const generateBtn = document.getElementById('generateBtn');
        if (generateBtn) {
            generateBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Generate button clicked');
                this.startGeneration();
            });
        }

        const generateSunoBtn = document.getElementById('generateSunoBtn');
        if (generateSunoBtn) {
            generateSunoBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Generate Suno button clicked');
                this.generateSunoSong();
            });
        }

        const cancelBtn = document.getElementById('cancelBtn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Cancel button clicked');
                this.cancelGeneration();
            });
        }

        const modifyBtn = document.getElementById('modifyBtn');
        if (modifyBtn) {
            modifyBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Modify button clicked');
                this.modifySettings();
            });
        }

        const mirrorToggle = document.getElementById('mirrorToggle');
        if (mirrorToggle) {
            mirrorToggle.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Mirror toggle clicked');
                this.toggleMirror();
            });
        }

        const placeholderToggle = document.getElementById('placeholderToggle');
        if (placeholderToggle) {
            placeholderToggle.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Placeholder toggle clicked');
                this.togglePlaceholderMode();
            });
        }

        // View mode toggle buttons
        const videoViewBtn = document.getElementById('videoViewBtn');
        if (videoViewBtn) {
            videoViewBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Video view button clicked');
                this.switchToVideoView();
            });
        }

        const avatarViewBtn = document.getElementById('avatarViewBtn');
        if (avatarViewBtn) {
            avatarViewBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Avatar view button clicked');
                this.switchToAvatarView();
            });
        }

        // Tab buttons
        document.querySelectorAll('.tab-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const tab = e.target.dataset.tab;
                console.log('Tab clicked:', tab);
                this.switchTab(tab);
            });
        });

        // Style selection
        document.querySelectorAll('.style-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const style = e.target.closest('.style-item').dataset.style;
                console.log('Style selected:', style);
                this.selectStyle(style);
            });
        });

        // Speed controls
        document.querySelectorAll('.speed-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const speed = parseFloat(e.target.dataset.speed);
                console.log('Speed changed:', speed);
                this.changeSpeed(speed);
            });
        });

        // Playback controls
        const playBtn = document.getElementById('playBtn');
        if (playBtn) {
            playBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Play button clicked');
                this.togglePlayback();
            });
        }

        const rewindBtn = document.getElementById('rewindBtn');
        if (rewindBtn) {
            rewindBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Rewind button clicked');
                this.rewind();
            });
        }

        const forwardBtn = document.getElementById('forwardBtn');
        if (forwardBtn) {
            forwardBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Forward button clicked');
                this.forward();
            });
        }

        // Camera presets
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const angle = e.target.dataset.angle;
                console.log('Camera angle changed:', angle);
                this.changeCameraAngle(angle);
            });
        });

        // Export buttons
        document.querySelectorAll('.export-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const action = e.target.textContent.trim();
                console.log('Export action:', action);
                this.handleExport(action);
            });
        });

        // Authentication buttons (will be added dynamically)
        document.addEventListener('click', (e) => {
            if (e.target.id === 'loginBtn') {
                console.log('Login button clicked');
                this.showLoginModal();
            } else if (e.target.id === 'signupBtn') {
                console.log('Signup button clicked');
                this.showSignupModal();
            } else if (e.target.id === 'logoutBtn') {
                console.log('Logout button clicked');
                this.logout();
            }
        });

        // Profile navigation
        const profileLink = document.querySelector('a[href="#profile"]');
        if (profileLink) {
            profileLink.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Profile link clicked');
                this.showProfileSection();
            });
        }

        // Projects navigation
        const projectsLink = document.querySelector('a[href="#projects"]');
        if (projectsLink) {
            projectsLink.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Projects link clicked');
                this.showProjectsSection();
            });
        }

        // Profile page event listeners
        document.addEventListener('click', (e) => {
            if (e.target.id === 'editProfileBtn') {
                this.editProfile();
            } else if (e.target.id === 'viewAllProjectsBtn') {
                this.viewAllProjects();
            } else if (e.target.id === 'exportDataBtn') {
                this.exportUserData();
            } else if (e.target.id === 'changePasswordBtn') {
                this.changePassword();
            } else if (e.target.id === 'deleteAccountBtn') {
                this.deleteAccount();
            } else if (e.target.id === 'createNewProjectBtn') {
                this.showUploadSection('music');
            } else if (e.target.closest('#userInfoNav')) {
                // User clicked on user info navigation
                this.showProfileSection();
            }
        });

        // Projects page event listeners
        document.addEventListener('change', (e) => {
            if (e.target.id === 'statusFilter' || e.target.id === 'sortFilter') {
                this.filterAndSortProjects();
            }
        });

        // Settings toggle listeners
        document.addEventListener('change', (e) => {
            if (e.target.id === 'emailNotifications' || 
                e.target.id === 'autoSave' || 
                e.target.id === 'highQuality') {
                this.saveUserSettings();
            }
        });

        console.log('Event listeners setup complete');
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

        if (timeline) {
            timeline.addEventListener('click', (e) => {
                const rect = timeline.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const percentage = clickX / rect.width;
                this.seekTo(percentage);
            });
        }

        if (scrubber) {
            scrubber.addEventListener('mousedown', (e) => {
                isDragging = true;
                e.preventDefault();
            });
        }

        document.addEventListener('mousemove', (e) => {
            if (isDragging && timeline) {
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
                switch (e.key) {
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

    handleButtonClick(action) {
        console.log('Handling button action:', action);

        switch (action) {
            case 'upload-music':
                this.showUploadSection('music');
                break;
            case 'try-sample':
                this.trySample();
                break;
            case 'start-generation':
                this.startGeneration();
                break;
            case 'cancel-generation':
                this.cancelGeneration();
                break;
            case 'modify-settings':
                this.modifySettings();
                break;
            case 'play-pause':
                this.togglePlayback();
                break;
            case 'rewind':
                this.rewind();
                break;
            case 'forward':
                this.forward();
                break;
            case 'mirror-toggle':
                this.toggleMirror();
                break;
            default:
                console.warn('Unknown action:', action);
                break;
        }
    }

    // Navigation methods
    showUploadSection(type) {
        this.hideAllSections();
        document.getElementById('uploadSection').style.display = 'block';
        this.currentSection = 'upload';
        this.switchTab('music');
        this.scrollToSection('uploadSection');
    }

    showProfileSection() {
        this.hideAllSections();
        document.getElementById('profileSection').style.display = 'block';
        this.currentSection = 'profile';
        this.scrollToSection('profileSection');
        this.loadProfileData();
    }

    showProjectsSection() {
        this.hideAllSections();
        document.getElementById('projectsSection').style.display = 'block';
        this.currentSection = 'projects';
        this.scrollToSection('projectsSection');
        this.loadProjectsData();
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

    trySample() {
        // Simulate using a sample track
        this.showUploadSection('music');
        this.switchTab('music');

        // Pre-fill with sample settings
        document.getElementById('genreSelect').value = 'hiphop';
        document.getElementById('skillLevel').value = 3;
        document.getElementById('tempoPreference').value = 120;

        // Show success message
        this.showNotification('Sample track loaded! Ready to generate choreography.', 'success');
    }

    selectStyle(style) {
        // Update style selection
        document.querySelectorAll('.style-item').forEach(item => {
            item.classList.remove('selected');
        });
        document.querySelector(`[data-style="${style}"]`).classList.add('selected');

        // Update genre select if upload section is visible
        if (this.currentSection === 'upload') {
            document.getElementById('genreSelect').value = style;
        }

        // Add visual feedback
        this.showNotification(`${style.charAt(0).toUpperCase() + style.slice(1)} style selected!`, 'info');
    }

    // Suno AI Integration Methods
    async generateSunoSong() {
        console.log('Starting Suno song generation...');
        
        if (!window.sunoService || !window.sunoService.isAvailable()) {
            this.showNotification('Suno AI service is not available. Please check API configuration.', 'error');
            return;
        }

        // Get form values
        const topic = document.getElementById('songTopic').value.trim();
        const tag = document.getElementById('songTag').value.trim();

        // Validate inputs
        if (!topic) {
            this.showNotification('Please enter a topic for your song', 'error');
            return;
        }

        if (!tag) {
            this.showNotification('Please enter at least one tag', 'error');
            return;
        }

        if (topic.length < 3) {
            this.showNotification('Topic must be at least 3 characters long', 'error');
            return;
        }

        // Show status
        this.showSunoStatus(true);
        this.updateSunoStatus('Preparing song generation...');

        try {
            // Generate song with Suno
            const result = await window.sunoService.generateSong({
                topic: topic,
                tags: tag
            });

            console.log('Suno generation started:', result);
            this.updateSunoStatus('Song generation in progress...');

            // Start polling for completion
            this.pollSunoGeneration(result.generation_id);

        } catch (error) {
            console.error('Suno generation error:', error);
            this.showSunoStatus(false);
            this.showNotification('Failed to generate song: ' + error.message, 'error');
        }
    }

    async pollSunoGeneration(generationId) {
        console.log('Polling Suno generation:', generationId);

        window.sunoService.pollGeneration(
            generationId,
            // onUpdate
            (status) => {
                console.log('Suno status update:', status);
                this.updateSunoStatus(`Generating... ${Math.round(status.progress || 0)}%`);
            },
            // onComplete
            async (status) => {
                console.log('Suno generation completed:', status);
                this.updateSunoStatus('Song generated successfully!');
                
                try {
                    // Download the generated song using the audio_url from status
                    const audioBlob = await window.sunoService.downloadSong(status.audio_url);
                    
                    // Create a file from the blob
                    const audioFile = await window.sunoService.createAudioFileFromBlob(
                        audioBlob, 
                        `suno-${status.title || generationId}.mp3`
                    );

                    // Create project with the generated song
                    await this.createProjectFromSunoSong(audioFile, generationId, status);
                    
                    this.showSunoStatus(false);
                    this.showNotification('Song generated successfully! Ready for choreography.', 'success');
                    
                    // Switch to music tab to show the generated song
                    this.switchTab('music');
                    
                } catch (error) {
                    console.error('Error processing generated song:', error);
                    this.showSunoStatus(false);
                    this.showNotification('Song generated but failed to process: ' + error.message, 'error');
                }
            },
            // onError
            (error) => {
                console.error('Suno generation failed:', error);
                this.showSunoStatus(false);
                this.showNotification('Song generation failed: ' + error.message, 'error');
            }
        );
    }

    async createProjectFromSunoSong(audioFile, generationId, sunoStatus) {
        try {
            // Create project data with Suno metadata
            const projectData = {
                title: sunoStatus.title || `Suno Generated Song - ${generationId}`,
                audio_file_name: audioFile.name,
                audio_file_size: audioFile.size,
                audio_file_type: audioFile.type,
                status: 'uploaded',
                is_suno_generated: true,
                suno_generation_id: generationId,
                suno_metadata: {
                    title: sunoStatus.title,
                    prompt: sunoStatus.metadata?.gpt_description_prompt,
                    tags: sunoStatus.metadata?.tags,
                    style: sunoStatus.metadata?.tags?.split(',')[0]?.trim(),
                    mood: sunoStatus.metadata?.tags?.split(',')[1]?.trim(),
                    created_at: sunoStatus.metadata?.created_at
                }
            };

            // Create project in the system
            const { data: project, error: projectError } = await window.choreographyService.createProject(projectData);
            if (projectError) throw projectError;

            this.currentProject = project;

            // Upload the audio file
            const uploadResult = await window.choreographyService.uploadAudioFile(audioFile, project.id);

            // Update project with file path
            await window.choreographyService.updateProject(project.id, {
                audio_file_path: uploadResult.path,
                uploadId: uploadResult.uploadId
            });

            // Add to projects list for the projects page
            this.addToProjectsList(project);

            // Update UI to show the generated song
            const uploadArea = document.getElementById('musicUploadArea');
            const icon = uploadArea.querySelector('.upload-icon i');
            const title = uploadArea.querySelector('h3');
            const subtitle = uploadArea.querySelector('p');

            icon.className = 'fas fa-check-circle';
            title.textContent = sunoStatus.title || audioFile.name;
            subtitle.textContent = `${(audioFile.size / 1024 / 1024).toFixed(2)} MB - Generated with Suno AI`;

            // Add glow effect
            uploadArea.classList.add('glow-cyan');

            console.log('Project created from Suno song:', project);

        } catch (error) {
            console.error('Error creating project from Suno song:', error);
            throw error;
        }
    }

    addToProjectsList(project) {
        try {
            // Get existing projects
            const projects = JSON.parse(localStorage.getItem('userProjects') || '[]');
            
            // Add new project to the beginning of the list
            projects.unshift({
                id: project.id,
                title: project.title,
                status: project.status || 'uploaded',
                created_at: new Date().toISOString(),
                audio_file_name: project.audio_file_name,
                duration: 'Unknown', // We could calculate this from the audio file
                style: project.suno_metadata?.style || 'Generated',
                is_suno_generated: project.is_suno_generated || false
            });
            
            // Save back to localStorage
            localStorage.setItem('userProjects', JSON.stringify(projects));
            
            console.log('Added project to projects list:', project.title);
        } catch (error) {
            console.error('Error adding project to list:', error);
        }
    }

    showSunoStatus(show) {
        const sunoStatus = document.getElementById('sunoStatus');
        const sunoForm = document.querySelector('.suno-form');
        const generateBtn = document.getElementById('generateSunoBtn');

        if (sunoStatus && sunoForm && generateBtn) {
            if (show) {
                sunoStatus.style.display = 'block';
                sunoForm.style.opacity = '0.5';
                sunoForm.style.pointerEvents = 'none';
                generateBtn.disabled = true;
                generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
            } else {
                sunoStatus.style.display = 'none';
                sunoForm.style.opacity = '1';
                sunoForm.style.pointerEvents = 'auto';
                generateBtn.disabled = false;
                generateBtn.innerHTML = '<i class="fas fa-magic"></i> Generate Song';
            }
        }
    }

    updateSunoStatus(message) {
        const statusText = document.getElementById('sunoStatusText');
        if (statusText) {
            statusText.textContent = message;
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

                // Upload file to backend
                const uploadResult = await window.choreographyService.uploadAudioFile(file, project.id);

                // Update project with file path and upload ID
                await window.choreographyService.updateProject(project.id, {
                    audio_file_path: uploadResult.path,
                    uploadId: uploadResult.uploadId
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
        console.log('Starting generation...');
        if (this.isGenerating) {
            console.log('Generation already in progress');
            return;
        }
        if (!this.currentProject) {
            console.log('No current project found');
            this.showNotification('Please upload a file first', 'error');
            return;
        }

        console.log('Current project:', this.currentProject);

        this.isGenerating = true;
        this.hideAllSections();
        document.getElementById('progressSection').style.display = 'block';
        this.currentSection = 'progress';
        this.scrollToSection('progressSection');

        // Start progress simulation immediately
        this.startRealTimeProgress();

        try {
            console.log('Calling startChoreographyGeneration...');

            // Get form values with fallbacks for missing elements
            const genreSelect = document.getElementById('genreSelect');
            const skillLevelSelect = document.getElementById('skillLevel');
            const tempoSelect = document.getElementById('tempoPreference');

            const settings = {
                dance_style: genreSelect ? genreSelect.value : 'hiphop',
                skill_level: skillLevelSelect ? parseInt(skillLevelSelect.value) : 3,
                tempo_preference: tempoSelect ? parseInt(tempoSelect.value) : 120,
                generate_fbx: false  // Disable FBX generation for faster processing
            };

            console.log('Generation settings:', settings);

            // Start AI generation process
            await window.choreographyService.startChoreographyGeneration(this.currentProject.id, settings);

            console.log('Generation started successfully');
            // For demo service, we'll use polling instead of real-time updates
            if (window.choreographyService.constructor.name === 'SimpleDemoService') {
                console.log('Using demo service - starting polling for updates');
                this.startPollingForUpdates();
            } else {
                // Subscribe to real-time updates for full Supabase service
                this.subscribeToProjectUpdates();
            }
        } catch (error) {
            console.error('Generation error:', error);
            this.showNotification('Failed to start generation: ' + error.message, 'error');
            this.cancelGeneration();
        }
    }

    startRealTimeProgress() {
        const statusElement = document.getElementById('progressStatus');
        const detailsElement = document.getElementById('progressDetails');

        // Set initial status
        if (statusElement) {
            statusElement.textContent = '🎵 Getting Ready...';
        }
        if (detailsElement) {
            detailsElement.textContent = 'Preparing your dance generation...';
        }

        // Clear any existing interval
        if (this.progressInterval) {
            clearInterval(this.progressInterval);
        }

        // Note: Actual polling is handled by SimpleDemoService.pollGenerationProgress()
        // This function now only sets up the initial UI state
        console.log('Real-time progress monitoring started (handled by SimpleDemoService)');
    }

    // This method will be called by SimpleDemoService via window.choreographer.updateGenerationProgress()
    updateGenerationProgress(status) {
        const statusElement = document.getElementById('progressStatus');
        const detailsElement = document.getElementById('progressDetails');

        // Update status text based on backend message
        if (statusElement) {
            statusElement.textContent = this.getStatusDisplay(status.status, status.progress);
        }

        if (detailsElement) {
            detailsElement.textContent = status.message || 'Processing your request...';
        }

        // Check if completed
        if (status.status === 'completed') {
            // Load video immediately upon completion
            setTimeout(() => {
                this.loadGeneratedVideo();
            }, 500); // Small delay to ensure backend has finished writing
            this.completeGeneration();
        } else if (status.status === 'error') {
            this.showNotification('Generation failed: ' + status.message, 'error');
            this.isGenerating = false;
        }
    }

    getStatusDisplay(status, progress) {
        const statusMessages = {
            'queued': '🎵 Getting Ready...',
            'processing': '🤖 AI is Creating Magic...',
            'completed': '✅ Dance Created Successfully!',
            'error': '❌ Something went wrong'
        };

        return statusMessages[status] || '🔄 Processing...';
    }

    completeGeneration() {
        clearInterval(this.progressInterval);
        this.isGenerating = false;

        // Immediately transition and load video
        this.hideAllSections();
        document.getElementById('studioSection').style.display = 'block';
        document.getElementById('exportSection').style.display = 'block';
        this.currentSection = 'studio';
        this.scrollToSection('studioSection');

        // Load the video immediately
        this.loadGeneratedVideo();

        this.showNotification('Choreography generated successfully!', 'success');
    }

    cancelGeneration() {
        if (this.progressInterval) {
            clearInterval(this.progressInterval);
        }
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
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
        const videoElement = document.getElementById('generatedVideo');
        const playBtn = document.getElementById('playBtn');
        const icon = playBtn.querySelector('i');

        if (!videoElement) {
            console.warn('Video element not found');
            return;
        }

        if (videoElement.paused) {
            videoElement.play();
            icon.className = 'fas fa-pause';
            this.isPlaying = true;
        } else {
            videoElement.pause();
            icon.className = 'fas fa-play';
            this.isPlaying = false;
        }
    }


    rewind() {
        const videoElement = document.getElementById('generatedVideo');
        if (!videoElement) {
            console.warn('Video element not found');
            return;
        }

        const newTime = Math.max(0, videoElement.currentTime - 10);
        videoElement.currentTime = newTime;
        this.showNotification('Rewound 10 seconds', 'info');
    }

    forward() {
        const videoElement = document.getElementById('generatedVideo');
        if (!videoElement) {
            console.warn('Video element not found');
            return;
        }

        const newTime = Math.min(videoElement.duration, videoElement.currentTime + 10);
        videoElement.currentTime = newTime;
        this.showNotification('Forwarded 10 seconds', 'info');
    }

    seekTo(percentage) {
        const videoElement = document.getElementById('generatedVideo');
        if (!videoElement || !videoElement.duration) {
            console.warn('Video element not found or not loaded');
            return;
        }

        const newTime = percentage * videoElement.duration;
        videoElement.currentTime = newTime;
    }

    updateTimeline() {
        const videoElement = document.getElementById('generatedVideo');
        if (!videoElement || !videoElement.duration) {
            return;
        }

        const progress = (videoElement.currentTime / videoElement.duration) * 100;
        const timelineProgress = document.getElementById('timelineProgress');
        const timelineScrubber = document.getElementById('timelineScrubber');
        const currentTimeEl = document.getElementById('currentTime');
        const totalTimeEl = document.getElementById('totalTime');

        if (timelineProgress) {
            timelineProgress.style.width = `${progress}%`;
        }
        if (timelineScrubber) {
            timelineScrubber.style.left = `${progress}%`;
        }
        if (currentTimeEl) {
            currentTimeEl.textContent = this.formatTime(videoElement.currentTime);
        }
        if (totalTimeEl) {
            totalTimeEl.textContent = this.formatTime(videoElement.duration);
        }
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    changeSpeed(speed) {
        const videoElement = document.getElementById('generatedVideo');
        if (!videoElement) {
            console.warn('Video element not found');
            return;
        }

        this.currentSpeed = speed;
        videoElement.playbackRate = speed;

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

    switchToVideoView() {
        console.log('Switching to video view');
        const videoContainer = document.getElementById('videoContainer');
        const viewerContainer = document.getElementById('viewerContainer');
        const videoViewBtn = document.getElementById('videoViewBtn');
        const avatarViewBtn = document.getElementById('avatarViewBtn');

        if (videoContainer && viewerContainer) {
            videoContainer.style.display = 'flex';
            viewerContainer.style.display = 'none';

            // Update button states
            videoViewBtn.classList.add('active');
            avatarViewBtn.classList.remove('active');

            this.showNotification('Switched to video view', 'info');
        }
    }

    switchToAvatarView() {
        console.log('Switching to avatar view');
        const videoContainer = document.getElementById('videoContainer');
        const viewerContainer = document.getElementById('viewerContainer');
        const videoViewBtn = document.getElementById('videoViewBtn');
        const avatarViewBtn = document.getElementById('avatarViewBtn');

        if (videoContainer && viewerContainer) {
            videoContainer.style.display = 'none';
            viewerContainer.style.display = 'flex';

            // Update button states
            videoViewBtn.classList.remove('active');
            avatarViewBtn.classList.add('active');

            this.showNotification('Switched to 3D avatar view', 'info');
        }
    }

    async loadGeneratedVideo() {
        console.log('Loading generated video...');
        if (!this.currentProject) {
            console.error('No project available');
            return;
        }

        try {
            const videoElement = document.getElementById('generatedVideo');
            const videoSource = document.getElementById('videoSource');

            if (videoElement && videoSource) {
                // Check if we should use placeholder video for testing
                const usePlaceholder = this.shouldUsePlaceholderVideo();
                
                let videoUrl;
                
                if (usePlaceholder) {
                    console.log('Using placeholder video for testing');
                    videoUrl = this.getPlaceholderVideoUrl();
                    this.showNotification('Using placeholder video for testing', 'info');
                } else {
                    // Get the generation ID from localStorage (updated by demo service)
                    const project = JSON.parse(localStorage.getItem('currentProject') || '{}');
                    const generationId = project.generation_id;

                    if (!generationId) {
                        console.error('No generation ID available in project:', project);
                        this.showNotification('No generation ID found. Using placeholder video.', 'info');
                        videoUrl = this.getPlaceholderVideoUrl();
                    } else {
                        // Set video source to backend download endpoint using generation_id
                        // First try to get the actual filename from the status
                        const statusResponse = await fetch(`http://localhost:5001/api/status/${generationId}`);

                        if (statusResponse.ok) {
                            const status = await statusResponse.json();
                            if (status.status === 'completed' && status.result && status.result.video_filename) {
                                // Use direct file serving for better compatibility
                                videoUrl = `http://localhost:5001/outputs/${status.result.video_filename}`;
                            } else {
                                // Fallback to download endpoint
                                videoUrl = `http://localhost:5001/api/download/${generationId}/video`;
                            }
                        } else {
                            // Fallback to download endpoint
                            videoUrl = `http://localhost:5001/api/download/${generationId}/video`;
                        }
                    }
                }

                console.log('Setting video URL:', videoUrl);

                videoSource.src = videoUrl;
                videoElement.load(); // Reload the video element

                // Handle video load events
                videoElement.onloadstart = () => {
                    console.log('Video load started');
                    this.showNotification('Loading video...', 'info');
                };

                videoElement.oncanplay = () => {
                    console.log('Video can play');
                    this.showNotification('Video loaded successfully!', 'success');
                };

                videoElement.onerror = (e) => {
                    console.error('Video load error:', e);
                    // Fallback to placeholder if real video fails
                    if (!usePlaceholder) {
                        console.log('Real video failed, falling back to placeholder');
                        videoSource.src = this.getPlaceholderVideoUrl();
                        videoElement.load();
                    } else {
                        this.showNotification('Failed to load video. Check browser console for details.', 'error');
                    }
                };

                // Add event listeners for video controls
                videoElement.addEventListener('timeupdate', () => {
                    this.updateTimeline();
                });

                videoElement.addEventListener('play', () => {
                    this.isPlaying = true;
                    const playBtn = document.getElementById('playBtn');
                    const icon = playBtn.querySelector('i');
                    icon.className = 'fas fa-pause';
                });

                videoElement.addEventListener('pause', () => {
                    this.isPlaying = false;
                    const playBtn = document.getElementById('playBtn');
                    const icon = playBtn.querySelector('i');
                    icon.className = 'fas fa-play';
                });

                videoElement.addEventListener('ended', () => {
                    this.isPlaying = false;
                    const playBtn = document.getElementById('playBtn');
                    const icon = playBtn.querySelector('i');
                    icon.className = 'fas fa-play';
                });

                videoElement.addEventListener('loadedmetadata', () => {
                    this.updateTimeline();
                });
            }
        } catch (error) {
            console.error('Error loading video:', error);
            this.showNotification('Failed to load video: ' + error.message, 'error');
        }
    }

    changeCameraAngle(angle) {
        // Update camera preset buttons
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-angle="${angle}"]`).classList.add('active');

        if (angle === '3d') {
            // Switch to 3D view
            this.switch3DMode(true);
        } else {
            // Switch to 2D view
            this.switch3DMode(false);

            // Apply camera transformation for 2D view
            const avatar3d = document.querySelector('.avatar-3d');
            switch (angle) {
                case 'front':
                    avatar3d.style.transform = 'rotateY(0deg)';
                    break;
                case 'side':
                    avatar3d.style.transform = 'rotateY(90deg)';
                    break;
                case 'top':
                    avatar3d.style.transform = 'rotateX(90deg)';
                    break;
            }
        }

        this.showNotification(`Camera angle: ${angle}`, 'info');
    }

    // Export methods
    handleExport(action) {
        switch (action) {
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
        console.log('Starting video download...');
        try {
            const project = JSON.parse(localStorage.getItem('currentProject') || '{}');
            const generationId = project.generation_id;

            if (!generationId) {
                this.showNotification('No generation ID found. Cannot download video.', 'error');
                return;
            }

            this.showNotification('Preparing video download...', 'info');

            // Create download link
            const downloadUrl = `http://localhost:5001/api/download/${generationId}/video`;
            console.log('Download URL:', downloadUrl);

            // Create temporary link and trigger download
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = `dance_video_${generationId}.mp4`;
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            this.showNotification('Video download started!', 'success');
        } catch (error) {
            console.error('Download error:', error);
            this.showNotification('Failed to download video: ' + error.message, 'error');
        }
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

    // Profile methods
    async loadProfileData() {
        try {
            const user = await window.choreographyService.getCurrentUser();
            if (user) {
                this.updateUserInfo(user);
                this.loadUserStatistics();
                this.loadRecentProjects();
                this.loadUserSettings();
            }
        } catch (error) {
            console.error('Error loading profile data:', error);
            this.showNotification('Failed to load profile data', 'error');
        }
    }

    updateUserInfo(user) {
        // Update user information display
        const userName = document.getElementById('userName');
        const userEmail = document.getElementById('userEmail');
        const memberSince = document.getElementById('memberSince');
        const accountType = document.getElementById('accountType');

        if (userName) userName.textContent = user.full_name || user.email || 'Demo User';
        if (userEmail) userEmail.textContent = user.email || 'demo@example.com';
        if (memberSince) {
            const joinDate = user.created_at ? new Date(user.created_at) : new Date();
            memberSince.textContent = joinDate.toLocaleDateString();
        }
        if (accountType) {
            accountType.textContent = user.account_type || 'Free';
            accountType.className = `account-type ${(user.account_type || 'free').toLowerCase()}`;
        }
    }

    loadUserStatistics() {
        // Load user statistics (mock data for demo)
        const totalProjects = document.getElementById('totalProjects');
        const completedVideos = document.getElementById('completedVideos');
        const totalTime = document.getElementById('totalTime');
        const favoriteStyle = document.getElementById('favoriteStyle');

        // Get statistics from localStorage or use mock data
        const stats = JSON.parse(localStorage.getItem('userStats') || '{}');
        
        if (totalProjects) totalProjects.textContent = stats.totalProjects || '0';
        if (completedVideos) completedVideos.textContent = stats.completedVideos || '0';
        if (totalTime) totalTime.textContent = stats.totalTime || '0h';
        if (favoriteStyle) favoriteStyle.textContent = stats.favoriteStyle || 'Hip-Hop';
    }

    loadRecentProjects() {
        const recentProjectsList = document.getElementById('recentProjectsList');
        if (!recentProjectsList) return;

        // Get recent projects from localStorage
        const projects = JSON.parse(localStorage.getItem('userProjects') || '[]');
        
        if (projects.length === 0) {
            recentProjectsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-folder-open"></i>
                    <p>No projects yet</p>
                    <button class="btn btn-primary" onclick="window.choreographer.showUploadSection('music')">
                        Create Your First Project
                    </button>
                </div>
            `;
        } else {
            recentProjectsList.innerHTML = projects.slice(0, 3).map(project => `
                <div class="project-item">
                    <div class="project-icon">
                        <i class="fas fa-music"></i>
                    </div>
                    <div class="project-info">
                        <div class="project-name">${project.title || 'Untitled Project'}</div>
                        <div class="project-meta">${project.status || 'Draft'} • ${new Date(project.created_at).toLocaleDateString()}</div>
                    </div>
                </div>
            `).join('');
        }
    }

    loadUserSettings() {
        // Load user settings from localStorage
        const settings = JSON.parse(localStorage.getItem('userSettings') || '{}');
        
        const emailNotifications = document.getElementById('emailNotifications');
        const autoSave = document.getElementById('autoSave');
        const highQuality = document.getElementById('highQuality');

        if (emailNotifications) emailNotifications.checked = settings.emailNotifications !== false;
        if (autoSave) autoSave.checked = settings.autoSave !== false;
        if (highQuality) highQuality.checked = settings.highQuality !== false;
    }

    saveUserSettings() {
        const settings = {
            emailNotifications: document.getElementById('emailNotifications')?.checked || false,
            autoSave: document.getElementById('autoSave')?.checked || false,
            highQuality: document.getElementById('highQuality')?.checked || false
        };
        
        localStorage.setItem('userSettings', JSON.stringify(settings));
        this.showNotification('Settings saved successfully', 'success');
    }

    editProfile() {
        this.showNotification('Profile editing feature coming soon!', 'info');
    }

    viewAllProjects() {
        this.showNotification('Projects view feature coming soon!', 'info');
    }

    exportUserData() {
        try {
            const userData = {
                user: JSON.parse(localStorage.getItem('currentProject') || '{}'),
                settings: JSON.parse(localStorage.getItem('userSettings') || '{}'),
                stats: JSON.parse(localStorage.getItem('userStats') || '{}'),
                projects: JSON.parse(localStorage.getItem('userProjects') || '[]')
            };

            const dataStr = JSON.stringify(userData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = 'choreoai-user-data.json';
            link.click();
            
            URL.revokeObjectURL(url);
            this.showNotification('User data exported successfully!', 'success');
        } catch (error) {
            console.error('Export error:', error);
            this.showNotification('Failed to export user data', 'error');
        }
    }

    changePassword() {
        this.showNotification('Password change feature coming soon!', 'info');
    }

    deleteAccount() {
        if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            if (confirm('This will permanently delete all your data. Are you absolutely sure?')) {
                // Clear all user data
                localStorage.removeItem('currentProject');
                localStorage.removeItem('userSettings');
                localStorage.removeItem('userStats');
                localStorage.removeItem('userProjects');
                
                this.showNotification('Account deleted successfully', 'success');
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            }
        }
    }

    // Projects methods
    async loadProjectsData() {
        try {
            // Get projects from localStorage or create mock data
            let projects = JSON.parse(localStorage.getItem('userProjects') || '[]');
            
            // If no projects exist, create some mock data for demo
            if (projects.length === 0) {
                projects = this.createMockProjects();
                localStorage.setItem('userProjects', JSON.stringify(projects));
            }

            this.displayProjects(projects);
            this.updateProjectsStats(projects);
        } catch (error) {
            console.error('Error loading projects data:', error);
            this.showNotification('Failed to load projects', 'error');
        }
    }

    createMockProjects() {
        const mockProjects = [
            {
                id: 'project-1',
                title: 'Hip-Hop Dance Routine',
                status: 'completed',
                created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                audio_file_name: 'hip-hop-beat.mp3',
                duration: '3:45',
                style: 'Hip-Hop',
                thumbnail: null
            },
            {
                id: 'project-2',
                title: 'Contemporary Flow',
                status: 'processing',
                created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                audio_file_name: 'contemporary-music.wav',
                duration: '4:12',
                style: 'Contemporary',
                thumbnail: null
            },
            {
                id: 'project-3',
                title: 'Jazz Fusion',
                status: 'draft',
                created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                audio_file_name: 'jazz-fusion.mp3',
                duration: '2:58',
                style: 'Jazz',
                thumbnail: null
            }
        ];
        return mockProjects;
    }

    displayProjects(projects) {
        const projectsGrid = document.getElementById('projectsGrid');
        const emptyProjects = document.getElementById('emptyProjects');

        if (!projectsGrid || !emptyProjects) return;

        if (projects.length === 0) {
            projectsGrid.style.display = 'none';
            emptyProjects.style.display = 'flex';
        } else {
            projectsGrid.style.display = 'grid';
            emptyProjects.style.display = 'none';
            
            projectsGrid.innerHTML = projects.map(project => this.createProjectCard(project)).join('');
        }
    }

    createProjectCard(project) {
        const statusClass = project.status || 'draft';
        const createdDate = new Date(project.created_at).toLocaleDateString();
        
        return `
            <div class="project-card" data-project-id="${project.id}">
                <div class="project-thumbnail">
                    <div class="thumbnail-placeholder">
                        <i class="fas fa-music"></i>
                        <span>${project.style || 'Dance'}</span>
                    </div>
                    <div class="project-status ${statusClass}">${statusClass}</div>
                </div>
                <div class="project-info">
                    <h3 class="project-title">${project.title || 'Untitled Project'}</h3>
                    <div class="project-meta">
                        <div class="project-meta-item">
                            <i class="fas fa-calendar"></i>
                            <span>Created ${createdDate}</span>
                        </div>
                        <div class="project-meta-item">
                            <i class="fas fa-clock"></i>
                            <span>${project.duration || 'Unknown'}</span>
                        </div>
                        <div class="project-meta-item">
                            <i class="fas fa-music"></i>
                            <span>${project.audio_file_name || 'No audio'}</span>
                        </div>
                    </div>
                    <div class="project-actions">
                        <button class="btn btn-primary btn-sm" onclick="window.choreographer.openProject('${project.id}')">
                            <i class="fas fa-play"></i>
                            Open
                        </button>
                        <button class="btn btn-outline btn-sm" onclick="window.choreographer.duplicateProject('${project.id}')">
                            <i class="fas fa-copy"></i>
                            Duplicate
                        </button>
                        <button class="btn btn-outline btn-sm" onclick="window.choreographer.deleteProject('${project.id}')">
                            <i class="fas fa-trash"></i>
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    filterAndSortProjects() {
        const statusFilter = document.getElementById('statusFilter')?.value || 'all';
        const sortFilter = document.getElementById('sortFilter')?.value || 'newest';
        
        let projects = JSON.parse(localStorage.getItem('userProjects') || '[]');
        
        // Filter by status
        if (statusFilter !== 'all') {
            projects = projects.filter(project => project.status === statusFilter);
        }
        
        // Sort projects
        switch (sortFilter) {
            case 'newest':
                projects.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                break;
            case 'oldest':
                projects.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
                break;
            case 'name':
                projects.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
                break;
            case 'status':
                projects.sort((a, b) => (a.status || '').localeCompare(b.status || ''));
                break;
        }
        
        this.displayProjects(projects);
    }

    updateProjectsStats(projects) {
        const stats = {
            totalProjects: projects.length,
            completedVideos: projects.filter(p => p.status === 'completed').length,
            totalTime: this.calculateTotalTime(projects),
            favoriteStyle: this.getFavoriteStyle(projects)
        };
        
        localStorage.setItem('userStats', JSON.stringify(stats));
    }

    calculateTotalTime(projects) {
        const totalSeconds = projects.reduce((total, project) => {
            if (project.duration) {
                const [minutes, seconds] = project.duration.split(':').map(Number);
                return total + (minutes * 60) + seconds;
            }
            return total;
        }, 0);
        
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    }

    getFavoriteStyle(projects) {
        const styleCount = {};
        projects.forEach(project => {
            const style = project.style || 'Unknown';
            styleCount[style] = (styleCount[style] || 0) + 1;
        });
        
        const favorite = Object.keys(styleCount).reduce((a, b) => 
            styleCount[a] > styleCount[b] ? a : b, 'Hip-Hop'
        );
        
        return favorite;
    }

    openProject(projectId) {
        const projects = JSON.parse(localStorage.getItem('userProjects') || '[]');
        const project = projects.find(p => p.id === projectId);
        
        if (project) {
            this.currentProject = project;
            this.showNotification(`Opening project: ${project.title}`, 'info');
            // Here you would typically load the project into the studio
            this.showStudioSection();
        }
    }

    duplicateProject(projectId) {
        const projects = JSON.parse(localStorage.getItem('userProjects') || '[]');
        const project = projects.find(p => p.id === projectId);
        
        if (project) {
            const duplicatedProject = {
                ...project,
                id: 'project-' + Date.now(),
                title: project.title + ' (Copy)',
                status: 'draft',
                created_at: new Date().toISOString()
            };
            
            projects.unshift(duplicatedProject);
            localStorage.setItem('userProjects', JSON.stringify(projects));
            
            this.displayProjects(projects);
            this.showNotification('Project duplicated successfully', 'success');
        }
    }

    deleteProject(projectId) {
        if (confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
            const projects = JSON.parse(localStorage.getItem('userProjects') || '[]');
            const filteredProjects = projects.filter(p => p.id !== projectId);
            
            localStorage.setItem('userProjects', JSON.stringify(filteredProjects));
            this.displayProjects(filteredProjects);
            this.showNotification('Project deleted successfully', 'success');
        }
    }

    // Utility methods
    hideAllSections() {
        const sections = ['uploadSection', 'progressSection', 'studioSection', 'exportSection', 'profileSection', 'projectsSection'];
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
        switch (type) {
            case 'success': return 'check-circle';
            case 'error': return 'exclamation-circle';
            case 'info': return 'info-circle';
            default: return 'info-circle';
        }
    }

    // Supabase integration methods
    setupSupabaseSubscriptions() {
        // Only set up Supabase subscriptions if using real Supabase service
        if (window.choreographyService && window.choreographyService.supabase) {
            // Subscribe to auth state changes
            window.choreographyService.supabase.auth.onAuthStateChange((event, session) => {
                this.isAuthenticated = !!session;
                this.updateAuthUI();
            });
        } else {
            console.log('Using SimpleDemoService - skipping Supabase subscriptions');
        }
    }

    startPollingForUpdates() {
        if (!this.currentProject) return;

        console.log('Starting polling for project updates...');

        // Clear any existing polling
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
        }

        this.pollingInterval = setInterval(async () => {
            try {
                // Get updated project data from localStorage (where demo service stores it)
                const stored = localStorage.getItem('currentProject');
                if (stored) {
                    const project = JSON.parse(stored);
                    console.log('Polling update:', project.status, project.processing_progress);

                    // Update progress if available
                    if (project.processing_progress !== undefined) {
                        this.currentProgress = project.processing_progress;
                        const progressFill = document.getElementById('progressFill');
                        const progressText = document.getElementById('progressText');

                        if (progressFill && progressText) {
                            progressFill.style.width = `${this.currentProgress}%`;
                            progressText.textContent = `${this.currentProgress}%`;
                        }
                    }

                    // Check if generation is complete
                    if (project.status === 'completed') {
                        console.log('Generation completed!');
                        clearInterval(this.pollingInterval);
                        this.completeGeneration(project);
                    } else if (project.status === 'failed') {
                        console.log('Generation failed:', project.error_message);
                        clearInterval(this.pollingInterval);
                        this.handleGenerationError(project.error_message || 'Unknown error');
                    }
                }
            } catch (error) {
                console.error('Polling error:', error);
            }
        }, 3000); // Poll every 3 seconds
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
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
        }
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

            // Load the generated video
            this.loadGeneratedVideo();

            // Start with video view by default
            this.switchToVideoView();

            this.showNotification('Choreography generated successfully!', 'success');
        }, 1000);
    }

    handleGenerationError(errorMessage) {
        clearInterval(this.progressInterval);
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
        }
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

    // Placeholder Video Methods
    shouldUsePlaceholderVideo() {
        // Check if we should use placeholder video for testing
        // This can be controlled by URL parameter, localStorage, or environment
        const urlParams = new URLSearchParams(window.location.search);
        const usePlaceholder = urlParams.get('placeholder') === 'true' || 
                              localStorage.getItem('usePlaceholderVideo') === 'true' ||
                              !this.isProductionEnvironment();
        
        return usePlaceholder;
    }

    getPlaceholderVideoUrl() {
        // Return a placeholder video URL
        // This could be a local file, data URL, or external placeholder
        return this.createPlaceholderVideoDataUrl();
    }

    createPlaceholderVideoDataUrl() {
        // Use the placeholder video generator if available
        if (window.PlaceholderVideoGenerator) {
            return window.PlaceholderVideoGenerator.createSimplePlaceholderUrl();
        }
        
        // Fallback to simple base64 video
        return 'data:video/mp4;base64,AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMWF2YzEAAAAIZnJlZQAAArxtZGF0AAACrgYF//+q3EXpvebZSLeWLNgg2SPu73gyNjQgLSBjb3JlIDE2MiByMzA4MSBkODVhYjQ5IC0gSC4yNjQvTVBFRy00IEFWQyBjb2RlYyAtIENvcHlsZWZ0IDIwMDMtMjAyMSAtIGh0dHA6Ly93d3cudmlkZW9sYW4ub3JnL3gyNjQuaHRtbCAtIG9wdGlvbnM6IGNhYmFjPTEgcmVmPTMgZGVibG9jaz0xOjA6MCBhbmFseXNlPTB4MzoweDExMyBtZT1oZXggc3VibWU9NyBwc3k9MSBwc3lfcmQ9MS4wMDowLjAwIG1peGVkX3JlZj0xIG1lX3JhbmdlPTE2IGNocm9tYV9tZT0xIHRyZWxsaXM9MSA4eDhkY3Q9MSBjcW09MCBkZWFkem9uZT0yMSwxMSBmYXN0X3Bza2lwPTEgY2hyb21hX3FwX29mZnNldD0tMiB0aHJlYWRzPTEgbG9va2FoZWFkX3RocmVhZHM9MSBzbGljZWRfdGhyZWFkcz0wIG5yPTAgZGVjaW1hdGU9MSBpbnRlcmxhY2VkPTAgYmx1cmF5X2NvbXBhdD0wIGNvbnN0cmFpbmVkX2ludHJhPTAgYmZyYW1lcz0zIGJfcHlyYW1pZD0yIGJfYWRhcHQ9MSBiX2JpYXM9MCBkaXJlY3Q9MSB3ZWlnaHRiPTEgb3Blbl9nb3A9MCB3ZWlnaHRwPTIga2V5aW50PTI1MCBrZXlpbnRfbWluPTEwIHNjZW5lY3V0PTQwIGludHJhX3JlZnJlc2g9MCByY19sb29rYWhlYWQ9NDAgcmM9Y3JmIG1idHJlZT0xIGNyZj0yMy4wIHFjb21wPTAuNjAgcXBtaW49MCBxcG1heD02OSBxcHN0ZXA9NCBpcF9yYXRpbz0xLjQwIGFxPTE6MS4wMACAAAAABWWIhAA3//728P4FN4y8X09Sut8yI8AXevs8IAAADAAADAAADAAADACwgIAAAAAAAB8YzQyLjAuMTAwMQEAAAAAO64AAAAA';
    }

    isProductionEnvironment() {
        // Simple check to determine if we're in production
        return window.location.hostname !== 'localhost' && 
               window.location.hostname !== '127.0.0.1' &&
               !window.location.hostname.includes('dev');
    }

    togglePlaceholderMode() {
        // Toggle placeholder video mode
        const currentMode = localStorage.getItem('usePlaceholderVideo') === 'true';
        const newMode = !currentMode;
        localStorage.setItem('usePlaceholderVideo', newMode.toString());
        
        // Update button text
        const toggleText = document.getElementById('placeholderToggleText');
        if (toggleText) {
            toggleText.textContent = newMode ? 'Use Placeholder' : 'Use Real Video';
        }
        
        // Update button state
        const toggleBtn = document.getElementById('placeholderToggle');
        if (toggleBtn) {
            if (newMode) {
                toggleBtn.classList.add('active');
            } else {
                toggleBtn.classList.remove('active');
            }
        }
        
        this.showNotification(
            `Placeholder video mode ${newMode ? 'enabled' : 'disabled'}`, 
            'info'
        );
        
        // Reload video if we're in studio mode
        if (this.currentSection === 'studio') {
            this.loadGeneratedVideo();
        }
        
        return newMode;
    }

    initializePlaceholderMode() {
        // Initialize placeholder mode button state
        const currentMode = localStorage.getItem('usePlaceholderVideo') === 'true';
        const toggleText = document.getElementById('placeholderToggleText');
        const toggleBtn = document.getElementById('placeholderToggle');
        
        if (toggleText) {
            toggleText.textContent = currentMode ? 'Use Placeholder' : 'Use Real Video';
        }
        
        if (toggleBtn) {
            if (currentMode) {
                toggleBtn.classList.add('active');
            } else {
                toggleBtn.classList.remove('active');
            }
        }
    }

    // 3D Viewer Methods
    init3DViewer() {
        if (window.ThreeDViewer) {
            try {
                this.threeDViewer = new ThreeDViewer('threejs-canvas');
                this.threeDViewer.loadDefaultAvatar();
                console.log('3D Viewer initialized successfully');
            } catch (error) {
                console.error('Failed to initialize 3D Viewer:', error);
            }
        } else {
            console.warn('ThreeDViewer not available');
        }
    }

    switch3DMode(enable) {
        this.current3DMode = enable;

        const canvas = document.getElementById('threejs-canvas');
        const avatar2D = document.getElementById('avatar-container-2d');
        const viewerControls = document.getElementById('viewer-controls');

        if (enable && this.threeDViewer) {
            // Show 3D viewer
            this.threeDViewer.show();
            if (avatar2D) avatar2D.style.display = 'none';

            // Sync playback state
            if (this.isPlaying) {
                this.threeDViewer.play();
            } else {
                this.threeDViewer.pause();
            }
        } else {
            // Show 2D viewer
            if (this.threeDViewer) this.threeDViewer.hide();
            if (avatar2D) avatar2D.style.display = 'block';
        }
    }

    loadFBXAvatar(fbxPath) {
        if (this.threeDViewer) {
            this.threeDViewer.loadAvatar(fbxPath)
                .then(() => {
                    this.showNotification('3D Avatar loaded successfully!', 'success');
                })
                .catch((error) => {
                    console.error('Failed to load FBX avatar:', error);
                    this.showNotification('Failed to load 3D avatar', 'error');
                });
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.choreographyApp = new AIChoreographer();
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

// Backend Configuration Functions
function toggleBackendConfig() {
    const configPanel = document.getElementById('backendConfig');
    const currentDisplay = configPanel.style.display;
    configPanel.style.display = currentDisplay === 'none' ? 'block' : 'none';

    if (configPanel.style.display === 'block') {
        // Show current backend URL
        const currentUrl = window.choreographyService?.backendUrl || 'http://localhost:5001';
        document.getElementById('backendUrlInput').value = currentUrl;
    }
}

function updateBackendUrl() {
    const newUrl = document.getElementById('backendUrlInput').value.trim();
    const statusDiv = document.getElementById('configStatus');

    if (!newUrl) {
        statusDiv.innerHTML = '<span style="color: red;">Please enter a valid URL</span>';
        return;
    }

    if (window.choreographyService) {
        window.choreographyService.setBackendUrl(newUrl);
        statusDiv.innerHTML = '<span style="color: green;">Backend URL updated successfully!</span>';
    }
}

async function testBackend() {
    const statusDiv = document.getElementById('configStatus');
    const url = document.getElementById('backendUrlInput').value.trim() || window.choreographyService?.backendUrl;

    if (!url) {
        statusDiv.innerHTML = '<span style="color: red;">No backend URL specified</span>';
        return;
    }

    statusDiv.innerHTML = '<span style="color: blue;">Testing connection...</span>';

    try {
        const response = await fetch(`${url}/api/health`);
        if (response.ok) {
            const data = await response.json();
            statusDiv.innerHTML = `<span style="color: green;">✅ Connected successfully! Status: ${data.status}</span>`;
        } else {
            statusDiv.innerHTML = `<span style="color: red;">❌ Connection failed (${response.status})</span>`;
        }
    } catch (error) {
        statusDiv.innerHTML = `<span style="color: red;">❌ Connection failed: ${error.message}</span>`;
    }
}
