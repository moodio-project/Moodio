require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Test environment variables route
app.get('/api/ai/test-env', (req, res) => {
  res.json({
    genius_key: process.env.GENIUS_API_KEY ? 'Present' : 'Missing',
    openai_key: process.env.OPENAI_API_KEY ? 'Present' : 'Missing',
    spotify_client: process.env.SPOTIFY_CLIENT_ID ? 'Present' : 'Missing',
    spotify_secret: process.env.SPOTIFY_CLIENT_SECRET ? 'Present' : 'Missing',
    database_url: process.env.DATABASE_URL ? 'Present' : 'Missing'
  });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Simple test server running on port ${PORT}`);
  console.log('Test the environment variables at: http://localhost:3001/api/ai/test-env');
}); 