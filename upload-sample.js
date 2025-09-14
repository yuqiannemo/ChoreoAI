// Script to upload the sample file to Supabase Storage
// Run this once to upload the sample file

const supabaseUrl = 'https://likdbicjuoqqwwrfjial.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxpa2RiaWNqdW9xcXd3cmZqaWFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3ODU5MzIsImV4cCI6MjA3MzM2MTkzMn0.T9IGw2rSxAK-3IE1dfDbjqosT91mUscO_yPJZMNguT4'

// Initialize Supabase client
const { createClient } = supabase
const supabaseClient = createClient(supabaseUrl, supabaseAnonKey)

async function uploadSampleFile() {
    try {
        console.log('Starting sample file upload...')
        
        // First, we need to fetch the sample file
        const response = await fetch('./sample/Rick Astley - Never Gonna Give You Up (Official Music Video) 4.mp3')
        if (!response.ok) {
            throw new Error('Failed to fetch sample file')
        }
        
        const audioBlob = await response.blob()
        console.log('Sample file fetched, size:', audioBlob.size)
        
        // Create a File object
        const sampleFile = new File([audioBlob], 'rick-astley-sample.mp3', {
            type: 'audio/mpeg',
            lastModified: Date.now()
        })
        
        // Upload to Supabase Storage
        const filePath = 'samples/rick-astley-sample.mp3'
        
        const { data, error } = await supabaseClient.storage
            .from('audio-files')
            .upload(filePath, sampleFile, {
                cacheControl: '3600',
                upsert: true // Allow overwriting if it exists
            })
        
        if (error) {
            throw error
        }
        
        console.log('Sample file uploaded successfully!')
        console.log('File path:', filePath)
        
        // Get the public URL
        const { data: urlData } = supabaseClient.storage
            .from('audio-files')
            .getPublicUrl(filePath)
        
        console.log('Public URL:', urlData.publicUrl)
        
        return {
            path: filePath,
            url: urlData.publicUrl,
            size: sampleFile.size
        }
        
    } catch (error) {
        console.error('Error uploading sample file:', error)
        throw error
    }
}

// Run the upload if this script is executed directly
if (typeof window !== 'undefined') {
    // Browser environment
    window.uploadSampleFile = uploadSampleFile
    console.log('Sample upload function available as window.uploadSampleFile()')
} else {
    // Node.js environment
    uploadSampleFile()
        .then(result => {
            console.log('Upload completed:', result)
        })
        .catch(error => {
            console.error('Upload failed:', error)
        })
}
