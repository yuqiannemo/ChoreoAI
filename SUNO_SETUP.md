# Suno AI Integration Setup

This guide will help you set up the Suno AI integration for generating custom songs in ChoreoAI.

## Prerequisites

1. **Suno API Access**: You need access to the Suno AI API. Based on the [Suno HackMIT 2025 API Documentation](https://suno-ai.notion.site/Suno-HackMIT-2025-API-Docs-a47928f8b7ca4b7ab8e0af8a1323ebf1), you'll need:
   - A valid API key
   - Access to the Suno API endpoints

## Setup Instructions

### 1. Get Your Suno API Key

1. Visit the Suno AI platform and sign up for API access
2. Navigate to your API settings/dashboard
3. Generate a new API key
4. Copy the API key for configuration

### 2. Configure the API Key

#### Option A: Direct Configuration (Development)
Edit the `suno-service.js` file and replace the placeholder:

```javascript
// In suno-service.js, line 8
this.apiKey = 'your-actual-suno-api-key-here';
```

#### Option B: Environment Variables (Production)
For production deployment, use environment variables:

```javascript
// In suno-service.js, line 8
this.apiKey = process.env.SUNO_API_KEY || 'your-suno-api-key';
```

### 3. Update API Endpoint (if needed)

If the API endpoint differs from the default, update it in `suno-service.js`:

```javascript
// In suno-service.js, line 9
this.baseUrl = 'https://your-actual-suno-api-endpoint.com/v1';
```

## Features

The Suno AI integration provides the following features:

### 🎵 Song Generation
- **Custom Prompts**: Describe the song you want to create
- **Style Selection**: Choose from Pop, Rock, Hip-Hop, Electronic, Jazz, Classical, Country, Reggae
- **Mood Control**: Set the emotional tone (Happy, Energetic, Calm, Melancholic, Romantic, Dramatic)
- **Duration Control**: Set song length between 30-300 seconds
- **Tempo Control**: Adjust BPM between 60-200

### 🔄 Workflow Integration
- **Seamless Integration**: Generated songs automatically flow into the choreography generation pipeline
- **Real-time Status**: Live updates during song generation
- **Error Handling**: Comprehensive error handling and user feedback
- **Project Management**: Generated songs are automatically saved as projects

## Usage

1. **Navigate to Upload Section**: Click "Upload Music" in the main interface
2. **Switch to Suno Tab**: Click "Generate with Suno AI" tab
3. **Fill in Details**:
   - Enter a detailed song description (minimum 10 characters)
   - Select style and mood
   - Set duration and tempo
4. **Generate**: Click "Generate Song" to start the process
5. **Wait for Completion**: The system will poll for completion and show progress
6. **Create Choreography**: Once complete, proceed to generate choreography as usual

## API Endpoints Used

Based on the Suno API documentation, the integration uses:

- `POST /v1/generate` - Start song generation
- `GET /v1/status/{generation_id}` - Check generation status
- `GET /v1/download/{generation_id}` - Download generated song
- `GET /v1/metadata/{generation_id}` - Get song metadata

## Error Handling

The integration includes comprehensive error handling for:

- **API Key Issues**: Invalid or missing API keys
- **Network Errors**: Connection timeouts and network issues
- **Validation Errors**: Invalid input parameters
- **Generation Failures**: API-side generation errors
- **Timeout Handling**: Long-running generation processes

## Troubleshooting

### Common Issues

1. **"Suno AI service is not available"**
   - Check that your API key is correctly configured
   - Verify the API endpoint URL is correct
   - Ensure you have valid API access

2. **"Generation timeout"**
   - Song generation can take up to 5 minutes
   - Check your internet connection
   - Verify the Suno API service is operational

3. **"Invalid parameters"**
   - Ensure song description is at least 10 characters
   - Check that duration is between 30-300 seconds
   - Verify tempo is between 60-200 BPM

### Debug Mode

Enable debug logging by opening browser developer tools and checking the console for detailed error messages.

## Security Notes

- **Never commit API keys to version control**
- **Use environment variables in production**
- **Implement rate limiting for production use**
- **Monitor API usage and costs**

## Support

For issues related to:
- **Suno API**: Contact Suno AI support
- **ChoreoAI Integration**: Check the application logs and error messages
- **General Issues**: Refer to the main ChoreoAI documentation

## Cost Considerations

- Suno API usage may incur costs
- Monitor your API usage through the Suno dashboard
- Consider implementing usage limits for production deployments

---

*Last updated: January 2025*
