// Supabase Service for AI Choreographer
// Using CDN version - no import needed

// Get Supabase client from global scope
const supabaseUrl = 'https://likdbicjuoqqwwrfjial.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxpa2RiaWNqdW9xcXd3cmZqaWFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3ODU5MzIsImV4cCI6MjA3MzM2MTkzMn0.T9IGw2rSxAK-3IE1dfDbjqosT91mUscO_yPJZMNguT4'
const supabase = window.supabase.createClient(supabaseUrl, supabaseAnonKey)

// Storage bucket names
const STORAGE_BUCKETS = {
    AUDIO: 'audio-files',
    VIDEOS: 'choreography-videos',
    THUMBNAILS: 'video-thumbnails'
}

// Database table names
const TABLES = {
    PROJECTS: 'choreography_projects',
    USERS: 'users'
}

class ChoreographyService {
    constructor() {
        this.currentUser = null
        this.init()
    }

    async init() {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser()
        this.currentUser = user
        this.supabase = supabase // Make supabase available for auth state changes
    }

    // Authentication methods
    async signUp(email, password, fullName) {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName
                }
            }
        })
        return { data, error }
    }

    async signIn(email, password) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        })
        if (data.user) {
            this.currentUser = data.user
        }
        return { data, error }
    }

    async signOut() {
        const { error } = await supabase.auth.signOut()
        this.currentUser = null
        return { error }
    }

    async getCurrentUser() {
        const { data: { user } } = await supabase.auth.getUser()
        this.currentUser = user
        return user
    }

    // Audio file upload
    async uploadAudioFile(file, projectId) {
        if (!this.currentUser) {
            throw new Error('User must be authenticated to upload files')
        }

        const fileExt = file.name.split('.').pop()
        const fileName = `${projectId}.${fileExt}`
        const filePath = `${this.currentUser.id}/${fileName}`

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
            .from(STORAGE_BUCKETS.AUDIO)
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            })

        if (error) {
            throw error
        }

        // Get public URL
        const { data: urlData } = supabase.storage
            .from(STORAGE_BUCKETS.AUDIO)
            .getPublicUrl(filePath)

        return {
            path: filePath,
            url: urlData.publicUrl,
            size: file.size,
            type: file.type
        }
    }

    // Video file upload
    async uploadVideoFile(file, projectId) {
        if (!this.currentUser) {
            throw new Error('User must be authenticated to upload files')
        }

        const fileExt = file.name.split('.').pop()
        const fileName = `${projectId}.${fileExt}`
        const filePath = `${this.currentUser.id}/${fileName}`

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
            .from(STORAGE_BUCKETS.VIDEOS)
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            })

        if (error) {
            throw error
        }

        // Get public URL
        const { data: urlData } = supabase.storage
            .from(STORAGE_BUCKETS.VIDEOS)
            .getPublicUrl(filePath)

        return {
            path: filePath,
            url: urlData.publicUrl,
            size: file.size
        }
    }

    // Thumbnail upload
    async uploadThumbnail(file, projectId) {
        if (!this.currentUser) {
            throw new Error('User must be authenticated to upload files')
        }

        const fileExt = file.name.split('.').pop()
        const fileName = `${projectId}_thumb.${fileExt}`
        const filePath = `${this.currentUser.id}/${fileName}`

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
            .from(STORAGE_BUCKETS.THUMBNAILS)
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: true
            })

        if (error) {
            throw error
        }

        // Get public URL
        const { data: urlData } = supabase.storage
            .from(STORAGE_BUCKETS.THUMBNAILS)
            .getPublicUrl(filePath)

        return {
            path: filePath,
            url: urlData.publicUrl
        }
    }

    // Project management
    async createProject(projectData) {
        if (!this.currentUser) {
            throw new Error('User must be authenticated to create projects')
        }

        const { data, error } = await supabase
            .from(TABLES.PROJECTS)
            .insert({
                user_id: this.currentUser.id,
                ...projectData
            })
            .select()
            .single()

        return { data, error }
    }

    async updateProject(projectId, updates) {
        const { data, error } = await supabase
            .from(TABLES.PROJECTS)
            .update(updates)
            .eq('id', projectId)
            .eq('user_id', this.currentUser.id)
            .select()
            .single()

        return { data, error }
    }

    async getProject(projectId) {
        const { data, error } = await supabase
            .from(TABLES.PROJECTS)
            .select('*')
            .eq('id', projectId)
            .eq('user_id', this.currentUser.id)
            .single()

        return { data, error }
    }

    async getUserProjects(limit = 20, offset = 0) {
        const { data, error } = await supabase
            .from(TABLES.PROJECTS)
            .select('*')
            .eq('user_id', this.currentUser.id)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1)

        return { data, error }
    }

    async deleteProject(projectId) {
        // First get the project to get file paths
        const { data: project } = await this.getProject(projectId)
        if (!project) {
            throw new Error('Project not found')
        }

        // Delete files from storage
        const filesToDelete = []
        if (project.audio_file_path) {
            filesToDelete.push({
                bucket: STORAGE_BUCKETS.AUDIO,
                path: project.audio_file_path
            })
        }
        if (project.video_file_path) {
            filesToDelete.push({
                bucket: STORAGE_BUCKETS.VIDEOS,
                path: project.video_file_path
            })
        }
        if (project.thumbnail_path) {
            filesToDelete.push({
                bucket: STORAGE_BUCKETS.THUMBNAILS,
                path: project.thumbnail_path
            })
        }

        // Delete files from storage
        for (const file of filesToDelete) {
            await supabase.storage
                .from(file.bucket)
                .remove([file.path])
        }

        // Delete project from database
        const { error } = await supabase
            .from(TABLES.PROJECTS)
            .delete()
            .eq('id', projectId)
            .eq('user_id', this.currentUser.id)

        return { error }
    }

    // File management
    async getAudioFileUrl(projectId) {
        const { data: project } = await this.getProject(projectId)
        if (!project || !project.audio_file_path) {
            return null
        }

        const { data } = supabase.storage
            .from(STORAGE_BUCKETS.AUDIO)
            .getPublicUrl(project.audio_file_path)

        return data.publicUrl
    }

    async getVideoFileUrl(projectId) {
        const { data: project } = await this.getProject(projectId)
        if (!project || !project.video_file_path) {
            return null
        }

        const { data } = supabase.storage
            .from(STORAGE_BUCKETS.VIDEOS)
            .getPublicUrl(project.video_file_path)

        return data.publicUrl
    }

    async getThumbnailUrl(projectId) {
        const { data: project } = await this.getProject(projectId)
        if (!project || !project.thumbnail_path) {
            return null
        }

        const { data } = supabase.storage
            .from(STORAGE_BUCKETS.THUMBNAILS)
            .getPublicUrl(project.thumbnail_path)

        return data.publicUrl
    }

    // Download files
    async downloadFile(bucket, path, filename) {
        const { data, error } = await supabase.storage
            .from(bucket)
            .download(path)

        if (error) {
            throw error
        }

        // Create download link
        const url = URL.createObjectURL(data)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }

    // Storage usage
    async getUserStorageUsage() {
        if (!this.currentUser) {
            return null
        }

        const { data, error } = await supabase.rpc('get_user_storage_usage', {
            user_uuid: this.currentUser.id
        })

        return { data, error }
    }

    // Real-time subscriptions
    subscribeToProjectUpdates(projectId, callback) {
        return supabase
            .channel(`project-${projectId}`)
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: TABLES.PROJECTS,
                filter: `id=eq.${projectId}`
            }, callback)
            .subscribe()
    }

    subscribeToUserProjects(callback) {
        if (!this.currentUser) {
            return null
        }

        return supabase
            .channel('user-projects')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: TABLES.PROJECTS,
                filter: `user_id=eq.${this.currentUser.id}`
            }, callback)
            .subscribe()
    }

    // AI API integration helpers
    async startChoreographyGeneration(projectId, settings) {
        if (!this.currentUser) {
            throw new Error('User must be authenticated to generate choreography')
        }

        // Get project details including audio file path
        const { data: project, error: projectError } = await supabase
            .from(TABLES.PROJECTS)
            .select('*')
            .eq('id', projectId)
            .eq('user_id', this.currentUser.id)
            .single()

        if (projectError) {
            throw projectError
        }

        // Update project status to processing
        await this.updateProject(projectId, {
            status: 'processing',
            processing_progress: 0,
            generation_started_at: new Date().toISOString(),
            generation_parameters: settings
        })

        try {
            // Download audio file from Supabase storage
            const { data: audioBlob, error: downloadError } = await supabase.storage
                .from(STORAGE_BUCKETS.AUDIO)
                .download(project.audio_file_path)

            if (downloadError) {
                throw downloadError
            }

            // Upload to dance generation API
            const formData = new FormData()
            formData.append('audio', audioBlob, project.audio_file_name)

            const uploadResponse = await fetch('http://localhost:5000/api/upload', {
                method: 'POST',
                body: formData
            })

            if (!uploadResponse.ok) {
                const errorData = await uploadResponse.json()
                throw new Error(errorData.error || 'Failed to upload audio to generation service')
            }

            const uploadResult = await uploadResponse.json()

            // Start generation
            const generateResponse = await fetch('http://localhost:5000/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    upload_id: uploadResult.upload_id,
                    feature_type: 'jukebox',
                    generate_fbx: true,
                    dance_style: settings.dance_style || 'freestyle',
                    skill_level: settings.skill_level || 3
                })
            })

            if (!generateResponse.ok) {
                const errorData = await generateResponse.json()
                throw new Error(errorData.error || 'Failed to start dance generation')
            }

            const generateResult = await generateResponse.json()

            // Update project with generation ID
            await this.updateProject(projectId, {
                generation_id: generateResult.generation_id,
                api_upload_id: uploadResult.upload_id
            })

            // Start polling for progress
            this.pollGenerationProgress(projectId, generateResult.generation_id)

            return { 
                projectId, 
                generationId: generateResult.generation_id,
                status: 'processing' 
            }

        } catch (error) {
            console.error('Generation error:', error)
            // Update project status to failed
            await this.updateProject(projectId, {
                status: 'failed',
                error_message: error.message
            })
            throw error
        }
    }

    async pollGenerationProgress(projectId, generationId) {
        const pollInterval = setInterval(async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/status/${generationId}`)
                if (!response.ok) {
                    throw new Error('Failed to get generation status')
                }

                const status = await response.json()
                
                // Update project with current progress
                await this.updateProject(projectId, {
                    processing_progress: status.progress || 0
                })

                if (status.status === 'completed') {
                    clearInterval(pollInterval)
                    
                    // Download and save generated video
                    const videoResponse = await fetch(`http://localhost:5000/api/download/${generationId}/video`)
                    if (videoResponse.ok) {
                        const videoBlob = await videoResponse.blob()
                        
                        // Upload video to Supabase storage
                        const videoPath = `${this.currentUser.id}/${projectId}_generated.mp4`
                        const { data: uploadData, error: uploadError } = await supabase.storage
                            .from(STORAGE_BUCKETS.VIDEOS)
                            .upload(videoPath, videoBlob, {
                                cacheControl: '3600',
                                upsert: true
                            })

                        if (!uploadError) {
                            const { data: urlData } = supabase.storage
                                .from(STORAGE_BUCKETS.VIDEOS)
                                .getPublicUrl(videoPath)
                            
                            await this.updateProject(projectId, {
                                status: 'completed',
                                completed_at: new Date().toISOString(),
                                processing_progress: 100,
                                video_path: videoPath,
                                video_url: urlData.publicUrl
                            })
                        }
                    }
                } else if (status.status === 'error') {
                    clearInterval(pollInterval)
                    await this.updateProject(projectId, {
                        status: 'failed',
                        error_message: status.message || 'Generation failed'
                    })
                }
            } catch (error) {
                console.error('Polling error:', error)
                clearInterval(pollInterval)
                await this.updateProject(projectId, {
                    status: 'failed',
                    error_message: 'Failed to track generation progress'
                })
            }
        }, 2000) // Poll every 2 seconds
    }

    // Utility methods
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    formatDuration(seconds) {
        const mins = Math.floor(seconds / 60)
        const secs = Math.floor(seconds % 60)
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }
}

// Create and export singleton instance
const choreographyService = new ChoreographyService()

// Make it available globally
window.choreographyService = choreographyService
