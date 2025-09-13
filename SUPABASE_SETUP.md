# Supabase Setup Guide for AI Choreographer

This guide will help you set up Supabase for your AI Choreographer application.

## 🚀 Quick Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `ai-choreographer`
   - **Database Password**: Choose a strong password
   - **Region**: Choose closest to your users
5. Click "Create new project"

### 2. Get Your Project Credentials

1. Go to **Settings** → **API**
2. Copy your:
   - **Project URL** (looks like: `https://your-project.supabase.co`)
   - **Anon/Public Key** (starts with `eyJ...`)

### 3. Update Configuration

1. Open `supabase-config.js`
2. Replace the placeholder values:

```javascript
const supabaseUrl = 'https://your-project.supabase.co'  // Your Project URL
const supabaseAnonKey = 'eyJ...'  // Your Anon Key
```

### 4. Set Up Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Copy the contents of `supabase-schema.sql`
3. Paste it into the SQL editor
4. Click **Run** to execute the schema

### 5. Set Up Storage Buckets

The schema will automatically create these storage buckets:
- `audio-files` - For uploaded music files
- `choreography-videos` - For generated choreography videos
- `video-thumbnails` - For video thumbnails (public)

### 6. Install Dependencies

```bash
cd ai-choreographer-frontend
npm install
```

### 7. Run the Application

```bash
npm run dev
```

## 📁 File Organization

### Audio Upload Workflow:
1. **User uploads audio** → Supabase Storage (`audio-files` bucket)
2. **Project created** → Database (`choreography_projects` table)
3. **AI processes audio** → Your AI API
4. **Video generated** → Supabase Storage (`choreography-videos` bucket)
5. **Project updated** → Database with video info

### File Structure:
```
audio-files/
├── {user-id}/
│   ├── {project-id}.mp3
│   └── {project-id}.wav

choreography-videos/
├── {user-id}/
│   ├── {project-id}.mp4
│   └── {project-id}.webm

video-thumbnails/
├── {user-id}/
│   ├── {project-id}_thumb.jpg
│   └── {project-id}_thumb.png
```

## 🔐 Security Features

### Row Level Security (RLS)
- Users can only access their own projects
- Files are organized by user ID
- Automatic user profile creation on signup

### Storage Policies
- Users can only upload to their own folders
- Audio/video files are private
- Thumbnails are public for easy sharing

## 🎯 Key Features

### Real-time Updates
- Progress tracking during AI generation
- Live project status updates
- Automatic UI updates

### File Management
- Automatic file cleanup on project deletion
- Storage usage tracking
- Public/private file access control

### User Management
- Email/password authentication
- User profiles with subscription tiers
- Project history and management

## 🔧 API Integration

### For Your AI API:

1. **Audio Processing Endpoint**:
```javascript
// When user uploads audio, call your AI API
const response = await fetch('YOUR_AI_API_ENDPOINT', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: JSON.stringify({
    audio_url: audioFileUrl,
    project_id: projectId,
    settings: {
      dance_style: 'hiphop',
      skill_level: 3,
      tempo_preference: 120
    }
  })
});
```

2. **Progress Updates**:
```javascript
// Your AI API should update the project status
await supabase
  .from('choreography_projects')
  .update({
    processing_progress: 50,
    status: 'processing'
  })
  .eq('id', projectId);
```

3. **Video Upload**:
```javascript
// After generating video, upload to Supabase
const videoUpload = await choreographyService.uploadVideoFile(videoBlob, projectId);

// Update project with video info
await supabase
  .from('choreography_projects')
  .update({
    video_file_path: videoUpload.path,
    status: 'completed',
    processing_progress: 100
  })
  .eq('id', projectId);
```

## 📊 Database Schema

### Tables:
- `users` - User profiles and subscription info
- `choreography_projects` - Project metadata and settings
- `storage.objects` - File storage (managed by Supabase)

### Key Fields:
- **Project Status**: `uploaded` → `processing` → `completed`/`failed`
- **File Paths**: Organized by user ID for security
- **Settings**: Dance style, skill level, tempo preferences
- **Timestamps**: Created, updated, completed times

## 🚨 Important Notes

1. **File Size Limits**: Supabase has file size limits (50MB for free tier)
2. **Rate Limits**: Be aware of API rate limits for file uploads
3. **Error Handling**: Always handle upload failures gracefully
4. **Cleanup**: Implement cleanup for failed uploads
5. **Backup**: Consider backup strategies for important files

## 🔍 Troubleshooting

### Common Issues:

1. **CORS Errors**: Make sure your domain is allowed in Supabase settings
2. **File Upload Fails**: Check file size and format restrictions
3. **Authentication Issues**: Verify your API keys are correct
4. **Database Errors**: Check RLS policies and user permissions

### Debug Mode:
```javascript
// Enable debug logging
localStorage.setItem('supabase.debug', 'true');
```

## 📈 Scaling Considerations

### For Production:
1. **CDN**: Use Supabase CDN for faster file delivery
2. **Caching**: Implement caching for frequently accessed files
3. **Monitoring**: Set up monitoring for storage usage
4. **Backup**: Implement automated backups
5. **Analytics**: Track usage patterns and optimize

### Storage Optimization:
- Compress audio files before upload
- Generate multiple video qualities
- Use efficient thumbnail generation
- Implement file cleanup policies

## 🎉 You're Ready!

Your AI Choreographer is now ready to:
- ✅ Handle user authentication
- ✅ Upload and store audio files
- ✅ Track project progress
- ✅ Store generated videos
- ✅ Manage user projects
- ✅ Provide real-time updates

Next steps:
1. Integrate with your AI API
2. Add more sophisticated UI components
3. Implement advanced features like sharing
4. Add analytics and monitoring
