const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const SpotifyWebApi = require('spotify-web-api-node');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize SQLite database
const db = new sqlite3.Database('./database.sqlite');

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
  origin: 'http://localhost:3000',
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
    'user-top-read'
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
app.get('/auth/spotify/callback', async (req, res) => {
  const { code, error } = req.query;
  
  console.log('📝 Spotify callback received:', { code: !!code, error });
  
  if (error) {
    console.error('❌ Spotify OAuth error:', error);
    return res.redirect('http://localhost:3000/login?error=spotify_auth_failed');
  }
  
  try {
    const data = await spotifyApi.authorizationCodeGrant(code);
    const { access_token, refresh_token } = data.body;
    
    console.log('✅ Got Spotify tokens');
    
    // Get user profile from Spotify
    spotifyApi.setAccessToken(access_token);
    spotifyApi.setRefreshToken(refresh_token);
    
    const userProfile = await spotifyApi.getMe();
    const spotifyUser = userProfile.body;
    
    console.log('👤 Spotify user data:', {
      id: spotifyUser.id,
      display_name: spotifyUser.display_name,
      email: spotifyUser.email
    });
    
    // Check if user exists in our database
    db.get('SELECT * FROM users WHERE spotify_id = ?', [spotifyUser.id], async (err, existingUser) => {
      if (err) {
        console.error('❌ Database SELECT error:', err);
        return res.redirect('http://localhost:3000/login?error=database_error');
      }
      
      if (existingUser) {
        console.log('✅ User exists, logging in');
        // User exists, generate JWT
        const token = jwt.sign(
          { userId: existingUser.id, email: existingUser.email },
          process.env.JWT_SECRET || 'secret',
          { expiresIn: '7d' }
        );
        
        // Redirect to frontend with token
        res.redirect(`http://localhost:3000?token=${token}&user=${encodeURIComponent(JSON.stringify({
          id: existingUser.id,
          username: existingUser.display_name || existingUser.username,
          email: existingUser.email
        }))}`);
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
              console.error('📊 Failed insert data:', {
                spotify_id: spotifyUser.id,
                display_name: spotifyUser.display_name,
                email: spotifyUser.email
              });
              return res.redirect('http://localhost:3000/login?error=database_error');
            }
            
            console.log('✅ User created successfully with ID:', this.lastID);
            
            const token = jwt.sign(
              { userId: this.lastID, email: spotifyUser.email },
              process.env.JWT_SECRET || 'secret',
              { expiresIn: '7d' }
            );
            
            res.redirect(`http://localhost:3000?token=${token}&user=${encodeURIComponent(JSON.stringify({
              id: this.lastID,
              username: spotifyUser.display_name,
              email: spotifyUser.email
            }))}`);
          }
        );
      }
    });
  } catch (error) {
    console.error('❌ Spotify OAuth process error:', error);
    res.redirect('http://localhost:3000/login?error=spotify_auth_failed');
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
app.get('/api/spotify/artist/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const artist = await spotifyApi.getArtist(id);
    res.json(artist.body);
  } catch (error) {
    console.error('Get artist error:', error);
    res.status(500).json({ error: 'Failed to fetch artist' });
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
      if (err) return res.status(500).json({ error: 'Failed to save mood' });
      
      res.status(201).json({
        mood: { id: this.lastID, mood, intensity, note, created_at: new Date() }
      });
    }
  );
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server running!' });
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

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`✅ Database initialized`);
  console.log(`✅ Spotify integration ready`);
});