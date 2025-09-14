import os
import sys
from pathlib import Path
from tempfile import TemporaryDirectory
import random
import uuid

import jukemirlib
import numpy as np
import torch
from tqdm import tqdm

from args import parse_test_opt
from data.slice import slice_audio
from EDGE import EDGE
from data.audio_extraction.baseline_features import extract as baseline_extract
from data.audio_extraction.jukebox_features import extract as juke_extract

def generate_dance_from_single_file(audio_file_path, output_dir=None, motion_save_dir=None, checkpoint_path="checkpoint.pt", feature_type="jukebox", generation_id=None):
    """
    Generate dance motion from a single audio file
    
    Args:
        audio_file_path (str): Path to the input audio file
        output_dir (str): Directory to save rendered videos (optional)
        motion_save_dir (str): Directory to save motion files for FBX conversion
        checkpoint_path (str): Path to the model checkpoint
        feature_type (str): Type of features to extract ("jukebox" or "baseline")
    
    Returns:
        dict: Dictionary containing paths to generated files
    """
    
    # Validate input file
    if not os.path.exists(audio_file_path):
        raise FileNotFoundError(f"Audio file not found: {audio_file_path}")
    
    # Setup directories
    if output_dir is None:
        output_dir = "renders"
    if motion_save_dir is None:
        motion_save_dir = "SMPL-to-FBX/motions"
    
    Path(output_dir).mkdir(parents=True, exist_ok=True)
    Path(motion_save_dir).mkdir(parents=True, exist_ok=True)
    
    # Generate unique identifier for this generation
    if generation_id is None:
        generation_id = str(uuid.uuid4())[:8]
    else:
        # Use first 8 characters for file naming to keep it manageable
        generation_id = str(generation_id)[:8]
    
    # Setup feature extraction function
    feature_func = juke_extract if feature_type == "jukebox" else baseline_extract
    sample_length = 60  # Reduced to 1 minute for faster generation
    sample_size = int(sample_length / 2.5) - 1
    
    # Create temporary directory for audio slicing
    temp_dir = TemporaryDirectory()
    temp_dirname = temp_dir.name
    
    try:
        print(f"Processing audio file: {audio_file_path}")
        
        # Slice the audio file into 2.5 second chunks
        print("Slicing audio...")
        slice_audio(audio_file_path, 2.5, 5.0, temp_dirname)
        
        # Get all sliced files
        import glob
        from functools import cmp_to_key
        
        # Sort function for slice files
        key_func = lambda x: int(os.path.splitext(x)[0].split("_")[-1].split("slice")[-1])
        def stringintcmp_(a, b):
            aa, bb = "".join(a.split("_")[:-1]), "".join(b.split("_")[:-1])
            ka, kb = key_func(a), key_func(b)
            if aa < bb:
                return -1
            if aa > bb:
                return 1
            if ka < kb:
                return -1
            if ka > kb:
                return 1
            return 0
        stringintkey = cmp_to_key(stringintcmp_)
        
        file_list = sorted(glob.glob(f"{temp_dirname}/*.wav"), key=stringintkey)
        
        if len(file_list) < sample_size:
            print(f"Warning: Audio file too short. Only {len(file_list)} chunks available, need {sample_size}")
            sample_size = len(file_list)
        
        # Randomly sample a chunk or use the beginning if file is short
        if len(file_list) <= sample_size:
            rand_idx = 0
            selected_files = file_list
        else:
            rand_idx = random.randint(0, len(file_list) - sample_size)
            selected_files = file_list[rand_idx : rand_idx + sample_size]
        
        # Extract features for selected audio chunks
        print("Extracting audio features...")
        cond_list = []
        for file in tqdm(selected_files):
            reps, _ = feature_func(file)
            cond_list.append(reps)
        
        cond_tensor = torch.from_numpy(np.array(cond_list))
        
        # Ensure tensor is on the correct device and properly formed
        device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        print(f"Using device: {device}")
        
        # Validate tensor before moving to device
        if cond_tensor.numel() == 0:
            raise ValueError("Empty condition tensor - audio features could not be extracted")
        
        # Move tensor to device and ensure it's contiguous
        cond_tensor = cond_tensor.to(device).contiguous().float()
        print(f"Condition tensor shape: {cond_tensor.shape}, device: {cond_tensor.device}, dtype: {cond_tensor.dtype}")
        
        # Verify tensor is not a meta tensor
        if cond_tensor.is_meta:
            raise RuntimeError("Condition tensor is a meta tensor - cannot proceed with generation")
        
        # Load the EDGE model
        print("Loading EDGE model...")
        model = EDGE(feature_type, checkpoint_path)
        model.eval()
        
        # Generate dance
        print("Generating dance...")
        data_tuple = (None, cond_tensor, selected_files)
        
        # Create output filename based on input
        input_filename = os.path.splitext(os.path.basename(audio_file_path))[0]
        output_filename = f"{input_filename}_{generation_id}"
        
        # Render the dance
        model.render_sample(
            data_tuple, 
            output_filename, 
            output_dir, 
            render_count=-1, 
            fk_out=motion_save_dir, 
            render=True
        )
        
        # Clean up
        torch.cuda.empty_cache()
        
        # Construct result paths - look for files containing the generation_id
        # The EDGE model creates files with complex names, so we need to search for them
        import glob
        
        video_files = glob.glob(os.path.join(output_dir, f"*{generation_id}*.mp4"))
        motion_files = glob.glob(os.path.join(motion_save_dir, f"*{generation_id}*.pkl"))
        
        video_path = video_files[0] if video_files else None
        motion_path = motion_files[0] if motion_files else None
        
        result = {
            "generation_id": generation_id,
            "video_path": video_path,
            "motion_path": motion_path,
            "input_file": audio_file_path,
            "output_dir": output_dir,
            "motion_save_dir": motion_save_dir
        }
        
        print(f"Dance generation completed!")
        print(f"Video saved to: {result['video_path']}")
        print(f"Motion data saved to: {result['motion_path']}")
        
        return result
        
    except Exception as e:
        print(f"Error during dance generation: {str(e)}")
        raise e
    finally:
        # Clean up temporary directory
        temp_dir.cleanup()

def main():
    """Command line interface for single file processing"""
    import argparse
    
    parser = argparse.ArgumentParser(description="Generate dance from a single audio file")
    parser.add_argument("--audio_file", type=str, required=True, help="Path to input audio file")
    parser.add_argument("--output_dir", type=str, default="renders", help="Directory to save rendered videos")
    parser.add_argument("--motion_save_dir", type=str, default="SMPL-to-FBX/motions", help="Directory to save motion files")
    parser.add_argument("--checkpoint", type=str, default="checkpoint.pt", help="Path to model checkpoint")
    parser.add_argument("--feature_type", type=str, default="jukebox", choices=["jukebox", "baseline"], help="Feature extraction type")
    
    args = parser.parse_args()
    
    try:
        result = generate_dance_from_single_file(
            audio_file_path=args.audio_file,
            output_dir=args.output_dir,
            motion_save_dir=args.motion_save_dir,
            checkpoint_path=args.checkpoint,
            feature_type=args.feature_type
        )
        
        print("\nGeneration completed successfully!")
        print("Results:", result)
        
    except Exception as e:
        print(f"Generation failed: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()