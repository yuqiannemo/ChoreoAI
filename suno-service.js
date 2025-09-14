// Suno AI API Service
// Based on Suno HackMIT 2025 API Documentation

class SunoService {
    constructor() {
        // Note: In production, these should be environment variables
        this.apiKey = 'your-suno-api-key'; // Replace with actual API key
        this.baseUrl = 'https://api.suno.ai/v1'; // Replace with actual API endpoint
        this.isGenerating = false;
        this.currentGeneration = null;
    }

    /**
     * Generate a song using Suno AI
     * @param {Object} params - Song generation parameters
     * @param {string} params.prompt - Description of the song to generate
     * @param {string} params.style - Music style (pop, rock, hip-hop, etc.)
     * @param {string} params.mood - Song mood (happy, energetic, calm, etc.)
     * @param {number} params.duration - Duration in seconds (30-300)
     * @param {number} params.tempo - Tempo in BPM (60-200)
     * @returns {Promise<Object>} Generation result
     */
    async generateSong(params) {
        if (this.isGenerating) {
            throw new Error('Song generation already in progress');
        }

        this.isGenerating = true;

        try {
            // Validate parameters
            this.validateParams(params);

            // Prepare the request payload
            const payload = {
                prompt: params.prompt,
                style: params.style,
                mood: params.mood,
                duration: Math.min(300, Math.max(30, params.duration)),
                tempo: Math.min(200, Math.max(60, params.tempo)),
                // Additional parameters based on Suno API spec
                include_lyrics: true,
                instrumental: false,
                custom_style: `${params.style} ${params.mood}`,
                generation_type: 'text_to_song'
            };

            console.log('Generating song with Suno AI:', payload);

            // Make API request to Suno
            const response = await fetch(`${this.baseUrl}/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`,
                    'X-API-Version': '2025-01'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`Suno API error: ${response.status} - ${errorData.message || response.statusText}`);
            }

            const result = await response.json();
            
            // Store current generation for polling
            this.currentGeneration = {
                id: result.generation_id,
                status: 'processing',
                created_at: new Date().toISOString()
            };

            return {
                success: true,
                generation_id: result.generation_id,
                status: 'processing',
                estimated_time: result.estimated_completion_time || 60,
                message: 'Song generation started successfully'
            };

        } catch (error) {
            console.error('Suno API error:', error);
            this.isGenerating = false;
            throw error;
        }
    }

    /**
     * Check the status of a song generation
     * @param {string} generationId - The generation ID to check
     * @returns {Promise<Object>} Status information
     */
    async checkGenerationStatus(generationId) {
        try {
            const response = await fetch(`${this.baseUrl}/status/${generationId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'X-API-Version': '2025-01'
                }
            });

            if (!response.ok) {
                throw new Error(`Status check failed: ${response.status}`);
            }

            const result = await response.json();
            
            return {
                id: generationId,
                status: result.status, // 'processing', 'completed', 'failed'
                progress: result.progress || 0,
                message: result.message || 'Processing...',
                result: result.result || null,
                error: result.error || null
            };

        } catch (error) {
            console.error('Status check error:', error);
            throw error;
        }
    }

    /**
     * Download the generated song
     * @param {string} generationId - The generation ID
     * @returns {Promise<Blob>} Audio file blob
     */
    async downloadSong(generationId) {
        try {
            const response = await fetch(`${this.baseUrl}/download/${generationId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'X-API-Version': '2025-01'
                }
            });

            if (!response.ok) {
                throw new Error(`Download failed: ${response.status}`);
            }

            return await response.blob();

        } catch (error) {
            console.error('Download error:', error);
            throw error;
        }
    }

    /**
     * Get song metadata
     * @param {string} generationId - The generation ID
     * @returns {Promise<Object>} Song metadata
     */
    async getSongMetadata(generationId) {
        try {
            const response = await fetch(`${this.baseUrl}/metadata/${generationId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'X-API-Version': '2025-01'
                }
            });

            if (!response.ok) {
                throw new Error(`Metadata fetch failed: ${response.status}`);
            }

            return await response.json();

        } catch (error) {
            console.error('Metadata fetch error:', error);
            throw error;
        }
    }

    /**
     * Poll for generation completion
     * @param {string} generationId - The generation ID to poll
     * @param {Function} onUpdate - Callback for status updates
     * @param {Function} onComplete - Callback for completion
     * @param {Function} onError - Callback for errors
     */
    async pollGeneration(generationId, onUpdate, onComplete, onError) {
        const pollInterval = 3000; // Poll every 3 seconds
        const maxPollTime = 300000; // Max 5 minutes
        const startTime = Date.now();

        const poll = async () => {
            try {
                const status = await this.checkGenerationStatus(generationId);
                
                // Call update callback
                if (onUpdate) {
                    onUpdate(status);
                }

                if (status.status === 'completed') {
                    this.isGenerating = false;
                    if (onComplete) {
                        onComplete(status);
                    }
                    return;
                } else if (status.status === 'failed') {
                    this.isGenerating = false;
                    if (onError) {
                        onError(new Error(status.error || 'Generation failed'));
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
     * Validate generation parameters
     * @param {Object} params - Parameters to validate
     */
    validateParams(params) {
        if (!params.prompt || params.prompt.trim().length < 10) {
            throw new Error('Prompt must be at least 10 characters long');
        }

        if (params.prompt.length > 500) {
            throw new Error('Prompt must be less than 500 characters');
        }

        const validStyles = ['pop', 'rock', 'hip-hop', 'electronic', 'jazz', 'classical', 'country', 'reggae'];
        if (!validStyles.includes(params.style)) {
            throw new Error('Invalid style selected');
        }

        const validMoods = ['happy', 'energetic', 'calm', 'melancholic', 'romantic', 'dramatic'];
        if (!validMoods.includes(params.mood)) {
            throw new Error('Invalid mood selected');
        }

        if (params.duration < 30 || params.duration > 300) {
            throw new Error('Duration must be between 30 and 300 seconds');
        }

        if (params.tempo < 60 || params.tempo > 200) {
            throw new Error('Tempo must be between 60 and 200 BPM');
        }
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
            { value: 'reggae', label: 'Reggae' }
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
            { value: 'dramatic', label: 'Dramatic' }
        ];
    }

    /**
     * Check if service is available
     * @returns {boolean} Service availability
     */
    isAvailable() {
        return !!this.apiKey && this.apiKey !== 'your-suno-api-key';
    }

    /**
     * Set API key
     * @param {string} apiKey - The API key
     */
    setApiKey(apiKey) {
        this.apiKey = apiKey;
    }
}

// Create global instance
window.sunoService = new SunoService();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SunoService;
}
