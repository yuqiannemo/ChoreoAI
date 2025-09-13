#!/usr/bin/env python

# Simple test to see what's causing the segfault
import sys
sys.path.append('SMPL-to-FBX')

try:
    print("Testing FBX import...")
    import fbx
    print("✓ FBX import successful")
    
    print("Testing FbxCommon import...")
    from FbxCommon import *
    print("✓ FbxCommon import successful")
    
    print("Testing SDK initialization...")
    lSdkManager, lScene = InitializeSdkObjects()
    print("✓ SDK initialization successful")
    
    print("Testing scene loading...")
    result = LoadScene(lSdkManager, lScene, "SMPL-to-FBX/ybot.fbx")
    print(f"✓ Scene loading result: {result}")
    
    print("All tests passed!")
    
except Exception as e:
    print(f"✗ Error: {e}")
    import traceback
    traceback.print_exc()