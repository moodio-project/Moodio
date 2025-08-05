const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const SpotifyWebApi = require('spotify-web-api-node');
const Genius = require('genius-lyrics').Client;
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Add deployment-friendly logging
console.log(`🚀 Starting Moodio server on port ${PORT}`);
console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);

// Initialize SQLite database
const db = new sqlite3.Database('./database.sqlite');

const userTokens = new Map();
// Initialize Genius API
const genius = new Genius(process.env.GENIUS_API_KEY);

// Helper function for mood descriptions
function getMoodDescription(mood, valence, energy) {
  const descriptions = {
    'energetic': 'High-energy, uplifting music that gets you moving',
    'happy': 'Positive, feel-good vibes that brighten your day', 
    'melancholy': 'Introspective, emotional music for reflective moments',
    'intense': 'Powerful, dramatic music with strong emotional impact',
    'contemplative': 'Thoughtful, deeper music for quiet reflection',
    'balanced': 'A versatile mix of emotions and energy levels'
  };
  return descriptions[mood] || 'A unique blend of musical emotions';
}

// Create tables if they don't exist
db.serialize(() => {
  // Users table (updated for Spotify)
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    spotify_id TEXT UNIQUE,
    username TEXT,
    display_name TEXT,
    email TEXT,
    password TEXT,
    avatar_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);


  // Moods table
  db.run(`CREATE TABLE IF NOT EXISTS moods (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    mood TEXT,
    intensity INTEGER,
    note TEXT,
    song_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);

  // Songs table
  db.run(`CREATE TABLE IF NOT EXISTS songs (
    id TEXT PRIMARY KEY,
    title TEXT,
    artist_name TEXT,
    album_name TEXT,
    artwork_url TEXT,
    preview_url TEXT
  )`);

  // Artists table
  db.run(`CREATE TABLE IF NOT EXISTS artists (
    id TEXT PRIMARY KEY,
    name TEXT,
    image_url TEXT,
    bio TEXT
  )`);

  // Audio features table
  db.run(`CREATE TABLE IF NOT EXISTS audio_features (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    song_id TEXT,
    danceability REAL,
    energy REAL,
    valence REAL,
    tempo REAL,
    speechiness REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (song_id) REFERENCES songs (id)
  )`);

  // Listening history table
  db.run(`CREATE TABLE IF NOT EXISTS listening_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    song_id TEXT,
    listened_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (song_id) REFERENCES songs (id)
  )`);
});

// Initialize Spotify API
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: process.env.SPOTIFY_REDIRECT_URI
});

// Log Spotify configuration on startup
console.log('🎵 Spotify Configuration:');
console.log('Client ID:', process.env.SPOTIFY_CLIENT_ID ? 'Set' : 'Missing');
console.log('Client Secret:', process.env.SPOTIFY_CLIENT_SECRET ? 'Set' : 'Missing');
console.log('Redirect URI:', process.env.SPOTIFY_REDIRECT_URI);

// Get Spotify access token using client credentials
const getSpotifyToken = async () => {
  try {
    const data = await spotifyApi.clientCredentialsGrant();
    spotifyApi.setAccessToken(data.body['access_token']);
    console.log('✅ Spotify token obtained');
    
    // Refresh token every 50 minutes
    setTimeout(() => {
      getSpotifyToken();
    }, 50 * 60 * 1000);
    
    return data.body['access_token'];
  } catch (error) {
    console.error('❌ Failed to get Spotify token:', error);
    throw error;
  }
};

// Initialize Spotify token on server start
getSpotifyToken();

// Middleware
app.use(cors({ 
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://moodio.onrender.com', 'https://moodio-frontend.onrender.com']
    : 'http://localhost:3000',
  credentials: true 
}));
app.use(express.json());

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'secret', (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// ===== DEBUG ROUTES =====

// Debug configuration
app.get('/debug/config', (req, res) => {
  res.json({
    spotifyClientId: process.env.SPOTIFY_CLIENT_ID,
    spotifyRedirectUri: process.env.SPOTIFY_REDIRECT_URI,
    actualSpotifyRedirectUri: spotifyApi.getRedirectURI()
  });
});

// Debug OAuth URL
app.get('/debug/oauth-url', (req, res) => {
  const scopes = [
    'user-read-private',
    'user-read-email',
    'user-top-read',
    'user-read-recently-played',
    'user-read-currently-playing',
    'user-read-playback-state',
    'user-modify-playback-state',
    'streaming'  // ← THIS IS CRUCIAL FOR WEB PLAYBACK SDK
  ];
  
  const authorizeURL = spotifyApi.createAuthorizeURL(scopes, 'moodio-state');
  res.json({ 
    url: authorizeURL,
    clientId: process.env.SPOTIFY_CLIENT_ID,
    redirectUri: process.env.SPOTIFY_REDIRECT_URI
  });
});

// ===== SPOTIFY OAUTH ROUTES =====

// Spotify OAuth login
app.get('/auth/spotify', (req, res) => {
  console.log('🔍 Starting Spotify OAuth with:');
  console.log('Client ID:', process.env.SPOTIFY_CLIENT_ID);
  console.log('Redirect URI:', process.env.SPOTIFY_REDIRECT_URI);
  console.log('SpotifyApi Redirect URI:', spotifyApi.getRedirectURI());
  
  const scopes = [
    'user-read-private',
    'user-read-email',
    'user-top-read',
    'user-read-recently-played',
    'user-read-currently-playing',
    'user-read-playback-state',
    'user-modify-playback-state',
    'streaming'
  ];
  
  const authorizeURL = spotifyApi.createAuthorizeURL(scopes, 'moodio-state');
  console.log('🔗 Generated OAuth URL:', authorizeURL);
  
  res.redirect(authorizeURL);
});

// Spotify OAuth callback
// ===== REPLACE YOUR ENTIRE Spotify OAuth callback in server.js =====

app.get('/auth/spotify/callback', async (req, res) => {
  const { code, error } = req.query;
  
  console.log('📝 Spotify callback received:', { code: !!code, error });
  
  if (error) {
    console.error('❌ Spotify OAuth error:', error);
    const redirectUrl = process.env.NODE_ENV === 'production' 
      ? 'https://moodio-frontend.onrender.com/login?error=spotify_auth_failed'
      : 'http://localhost:3000/login?error=spotify_auth_failed';
    return res.redirect(redirectUrl);
  }
  
  if (!code) {
    console.error('❌ No authorization code received');
    const redirectUrl = process.env.NODE_ENV === 'production' 
      ? 'https://moodio-frontend.onrender.com/login?error=no_code'
      : 'http://localhost:3000/login?error=no_code';
    return res.redirect(redirectUrl);
  }
  
  try {
    const data = await spotifyApi.authorizationCodeGrant(code);
    const { access_token, refresh_token, expires_in } = data.body;
    
    console.log('✅ Got Spotify tokens:', {
      hasAccessToken: !!access_token,
      hasRefreshToken: !!refresh_token,
      expiresIn: expires_in
    });
    
    // Get user profile from Spotify with the new tokens
    const userSpotifyApi = new SpotifyWebApi({
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
      redirectUri: process.env.SPOTIFY_REDIRECT_URI
    });
    
    userSpotifyApi.setAccessToken(access_token);
    userSpotifyApi.setRefreshToken(refresh_token);
    
    const userProfile = await userSpotifyApi.getMe();
    const spotifyUser = userProfile.body;
    
    console.log('👤 Spotify user data:', {
      id: spotifyUser.id,
      display_name: spotifyUser.display_name,
      email: spotifyUser.email,
      product: spotifyUser.product,
      country: spotifyUser.country
    });
    
    // Check Premium status explicitly
    const isPremium = spotifyUser.product === 'premium';
    console.log('🎵 Premium status:', isPremium ? 'YES' : 'NO');
    
    // Check if user exists in our database
    db.get('SELECT * FROM users WHERE spotify_id = ?', [spotifyUser.id], async (err, existingUser) => {
      if (err) {
        console.error('❌ Database SELECT error:', err);
        const redirectUrl = process.env.NODE_ENV === 'production' 
          ? 'https://moodio-frontend.onrender.com/login?error=database_error'
          : 'http://localhost:3000/login?error=database_error';
        return res.redirect(redirectUrl);
      }
      
      if (existingUser) {
        console.log('✅ User exists, logging in');
        
        // Store user's Spotify tokens for playback
        userTokens.set(existingUser.id, {
          access_token,
          refresh_token,
          product: spotifyUser.product,
          expires_at: Date.now() + (expires_in * 1000)
        });
        
        console.log('💾 Stored tokens for user ID:', existingUser.id);
        
        // User exists, generate JWT
        const token = jwt.sign(
          { userId: existingUser.id, email: existingUser.email },
          process.env.JWT_SECRET || 'secret',
          { expiresIn: '7d' }
        );
        
        // Create user data object for frontend
        const userData = {
          id: existingUser.id,
          username: existingUser.display_name || existingUser.username,
          email: existingUser.email,
          spotify_token: access_token, // ✅ PASS THE TOKEN!
          has_premium: isPremium, // ✅ PASS PREMIUM STATUS!
          spotify_product: spotifyUser.product // Debug info
        };
        
        console.log('🚀 Redirecting with user data:', {
          id: userData.id,
          username: userData.username,
          hasSpotifyToken: !!userData.spotify_token,
          hasPremium: userData.has_premium,
          spotifyProduct: userData.spotify_product
        });
        
        // Redirect to frontend with all data
        const baseUrl = process.env.NODE_ENV === 'production' 
          ? 'https://moodio-frontend.onrender.com'
          : 'http://localhost:3000';
        const redirectURL = `${baseUrl}?token=${token}&user=${encodeURIComponent(JSON.stringify(userData))}`;
        console.log('🔗 Redirect URL created, length:', redirectURL.length);
        
        res.redirect(redirectURL);
        
      } else {
        console.log('👤 Creating new user for:', spotifyUser.display_name);
        // Create new user
        db.run(
          'INSERT INTO users (spotify_id, display_name, username, email, avatar_url) VALUES (?, ?, ?, ?, ?)',
          [
            spotifyUser.id, 
            spotifyUser.display_name, 
            spotifyUser.display_name, 
            spotifyUser.email, 
            spotifyUser.images?.[0]?.url || null
          ],
          function(err) {
            if (err) {
              console.error('❌ Database INSERT error:', err);
              const redirectUrl = process.env.NODE_ENV === 'production' 
                ? 'https://moodio-frontend.onrender.com/login?error=database_error'
                : 'http://localhost:3000/login?error=database_error';
              return res.redirect(redirectUrl);
            }
            
            console.log('✅ User created successfully with ID:', this.lastID);
            
            // Store user's Spotify tokens for playback
            userTokens.set(this.lastID, {
              access_token,
              refresh_token,
              product: spotifyUser.product,
              expires_at: Date.now() + (expires_in * 1000)
            });
            
            console.log('💾 Stored tokens for new user ID:', this.lastID);
            
            const token = jwt.sign(
              { userId: this.lastID, email: spotifyUser.email },
              process.env.JWT_SECRET || 'secret',
              { expiresIn: '7d' }
            );
            
            // Create user data object for frontend
            const userData = {
              id: this.lastID,
              username: spotifyUser.display_name,
              email: spotifyUser.email,
              spotify_token: access_token, // ✅ PASS THE TOKEN!
              has_premium: isPremium, // ✅ PASS PREMIUM STATUS!
              spotify_product: spotifyUser.product // Debug info
            };
            
            console.log('🚀 Redirecting with new user data:', {
              id: userData.id,
              username: userData.username,
              hasSpotifyToken: !!userData.spotify_token,
              hasPremium: userData.has_premium,
              spotifyProduct: userData.spotify_product
            });
            
            // Redirect to frontend with all data
            const baseUrl = process.env.NODE_ENV === 'production' 
              ? 'https://moodio-frontend.onrender.com'
              : 'http://localhost:3000';
            const redirectURL = `${baseUrl}?token=${token}&user=${encodeURIComponent(JSON.stringify(userData))}`;
            console.log('🔗 Redirect URL created, length:', redirectURL.length);
            
            res.redirect(redirectURL);
          }
        );
      }
    });
  } catch (error) {
    console.error('❌ Spotify OAuth process error:', error);
    const redirectUrl = process.env.NODE_ENV === 'production' 
      ? 'https://moodio-frontend.onrender.com/login?error=spotify_auth_failed'
      : 'http://localhost:3000/login?error=spotify_auth_failed';
    res.redirect(redirectUrl);
  }
});

// ===== ADD DEBUG ROUTE to check your Premium status =====

app.get('/debug/spotify-user', authenticateToken, async (req, res) => {
  const userSpotifyData = userTokens.get(req.user.userId);
  
  if (!userSpotifyData) {
    return res.json({ error: 'No Spotify token found for user' });
  }
  
  try {
    // Check current user data from Spotify
    const response = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        'Authorization': `Bearer ${userSpotifyData.access_token}`
      }
    });
    
    if (response.ok) {
      const userData = await response.json();
      res.json({
        stored_product: userSpotifyData.product,
        current_product: userData.product,
        is_premium: userData.product === 'premium',
        user_data: userData
      });
    } else {
      res.json({ error: 'Failed to fetch current user data', status: response.status });
    }
  } catch (error) {
    res.json({ error: 'Error checking Spotify user', details: error.message });
  }
});

// ===== ADD A TEST ROUTE TO DEBUG =====

app.get('/debug/check-route', (req, res) => {
  res.json({ 
    message: 'Route working',
    timestamp: new Date().toISOString() 
  });
});

// ===== ALSO ADD A SIMPLE CHECK FOR THE AUTHENTICATION =====

app.get('/debug/auth-test', authenticateToken, (req, res) => {
  console.log('🔍 Auth test - User:', req.user);
  res.json({
    message: 'Authentication working',
    user: req.user,
    hasUserTokens: userTokens.has(req.user.userId),
    userTokensCount: userTokens.size,
    availableUserIds: Array.from(userTokens.keys())
  });
});

// Get user's access token for Web Playback SDK
app.get('/api/spotify/token', authenticateToken, (req, res) => {
  const userSpotifyData = userTokens.get(req.user.userId);
  
  if (!userSpotifyData) {
    return res.status(401).json({ error: 'No Spotify token found' });
  }
  
  res.json({
    access_token: userSpotifyData.access_token
  });
});

// Refresh Spotify token if needed
app.post('/api/spotify/refresh-token', authenticateToken, async (req, res) => {
  const userSpotifyData = userTokens.get(req.user.userId);
  
  if (!userSpotifyData || !userSpotifyData.refresh_token) {
    return res.status(401).json({ error: 'No refresh token found' });
  }
  
  try {
    spotifyApi.setRefreshToken(userSpotifyData.refresh_token);
    const data = await spotifyApi.refreshAccessToken();
    const { access_token } = data.body;
    
    // Update stored token
    userSpotifyData.access_token = access_token;
    userTokens.set(req.user.userId, userSpotifyData);
    
    res.json({ access_token });
  } catch (error) {
    console.error('Token refresh failed:', error);
    res.status(500).json({ error: 'Failed to refresh token' });
  }
});

// Start playback on a specific device
app.put('/api/spotify/play', authenticateToken, async (req, res) => {
  const { track_uri, device_id } = req.body;
  const userSpotifyData = userTokens.get(req.user.userId);
  
  if (!userSpotifyData) {
    return res.status(401).json({ error: 'No Spotify token found' });
  }
  
  try {
    const response = await fetch(`https://api.spotify.com/v1/me/player/play${device_id ? `?device_id=${device_id}` : ''}`, {
      method: 'PUT',
      body: JSON.stringify({ uris: [track_uri] }),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userSpotifyData.access_token}`
      }
    });
    
    if (response.status === 204) {
      res.json({ success: true });
    } else {
      throw new Error(`Spotify API responded with status ${response.status}`);
    }
  } catch (error) {
    console.error('Playback failed:', error);
    res.status(500).json({ error: 'Failed to start playback' });
  }
});

// Get user's currently playing track
app.get('/api/spotify/currently-playing', authenticateToken, async (req, res) => {
  const userSpotifyData = userTokens.get(req.user.userId);
  
  if (!userSpotifyData) {
    return res.status(401).json({ error: 'No Spotify token found' });
  }
  
  try {
    const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
      headers: {
        'Authorization': `Bearer ${userSpotifyData.access_token}`
      }
    });
    
    if (response.status === 204) {
      res.json({ is_playing: false });
    } else {
      const data = await response.json();
      res.json(data);
    }
  } catch (error) {
    console.error('Failed to get currently playing:', error);
    res.status(500).json({ error: 'Failed to get currently playing track' });
  }
});

// ===== REGULAR AUTH ROUTES =====

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields required' });
    }

    // Check if user exists
    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, row) => {
      if (row) {
        return res.status(400).json({ error: 'User already exists' });
      }

      // Hash password and create user
      const hashedPassword = await bcrypt.hash(password, 10);
      
      db.run(
        'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
        [username, email, hashedPassword],
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Failed to create user' });
          }

          // Generate token
          const token = jwt.sign(
            { userId: this.lastID, email }, 
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '7d' }
          );

          res.status(201).json({
            user: { id: this.lastID, username, email },
            token
          });
        }
      );
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '7d' }
      );

      res.json({
        user: { id: user.id, username: user.username, email: user.email },
        token
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get profile
app.get('/api/auth/me', authenticateToken, (req, res) => {
  db.get('SELECT id, username, display_name, email FROM users WHERE id = ?', [req.user.userId], (err, user) => {
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ 
      user: { 
        id: user.id, 
        username: user.display_name || user.username, 
        email: user.email 
      } 
    });
  });
});

// ===== REAL SPOTIFY API ROUTES =====

// REAL Spotify search
app.get('/api/spotify/search', authenticateToken, async (req, res) => {
  try {
    const { q, type = 'track,artist,album', limit = 20 } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Search query required' });
    }

    const searchResults = await spotifyApi.search(q, type.split(','), { limit: parseInt(limit) });
    
    res.json({
      tracks: searchResults.body.tracks || { items: [] },
      artists: searchResults.body.artists || { items: [] },
      albums: searchResults.body.albums || { items: [] }
    });
  } catch (error) {
    console.error('Spotify search error:', error);
    
    // If token expired, refresh and retry
    if (error.statusCode === 401) {
      try {
        await getSpotifyToken();
        const searchResults = await spotifyApi.search(q, type.split(','), { limit: parseInt(limit) });
        res.json({
          tracks: searchResults.body.tracks || { items: [] },
          artists: searchResults.body.artists || { items: [] },
          albums: searchResults.body.albums || { items: [] }
        });
      } catch (retryError) {
        res.status(500).json({ error: 'Search failed after token refresh' });
      }
    } else {
      res.status(500).json({ error: 'Search failed' });
    }
  }
});

// Get REAL artist details
app.get('/api/spotify/artist/:id/enhanced', authenticateToken, async (req, res) => {
  try {
    const { id: artistId } = req.params;
    const userSpotifyData = userTokens.get(req.user.userId);

    if (!userSpotifyData) {
      return res.status(401).json({ error: 'No Spotify token available' });
    }

    // Get basic Spotify artist data
    const [artistResponse, topTracksResponse] = await Promise.all([
      fetch(`https://api.spotify.com/v1/artists/${artistId}`, {
        headers: { 'Authorization': `Bearer ${userSpotifyData.access_token}` }
      }),
      fetch(`https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=US`, {
        headers: { 'Authorization': `Bearer ${userSpotifyData.access_token}` }
      })
    ]);

    const spotifyArtist = await artistResponse.json();
    const topTracksData = await topTracksResponse.json();

  
    // Temporarily disable Genius to avoid errors
    let geniusData = null;
    console.log('🔍 Genius integration temporarily disabled for stability');

    res.json({
      spotify: { ...spotifyArtist, top_tracks: topTracksData.tracks || [] },
      genius: geniusData,
      mood_analysis: null
    });

  } catch (error) {
    console.error('❌ Enhanced artist fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch enhanced artist data' });
  }
});

// Get REAL artist top tracks
app.get('/api/spotify/artist/:id/top-tracks', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const topTracks = await spotifyApi.getArtistTopTracks(id, 'US');
    res.json({ tracks: topTracks.body.tracks });
  } catch (error) {
    console.error('Get artist top tracks error:', error);
    res.status(500).json({ error: 'Failed to fetch top tracks' });
  }
});

// Get REAL audio features for mood analysis
app.get('/api/spotify/audio-features/:trackId', authenticateToken, async (req, res) => {
  try {
    const { trackId } = req.params;
    const features = await spotifyApi.getAudioFeaturesForTrack(trackId);
    
    // Convert Spotify audio features to mood
    const audioFeatures = features.body;
    let mood = 'neutral';
    
    if (audioFeatures.valence > 0.6 && audioFeatures.energy > 0.6) {
      mood = 'happy';
    } else if (audioFeatures.valence < 0.4 && audioFeatures.energy < 0.4) {
      mood = 'sad';
    } else if (audioFeatures.energy > 0.7) {
      mood = 'energetic';
    } else if (audioFeatures.valence > 0.6 && audioFeatures.energy < 0.5) {
      mood = 'calm';
    }
    
    res.json({
      ...audioFeatures,
      mood
    });
  } catch (error) {
    console.error('Get audio features error:', error);
    res.status(500).json({ error: 'Failed to fetch audio features' });
  }
});

// Get user's top tracks
app.get('/api/spotify/top-tracks', authenticateToken, async (req, res) => {
  try {
    // Get popular tracks for now
    const topTracks = await spotifyApi.search('year:2024', ['track'], { limit: 10 });
    res.json(topTracks.body.tracks);
  } catch (error) {
    console.error('Get top tracks error:', error);
    res.status(500).json({ error: 'Failed to fetch top tracks' });
  }
});

// Get mood-based recommendations
app.get('/api/spotify/recommendations/:mood', authenticateToken, async (req, res) => {
  try {
    const { mood } = req.params;
    
    // Map moods to Spotify audio feature parameters
    const moodSeeds = {
      happy: { target_valence: 0.8, target_energy: 0.7 },
      sad: { target_valence: 0.2, target_energy: 0.3 },
      energetic: { target_energy: 0.9, target_danceability: 0.8 },
      calm: { target_valence: 0.6, target_energy: 0.3 },
      excited: { target_valence: 0.8, target_energy: 0.8 },
      angry: { target_energy: 0.9, target_valence: 0.3 },
      tired: { target_energy: 0.2, target_valence: 0.4 }
    };
    
    const seedParams = moodSeeds[mood] || moodSeeds.happy;
    
    // Get recommendations based on mood
    const recommendations = await spotifyApi.getRecommendations({
      seed_genres: ['pop', 'rock', 'indie'],
      limit: 10,
      ...seedParams
    });
    
    res.json({ tracks: recommendations.body.tracks });
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
});

app.get('/migrate/add-song-columns', (req, res) => {
  console.log('🔄 Adding song columns to moods table...');
  
  db.run('ALTER TABLE moods ADD COLUMN song_name TEXT', (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Error adding song_name column:', err);
    } else {
      console.log('✅ Added song_name column');
    }
    
    db.run('ALTER TABLE moods ADD COLUMN artist_name TEXT', (err) => {
      if (err && !err.message.includes('duplicate column name')) {
        console.error('Error adding artist_name column:', err);
      } else {
        console.log('✅ Added artist_name column');
      }
      
      console.log('✅ Database migration completed!');
      res.json({ success: true, message: 'Song columns added to moods table!' });
    });
  });
});

// Add this to your server.js after your existing routes

// OpenAI Integration
const { OpenAI } = require('openai');
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// AI-powered mood analysis and recommendations
app.post('/api/ai/mood-recommendations', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Get user's recent mood logs
    db.all(
      'SELECT mood, intensity, note, created_at FROM moods WHERE user_id = ? ORDER BY created_at DESC LIMIT 10',
      [userId],
      async (err, moods) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to fetch mood data' });
        }

        if (!moods || moods.length === 0) {
          return res.json({
            recommendations: ["Start logging your moods to get personalized recommendations!"],
            insights: "No mood data available yet.",
            suggested_genres: ["pop", "indie", "chill"]
          });
        }

        try {
          // Create a mood summary for OpenAI
          const moodSummary = moods.map(m => 
            `${m.mood} (intensity: ${m.intensity}/10) - ${m.note || 'no note'}`
          ).join('\n');

          const prompt = `
Based on these recent mood logs from a music listener:

${moodSummary}

Please provide personalized music recommendations in this exact JSON format:
{
  "insights": "A 2-3 sentence analysis of their mood patterns",
  "recommendations": [
    "3-4 specific actionable recommendations for music to improve their mood or match their current state"
  ],
  "suggested_genres": ["3-4 music genres that would work well"],
  "playlist_theme": "A creative name for a playlist based on their mood pattern"
}

Focus on being helpful, empathetic, and specific about how music can support their emotional wellbeing.`;

          const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 500,
            temperature: 0.7
          });

          const aiResponse = completion.choices[0].message.content;
          
          try {
            const parsedResponse = JSON.parse(aiResponse);
            res.json(parsedResponse);
          } catch (parseError) {
            // Fallback if JSON parsing fails
            res.json({
              insights: aiResponse,
              recommendations: ["Try listening to music that matches your current mood"],
              suggested_genres: ["pop", "indie", "alternative"],
              playlist_theme: "Your Mood Mix"
            });
          }

        } catch (aiError) {
          console.error('OpenAI API error:', aiError);
          res.status(500).json({ error: 'Failed to generate AI recommendations' });
        }
      }
    );

  } catch (error) {
    console.error('Mood recommendations error:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
});

// AI mood insights for dashboard
app.get('/api/ai/mood-insights', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    db.all(
      'SELECT mood, intensity, created_at FROM moods WHERE user_id = ? ORDER BY created_at DESC LIMIT 20',
      [userId],
      async (err, moods) => {
        if (err || !moods.length) {
          return res.json({ insight: "Start logging moods to see AI insights!" });
        }

        const moodCounts = {};
        let totalIntensity = 0;

        moods.forEach(mood => {
          moodCounts[mood.mood] = (moodCounts[mood.mood] || 0) + 1;
          totalIntensity += mood.intensity;
        });

        const dominantMood = Object.keys(moodCounts).reduce((a, b) => 
          moodCounts[a] > moodCounts[b] ? a : b
        );
        
        const averageIntensity = (totalIntensity / moods.length).toFixed(1);

        try {
          const prompt = `
Based on recent mood data:
- Most frequent mood: ${dominantMood}  
- Average intensity: ${averageIntensity}/10
- Total mood logs: ${moods.length}
- Recent moods: ${moods.slice(0, 5).map(m => m.mood).join(', ')}

Provide a brief, encouraging insight (1-2 sentences) about their emotional patterns and how music might help.`;

          const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 100,
            temperature: 0.8
          });

          res.json({
            insight: completion.choices[0].message.content.trim(),
            dominantMood,
            averageIntensity,
            totalLogs: moods.length
          });

        } catch (aiError) {
          res.json({
            insight: `You've been feeling mostly ${dominantMood} lately. Music can be a great way to support your emotional journey!`,
            dominantMood,
            averageIntensity,
            totalLogs: moods.length
          });
        }
      }
    );

  } catch (error) {
    console.error('Mood insights error:', error);
    res.status(500).json({ error: 'Failed to get insights' });
  }
});

// ===== MOOD ROUTES =====

// Get user moods
app.get('/api/moods', authenticateToken, (req, res) => {
  db.all(
    'SELECT * FROM moods WHERE user_id = ? ORDER BY created_at DESC',
    [req.user.userId],
    (err, moods) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json({ moods });
    }
  );
});

// Create mood
app.post('/api/moods', authenticateToken, (req, res) => {
  const { mood, intensity, note } = req.body;
  
  db.run(
    'INSERT INTO moods (user_id, mood, intensity, note) VALUES (?, ?, ?, ?)',
    [req.user.userId, mood, intensity, note],
    function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to save mood' });
      }
      
      // Get the actual record with correct timestamp
      db.get(
        'SELECT * FROM moods WHERE id = ?',
        [this.lastID],
        (err, row) => {
          if (err) return res.status(500).json({ error: 'Failed to retrieve mood' });
          res.status(201).json({ mood: row });
        }
      );
    }
  );
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Moodio server running!',
    timestamp: new Date().toISOString(),
    port: PORT,
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root health check for Render
app.get('/', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Moodio API is running!',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// Add this temporary migration route
app.get('/migrate/add-spotify-columns', (req, res) => {
  console.log('🔄 Starting database migration...');
  
  db.run('ALTER TABLE users ADD COLUMN spotify_id TEXT', (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Error adding spotify_id column:', err);
    } else {
      console.log('✅ Added spotify_id column');
    }
    
    db.run('ALTER TABLE users ADD COLUMN display_name TEXT', (err) => {
      if (err && !err.message.includes('duplicate column name')) {
        console.error('Error adding display_name column:', err);
      } else {
        console.log('✅ Added display_name column');
      }
      
      db.run('ALTER TABLE users ADD COLUMN avatar_url TEXT', (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('Error adding avatar_url column:', err);
        } else {
          console.log('✅ Added avatar_url column');
        }
        
        console.log('✅ Database migration completed!');
        res.json({ success: true, message: 'Database updated!' });
      });
    });
  });
});

// Add this test route
app.get('/test/database', (req, res) => {
  db.get('SELECT name FROM sqlite_master WHERE type="table"', (err, result) => {
    if (err) {
      return res.json({ error: 'Database connection failed', details: err.message });
    }
    
    db.all('PRAGMA table_info(users)', (err, columns) => {
      if (err) {
        return res.json({ error: 'Users table check failed', details: err.message });
      }
      
      res.json({ 
        status: 'Database OK', 
        userTableColumns: columns 
      });
    });
  });
});

// Add this simple debug route to test backend
app.get('/debug/test', (req, res) => {
  res.json({ 
    message: 'Backend is working',
    timestamp: new Date().toISOString(),
    userTokensCount: userTokens.size
  });
});

// ===== ADD THESE TEST ROUTES TO YOUR server.js =====

// Test if Spotify OAuth is working at all
app.get('/test/spotify-auth', (req, res) => {
  console.log('🧪 Testing Spotify OAuth redirect...');
  
  const scopes = [
    'user-read-private',
    'user-read-email',
    'user-top-read'
  ];
  
  try {
    const authorizeURL = spotifyApi.createAuthorizeURL(scopes, 'test-state');
    console.log('✅ Generated test OAuth URL:', authorizeURL);
    
    res.json({
      message: 'Spotify OAuth test',
      redirect_url: authorizeURL,
      client_id: process.env.SPOTIFY_CLIENT_ID,
      redirect_uri: process.env.SPOTIFY_REDIRECT_URI
    });
  } catch (error) {
    console.error('❌ OAuth URL generation failed:', error);
    res.status(500).json({ error: 'Failed to generate OAuth URL', details: error.message });
  }
});

// Test callback route
app.get('/test/callback', (req, res) => {
  console.log('🧪 Test callback hit with query params:', req.query);
  res.json({
    message: 'Callback received',
    query_params: req.query,
    timestamp: new Date().toISOString()
  });
});

// Check what tokens we have stored
app.get('/debug/stored-tokens', (req, res) => {
  const tokenInfo = [];
  
  userTokens.forEach((tokenData, userId) => {
    tokenInfo.push({
      userId: userId,
      hasAccessToken: !!tokenData.access_token,
      hasRefreshToken: !!tokenData.refresh_token,
      product: tokenData.product,
      accessTokenPreview: tokenData.access_token ? 
        tokenData.access_token.substring(0, 10) + '...' : 'None'
    });
  });
  
  res.json({
    totalUsers: userTokens.size,
    tokens: tokenInfo
  });
});

// Simple manual token storage test
app.post('/test/store-token', (req, res) => {
  const { userId, testToken } = req.body;
  
  if (!userId || !testToken) {
    return res.status(400).json({ error: 'userId and testToken required' });
  }
  
  userTokens.set(parseInt(userId), {
    access_token: testToken,
    refresh_token: 'test_refresh',
    product: 'premium'
  });
  
  console.log('🧪 Manually stored test token for user:', userId);
  
  res.json({
    message: 'Test token stored',
    userId: userId,
    tokenCount: userTokens.size
  });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`✅ Database initialized`);
  console.log(`✅ Spotify integration ready`);
  console.log(`✅ Health check available at http://localhost:${PORT}/api/health`);
  console.log(`✅ Root endpoint available at http://localhost:${PORT}/`);
});
