#!/bin/bash

# ChoreoAI Launcher Script
echo "Starting ChoreoAI Dance Generation System..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "Error: Please run this script from the ChoreoAI directory"
    exit 1
fi

# Function to cleanup background processes
cleanup() {
    echo "Stopping services..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
    fi
    exit 0
}

# Trap ctrl+c to cleanup
trap cleanup INT

# Start Python backend
echo "Starting Python backend server..."
cd external
source .venv/bin/activate 2>/dev/null || {
    echo "Virtual environment not found. Please run setup.sh first."
    exit 1
}
cd ..

python3 dance_server.py &
BACKEND_PID=$!

# Wait a bit for backend to start
sleep 3

# Start frontend development server
echo "Starting frontend development server..."
npm start &
FRONTEND_PID=$!

echo ""
echo "✅ ChoreoAI is now running!"
echo "🔗 Frontend: http://localhost:8080"
echo "🔗 Backend API: http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for background processes
wait