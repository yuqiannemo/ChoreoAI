#!/usr/bin/env python3
"""
Create a placeholder video for ChoreoAI testing
This script creates a simple MP4 video with a dancing animation
"""

import cv2
import numpy as np
import os

def create_placeholder_video():
    # Video parameters
    width, height = 640, 480
    fps = 30
    duration = 10  # 10 seconds for testing
    total_frames = fps * duration
    
    # Create video writer
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter('placeholder-video.mp4', fourcc, fps, (width, height))
    
    print(f"Creating placeholder video: {width}x{height}, {fps} FPS, {duration} seconds")
    
    for frame_num in range(total_frames):
        # Create frame with gradient background
        frame = np.zeros((height, width, 3), dtype=np.uint8)
        
        # Create gradient background
        for y in range(height):
            for x in range(width):
                # Purple to pink gradient
                r = int(255 * (x / width))
                g = int(53 * (1 - x / width) + 64 * (x / width))
                b = int(177 * (1 - x / width) + 129 * (x / width))
                frame[y, x] = [b, g, r]  # BGR format for OpenCV
        
        # Add dancing figure (simple stick figure)
        center_x, center_y = width // 2, height // 2
        
        # Animate the figure
        time = frame_num / fps
        dance_offset = int(20 * np.sin(time * 4))  # Dancing motion
        
        # Head
        cv2.circle(frame, (center_x, center_y - 80 + dance_offset), 20, (255, 255, 255), -1)
        
        # Body
        cv2.line(frame, (center_x, center_y - 60 + dance_offset), (center_x, center_y + 40), (255, 255, 255), 4)
        
        # Arms (dancing motion)
        arm_swing = int(30 * np.sin(time * 6))
        cv2.line(frame, (center_x, center_y - 40 + dance_offset), 
                (center_x - 40 + arm_swing, center_y - 20 + dance_offset), (255, 255, 255), 3)
        cv2.line(frame, (center_x, center_y - 40 + dance_offset), 
                (center_x + 40 - arm_swing, center_y - 20 + dance_offset), (255, 255, 255), 3)
        
        # Legs (dancing motion)
        leg_swing = int(25 * np.sin(time * 8))
        cv2.line(frame, (center_x, center_y + 40), 
                (center_x - 30 + leg_swing, center_y + 100), (255, 255, 255), 3)
        cv2.line(frame, (center_x, center_y + 40), 
                (center_x + 30 - leg_swing, center_y + 100), (255, 255, 255), 3)
        
        # Add text
        cv2.putText(frame, "ChoreoAI", (center_x - 80, center_y + 150), 
                   cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
        cv2.putText(frame, "Placeholder Video", (center_x - 100, center_y + 180), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
        
        # Add progress indicator
        progress = frame_num / total_frames
        progress_width = int(200 * progress)
        cv2.rectangle(frame, (center_x - 100, center_y + 200), 
                     (center_x - 100 + progress_width, center_y + 210), (0, 229, 255), -1)
        cv2.rectangle(frame, (center_x - 100, center_y + 200), 
                     (center_x + 100, center_y + 210), (255, 255, 255), 2)
        
        # Write frame
        out.write(frame)
        
        # Progress indicator
        if frame_num % 30 == 0:
            print(f"Progress: {frame_num}/{total_frames} frames ({progress*100:.1f}%)")
    
    # Release everything
    out.release()
    print("Placeholder video created: placeholder-video.mp4")
    
    # Get file size
    file_size = os.path.getsize('placeholder-video.mp4')
    print(f"File size: {file_size / 1024:.1f} KB")

if __name__ == "__main__":
    try:
        create_placeholder_video()
    except ImportError:
        print("OpenCV not available. Creating a simple text-based placeholder instead.")
        # Create a simple text file as fallback
        with open('placeholder-video.txt', 'w') as f:
            f.write("Placeholder video for ChoreoAI testing\n")
            f.write("This file represents a generated dance video\n")
            f.write("Duration: 10 seconds\n")
            f.write("Resolution: 640x480\n")
            f.write("Format: MP4\n")
        print("Created placeholder-video.txt as fallback")
