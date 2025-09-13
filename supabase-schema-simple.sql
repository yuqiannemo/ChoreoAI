-- Simplified Supabase Database Schema for AI Choreographer
-- This version works without owner privileges

-- Create users table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'enterprise')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create choreography projects table
CREATE TABLE IF NOT EXISTS public.choreography_projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    
    -- Audio file information
    audio_file_name TEXT NOT NULL,
    audio_file_path TEXT NOT NULL,
    audio_file_size BIGINT,
    audio_file_type TEXT,
    audio_duration FLOAT, -- in seconds
    
    -- Generation settings
    dance_style TEXT NOT NULL CHECK (dance_style IN ('hiphop', 'ballet', 'house', 'contemporary', 'jazz', 'popping')),
    skill_level INTEGER CHECK (skill_level >= 1 AND skill_level <= 5),
    tempo_preference INTEGER CHECK (tempo_preference >= 60 AND tempo_preference <= 180),
    complexity_level INTEGER CHECK (complexity_level >= 1 AND complexity_level <= 5),
    
    -- Video file information
    video_file_name TEXT,
    video_file_path TEXT,
    video_file_size BIGINT,
    video_duration FLOAT, -- in seconds
    thumbnail_path TEXT,
    
    -- Processing status
    status TEXT DEFAULT 'uploaded' CHECK (status IN ('uploaded', 'processing', 'completed', 'failed', 'cancelled')),
    processing_progress INTEGER DEFAULT 0 CHECK (processing_progress >= 0 AND processing_progress <= 100),
    error_message TEXT,
    
    -- AI model information
    model_version TEXT,
    generation_time FLOAT, -- in seconds
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_choreography_projects_user_id ON public.choreography_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_choreography_projects_status ON public.choreography_projects(status);
CREATE INDEX IF NOT EXISTS idx_choreography_projects_created_at ON public.choreography_projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_choreography_projects_dance_style ON public.choreography_projects(dance_style);

-- Create storage buckets (this might need to be done manually in the dashboard)
-- Go to Storage > Create Bucket and create these manually:
-- 1. audio-files (private)
-- 2. choreography-videos (private) 
-- 3. video-thumbnails (public)

-- Row Level Security Policies

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

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_choreography_projects_updated_at BEFORE UPDATE ON public.choreography_projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.choreography_projects ENABLE ROW LEVEL SECURITY;

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
