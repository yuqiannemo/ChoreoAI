#!/usr/bin/env python3
"""
Dance Generation Backend Server
Handles API requests for dance generation from uploaded music files
"""

import os
import sys
import json
import uuid
import subprocess
import shutil
from pathlib import Path
from flask import Flask, request, jsonify, send_file, send_from_directory
from flask_cors import CORS
import tempfile
import threading
import time
from werkzeug.utils import secure_filename
from flask import send_from_directory

# Add external directory to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'external'))

# Import dance generation function with error handling
try:
    from single_music_generator import generate_dance_from_single_file
    DANCE_GENERATION_AVAILABLE = True
except ImportError as e:
    print(f"Warning: Could not import dance generation module: {e}")
    print("Dance generation will not be available. Please check your environment setup.")
    DANCE_GENERATION_AVAILABLE = False
    
    # Create a dummy function for testing
    def generate_dance_from_single_file(*args, **kwargs):
        raise RuntimeError("Dance generation is not available. Please check your environment setup.")

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend integration

# Configuration
UPLOAD_FOLDER = 'uploads'
OUTPUT_FOLDER = 'outputs'
MOTION_FOLDER = 'motions'
FBX_OUTPUT_FOLDER = 'fbx_outputs'
ALLOWED_EXTENSIONS = {'wav', 'mp3', 'flac', 'm4a'}

# Ensure directories exist
for folder in [UPLOAD_FOLDER, OUTPUT_FOLDER, MOTION_FOLDER, FBX_OUTPUT_FOLDER]:
    Path(folder).mkdir(parents=True, exist_ok=True)

# Store generation status
generation_status = {}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def convert_audio_to_wav(input_path, output_path):
    """Convert audio file to WAV format using ffmpeg"""
    try:
        cmd = [
            'ffmpeg', '-i', input_path, 
            '-ar', '44100',  # Sample rate
            '-ac', '2',      # Stereo
            '-y',            # Overwrite output file
            output_path
        ]
        subprocess.run(cmd, check=True, capture_output=True)
        return True
    except subprocess.CalledProcessError as e:
        print(f"FFmpeg error: {e}")
        return False
    except FileNotFoundError:
        print("FFmpeg not found. Please install ffmpeg.")
        return False

def update_progress_gradually(generation_id, start_progress, end_progress, duration_seconds):
    """Gradually update progress over time to show activity during long operations"""
    start_time = time.time()
    
    while time.time() - start_time < duration_seconds:
        if generation_id not in generation_status:
            break
            
        elapsed = time.time() - start_time
        progress_fraction = elapsed / duration_seconds
        current_progress = start_progress + (end_progress - start_progress) * progress_fraction
        
        # Only update if the status hasn't moved beyond our target
        if generation_status[generation_id]['progress'] < end_progress:
            generation_status[generation_id]['progress'] = min(int(current_progress), end_progress)
        
        time.sleep(2)  # Update every 2 seconds

def generate_dance_async(generation_id, audio_file_path, params):
    """Asynchronously generate dance from audio file"""
    try:
        generation_status[generation_id]['status'] = 'processing'
        generation_status[generation_id]['progress'] = 10
        generation_status[generation_id]['message'] = 'Starting dance generation...'
        
        # Convert to WAV if needed
        file_ext = os.path.splitext(audio_file_path)[1].lower()
        if file_ext != '.wav':
            wav_path = os.path.splitext(audio_file_path)[0] + '.wav'
            generation_status[generation_id]['progress'] = 20
            generation_status[generation_id]['message'] = 'Converting audio format...'
            
            if not convert_audio_to_wav(audio_file_path, wav_path):
                raise Exception("Failed to convert audio to WAV format")
            audio_file_path = wav_path
        
        generation_status[generation_id]['progress'] = 30
        generation_status[generation_id]['message'] = 'Extracting audio features...'
        
        # Change to external directory for EDGE model execution
        original_cwd = os.getcwd()
        external_dir = os.path.join(os.path.dirname(__file__), 'external')
        os.chdir(external_dir)
        
        try:
            # Convert audio file path to absolute path since we're changing directories
            abs_audio_path = os.path.abspath(os.path.join(original_cwd, audio_file_path))
            abs_output_dir = os.path.abspath(os.path.join(original_cwd, OUTPUT_FOLDER))
            abs_motion_dir = os.path.abspath(os.path.join(original_cwd, MOTION_FOLDER))
            
            # Update progress before model generation
            generation_status[generation_id]['progress'] = 50
            generation_status[generation_id]['message'] = 'Loading AI model and generating dance...'
            
            # Start gradual progress update in background
            progress_thread = threading.Thread(
                target=update_progress_gradually, 
                args=(generation_id, 50, 80, 120)  # Gradually go from 50% to 80% over 2 minutes
            )
            progress_thread.daemon = True
            progress_thread.start()
            
            # Generate dance using the EDGE model
            result = generate_dance_from_single_file(
                audio_file_path=abs_audio_path,
                output_dir=abs_output_dir,
                motion_save_dir=abs_motion_dir,
                checkpoint_path='checkpoint.pt',  # Now relative to external directory
                feature_type=params.get('feature_type', 'jukebox'),
                generation_id=generation_id
            )
        finally:
            # Always return to original directory
            os.chdir(original_cwd)
        
        generation_status[generation_id]['progress'] = 85
        generation_status[generation_id]['message'] = 'Finalizing dance video...'
        
        # Skip FBX conversion for now (can be enabled later if needed)
        fbx_path = None
        # if params.get('generate_fbx', False) and result.get('motion_path'):
        #     fbx_path = convert_motion_to_fbx(result['motion_path'], generation_id)
        
        generation_status[generation_id]['progress'] = 100
        generation_status[generation_id]['status'] = 'completed'
        generation_status[generation_id]['message'] = 'Dance generation completed!'
        
        # Find the actual generated files
        # Use first 8 characters of generation_id for file lookup (matching single_music_generator)
        short_generation_id = generation_id[:8]
        video_files = list(Path(OUTPUT_FOLDER).glob(f"*{short_generation_id}*.mp4"))
        motion_files = list(Path(MOTION_FOLDER).glob(f"*{short_generation_id}*.pkl"))
        
        video_path = str(video_files[0]) if video_files else result.get('video_path')
        motion_path = str(motion_files[0]) if motion_files else result.get('motion_path')
        
        generation_status[generation_id]['result'] = {
            'video_path': video_path,
            'motion_path': motion_path,
            'fbx_path': fbx_path,
            'generation_id': generation_id,
            'video_filename': os.path.basename(video_path) if video_path else None
        }
        
    except Exception as e:
        generation_status[generation_id]['status'] = 'error'
        generation_status[generation_id]['message'] = f'Error: {str(e)}'
        generation_status[generation_id]['error'] = str(e)
        print(f"Generation error for {generation_id}: {e}")

def convert_motion_to_fbx(motion_path, generation_id):
    """Convert motion data to FBX format using SMPL-to-FBX converter"""
    try:
        # Create temporary directory for this conversion
        temp_motion_dir = os.path.join(MOTION_FOLDER, f'temp_{generation_id}')
        Path(temp_motion_dir).mkdir(parents=True, exist_ok=True)
        
        # Copy motion file to temporary directory
        temp_motion_path = os.path.join(temp_motion_dir, os.path.basename(motion_path))
        shutil.copy2(motion_path, temp_motion_path)
        
        # Output directory for FBX
        fbx_output_dir = os.path.join(FBX_OUTPUT_FOLDER, generation_id)
        Path(fbx_output_dir).mkdir(parents=True, exist_ok=True)
        
        # Run SMPL-to-FBX conversion
        convert_script = os.path.join('external', 'SMPL-to-FBX', 'Convert.py')
        fbx_source = os.path.join('external', 'SMPL-to-FBX', 'ybot.fbx')
        
        if os.path.exists(convert_script) and os.path.exists(fbx_source):
            cmd = [
                'python3', convert_script,
                '--input_dir', temp_motion_dir,
                '--fbx_source_path', fbx_source,
                '--output_dir', fbx_output_dir
            ]
            
            subprocess.run(cmd, check=True, cwd='external')
            
            # Find the generated FBX file
            fbx_files = list(Path(fbx_output_dir).glob('*.fbx'))
            if fbx_files:
                return str(fbx_files[0])
        
        return None
        
    except Exception as e:
        print(f"FBX conversion error: {e}")
        return None

@app.route('/api/upload', methods=['POST'])
def upload_file():
    """Handle music file upload"""
    try:
        if 'audio' not in request.files:
            return jsonify({'error': 'No audio file provided'}), 400
        
        file = request.files['audio']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'File type not allowed. Please upload WAV, MP3, FLAC, or M4A files.'}), 400
        
        # Generate unique ID for this upload
        upload_id = str(uuid.uuid4())
        
        # Save uploaded file
        filename = secure_filename(f"{upload_id}_{file.filename}")
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(file_path)
        
        return jsonify({
            'upload_id': upload_id,
            'filename': file.filename,
            'message': 'File uploaded successfully'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/generate', methods=['POST'])
def generate_dance():
    """Start dance generation process"""
    try:
        data = request.get_json()
        upload_id = data.get('upload_id')
        
        print(f"DEBUG: Received generate request with upload_id: {upload_id}")
        print(f"DEBUG: Request data: {data}")
        
        if not upload_id:
            print("DEBUG: No upload_id provided in request")
            return jsonify({'error': 'Upload ID required'}), 400
        
        # Find uploaded file
        upload_files = list(Path(UPLOAD_FOLDER).glob(f"{upload_id}_*"))
        print(f"DEBUG: Looking for files matching pattern: {upload_id}_*")
        print(f"DEBUG: Found upload files: {upload_files}")
        
        if not upload_files:
            # List all files in upload folder for debugging
            all_files = list(Path(UPLOAD_FOLDER).glob("*"))
            print(f"DEBUG: All files in upload folder: {all_files}")
            return jsonify({'error': 'Uploaded file not found'}), 404
        
        audio_file_path = str(upload_files[0])
        generation_id = str(uuid.uuid4())
        
        # Initialize generation status
        generation_status[generation_id] = {
            'status': 'queued',
            'progress': 0,
            'message': 'Generation queued...',
            'upload_id': upload_id,
            'created_at': time.time()
        }
        
        # Extract generation parameters
        params = {
            'feature_type': data.get('feature_type', 'jukebox'),
            'generate_fbx': data.get('generate_fbx', True),
            'dance_style': data.get('dance_style', 'freestyle'),
            'skill_level': data.get('skill_level', 3)
        }
        
        # Start generation in background thread
        thread = threading.Thread(
            target=generate_dance_async, 
            args=(generation_id, audio_file_path, params)
        )
        thread.daemon = True
        thread.start()
        
        return jsonify({
            'generation_id': generation_id,
            'message': 'Dance generation started'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/status/<generation_id>', methods=['GET'])
def get_generation_status(generation_id):
    """Get status of dance generation"""
    if generation_id not in generation_status:
        return jsonify({'error': 'Generation ID not found'}), 404
    
    status = generation_status[generation_id].copy()
    return jsonify(status)

@app.route('/api/download/<generation_id>/<file_type>', methods=['GET'])
def download_file(generation_id, file_type):
    """Download generated files"""
    try:
        if generation_id not in generation_status:
            return jsonify({'error': 'Generation ID not found'}), 404
        
        status = generation_status[generation_id]
        if status['status'] != 'completed':
            return jsonify({'error': 'Generation not completed'}), 400
        
        result = status.get('result', {})
        
        if file_type == 'video' and result.get('video_path'):
            return send_file(result['video_path'], as_attachment=True)
        elif file_type == 'fbx' and result.get('fbx_path'):
            return send_file(result['fbx_path'], as_attachment=True)
        elif file_type == 'motion' and result.get('motion_path'):
            return send_file(result['motion_path'], as_attachment=True)
        else:
            return jsonify({'error': f'File type {file_type} not available'}), 404
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/cleanup/<generation_id>', methods=['DELETE'])
def cleanup_generation(generation_id):
    """Clean up files for a generation"""
    try:
        if generation_id in generation_status:
            # Remove files
            status = generation_status[generation_id]
            result = status.get('result', {})
            
            for file_path in [result.get('video_path'), result.get('motion_path'), result.get('fbx_path')]:
                if file_path and os.path.exists(file_path):
                    os.remove(file_path)
            
            # Remove from status tracking
            del generation_status[generation_id]
            
        return jsonify({'message': 'Cleanup completed'})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'active_generations': len([g for g in generation_status.values() if g['status'] in ['queued', 'processing']])
    })

@app.route('/outputs/<path:filename>')
def serve_output_file(filename):
    """Serve generated output files directly"""
    try:
        return send_from_directory(OUTPUT_FOLDER, filename)
    except FileNotFoundError:
        return jsonify({'error': 'File not found'}), 404

if __name__ == '__main__':
    # Render / production friendly startup
    venv_path = os.path.join('external', '.venv')
    if os.path.exists(venv_path):
        print(f"(Note) Virtual environment detected at: {venv_path}")

    port = int(os.getenv('PORT', '5001'))  # Render provides PORT env var
    frontend_origin = os.getenv('FRONTEND_ORIGIN')
    if frontend_origin:
        try:
            from flask_cors import CORS as _CORS
            _CORS(app, resources={r"/api/*": {"origins": [frontend_origin]}}, supports_credentials=True)
            print(f"CORS restricted to origin: {frontend_origin}")
        except Exception as _e:
            print(f"Could not tighten CORS: {_e}")

    print("Starting Dance Generation Backend Server (production-aware)...")
    print(f"Listening on 0.0.0.0:{port}")
    print("\nAvailable endpoints:")
    print("POST /api/upload - Upload music file")
    print("POST /api/generate - Start dance generation")
    print("GET  /api/status/<id> - Check generation status")
    print("GET  /api/download/<id>/<type> - Download generated files")
    print("GET  /api/health - Health check")
    
    # In container / Render this will be replaced by gunicorn, but keep for local fallback
    app.run(host='0.0.0.0', port=port, debug=os.getenv('FLASK_DEBUG','0')=='1')