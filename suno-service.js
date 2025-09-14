// Suno AI API Service
// Based on actual Suno HackMIT 2025 API from the notebook

class SunoService {
    constructor() {
        this.API_KEY = 'b605c69954184dd29c983b8f510b5719';
        this.GENERATE_ENDPOINT = 'https://studio-api.prod.suno.com/api/v2/external/hackmit/generate';
        this.CLIPS_ENDPOINT = 'https://studio-api.prod.suno.com/api/v2/external/hackmit/clips';
        this.isGenerating = false;
        this.currentGeneration = null;
    }

    /**
     * Generate a song using Suno AI
     * @param {Object} params - Song generation parameters
     * @param {string} params.topic - Topic/description of the song to generate
     * @param {string} params.tags - Tags/genre for the song (comma-separated)
     * @returns {Promise<Object>} Generation result
     */
    async generateSong(params) {
        if (this.isGenerating) {
            throw new Error('Song generation already in progress');
        }

        this.isGenerating = true;

        try {
            console.log('Generating song with Suno API...', params);
            
            // Create the request body based on the notebook example
            const requestBody = {
                topic: params.topic,
                tags: params.tags
            };

            const response = await fetch(this.GENERATE_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Suno API error: ${response.status} ${response.statusText} - ${errorText}`);
            }

            const data = await response.json();
            console.log('Suno generation response:', data);
            
            // Return the first clip from the response
            if (data && data.length > 0) {
                const clip = data[0];
                this.currentGeneration = {
                    id: clip.id,
                    status: clip.status,
                    audio_url: clip.audio_url,
                    title: clip.title,
                    metadata: clip.metadata
                };

                return {
                    success: true,
                    generation_id: clip.id,
                    status: clip.status,
                    audio_url: clip.audio_url,
                    title: clip.title,
                    metadata: clip.metadata,
                    message: 'Song generation started successfully'
                };
            } else {
                throw new Error('No clips returned from Suno API');
            }

        } catch (error) {
            console.error('Suno generation error:', error);
            this.isGenerating = false;
            throw error;
        }
    }

    /**
     * Check the status of a song generation
     * @param {string} clipId - The clip ID to check
     * @returns {Promise<Object>} Status information
     */
    async checkGenerationStatus(clipId) {
        try {
            console.log('Polling Suno generation status for clip:', clipId);
            
            const response = await fetch(`${this.CLIPS_ENDPOINT}?ids=${clipId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.API_KEY}`
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Suno API error: ${response.status} ${response.statusText} - ${errorText}`);
            }

            const data = await response.json();
            console.log('Suno polling response:', data);
            
            if (data && data.length > 0) {
                const clip = data[0];
                return {
                    id: clip.id,
                    status: clip.status, // 'submitted', 'streaming', 'complete', 'failed'
                    progress: this.getProgressFromStatus(clip.status),
                    message: this.getStatusMessage(clip.status),
                    audio_url: clip.audio_url,
                    title: clip.title,
                    metadata: clip.metadata,
                    error: null
                };
            } else {
                throw new Error('No clip data returned from Suno API');
            }

        } catch (error) {
            console.error('Status check error:', error);
            throw error;
        }
    }

    /**
     * Download the generated song
     * @param {string} audioUrl - The audio URL to download
     * @returns {Promise<Blob>} Audio file blob
     */
    async downloadSong(audioUrl) {
        try {
            console.log('Downloading song from:', audioUrl);
            
            const response = await fetch(audioUrl);
            if (!response.ok) {
                throw new Error(`Download error: ${response.statusText}`);
            }
            
            const blob = await response.blob();
            console.log('Downloaded audio blob:', blob.size, 'bytes');
            return blob;
        } catch (error) {
            console.error('Download error:', error);
            throw error;
        }
    }

    /**
     * Create an audio file from blob for the choreography pipeline
     * @param {Blob} blob - The audio blob
     * @param {string} filename - The filename for the audio file
     * @returns {File} Audio file object
     */
    async createAudioFileFromBlob(blob, filename = 'suno-generated.mp3') {
        try {
            // Create a File object from the blob
            const file = new File([blob], filename, { type: 'audio/mpeg' });
            console.log('Created audio file:', file.name, file.size, 'bytes');
            return file;
        } catch (error) {
            console.error('Error creating audio file:', error);
            throw error;
        }
    }

    /**
     * Poll for generation completion
     * @param {string} clipId - The clip ID to poll
     * @param {Function} onUpdate - Callback for status updates
     * @param {Function} onComplete - Callback for completion
     * @param {Function} onError - Callback for errors
     */
    async pollGeneration(clipId, onUpdate, onComplete, onError) {
        const pollInterval = 3000; // Poll every 3 seconds
        const maxPollTime = 300000; // Max 5 minutes
        const startTime = Date.now();

        const poll = async () => {
            try {
                const status = await this.checkGenerationStatus(clipId);
                
                // Call update callback
                if (onUpdate) {
                    onUpdate(status);
                }

                // Check if generation is complete (streaming or complete status means audio is available)
                if (status.status === 'streaming' || status.status === 'complete') {
                    this.isGenerating = false;
                    if (onComplete) {
                        onComplete(status);
                    }
                    return;
                } else if (status.status === 'failed') {
                    this.isGenerating = false;
                    if (onError) {
                        onError(new Error('Generation failed'));
                    }
                    return;
                }

                // Check if we've exceeded max poll time
                if (Date.now() - startTime > maxPollTime) {
                    this.isGenerating = false;
                    if (onError) {
                        onError(new Error('Generation timeout'));
                    }
                    return;
                }

                // Continue polling
                setTimeout(poll, pollInterval);

            } catch (error) {
                this.isGenerating = false;
                if (onError) {
                    onError(error);
                }
            }
        };

        // Start polling
        poll();
    }

    /**
     * Get progress percentage from status
     * @param {string} status - The generation status
     * @returns {number} Progress percentage
     */
    getProgressFromStatus(status) {
        switch (status) {
            case 'submitted': return 10;
            case 'processing': return 50;
            case 'streaming': return 90;
            case 'complete': return 100;
            case 'failed': return 0;
            default: return 0;
        }
    }

    /**
     * Get human-readable status message
     * @param {string} status - The generation status
     * @returns {string} Status message
     */
    getStatusMessage(status) {
        switch (status) {
            case 'submitted': return 'Song submitted for generation...';
            case 'processing': return 'Generating your song...';
            case 'streaming': return 'Song is ready!';
            case 'complete': return 'Song generation complete!';
            case 'failed': return 'Song generation failed';
            default: return 'Processing...';
        }
    }

    /**
     * Check if generation is complete
     * @param {string} status - The generation status
     * @returns {boolean} Whether generation is complete
     */
    isGenerationComplete(status) {
        return status === 'complete' || status === 'streaming';
    }

    /**
     * Get available styles
     * @returns {Array} List of available styles
     */
    getAvailableStyles() {
        return [
            { value: 'pop', label: 'Pop' },
            { value: 'rock', label: 'Rock' },
            { value: 'hip-hop', label: 'Hip-Hop' },
            { value: 'electronic', label: 'Electronic' },
            { value: 'jazz', label: 'Jazz' },
            { value: 'classical', label: 'Classical' },
            { value: 'country', label: 'Country' },
            { value: 'reggae', label: 'Reggae' },
            { value: 'blues', label: 'Blues' },
            { value: 'folk', label: 'Folk' }
        ];
    }

    /**
     * Get available moods
     * @returns {Array} List of available moods
     */
    getAvailableMoods() {
        return [
            { value: 'happy', label: 'Happy' },
            { value: 'energetic', label: 'Energetic' },
            { value: 'calm', label: 'Calm' },
            { value: 'melancholic', label: 'Melancholic' },
            { value: 'romantic', label: 'Romantic' },
            { value: 'dramatic', label: 'Dramatic' },
            { value: 'upbeat', label: 'Upbeat' },
            { value: 'peaceful', label: 'Peaceful' }
        ];
    }

    /**
     * Check if service is available
     * @returns {boolean} Service availability
     */
    isAvailable() {
        return !!this.API_KEY && this.API_KEY !== 'your-suno-api-key';
    }

    /**
     * Set API key
     * @param {string} apiKey - The API key
     */
    setApiKey(apiKey) {
        this.API_KEY = apiKey;
    }
}

// Create global instance
window.sunoService = new SunoService();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SunoService;
}