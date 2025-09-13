-- Supabase Database Schema Update for AI Choreographer
-- This version handles existing policies gracefully

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view own projects" ON public.choreography_projects;
DROP POLICY IF EXISTS "Users can insert own projects" ON public.choreography_projects;
DROP POLICY IF EXISTS "Users can update own projects" ON public.choreography_projects;
DROP POLICY IF EXISTS "Users can delete own projects" ON public.choreography_projects;
DROP POLICY IF EXISTS "Users can upload own audio files" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own audio files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own audio files" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own video files" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own video files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own video files" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own thumbnails" ON storage.objects;

-- Recreate all policies
-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Choreography projects policies
CREATE POLICY "Users can view own projects" ON public.choreography_projects
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects" ON public.choreography_projects
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects" ON public.choreography_projects
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects" ON public.choreography_projects
    FOR DELETE USING (auth.uid() = user_id);

-- Storage policies for audio files
CREATE POLICY "Users can upload own audio files" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'audio-files' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can view own audio files" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'audio-files' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete own audio files" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'audio-files' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Storage policies for video files
CREATE POLICY "Users can upload own video files" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'choreography-videos' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can view own video files" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'choreography-videos' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete own video files" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'choreography-videos' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Storage policies for thumbnails (public read)
CREATE POLICY "Anyone can view thumbnails" ON storage.objects
    FOR SELECT USING (bucket_id = 'video-thumbnails');

CREATE POLICY "Users can upload own thumbnails" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'video-thumbnails' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );
