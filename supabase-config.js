// Supabase Configuration
// Using CDN version - no import needed

// Your Supabase project credentials
const supabaseUrl = 'https://likdbicjuoqqwwrfjial.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxpa2RiaWNqdW9xcXd3cmZqaWFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3ODU5MzIsImV4cCI6MjA3MzM2MTkzMn0.T9IGw2rSxAK-3IE1dfDbjqosT91mUscO_yPJZMNguT4'

// Create Supabase client using global supabase object from CDN
const supabase = supabase.createClient(supabaseUrl, supabaseAnonKey)

// Storage bucket names
export const STORAGE_BUCKETS = {
    AUDIO: 'audio-files',
    VIDEOS: 'choreography-videos',
    THUMBNAILS: 'video-thumbnails'
}

// Database table names
export const TABLES = {
    PROJECTS: 'choreography_projects',
    USERS: 'users'
}
