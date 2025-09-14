#!/bin/bash

# Setup script for ChoreoAI Dance Generation
echo "Setting up ChoreoAI Dance Generation..."

# Check if we're in the ChoreoAI directory
if [ ! -f "package.json" ]; then
    echo "Error: Please run this script from the ChoreoAI directory"
    exit 1
fi

# Create virtual environment for Python backend
echo "Creating Python virtual environment..."
cd external
if [ ! -d ".venv" ]; then
    python3 -m venv .venv
fi

# Activate virtual environment
source .venv/bin/activate

# Install Python dependencies
echo "Installing Python dependencies..."
pip install --upgrade pip

# Install PyTorch (adjust URL for your system if needed)
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu

# Install other requirements
pip install flask flask-cors numpy scipy librosa matplotlib tqdm Pillow opencv-python ffmpeg-python

# Check if EDGE requirements.txt exists and install
if [ -f "requirements.txt" ]; then
    echo "Installing EDGE-specific requirements..."
    pip install -r requirements.txt
fi

# Install additional ML dependencies that might be needed
pip install transformers accelerate

echo "Python environment setup complete!"

# Go back to main directory
cd ..

# Install Node.js dependencies
echo "Installing Node.js dependencies..."
npm install

# Check if ffmpeg is installed
echo "Checking system dependencies..."
if ! command -v ffmpeg &> /dev/null; then
    echo "Warning: ffmpeg is not installed. Please install it for audio conversion:"
    echo "  Ubuntu/Debian: sudo apt install ffmpeg"
    echo "  macOS: brew install ffmpeg"
    echo "  Or visit: https://ffmpeg.org/download.html"
fi

# Setup FBX SDK if needed
echo "Setting up FBX SDK..."
cd external
if [ -f "fbx202034_fbxpythonsdk_linux.tar.gz" ]; then
    if [ ! -d "fbx202034_fbxpythonsdk_linux" ]; then
        echo "Extracting FBX SDK..."
        tar -xzf fbx202034_fbxpythonsdk_linux.tar.gz
    fi
    
    # Install FBX SDK in virtual environment
    if [ -f "fbx202034_fbxpythonsdk_linux/lib/Python310_x64/fbx.so" ]; then
        echo "Installing FBX Python SDK..."
        source .venv/bin/activate
        
        # Copy FBX files to site-packages
        SITE_PACKAGES=$(python -c "import site; print(site.getsitepackages()[0])")
        cp fbx202034_fbxpythonsdk_linux/lib/Python310_x64/* "$SITE_PACKAGES/" 2>/dev/null || true
        
        echo "FBX SDK installation attempted. You may need to manually install it based on your Python version."
    fi
fi

cd ..

# Create necessary directories
echo "Creating output directories..."
mkdir -p uploads
mkdir -p outputs
mkdir -p motions
mkdir -p fbx_outputs

# Make scripts executable
chmod +x dance_server.py

echo ""
echo "Setup complete! 🎉"
echo ""
echo "To start the application:"
echo "1. Start the Python backend:"
echo "   cd external && source .venv/bin/activate && cd .. && python3 dance_server.py"
echo ""
echo "2. In another terminal, start the frontend:"
echo "   npm start"
echo ""
echo "3. Open http://localhost:8080 in your browser"
echo ""
echo "Note: Make sure you have the EDGE checkpoint.pt file in the external/ directory"
echo "and that all dependencies are properly installed."