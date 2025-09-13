-- Create tables only (no policies yet)
-- Run this first to create the basic tables

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
