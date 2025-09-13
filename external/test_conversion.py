#!/usr/bin/env python

import sys
import traceback
sys.path.append('SMPL-to-FBX')

from tqdm import tqdm
from FbxReadWriter import FbxReadWrite
from SmplObject import SmplObjects

def convert_with_debug():
    input_dir = "SMPL-to-FBX/motions"
    fbx_source_path = "SMPL-to-FBX/ybot.fbx"
    output_dir = "SMPL-to-FBX/fbx_out"
    
    print("Loading SMPL objects...")
    smplObjects = SmplObjects(input_dir)
    print(f"Found {len(list(smplObjects))} motion files")
    
    # Reset the iterator
    smplObjects = SmplObjects(input_dir)
    
    for pkl_name, smpl_params in tqdm(smplObjects):
        print(f"\nProcessing: {pkl_name}")
        try:
            print("  Creating FbxReadWrite...")
            fbxReadWrite = FbxReadWrite(fbx_source_path)
            print("  ✓ FbxReadWrite created")
            
            print("  Adding animation...")
            fbxReadWrite.addAnimation(pkl_name, smpl_params)
            print("  ✓ Animation added")
            
            print("  Writing FBX...")
            fbxReadWrite.writeFbx(output_dir, pkl_name)
            print("  ✓ FBX written")
            
            print("  Destroying...")
            fbxReadWrite.destroy()
            print("  ✓ Destroyed")
            
        except Exception as e:
            print(f"  ✗ Error: {e}")
            traceback.print_exc()
            if 'fbxReadWrite' in locals():
                try:
                    fbxReadWrite.destroy()
                except:
                    pass
            break

if __name__ == "__main__":
    convert_with_debug()