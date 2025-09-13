# AI Choreographer Frontend

A modern, responsive web frontend for an AI choreographer application that allows users to upload music or video files and generate dance choreography using AI.

## Features

### 🎨 Design
- **Cyberpunk Aesthetic**: Dark theme with neon pink (#FF4081) and cyan (#00E5FF) accents
- **Responsive Design**: Optimized for both desktop and mobile devices
- **Smooth Animations**: CSS transitions and keyframe animations for a polished feel
- **Interactive Elements**: Hover effects, glowing buttons, and animated skeleton demonstrations

### 🎵 Core Functionality
- **Music Upload**: Drag & drop or browse to upload audio files
- **Video Upload**: Support for video file uploads with style extraction
- **Style Selection**: Choose from Hip Hop, Ballet, House, Contemporary, Jazz, and Popping
- **Customization**: Adjustable skill level and tempo preferences
- **Real-time Progress**: Animated progress bar with skeleton visualization during generation

### 🎬 Studio Player
- **3D Avatar View**: Animated skeleton demonstration of choreography
- **Playback Controls**: Play, pause, rewind, forward with keyboard shortcuts
- **Speed Control**: Multiple playback speeds (0.25x to 2x)
- **Camera Angles**: Front, Side, 3D, and Top view presets
- **Mirror Mode**: Toggle horizontal flip for mirror practice
- **Timeline Scrubbing**: Interactive timeline with progress visualization

### 📱 Mobile Support
- **Touch-Friendly**: Optimized for mobile interactions
- **Responsive Layout**: Adapts to different screen sizes
- **Gesture Hints**: Visual indicators for gesture controls
- **Mobile Navigation**: Collapsible menus and touch-optimized buttons

## File Structure

```
ai-choreographer-frontend/
├── index.html          # Main HTML structure
├── styles.css          # CSS with cyberpunk theme and animations
├── script.js           # JavaScript for interactivity
└── README.md           # This file
```

## Getting Started

1. **Open the Application**: Simply open `index.html` in a web browser
2. **Upload Content**: Click "Upload Music" or "Upload Video" to get started
3. **Configure Settings**: Choose dance style, skill level, and tempo preferences
4. **Generate**: Click "Generate Choreography" to start the AI process
5. **View Results**: Watch your choreography in the studio player
6. **Export**: Download video, export GLB, or share your creation

## Color Scheme

The design follows the specified cyberpunk color palette:

- **Primary Purple**: #5E35B1 (Deep Purple)
- **Accent Pink**: #FF4081 (Neon Pink)
- **Accent Cyan**: #00E5FF (Cyan)
- **Background**: #121212 (Off-Black)
- **Card Background**: #1E1E1E (Dark Slate Gray)
- **Text Primary**: #FFFFFF (White)
- **Text Secondary**: #E0E0E0 (Very Light Gray)
- **Text Muted**: #B0B0B0 (Gray)

## Interactive Features

### Keyboard Shortcuts (Studio Mode)
- **Spacebar**: Play/Pause
- **Left Arrow**: Rewind 10 seconds
- **Right Arrow**: Forward 10 seconds
- **M**: Toggle mirror mode

### File Upload
- **Drag & Drop**: Drag files directly onto upload areas
- **File Browser**: Click upload areas to open file picker
- **Supported Formats**: Audio files for music, video files for video upload

### Gesture Controls (Planned)
The interface is designed to support future gesture recognition:
- **Swipe Left**: Rewind
- **Swipe Right**: Forward
- **Palm Up**: Pause/Play toggle
- **Double Tap**: Toggle mirror view

## Browser Compatibility

- **Modern Browsers**: Chrome, Firefox, Safari, Edge (latest versions)
- **CSS Features**: Uses modern CSS Grid, Flexbox, and animations
- **JavaScript**: ES6+ features with class-based architecture

## Customization

### Adding New Dance Styles
1. Add new options to the `genreSelect` dropdown in HTML
2. Add corresponding style items to the showcase section
3. Update the `selectStyle()` method in JavaScript

### Modifying Colors
Update CSS custom properties in `:root` section of `styles.css`:
```css
:root {
    --primary-purple: #5E35B1;
    --accent-pink: #FF4081;
    --accent-cyan: #00E5FF;
    /* ... other colors */
}
```

### Adding New Features
The JavaScript is organized in a class-based structure for easy extension:
- Add new methods to the `AIChoreographer` class
- Update event listeners in `setupEventListeners()`
- Add corresponding UI elements in HTML

## API Integration

The frontend is designed to integrate with your AI choreographer API. Key integration points:

1. **File Upload**: Replace file handling with actual API calls
2. **Generation Process**: Connect progress simulation to real API progress
3. **Result Display**: Replace skeleton animations with actual 3D avatar data
4. **Export Functions**: Implement actual download and sharing functionality

## Performance Considerations

- **Optimized Animations**: Uses CSS transforms and opacity for smooth performance
- **Lazy Loading**: Intersection Observer for scroll-triggered animations
- **Efficient DOM Updates**: Minimal DOM manipulation with class-based updates
- **Responsive Images**: Scalable vector icons and CSS-based graphics

## Future Enhancements

- **WebGL Integration**: Replace CSS animations with 3D WebGL avatars
- **Real-time Collaboration**: Multi-user choreography sessions
- **Advanced Editing**: Timeline-based choreography editing
- **Social Features**: Share and discover choreographies
- **AI Feedback**: Real-time movement analysis and suggestions

## Support

For questions or issues with the frontend implementation, refer to the code comments or create an issue in your project repository.

---

*Built with modern web technologies and designed for the future of AI-powered choreography.*
