// Placeholder Video Generator for ChoreoAI
// Creates a simple animated video for testing purposes

class PlaceholderVideoGenerator {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.isAnimating = false;
        this.animationId = null;
        this.frameCount = 0;
        this.duration = 10; // 10 seconds
        this.fps = 30;
        this.totalFrames = this.duration * this.fps;
    }

    /**
     * Create a placeholder video element with animation
     * @param {number} width - Video width
     * @param {number} height - Video height
     * @param {number} duration - Video duration in seconds
     * @returns {HTMLVideoElement} Video element with placeholder content
     */
    createPlaceholderVideo(width = 640, height = 480, duration = 10) {
        this.duration = duration;
        this.totalFrames = duration * this.fps;

        // Create canvas for animation
        this.canvas = document.createElement('canvas');
        this.canvas.width = width;
        this.canvas.height = height;
        this.ctx = this.canvas.getContext('2d');

        // Create video element
        const video = document.createElement('video');
        video.width = width;
        video.height = height;
        video.controls = false;
        video.muted = true;
        video.loop = true;

        // Generate video frames
        this.generateVideoFrames(video);

        return video;
    }

    /**
     * Generate video frames using canvas animation
     * @param {HTMLVideoElement} video - Video element to populate
     */
    generateVideoFrames(video) {
        const frames = [];
        
        for (let frame = 0; frame < this.totalFrames; frame++) {
            this.frameCount = frame;
            this.drawFrame();
            
            // Convert canvas to blob
            this.canvas.toBlob((blob) => {
                frames.push(blob);
                
                if (frames.length === this.totalFrames) {
                    this.createVideoFromFrames(frames, video);
                }
            }, 'image/png');
        }
    }

    /**
     * Draw a single frame of the animation
     */
    drawFrame() {
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;
        const time = this.frameCount / this.fps;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Create gradient background
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, '#5E35B1');
        gradient.addColorStop(1, '#FF4081');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // Add dancing figure
        this.drawDancingFigure(ctx, width, height, time);

        // Add text
        this.drawText(ctx, width, height, time);

        // Add progress indicator
        this.drawProgressBar(ctx, width, height, time);
    }

    /**
     * Draw a simple dancing figure
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} width - Canvas width
     * @param {number} height - Canvas height
     * @param {number} time - Current time in seconds
     */
    drawDancingFigure(ctx, width, height, time) {
        const centerX = width / 2;
        const centerY = height / 2;
        
        // Dancing motion
        const danceOffset = Math.sin(time * 4) * 20;
        const armSwing = Math.sin(time * 6) * 30;
        const legSwing = Math.sin(time * 8) * 25;

        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';

        // Head
        ctx.beginPath();
        ctx.arc(centerX, centerY - 80 + danceOffset, 20, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
        ctx.stroke();

        // Body
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - 60 + danceOffset);
        ctx.lineTo(centerX, centerY + 40);
        ctx.stroke();

        // Arms (dancing motion)
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - 40 + danceOffset);
        ctx.lineTo(centerX - 40 + armSwing, centerY - 20 + danceOffset);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(centerX, centerY - 40 + danceOffset);
        ctx.lineTo(centerX + 40 - armSwing, centerY - 20 + danceOffset);
        ctx.stroke();

        // Legs (dancing motion)
        ctx.beginPath();
        ctx.moveTo(centerX, centerY + 40);
        ctx.lineTo(centerX - 30 + legSwing, centerY + 100);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(centerX, centerY + 40);
        ctx.lineTo(centerX + 30 - legSwing, centerY + 100);
        ctx.stroke();
    }

    /**
     * Draw text overlay
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} width - Canvas width
     * @param {number} height - Canvas height
     * @param {number} time - Current time in seconds
     */
    drawText(ctx, width, height, time) {
        const centerX = width / 2;
        const centerY = height / 2;

        // Main title
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('ChoreoAI', centerX, centerY + 150);

        // Subtitle
        ctx.font = '24px Arial';
        ctx.fillText('AI-Generated Dance Choreography', centerX, centerY + 180);

        // Time display
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        ctx.font = '20px Arial';
        ctx.fillText(`${minutes}:${seconds.toString().padStart(2, '0')}`, centerX, centerY + 220);
    }

    /**
     * Draw progress bar
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} width - Canvas width
     * @param {number} height - Canvas height
     * @param {number} time - Current time in seconds
     */
    drawProgressBar(ctx, width, height, time) {
        const centerX = width / 2;
        const centerY = height / 2;
        const progress = time / this.duration;
        const barWidth = 300;
        const barHeight = 8;

        // Background
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(centerX - barWidth / 2, centerY + 250, barWidth, barHeight);

        // Progress fill
        ctx.fillStyle = '#00E5FF';
        ctx.fillRect(centerX - barWidth / 2, centerY + 250, barWidth * progress, barHeight);

        // Border
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.strokeRect(centerX - barWidth / 2, centerY + 250, barWidth, barHeight);
    }

    /**
     * Create video from frames (simplified version)
     * @param {Array} frames - Array of frame blobs
     * @param {HTMLVideoElement} video - Video element
     */
    createVideoFromFrames(frames, video) {
        // For simplicity, we'll create a data URL from the first frame
        // In a real implementation, you'd use MediaRecorder API
        this.canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            video.src = url;
        });
    }

    /**
     * Create a simple placeholder video URL
     * @returns {string} Data URL for placeholder video
     */
    static createSimplePlaceholderUrl() {
        // Return a simple base64 encoded video placeholder
        return 'data:video/mp4;base64,AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMWF2YzEAAAAIZnJlZQAAArxtZGF0AAACrgYF//+q3EXpvebZSLeWLNgg2SPu73gyNjQgLSBjb3JlIDE2MiByMzA4MSBkODVhYjQ5IC0gSC4yNjQvTVBFRy00IEFWQyBjb2RlYyAtIENvcHlsZWZ0IDIwMDMtMjAyMSAtIGh0dHA6Ly93d3cudmlkZW9sYW4ub3JnL3gyNjQuaHRtbCAtIG9wdGlvbnM6IGNhYmFjPTEgcmVmPTMgZGVibG9jaz0xOjA6MCBhbmFseXNlPTB4MzoweDExMyBtZT1oZXggc3VibWU9NyBwc3k9MSBwc3lfcmQ9MS4wMDowLjAwIG1peGVkX3JlZj0xIG1lX3JhbmdlPTE2IGNocm9tYV9tZT0xIHRyZWxsaXM9MSA4eDhkY3Q9MSBjcW09MCBkZWFkem9uZT0yMSwxMSBmYXN0X3Bza2lwPTEgY2hyb21hX3FwX29mZnNldD0tMiB0aHJlYWRzPTEgbG9va2FoZWFkX3RocmVhZHM9MSBzbGljZWRfdGhyZWFkcz0wIG5yPTAgZGVjaW1hdGU9MSBpbnRlcmxhY2VkPTAgYmx1cmF5X2NvbXBhdD0wIGNvbnN0cmFpbmVkX2ludHJhPTAgYmZyYW1lcz0zIGJfcHlyYW1pZD0yIGJfYWRhcHQ9MSBiX2JpYXM9MCBkaXJlY3Q9MSB3ZWlnaHRiPTEgb3Blbl9nb3A9MCB3ZWlnaHRwPTIga2V5aW50PTI1MCBrZXlpbnRfbWluPTEwIHNjZW5lY3V0PTQwIGludHJhX3JlZnJlc2g9MCByY19sb29rYWhlYWQ9NDAgcmM9Y3JmIG1idHJlZT0xIGNyZj0yMy4wIHFjb21wPTAuNjAgcXBtaW49MCBxcG1heD02OSBxcHN0ZXA9NCBpcF9yYXRpbz0xLjQwIGFxPTE6MS4wMACAAAAABWWIhAA3//728P4FN4y8X09Sut8yI8AXevs8IAAADAAADAAADAAADACwgIAAAAAAAB8YzQyLjAuMTAwMQEAAAAAO64AAAAA';
    }

    /**
     * Create a canvas-based placeholder video
     * @param {number} width - Video width
     * @param {number} height - Video height
     * @param {number} duration - Video duration
     * @returns {HTMLVideoElement} Video element
     */
    static createCanvasPlaceholder(width = 640, height = 480, duration = 10) {
        const generator = new PlaceholderVideoGenerator();
        return generator.createPlaceholderVideo(width, height, duration);
    }
}

// Make available globally
window.PlaceholderVideoGenerator = PlaceholderVideoGenerator;
