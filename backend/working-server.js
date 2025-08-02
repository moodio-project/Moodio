require('dotenv').config();
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
  credentials: true
}));
app.use(express.json());

// Password hashing function
const hashPassword = (password) => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

// Mock user database with hashed passwords
const users = [
  {
    id: 1,
    username: 'demo',
    email: 'demo@example.com',
    password: hashPassword('password123'),
    spotify_id: null,
    display_name: 'Demo User',
    avatar_url: null,
    created_at: new Date().toISOString()
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
  
  const hashedPassword = hashPassword(password);
  const user = users.find(u => u.email === email && u.password === hashedPassword);
  
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = `token_${Date.now()}_${user.id}`;
  sessions.set(token, { userId: user.id, user });

  res.json({
    user: { 
      id: user.id, 
      username: user.username, 
      email: user.email,
      display_name: user.display_name,
      avatar_url: user.avatar_url
    },
    token
  });
});

app.post('/api/auth/signup', (req, res) => {
  const { username, email, password } = req.body;
  
  // Check if user already exists
  if (users.find(u => u.email === email)) {
    return res.status(400).json({ error: 'User with this email already exists' });
  }

  if (users.find(u => u.username === username)) {
    return res.status(400).json({ error: 'Username already taken' });
  }

  const newUser = {
    id: users.length + 1,
    username,
    email,
    password: hashPassword(password),
    spotify_id: null,
    display_name: username,
    avatar_url: null,
    created_at: new Date().toISOString()
  };

  users.push(newUser);
  
  const token = `token_${Date.now()}_${newUser.id}`;
  sessions.set(token, { userId: newUser.id, user: newUser });

  res.json({
    user: { 
      id: newUser.id, 
      username: newUser.username, 
      email: newUser.email,
      display_name: newUser.display_name,
      avatar_url: newUser.avatar_url
    },
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

// Spotify OAuth routes - FIXED REDIRECT URI
app.get('/api/auth/spotify', (req, res) => {
  const spotifyClientId = process.env.SPOTIFY_CLIENT_ID;
  // Fixed redirect URI to match Spotify app settings
  const redirectUri = 'http://localhost:3001/api/auth/spotify/callback';
  const scope = 'user-read-private user-read-email user-read-playback-state user-top-read user-read-recently-played playlist-read-private';
  
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
    spotify_id: 'spotify_user_123',
    display_name: 'Spotify User',
    avatar_url: 'https://via.placeholder.com/150',
    created_at: new Date().toISOString()
  };

  // Check if user already exists
  let existingUser = users.find(u => u.spotify_id === mockSpotifyUser.spotify_id);
  
  if (!existingUser) {
    // Create new user
    existingUser = {
      id: users.length + 1,
      username: mockSpotifyUser.username,
      email: mockSpotifyUser.email,
      password: null, // Spotify users don't have passwords
      spotify_id: mockSpotifyUser.spotify_id,
      display_name: mockSpotifyUser.display_name,
      avatar_url: mockSpotifyUser.avatar_url,
      created_at: new Date().toISOString()
    };
    users.push(existingUser);
  }

  const token = `spotify_token_${Date.now()}_${existingUser.id}`;
  sessions.set(token, { userId: existingUser.id, user: existingUser });

  // Redirect to frontend with token - support multiple ports
  const frontendUrl = req.headers.origin || 'http://localhost:5173';
  res.redirect(`${frontendUrl}/spotify/callback?token=${token}`);
});

// Mock AI endpoints for testing
app.post('/api/ai/analyze-mood', (req, res) => {
  const { mood, note, song_id } = req.body;
  
  // Use the user's actual mood input instead of ignoring it
  const userMood = mood || 'neutral';
  const userNote = note || '';
  
  // Create a more realistic analysis based on user input
  let analysis = {
    mood: userMood,
    confidence: 0.9,
    reasoning: `Based on your input, you're feeling ${userMood}.`
  };

  // Add more detailed reasoning if user provided a note
  if (userNote) {
    analysis.reasoning += ` Your note "${userNote}" provides additional context about your emotional state.`;
  }

  // Adjust confidence based on input quality
  if (userNote && userNote.length > 10) {
    analysis.confidence = 0.95;
  } else if (userNote && userNote.length > 5) {
    analysis.confidence = 0.85;
  } else {
    analysis.confidence = 0.75;
  }

  res.json({
    analysis,
    song_recommendations: [
      { title: 'Mood Music 1', artist: 'Artist 1', reason: 'Matches your current mood' },
      { title: 'Mood Music 2', artist: 'Artist 2', reason: 'Helps enhance your feeling' }
    ]
  });
});

app.get('/api/ai/song-recommendations', (req, res) => {
  const { mood = 'happy', limit = 5 } = req.query;
  
  // Create mood-specific recommendations
  const moodRecommendations = {
    happy: [
      { title: 'Happy', artist: 'Pharrell Williams', reason: 'Perfect for a happy mood', mood_match: mood },
      { title: 'Good Vibrations', artist: 'The Beach Boys', reason: 'Uplifting and positive', mood_match: mood },
      { title: 'Walking on Sunshine', artist: 'Katrina & The Waves', reason: 'Energetic and joyful', mood_match: mood },
      { title: 'Don\'t Stop Believin\'', artist: 'Journey', reason: 'Inspiring and motivational', mood_match: mood },
      { title: 'I Gotta Feeling', artist: 'The Black Eyed Peas', reason: 'Celebratory and upbeat', mood_match: mood }
    ],
    sad: [
      { title: 'Mad World', artist: 'Gary Jules', reason: 'Melancholic and reflective', mood_match: mood },
      { title: 'Hallelujah', artist: 'Jeff Buckley', reason: 'Emotional and cathartic', mood_match: mood },
      { title: 'Fix You', artist: 'Coldplay', reason: 'Comforting and healing', mood_match: mood },
      { title: 'The Scientist', artist: 'Coldplay', reason: 'Thoughtful and introspective', mood_match: mood },
      { title: 'Skinny Love', artist: 'Bon Iver', reason: 'Raw and emotional', mood_match: mood }
    ],
    calm: [
      { title: 'Weightless', artist: 'Marconi Union', reason: 'Scientifically proven to reduce anxiety', mood_match: mood },
      { title: 'Claire de Lune', artist: 'Debussy', reason: 'Peaceful and serene', mood_match: mood },
      { title: 'River Flows in You', artist: 'Yiruma', reason: 'Gentle and flowing', mood_match: mood },
      { title: 'Comptine d\'un autre été', artist: 'Yann Tiersen', reason: 'Delicate and calming', mood_match: mood },
      { title: 'Gymnopédie No.1', artist: 'Erik Satie', reason: 'Minimalist and peaceful', mood_match: mood }
    ],
    excited: [
      { title: 'Eye of the Tiger', artist: 'Survivor', reason: 'Motivational and powerful', mood_match: mood },
      { title: 'We Will Rock You', artist: 'Queen', reason: 'Anthemic and energizing', mood_match: mood },
      { title: 'Thunderstruck', artist: 'AC/DC', reason: 'High energy and electrifying', mood_match: mood },
      { title: 'Back in Black', artist: 'AC/DC', reason: 'Rock anthem for excitement', mood_match: mood },
      { title: 'We Are the Champions', artist: 'Queen', reason: 'Victorious and triumphant', mood_match: mood }
    ],
    angry: [
      { title: 'Break Stuff', artist: 'Limp Bizkit', reason: 'Cathartic release of anger', mood_match: mood },
      { title: 'Killing in the Name', artist: 'Rage Against the Machine', reason: 'Powerful and rebellious', mood_match: mood },
      { title: 'Given Up', artist: 'Linkin Park', reason: 'Intense and emotional', mood_match: mood },
      { title: 'Bodies', artist: 'Drowning Pool', reason: 'Aggressive and energetic', mood_match: mood },
      { title: 'Chop Suey!', artist: 'System of a Down', reason: 'Dynamic and intense', mood_match: mood }
    ]
  };

  const recommendations = moodRecommendations[mood.toLowerCase()] || moodRecommendations.happy;
  
  res.json({
    recommendations: recommendations.slice(0, parseInt(limit)),
    mood_analyzed: mood,
    total_recommendations: recommendations.length
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