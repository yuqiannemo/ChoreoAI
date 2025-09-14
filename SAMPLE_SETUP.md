# Sample File Setup Instructions

## Quick Fix for "Failed to Fetch" Error

The "failed to fetch" error occurs because the sample file hasn't been uploaded to Supabase yet. Here are the steps to fix it:

### Option 1: Upload Sample File (Recommended)

1. **Open the upload page**: Open `upload-sample.html` in your browser through a web server (like Live Server in VS Code)

2. **Upload the sample**: Click "Upload Sample File" button

3. **Test the upload**: Click "Test Sample File" to verify it works

4. **Copy the URL**: Use the URL that appears for your application

### Option 2: Use Demo Mode (Current Fallback)

The application now has a fallback system that will work even without uploading the sample file:

- If the Supabase sample file is not found, it automatically creates a demo sample
- The demo sample will still demonstrate the full workflow
- Users can still experience the choreography generation process

### Option 3: Manual Upload via Supabase Dashboard

1. Go to your Supabase dashboard
2. Navigate to Storage → audio-files bucket
3. Create a folder called "samples"
4. Upload your Rick Astley MP3 file as "rick-astley-sample.mp3"
5. Make sure the file is publicly accessible

### Current Status

The application now handles the "failed to fetch" error gracefully:

✅ **Primary**: Tries to use the real sample file from Supabase  
✅ **Fallback 1**: Uses a demo sample if Supabase file is not found  
✅ **Fallback 2**: Creates a basic demo project if all else fails  

### Testing

1. Click "Try Sample" button
2. Check the browser console for messages like:
   - "Using Supabase sample file" (if uploaded)
   - "Using demo sample (Supabase file not found)" (if not uploaded)
3. The generation process should start regardless

The sample functionality will work in all cases now!
