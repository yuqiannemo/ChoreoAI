# ChoreoAI - AI-Powered Dance Generation System

A comprehensive AI choreographer application that allows users to upload music files and generate realistic dance choreography with interactive 3D visualization.

## 🌟 Features

### � Music-to-Dance Generation
- **Single File Processing**: Upload individual music files for personalized dance generation
- **EDGE Model Integration**: Uses state-of-the-art EDGE (Editable Dance GEneration) AI model
- **Multiple Audio Formats**: Supports WAV, MP3, FLAC, and M4A files
- **Automatic Audio Processing**: Converts audio to appropriate format for AI processing

### 🕺 3D Avatar Visualization
- **Interactive 3D Viewer**: Full 3D avatar with interactive camera controls
- **SMPL-to-FBX Conversion**: Converts motion data to industry-standard FBX format
- **Multiple View Modes**: 2D preview and full 3D interactive modes
- **Camera Controls**: Orbit, zoom, pan controls with preset camera angles
- **Avatar Customization**: Wireframe toggle, opacity control, and show/hide options

### 🎬 Advanced Playback
- **Synchronized Playback**: 2D and 3D viewers sync with audio playback
- **Speed Control**: Multiple playback speeds from 0.25x to 2x
- **Timeline Scrubbing**: Interactive timeline with precise control
- **Mirror Mode**: Toggle for practice and learning

### 🔗 Full-Stack Architecture
- **Python Backend**: Flask-based API server for dance generation
- **Frontend Integration**: Modern web interface with real-time progress tracking
- **Database Integration**: Supabase for user management and project storage
- **File Management**: Automatic file upload, processing, and download

## 🚀 Quick Start

### Prerequisites
- Python 3.8+ with virtual environment support
- Node.js 16+ with npm
- ffmpeg (for audio conversion)
- Git

### Setup
1. **Clone and navigate to the project:**
   ```bash
   cd /home/user/ChoreoAI
   ```

2. **Run the setup script:**
   ```bash
   ./setup.sh
   ```

3. **Start the application:**
   ```bash
   ./start.sh
   ```

4. **Access the application:**
   - Frontend: http://localhost:8080
   - Backend API: http://localhost:5000

### Manual Setup (if automatic setup fails)

1. **Backend Setup:**
   ```bash
   cd external
   python3 -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   cd ..
   ```

2. **Frontend Setup:**
   ```bash
   npm install
   ```

3. **Start Services:**
   ```bash
   # Terminal 1: Backend
   python3 dance_server.py
   
   # Terminal 2: Frontend
   npm start
   ```

## 📁 Project Structure

```
ChoreoAI/
├── index.html                 # Main web interface
├── script.js                  # Frontend JavaScript logic
├── styles.css                 # UI styling and animations
├── threejs-viewer.js          # 3D visualization component
├── supabase-service.js        # Database and auth service
├── dance_server.py            # Python backend API server
├── requirements.txt           # Python dependencies
├── setup.sh                   # Automated setup script
├── start.sh                   # Application launcher
└── external/                  # AI model and processing
    ├── single_music_generator.py  # Single file dance generation
    ├── EDGE.py                    # EDGE model implementation
    ├── test.py                    # Original batch processing
    ├── checkpoint.pt              # Pre-trained model weights
    └── SMPL-to-FBX/              # 3D avatar conversion
        ├── Convert.py             # SMPL to FBX converter
        └── ybot.fbx              # Base avatar model
```

## 🎯 Usage Workflow

1. **User Registration/Login**: Create account or sign in
2. **Music Upload**: Drag & drop or browse to upload music file
3. **Style Configuration**: Choose dance style and preferences
4. **Generation**: AI processes music and generates dance motion
5. **3D Visualization**: View and interact with 3D avatar performing the dance
6. **Export**: Download generated video, motion data, or FBX files

## 🔧 API Endpoints

### Backend API (Port 5000)
- `POST /api/upload` - Upload music file
- `POST /api/generate` - Start dance generation
- `GET /api/status/<id>` - Check generation progress
- `GET /api/download/<id>/<type>` - Download generated files
- `DELETE /api/cleanup/<id>` - Clean up generation files
- `GET /api/health` - Health check

## 🎨 Frontend Features

### Modern UI/UX
- **Cyberpunk Aesthetic**: Dark theme with neon accents
- **Responsive Design**: Works on desktop and mobile
- **Real-time Updates**: Live progress tracking and notifications
- **Interactive Elements**: Smooth animations and hover effects

### 3D Viewer Controls
- **Mouse Controls**: Orbit (left-click drag), Zoom (scroll), Pan (right-click drag)
- **Camera Presets**: Front, Side, 3D, Top view buttons
- **Avatar Controls**: Show/hide, wireframe mode, opacity slider
- **Reset View**: One-click camera reset

## 🔬 Technical Details

### AI Model (EDGE)
- **Architecture**: Transformer-based dance generation
- **Input**: Audio features (Jukebox or baseline)
- **Output**: SMPL motion parameters
- **Training**: Trained on AIST++ dance dataset

### 3D Pipeline
1. **Motion Generation**: EDGE model creates motion sequences
2. **SMPL Processing**: Motion data in SMPL format
3. **FBX Conversion**: Convert to industry-standard FBX
4. **3D Rendering**: Three.js-based real-time rendering

### File Processing
- **Audio Conversion**: Automatic format conversion via ffmpeg
- **Motion Export**: SMPL parameters saved as .pkl files
- **3D Export**: FBX files for use in external 3D software
- **Video Rendering**: MP4 output with visual representation

## 🛠️ Development

### Adding New Features
1. **Backend**: Extend `dance_server.py` with new endpoints
2. **Frontend**: Modify `script.js` for new UI features
3. **3D Viewer**: Update `threejs-viewer.js` for visualization enhancements

### Configuration
- **Model Settings**: Adjust parameters in `single_music_generator.py`
- **UI Themes**: Modify CSS variables in `styles.css`
- **API Settings**: Update endpoints in `supabase-service.js`

## 📝 Notes

- **Model Requirements**: Requires EDGE checkpoint.pt file in external/ directory
- **FBX Dependencies**: SMPL-to-FBX conversion requires FBX Python SDK
- **Performance**: 3D rendering performance depends on device capabilities
- **Audio Formats**: Some formats may require additional ffmpeg codecs

## 🐛 Troubleshooting

### Common Issues
1. **Virtual Environment**: Ensure .venv is activated for Python commands
2. **Missing Dependencies**: Run setup.sh to install all requirements
3. **Port Conflicts**: Check if ports 5000 and 8080 are available
4. **FBX Conversion**: May require manual FBX SDK installation

### Support
- Check console logs for detailed error messages
- Ensure all dependencies are installed correctly
- Verify file permissions for uploaded content

## 🎯 Future Enhancements

- **Multiple Avatar Models**: Support for different character types
- **Real-time Generation**: Faster processing for immediate results
- **Dance Style Transfer**: Convert between different dance styles
- **Collaborative Features**: Share and remix generated choreographies
- **Mobile App**: Native mobile application development

---

Built with ❤️ using EDGE AI model, Three.js, Flask, and modern web technologies.
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
