require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));
app.use(express.json());

// Mock user database
const users = [
  {
    id: 1,
    username: 'demo',
    email: 'demo@example.com',
    password: 'password123'
  }
];

// Mock sessions
const sessions = new Map();

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    message: 'Backend server is running!'
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

// Authentication routes
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  const user = users.find(u => u.email === email && u.password === password);
  
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = `token_${Date.now()}_${user.id}`;
  sessions.set(token, { userId: user.id, user });

  res.json({
    user: { id: user.id, username: user.username, email: user.email },
    token
  });
});

app.post('/api/auth/signup', (req, res) => {
  const { username, email, password } = req.body;
  
  // Check if user already exists
  if (users.find(u => u.email === email)) {
    return res.status(400).json({ error: 'User already exists' });
  }

  const newUser = {
    id: users.length + 1,
    username,
    email,
    password
  };

  users.push(newUser);
  
  const token = `token_${Date.now()}_${newUser.id}`;
  sessions.set(token, { userId: newUser.id, user: newUser });

  res.json({
    user: { id: newUser.id, username: newUser.username, email: newUser.email },
    token
  });
});

app.post('/api/auth/logout', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token) {
    sessions.delete(token);
  }
  res.json({ message: 'Logged out successfully' });
});

app.get('/api/auth/me', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token || !sessions.has(token)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const session = sessions.get(token);
  res.json({
    user: session.user,
    spotify_profile: null
  });
});

// Spotify OAuth routes
app.get('/api/auth/spotify', (req, res) => {
  const spotifyClientId = process.env.SPOTIFY_CLIENT_ID;
  const redirectUri = 'http://localhost:3001/api/auth/spotify/callback';
  const scope = 'user-read-private user-read-email user-read-playback-state';
  
  const authUrl = `https://accounts.spotify.com/authorize?client_id=${spotifyClientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}`;
  
  res.json({ authUrl });
});

app.get('/api/auth/spotify/callback', (req, res) => {
  const { code } = req.query;
  
  if (!code) {
    return res.status(400).json({ error: 'No authorization code received' });
  }

  // In a real implementation, you would exchange the code for tokens
  // For now, we'll create a mock Spotify user
  const mockSpotifyUser = {
    id: 'spotify_user_123',
    username: 'spotify_user',
    email: 'spotify@example.com',
    spotify_id: 'spotify_user_123'
  };

  const token = `spotify_token_${Date.now()}_${mockSpotifyUser.id}`;
  sessions.set(token, { userId: mockSpotifyUser.id, user: mockSpotifyUser });

  // Redirect to frontend with token
  res.redirect(`http://localhost:5173/spotify/callback?token=${token}`);
});

// Mock AI endpoints for testing
app.post('/api/ai/analyze-mood', (req, res) => {
  res.json({
    analysis: {
      mood: 'happy',
      confidence: 0.85,
      reasoning: 'The user seems to be in a positive mood based on their description.'
    }
  });
});

app.get('/api/ai/song-recommendations', (req, res) => {
  const { mood = 'happy', limit = 5 } = req.query;
  res.json({
    recommendations: [
      { title: 'Happy', artist: 'Pharrell Williams', reason: 'Perfect for a happy mood', mood_match: mood },
      { title: 'Good Vibrations', artist: 'The Beach Boys', reason: 'Uplifting and positive', mood_match: mood },
      { title: 'Walking on Sunshine', artist: 'Katrina & The Waves', reason: 'Energetic and joyful', mood_match: mood },
      { title: 'Don\'t Stop Believin\'', artist: 'Journey', reason: 'Inspiring and motivational', mood_match: mood },
      { title: 'I Gotta Feeling', artist: 'The Black Eyed Peas', reason: 'Celebratory and upbeat', mood_match: mood }
    ]
  });
});

// Mock Spotify endpoints
app.get('/api/spotify/profile', (req, res) => {
  res.json({
    id: 'mock_user_id',
    display_name: 'Test User',
    email: 'test@example.com',
    images: [{ url: 'https://via.placeholder.com/150', height: 150, width: 150 }],
    external_urls: { spotify: 'https://open.spotify.com/user/mock_user_id' },
    followers: { total: 100 },
    country: 'US',
    product: 'premium'
  });
});

// Mock mood endpoints
app.get('/api/moods', (req, res) => {
  res.json([
    { id: 1, mood: 'happy', intensity: 8, note: 'Feeling great today!', created_at: new Date().toISOString() },
    { id: 2, mood: 'calm', intensity: 6, note: 'Relaxed and peaceful', created_at: new Date().toISOString() }
  ]);
});

app.post('/api/moods', (req, res) => {
  const { mood, mood_intensity, note } = req.body;
  res.json({
    id: Math.floor(Math.random() * 1000),
    mood,
    mood_intensity,
    note,
    created_at: new Date().toISOString(),
    message: 'Mood logged successfully!'
  });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Working server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔧 Environment test: http://localhost:${PORT}/api/ai/test-env`);
  console.log(`🎵 AI recommendations: http://localhost:${PORT}/api/ai/song-recommendations?mood=happy`);
  console.log(`🔐 Auth endpoints: /api/auth/login, /api/auth/signup, /api/auth/spotify`);
}); 