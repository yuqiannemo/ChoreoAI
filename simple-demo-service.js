// Simple Demo Service for ChoreoAI
// Bypasses Supabase and connects directly to local backend

class SimpleDemoService {
    constructor() {
        this.currentUser = { id: 'demo-user', email: 'demo@example.com' };

        // Environment-aware backend URL
        this.backendUrl = this.getBackendUrl();
    }

    getBackendUrl() {
        // Check if we're in development (localhost) or production (vercel)
        const hostname = window.location.hostname;

        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            // Local development
            return 'http://localhost:5001';
        } else {
            // Production - you can replace this with your ngrok URL or deployed backend URL
            const deployedBackendUrl = localStorage.getItem('BACKEND_URL') || 'https://535a9730f0f4.ngrok-free.app';
            return deployedBackendUrl;
        }
    }

    // Method to update backend URL (useful for setting ngrok URL)
    setBackendUrl(url) {
        this.backendUrl = url;
        localStorage.setItem('BACKEND_URL', url);
        console.log('Backend URL updated to:', url);
    }

    // Mock authentication methods
    async getCurrentUser() {
        return this.currentUser;
    }

    async signIn(email, password) {
        // Set the current user when signing in
        this.currentUser = {
            id: 'demo-user-123',
            email: email,
            full_name: email.split('@')[0] || 'Demo User',
            created_at: new Date().toISOString()
        };
        return { data: { user: this.currentUser }, error: null };
    }

    async signUp(email, password, fullName) {
        // Set the current user when signing up
        this.currentUser = {
            id: 'demo-user-123',
            email: email,
            full_name: fullName || email.split('@')[0] || 'Demo User',
            created_at: new Date().toISOString()
        };
        return { data: { user: this.currentUser }, error: null };
    }

    async signOut() {
        this.currentUser = null;
        return { error: null };
    }

    // File upload to local backend
    async uploadAudioFile(file, projectId) {
        const formData = new FormData();
        formData.append('audio', file);

        try {
            const response = await fetch(`${this.backendUrl}/api/upload`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`Upload failed: ${response.statusText}`);
            }

            const result = await response.json();
            return {
                path: result.upload_id,
                publicUrl: `uploads/${result.filename}`,
                uploadId: result.upload_id
            };
        } catch (error) {
            throw new Error(`Upload error: ${error.message}`);
        }
    }

    // Project management (simplified)
    async createProject(projectData) {
        const project = {
            id: 'demo-project-' + Date.now(),
            ...projectData,
            user_id: this.currentUser.id,
            created_at: new Date().toISOString(),
            status: 'uploaded'
        };

        // Store in localStorage for demo purposes
        localStorage.setItem('currentProject', JSON.stringify(project));
        return { data: project, error: null };
    }

    async updateProject(projectId, updates) {
        const stored = localStorage.getItem('currentProject');
        if (stored) {
            const project = JSON.parse(stored);
            Object.assign(project, updates);
            localStorage.setItem('currentProject', JSON.stringify(project));
        }
        return { error: null };
    }

    async getProject(projectId) {
        const stored = localStorage.getItem('currentProject');
        return stored ? { data: JSON.parse(stored), error: null } : { data: null, error: null };
    }

    // Dance generation using local backend
    async startChoreographyGeneration(projectId, settings) {
        try {
            console.log('Starting choreography generation for project:', projectId);
            const project = JSON.parse(localStorage.getItem('currentProject') || '{}');
            console.log('Retrieved project from localStorage:', project);

            if (!project.uploadId) {
                console.error('No upload ID found in project:', project);
                throw new Error('No upload ID found. Please upload a file first.');
            }

            console.log('Upload ID found:', project.uploadId);

            // Update project status
            await this.updateProject(projectId, {
                status: 'processing',
                processing_progress: 0,
                generation_started_at: new Date().toISOString()
            });

            console.log('Starting generation with settings:', settings);
            console.log('Backend URL:', this.backendUrl);

            // Start generation via backend API
            const response = await fetch(`${this.backendUrl}/api/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    upload_id: project.uploadId,
                    dance_style: settings.dance_style || 'hiphop',
                    skill_level: settings.skill_level || 3,
                    generate_fbx: true
                })
            });

            console.log('Backend response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Backend error response:', errorText);
                throw new Error(`Generation failed: ${response.statusText} - ${errorText}`);
            }

            const result = await response.json();
            console.log('Generation started successfully:', result);

            // Store generation ID
            await this.updateProject(projectId, {
                generation_id: result.generation_id
            });

            // Start polling for progress
            this.pollGenerationProgress(projectId, result.generation_id);

            return {
                projectId,
                generationId: result.generation_id,
                status: 'processing'
            };

        } catch (error) {
            console.error('Generation error:', error);
            await this.updateProject(projectId, {
                status: 'failed',
                error_message: error.message
            });
            throw error;
        }
    }

    async pollGenerationProgress(projectId, generationId) {
        const pollInterval = setInterval(async () => {
            try {
                const response = await fetch(`${this.backendUrl}/api/status/${generationId}`);
                if (!response.ok) {
                    throw new Error('Failed to get generation status');
                }

                const status = await response.json();

                // Update project with current progress
                await this.updateProject(projectId, {
                    processing_progress: status.progress || 0,
                    status: status.status === 'completed' ? 'completed' : 'processing'
                });

                // Trigger progress update event
                if (window.choreographer) {
                    window.choreographer.updateGenerationProgress(status);
                }

                if (status.status === 'completed') {
                    clearInterval(pollInterval);

                    await this.updateProject(projectId, {
                        status: 'completed',
                        completed_at: new Date().toISOString(),
                        processing_progress: 100,
                        generation_result: status.result
                    });

                    // Trigger completion event
                    if (window.choreographer) {
                        window.choreographer.onGenerationComplete(status.result);
                    }
                } else if (status.status === 'error') {
                    clearInterval(pollInterval);
                    await this.updateProject(projectId, {
                        status: 'failed',
                        error_message: status.message || 'Generation failed'
                    });
                }
            } catch (error) {
                console.error('Polling error:', error);
                clearInterval(pollInterval);
                await this.updateProject(projectId, {
                    status: 'failed',
                    error_message: 'Failed to track generation progress'
                });
            }
        }, 5000); // Poll every 5 seconds (reduced frequency)
    }

    // Mock subscription function (since we don't have real-time updates)
    subscribeToProjectUpdates(projectId, callback) {
        console.log('Setting up project updates subscription for:', projectId);

        // Return a mock subscription object
        return {
            unsubscribe: () => {
                console.log('Unsubscribed from project updates');
            }
        };
    }

    // Download generated files
    async downloadFile(generationId, fileType) {
        try {
            const response = await fetch(`${this.backendUrl}/api/download/${generationId}/${fileType}`);
            if (!response.ok) {
                throw new Error(`Download failed: ${response.statusText}`);
            }
            return response.blob();
        } catch (error) {
            throw new Error(`Download error: ${error.message}`);
        }
    }

    // Utility methods
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    formatDuration(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
}

// Create global instance
window.choreographyService = new SimpleDemoService();

console.log('SimpleDemoService initialized - ready for local backend integration');