# Manual Sample File Upload to Supabase

## Quick Steps to Upload Your Sample File

### 1. Go to Supabase Dashboard
- Open your browser and go to: https://supabase.com/dashboard
- Sign in to your account
- Select your project: `likdbicjuoqqwwrfjial`

### 2. Navigate to Storage
- In the left sidebar, click on **"Storage"**
- You should see your storage buckets

### 3. Access the Audio Files Bucket
- Click on the **"audio-files"** bucket
- This is where your audio files are stored

### 4. Create Sample Folder
- Click **"New folder"** button
- Name it: `samples`
- Click **"Create folder"**

### 5. Upload Your Sample File
- Navigate into the `samples` folder
- Click **"Upload file"** button
- Select your file: `Rick Astley - Never Gonna Give You Up (Official Music Video) 4.mp3`
- **Important**: Rename it to `rick-astley-sample.mp3` during upload
- Click **"Upload"**

### 6. Make File Public
- After upload, click on the uploaded file
- In the file details, make sure it's set to **"Public"**
- If not, click the toggle to make it public

### 7. Get the File URL
- The file URL should be:
  ```
  https://likdbicjuoqqwwrfjial.supabase.co/storage/v1/object/public/audio-files/samples/rick-astley-sample.mp3
  ```

### 8. Test the Upload
- Copy the URL above
- Paste it in a new browser tab
- The audio file should start playing/downloading

## Alternative: Direct File Upload

If you prefer, you can also:

1. **Drag and drop** the file directly into the `samples` folder
2. **Right-click** on the file after upload
3. **Select "Make public"** from the context menu

## Verify It's Working

After uploading:

1. Go back to your ChoreoAI application
2. Click the **"Try Sample"** button
3. Check the browser console - you should see: `"Using Supabase sample file"`
4. The generation process should start with the real audio file

## File Structure in Supabase

Your storage should look like this:
```
audio-files/
├── samples/
│   └── rick-astley-sample.mp3  ← Your sample file
└── [user-uploads]/
    └── [user-id]/
        └── [project-files]/
```

That's it! The manual upload is much simpler than the automated scripts.
