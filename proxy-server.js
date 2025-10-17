import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

// Enable CORS for all routes
app.use(cors());

// Proxy endpoint for audio files
app.get('/proxy-audio', async (req, res) => {
  const audioUrl = req.query.url;

  if (!audioUrl) {
    return res.status(400).json({ error: 'Missing url parameter' });
  }

  try {
    console.log(`Proxying audio from: ${audioUrl}`);

    // Fetch the audio file from the URL
    const response = await fetch(audioUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch audio: ${response.status}`);
    }

    // Get the content type from the original response
    const contentType = response.headers.get('content-type') || 'audio/mpeg';

    // Set appropriate headers
    res.setHeader('Content-Type', contentType);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Cache-Control', 'public, max-age=3600');

    // Stream the audio data to the client
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    res.send(buffer);

  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Failed to fetch audio file', details: error.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Audio proxy server is running' });
});

app.listen(PORT, () => {
  console.log(`Audio proxy server is running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Proxy endpoint: http://localhost:${PORT}/proxy-audio?url=<audio_url>`);
});
