# Placeholder Video Feature Guide

This guide explains how to use the placeholder video feature in ChoreoAI for faster testing and development.

## Overview

The placeholder video feature allows you to test the ChoreoAI interface without waiting for actual model generation. This is particularly useful during development and testing phases.

## Features

### 🎬 **Automatic Placeholder Mode**
- **Development Environment**: Automatically enabled on localhost and development domains
- **URL Parameter**: Add `?placeholder=true` to force placeholder mode
- **LocalStorage**: Persistent setting across browser sessions

### 🎮 **Interactive Controls**
- **Toggle Button**: Switch between placeholder and real video modes
- **Real-time Switching**: Change modes without page refresh
- **Visual Feedback**: Button state indicates current mode

### 🎨 **Animated Placeholder**
- **Dancing Figure**: Simple stick figure animation
- **Gradient Background**: Purple to pink gradient matching app theme
- **Progress Bar**: Animated progress indicator
- **Time Display**: Shows current playback time

## How to Use

### Method 1: Automatic (Development)
When running on localhost or development domains, placeholder mode is automatically enabled.

### Method 2: URL Parameter
Add `?placeholder=true` to your URL:
```
http://localhost:3000/index.html?placeholder=true
```

### Method 3: Toggle Button
1. Navigate to the Studio section
2. Click the "Use Real Video" button in the top controls
3. The button will change to "Use Placeholder" and the video will reload

### Method 4: LocalStorage
Set the placeholder mode programmatically:
```javascript
localStorage.setItem('usePlaceholderVideo', 'true');
```

## Technical Details

### File Structure
```
├── placeholder-video.html          # Standalone placeholder demo
├── placeholder-video.js           # Placeholder video generator
├── create-placeholder-video.py    # Python script for video creation
└── PLACEHOLDER_VIDEO_GUIDE.md     # This guide
```

### Key Functions

#### `shouldUsePlaceholderVideo()`
Determines whether to use placeholder video based on:
- URL parameters
- LocalStorage settings
- Environment detection

#### `getPlaceholderVideoUrl()`
Returns the appropriate placeholder video URL:
- Canvas-generated animation
- Base64 encoded video data
- Fallback to simple placeholder

#### `togglePlaceholderMode()`
Switches between placeholder and real video modes:
- Updates UI elements
- Reloads video content
- Persists setting in localStorage

### Video Specifications
- **Format**: MP4 (base64 encoded)
- **Duration**: 10 seconds (configurable)
- **Resolution**: 640x480 (configurable)
- **Frame Rate**: 30 FPS
- **Background**: Gradient (Purple to Pink)
- **Animation**: Dancing stick figure

## Development Workflow

### 1. **Quick Testing**
```bash
# Start the application
npm start

# Open with placeholder mode
open http://localhost:3000?placeholder=true
```

### 2. **Toggle During Development**
- Use the toggle button in the studio section
- No need to restart the application
- Changes persist across page refreshes

### 3. **Custom Placeholder**
Modify `placeholder-video.js` to create custom animations:
```javascript
// Customize the dancing figure
drawDancingFigure(ctx, width, height, time) {
    // Your custom animation code here
}
```

## Production Considerations

### Environment Detection
The system automatically detects production environments:
- **Development**: `localhost`, `127.0.0.1`, domains containing `dev`
- **Production**: All other domains

### Disabling in Production
Placeholder mode is automatically disabled in production environments. To force disable:
```javascript
localStorage.setItem('usePlaceholderVideo', 'false');
```

## Troubleshooting

### Common Issues

1. **Placeholder not loading**
   - Check browser console for errors
   - Verify placeholder-video.js is loaded
   - Try refreshing the page

2. **Toggle button not working**
   - Ensure JavaScript is enabled
   - Check for console errors
   - Verify button event listeners are attached

3. **Video controls not responding**
   - Check if video element is properly initialized
   - Verify event listeners are attached
   - Test with browser developer tools

### Debug Mode
Enable debug logging:
```javascript
// In browser console
localStorage.setItem('debugMode', 'true');
```

## Customization

### Changing Animation
Edit the `drawDancingFigure()` function in `placeholder-video.js`:
```javascript
drawDancingFigure(ctx, width, height, time) {
    // Modify animation parameters
    const danceOffset = Math.sin(time * 4) * 20; // Speed: 4
    const armSwing = Math.sin(time * 6) * 30;    // Speed: 6
    const legSwing = Math.sin(time * 8) * 25;    // Speed: 8
}
```

### Changing Colors
Modify the gradient in `drawFrame()`:
```javascript
const gradient = ctx.createLinearGradient(0, 0, width, height);
gradient.addColorStop(0, '#5E35B1'); // Purple
gradient.addColorStop(1, '#FF4081'); // Pink
```

### Changing Duration
Update the duration in the constructor:
```javascript
constructor() {
    this.duration = 15; // 15 seconds instead of 10
    this.totalFrames = this.duration * this.fps;
}
```

## Performance Notes

- **Memory Usage**: Placeholder videos use minimal memory
- **CPU Usage**: Canvas animations are optimized for smooth playback
- **File Size**: Base64 encoded videos are small (~1KB)
- **Loading Time**: Instant loading compared to real video generation

## Future Enhancements

Potential improvements for the placeholder system:
- Multiple placeholder themes
- User-uploaded placeholder videos
- More complex animations
- Audio placeholder support
- Custom duration settings

---

*Last updated: January 2025*
