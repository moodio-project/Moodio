const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const SpotifyWebApi = require("spotify-web-api-node");
const Genius = require("genius-lyrics").Client;
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3001;

// Add deployment-friendly logging
console.log(`🚀 Starting Moodio server on port ${PORT}`);
console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);

// Initialize PostgreSQL database
const { Pool } = require("pg");
const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

// Test the connection
db.connect((err, client, release) => {
  if (err) {
    console.error("Error acquiring client", err.stack);
  } else {
    console.log("✅ PostgreSQL connected successfully");
    release();
  }
});

const userTokens = new Map();
// Initialize Genius API
const genius = new Genius(process.env.GENIUS_API_KEY);

// Helper function for mood descriptions
function getMoodDescription(mood, valence, energy) {
  const descriptions = {
    energetic: "High-energy, uplifting music that gets you moving",
    happy: "Positive, feel-good vibes that brighten your day",
    melancholy: "Introspective, emotional music for reflective moments",
    intense: "Powerful, dramatic music with strong emotional impact",
    contemplative: "Thoughtful, deeper music for quiet reflection",
    balanced: "A versatile mix of emotions and energy levels",
  };
  return descriptions[mood] || "A unique blend of musical emotions";
}

// Create tables if they don't exist (PostgreSQL version)
const createTables = async () => {
  try {
    // Users table
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        spotify_id TEXT UNIQUE,
        username TEXT,
        display_name TEXT,
        email TEXT,
        password TEXT,
        avatar_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Moods table
    await db.query(`
      CREATE TABLE IF NOT EXISTS moods (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        mood TEXT NOT NULL,
        intensity INTEGER,
        note TEXT,
        song_id TEXT,
        song_name TEXT,
        artist_name TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Favorites table
    await db.query(`
      CREATE TABLE IF NOT EXISTS favorites (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        item_type TEXT NOT NULL,
        item_id TEXT NOT NULL,
        item_name TEXT,
        artist_name TEXT,
        album_name TEXT,
        artwork_url TEXT,
        track_uri TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, item_id)
      )
    `);

    // Songs table
    await db.query(`
      CREATE TABLE IF NOT EXISTS songs (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        artist_name TEXT,
        album_name TEXT,
        artwork_url TEXT,
        preview_url TEXT
      )
    `);

    // Artists table
    await db.query(`
      CREATE TABLE IF NOT EXISTS artists (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        image_url TEXT,
        bio TEXT
      )
    `);

    // Audio Features table
    await db.query(`
      CREATE TABLE IF NOT EXISTS audio_features (
        id SERIAL PRIMARY KEY,
        song_id TEXT REFERENCES songs(id),
        danceability REAL,
        energy REAL,
        valence REAL
      )
    `);

    // Listening History table
    await db.query(`
      CREATE TABLE IF NOT EXISTS listening_history (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        song_id TEXT REFERENCES songs(id),
        listened_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log("✅ All tables created successfully");
  } catch (error) {
    console.error("❌ Error creating tables:", error);
  }
};

// Call the function to create tables
createTables();

// Initialize Spotify API
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: process.env.SPOTIFY_REDIRECT_URI,
});

// Log Spotify configuration on startup
console.log("🎵 Spotify Configuration:");
console.log("Client ID:", process.env.SPOTIFY_CLIENT_ID ? "Set" : "Missing");
console.log(
  "Client Secret:",
  process.env.SPOTIFY_CLIENT_SECRET ? "Set" : "Missing"
);
console.log("Redirect URI:", process.env.SPOTIFY_REDIRECT_URI);

// Get Spotify access token using client credentials
const getSpotifyToken = async () => {
  try {
    const data = await spotifyApi.clientCredentialsGrant();
    spotifyApi.setAccessToken(data.body["access_token"]);
    console.log("✅ Spotify token obtained");

    // Refresh token every 50 minutes
    setTimeout(() => {
      getSpotifyToken();
    }, 50 * 60 * 1000);

    return data.body["access_token"];
  } catch (error) {
    console.error("❌ Failed to get Spotify token:", error);
    throw error;
  }
};

// Initialize Spotify token on server start
getSpotifyToken();

// Middleware
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? [
            "https://moodio.onrender.com",
            "https://moodio-frontend.onrender.com",
          ]
        : "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  jwt.verify(token, process.env.JWT_SECRET || "secret", (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = user;
    next();
  });
};

// ===== DEBUG ROUTES =====

// Debug configuration
app.get("/debug/config", (req, res) => {
  res.json({
    spotifyClientId: process.env.SPOTIFY_CLIENT_ID,
    spotifyRedirectUri: process.env.SPOTIFY_REDIRECT_URI,
    actualSpotifyRedirectUri: spotifyApi.getRedirectURI(),
  });
});

// Debug OAuth URL
app.get("/debug/oauth-url", (req, res) => {
  const scopes = [
    "user-read-private",
    "user-read-email",
    "user-top-read",
    "user-read-recently-played",
    "user-read-currently-playing",
    "user-read-playback-state",
    "user-modify-playback-state",
    "streaming", // ← THIS IS CRUCIAL FOR WEB PLAYBACK SDK
  ];

  const authorizeURL = spotifyApi.createAuthorizeURL(scopes, "moodio-state");
  res.json({
    url: authorizeURL,
    clientId: process.env.SPOTIFY_CLIENT_ID,
    redirectUri: process.env.SPOTIFY_REDIRECT_URI,
  });
});

// ===== SPOTIFY OAUTH ROUTES =====

// Spotify OAuth login
app.get("/auth/spotify", (req, res) => {
  console.log("🔍 Starting Spotify OAuth with:");
  console.log("Client ID:", process.env.SPOTIFY_CLIENT_ID);
  console.log("Redirect URI:", process.env.SPOTIFY_REDIRECT_URI);
  console.log("SpotifyApi Redirect URI:", spotifyApi.getRedirectURI());

  const scopes = [
    "user-read-private",
    "user-read-email",
    "user-top-read",
    "user-read-recently-played",
    "user-read-currently-playing",
    "user-read-playback-state",
    "user-modify-playback-state",
    "streaming",
  ];

  const authorizeURL = spotifyApi.createAuthorizeURL(scopes, "moodio-state");
  console.log("🔗 Generated OAuth URL:", authorizeURL);

  res.redirect(authorizeURL);
});

// Spotify OAuth callback
// ===== REPLACE YOUR ENTIRE Spotify OAuth callback in server.js =====

app.get("/auth/spotify/callback", async (req, res) => {
  const { code, error } = req.query;

  console.log("📝 Spotify callback received:", { code: !!code, error });

  if (error) {
    console.error("❌ Spotify OAuth error:", error);
    const redirectUrl =
      process.env.NODE_ENV === "production"
        ? "https://moodio-frontend.onrender.com/login?error=spotify_auth_failed"
        : "http://localhost:3000/login?error=spotify_auth_failed";
    return res.redirect(redirectUrl);
  }

  if (!code) {
    console.error("❌ No authorization code received");
    const redirectUrl =
      process.env.NODE_ENV === "production"
        ? "https://moodio-frontend.onrender.com/login?error=no_code"
        : "http://localhost:3000/login?error=no_code";
    return res.redirect(redirectUrl);
  }

  try {
    const data = await spotifyApi.authorizationCodeGrant(code);
    const { access_token, refresh_token, expires_in } = data.body;

    // Get user profile from Spotify
    const userSpotifyApi = new SpotifyWebApi({
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
      redirectUri: process.env.SPOTIFY_REDIRECT_URI,
    });

    userSpotifyApi.setAccessToken(access_token);
    userSpotifyApi.setRefreshToken(refresh_token);

    const userProfile = await userSpotifyApi.getMe();
    const spotifyUser = userProfile.body;
    const isPremium = spotifyUser.product === "premium";

    // Check if user exists in our database - PostgreSQL version
    try {
      const result = await db.query(
        "SELECT * FROM users WHERE spotify_id = $1",
        [spotifyUser.id]
      );
      const existingUser = result.rows[0];

      if (existingUser) {
        console.log("✅ User exists, logging in");

        // Store user's Spotify tokens for playback
        userTokens.set(existingUser.id, {
          access_token,
          refresh_token,
          product: spotifyUser.product,
          expires_at: Date.now() + expires_in * 1000,
        });

        // User exists, generate JWT
        const token = jwt.sign(
          { userId: existingUser.id, email: existingUser.email },
          process.env.JWT_SECRET || "secret",
          { expiresIn: "7d" }
        );

        // Create user data object for frontend
        const userData = {
          id: existingUser.id,
          username: existingUser.display_name || existingUser.username,
          email: existingUser.email,
          spotify_token: access_token,
          has_premium: isPremium,
          spotify_product: spotifyUser.product,
        };

        // Redirect to frontend
        const baseUrl =
          process.env.NODE_ENV === "production"
            ? "https://moodio-frontend.onrender.com"
            : "http://localhost:3000";
        const redirectURL = `${baseUrl}?token=${token}&user=${encodeURIComponent(
          JSON.stringify(userData)
        )}`;

        res.redirect(redirectURL);
      } else {
        console.log("👤 Creating new user for:", spotifyUser.display_name);

        // Create new user - PostgreSQL version
        const insertResult = await db.query(
          "INSERT INTO users (spotify_id, display_name, username, email, avatar_url) VALUES ($1, $2, $3, $4, $5) RETURNING id",
          [
            spotifyUser.id,
            spotifyUser.display_name,
            spotifyUser.display_name,
            spotifyUser.email,
            spotifyUser.images?.[0]?.url || null,
          ]
        );
        const newUserId = insertResult.rows[0].id;

        console.log("✅ User created successfully with ID:", newUserId);

        // Store user's Spotify tokens for playback
        userTokens.set(newUserId, {
          access_token,
          refresh_token,
          product: spotifyUser.product,
          expires_at: Date.now() + expires_in * 1000,
        });

        const token = jwt.sign(
          { userId: newUserId, email: spotifyUser.email },
          process.env.JWT_SECRET || "secret",
          { expiresIn: "7d" }
        );

        // Create user data object for frontend
        const userData = {
          id: newUserId,
          username: spotifyUser.display_name,
          email: spotifyUser.email,
          spotify_token: access_token,
          has_premium: isPremium,
          spotify_product: spotifyUser.product,
        };

        // Redirect to frontend
        const baseUrl =
          process.env.NODE_ENV === "production"
            ? "https://moodio-frontend.onrender.com"
            : "http://localhost:3000";
        const redirectURL = `${baseUrl}?token=${token}&user=${encodeURIComponent(
          JSON.stringify(userData)
        )}`;

        res.redirect(redirectURL);
      }
    } catch (dbError) {
      console.error("❌ Database error:", dbError);
      const redirectUrl =
        process.env.NODE_ENV === "production"
          ? "https://moodio-frontend.onrender.com/login?error=database_error"
          : "http://localhost:3000/login?error=database_error";
      return res.redirect(redirectUrl);
    }
  } catch (error) {
    console.error("❌ Spotify OAuth process error:", error);
    const redirectUrl =
      process.env.NODE_ENV === "production"
        ? "https://moodio-frontend.onrender.com/login?error=spotify_auth_failed"
        : "http://localhost:3000/login?error=spotify_auth_failed";
    res.redirect(redirectUrl);
  }
});

// ===== ADD DEBUG ROUTE to check your Premium status =====

app.get("/debug/spotify-user", authenticateToken, async (req, res) => {
  const userSpotifyData = userTokens.get(req.user.userId);

  if (!userSpotifyData) {
    return res.json({ error: "No Spotify token found for user" });
  }

  try {
    // Check current user data from Spotify
    const response = await fetch("https://api.spotify.com/v1/me", {
      headers: {
        Authorization: `Bearer ${userSpotifyData.access_token}`,
      },
    });

    if (response.ok) {
      const userData = await response.json();
      res.json({
        stored_product: userSpotifyData.product,
        current_product: userData.product,
        is_premium: userData.product === "premium",
        user_data: userData,
      });
    } else {
      res.json({
        error: "Failed to fetch current user data",
        status: response.status,
      });
    }
  } catch (error) {
    res.json({ error: "Error checking Spotify user", details: error.message });
  }
});

// ===== ADD A TEST ROUTE TO DEBUG =====

app.get("/debug/check-route", (req, res) => {
  res.json({
    message: "Route working",
    timestamp: new Date().toISOString(),
  });
});

// ===== ALSO ADD A SIMPLE CHECK FOR THE AUTHENTICATION =====

app.get("/debug/auth-test", authenticateToken, (req, res) => {
  console.log("🔍 Auth test - User:", req.user);
  res.json({
    message: "Authentication working",
    user: req.user,
    hasUserTokens: userTokens.has(req.user.userId),
    userTokensCount: userTokens.size,
    availableUserIds: Array.from(userTokens.keys()),
  });
});

// Get user's access token for Web Playback SDK
app.get("/api/spotify/token", authenticateToken, (req, res) => {
  const userSpotifyData = userTokens.get(req.user.userId);

  if (!userSpotifyData) {
    return res.status(401).json({ error: "No Spotify token found" });
  }

  res.json({
    access_token: userSpotifyData.access_token,
  });
});

// Refresh Spotify token if needed
app.post("/api/spotify/refresh-token", authenticateToken, async (req, res) => {
  const userSpotifyData = userTokens.get(req.user.userId);

  if (!userSpotifyData || !userSpotifyData.refresh_token) {
    return res.status(401).json({ error: "No refresh token found" });
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
    console.error("Token refresh failed:", error);
    res.status(500).json({ error: "Failed to refresh token" });
  }
});

// Start playback on a specific device
app.put("/api/spotify/play", authenticateToken, async (req, res) => {
  const { track_uri, device_id } = req.body;
  const userSpotifyData = userTokens.get(req.user.userId);

  if (!userSpotifyData) {
    return res.status(401).json({ error: "No Spotify token found" });
  }

  try {
    const response = await fetch(
      `https://api.spotify.com/v1/me/player/play${
        device_id ? `?device_id=${device_id}` : ""
      }`,
      {
        method: "PUT",
        body: JSON.stringify({ uris: [track_uri] }),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userSpotifyData.access_token}`,
        },
      }
    );

    if (response.status === 204) {
      res.json({ success: true });
    } else {
      throw new Error(`Spotify API responded with status ${response.status}`);
    }
  } catch (error) {
    console.error("Playback failed:", error);
    res.status(500).json({ error: "Failed to start playback" });
  }
});

// Get user's currently playing track
app.get(
  "/api/spotify/currently-playing",
  authenticateToken,
  async (req, res) => {
    const userSpotifyData = userTokens.get(req.user.userId);

    if (!userSpotifyData) {
      return res.status(401).json({ error: "No Spotify token found" });
    }

    try {
      const response = await fetch(
        "https://api.spotify.com/v1/me/player/currently-playing",
        {
          headers: {
            Authorization: `Bearer ${userSpotifyData.access_token}`,
          },
        }
      );

      if (response.status === 204) {
        res.json({ is_playing: false });
      } else {
        const data = await response.json();
        res.json(data);
      }
    } catch (error) {
      console.error("Failed to get currently playing:", error);
      res.status(500).json({ error: "Failed to get currently playing track" });
    }
  }
);

// ===== REGULAR AUTH ROUTES =====

// Register
app.post("/api/auth/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: "All fields required" });
    }

    // Check if user exists
    const existingUser = await db.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await db.query(
      "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id",
      [username, email, hashedPassword]
    );

    const userId = result.rows[0].id;

    // Generate token
    const token = jwt.sign(
      { userId, email },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "7d" }
    );

    res.status(201).json({
      user: { id: userId, username, email },
      token,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    const user = result.rows[0];
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "7d" }
    );

    res.json({
      user: { id: user.id, username: user.username, email: user.email },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get profile
app.get("/api/auth/me", authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      "SELECT id, username, display_name, email FROM users WHERE id = $1",
      [req.user.userId]
    );

    const user = result.rows[0];
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      user: {
        id: user.id,
        username: user.display_name || user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ error: "Failed to fetch user profile" });
  }
});

// ===== REAL SPOTIFY API ROUTES =====

// REAL Spotify search
app.get("/api/spotify/search", authenticateToken, async (req, res) => {
  try {
    const { q, type = "track,artist,album", limit = 20 } = req.query;

    if (!q) {
      return res.status(400).json({ error: "Search query required" });
    }

    const searchResults = await spotifyApi.search(q, type.split(","), {
      limit: parseInt(limit),
    });

    res.json({
      tracks: searchResults.body.tracks || { items: [] },
      artists: searchResults.body.artists || { items: [] },
      albums: searchResults.body.albums || { items: [] },
    });
  } catch (error) {
    console.error("Spotify search error:", error);

    // If token expired, refresh and retry
    if (error.statusCode === 401) {
      try {
        await getSpotifyToken();
        const searchResults = await spotifyApi.search(q, type.split(","), {
          limit: parseInt(limit),
        });
        res.json({
          tracks: searchResults.body.tracks || { items: [] },
          artists: searchResults.body.artists || { items: [] },
          albums: searchResults.body.albums || { items: [] },
        });
      } catch (retryError) {
        res.status(500).json({ error: "Search failed after token refresh" });
      }
    } else {
      res.status(500).json({ error: "Search failed" });
    }
  }
});

// Get REAL artist details
app.get(
  "/api/spotify/artist/:id/enhanced",
  authenticateToken,
  async (req, res) => {
    try {
      const { id: artistId } = req.params;
      const userSpotifyData = userTokens.get(req.user.userId);

      if (!userSpotifyData) {
        return res.status(401).json({ error: "No Spotify token available" });
      }

      // Get basic Spotify artist data
      const [artistResponse, topTracksResponse] = await Promise.all([
        fetch(`https://api.spotify.com/v1/artists/${artistId}`, {
          headers: { Authorization: `Bearer ${userSpotifyData.access_token}` },
        }),
        fetch(
          `https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=US`,
          {
            headers: {
              Authorization: `Bearer ${userSpotifyData.access_token}`,
            },
          }
        ),
      ]);

      const spotifyArtist = await artistResponse.json();
      const topTracksData = await topTracksResponse.json();

      // Temporarily disable Genius to avoid errors
      let geniusData = null;
      console.log("🔍 Genius integration temporarily disabled for stability");

      res.json({
        spotify: { ...spotifyArtist, top_tracks: topTracksData.tracks || [] },
        genius: geniusData,
        mood_analysis: null,
      });
    } catch (error) {
      console.error("❌ Enhanced artist fetch error:", error);
      res.status(500).json({ error: "Failed to fetch enhanced artist data" });
    }
  }
);

// Get REAL artist top tracks
app.get(
  "/api/spotify/artist/:id/top-tracks",
  authenticateToken,
  async (req, res) => {
    try {
      const { id } = req.params;
      const topTracks = await spotifyApi.getArtistTopTracks(id, "US");
      res.json({ tracks: topTracks.body.tracks });
    } catch (error) {
      console.error("Get artist top tracks error:", error);
      res.status(500).json({ error: "Failed to fetch top tracks" });
    }
  }
);

// Get REAL audio features for mood analysis
app.get(
  "/api/spotify/audio-features/:trackId",
  authenticateToken,
  async (req, res) => {
    try {
      const { trackId } = req.params;
      const features = await spotifyApi.getAudioFeaturesForTrack(trackId);

      // Convert Spotify audio features to mood
      const audioFeatures = features.body;
      let mood = "neutral";

      if (audioFeatures.valence > 0.6 && audioFeatures.energy > 0.6) {
        mood = "happy";
      } else if (audioFeatures.valence < 0.4 && audioFeatures.energy < 0.4) {
        mood = "sad";
      } else if (audioFeatures.energy > 0.7) {
        mood = "energetic";
      } else if (audioFeatures.valence > 0.6 && audioFeatures.energy < 0.5) {
        mood = "calm";
      }

      res.json({
        ...audioFeatures,
        mood,
      });
    } catch (error) {
      console.error("Get audio features error:", error);
      res.status(500).json({ error: "Failed to fetch audio features" });
    }
  }
);

// Get user's top tracks
app.get("/api/spotify/top-tracks", authenticateToken, async (req, res) => {
  try {
    // Get popular tracks for now
    const topTracks = await spotifyApi.search("year:2024", ["track"], {
      limit: 10,
    });
    res.json(topTracks.body.tracks);
  } catch (error) {
    console.error("Get top tracks error:", error);
    res.status(500).json({ error: "Failed to fetch top tracks" });
  }
});

// Get mood-based recommendations
app.get(
  "/api/spotify/recommendations/:mood",
  authenticateToken,
  async (req, res) => {
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
        tired: { target_energy: 0.2, target_valence: 0.4 },
      };

      const seedParams = moodSeeds[mood] || moodSeeds.happy;

      // Get recommendations based on mood
      const recommendations = await spotifyApi.getRecommendations({
        seed_genres: ["pop", "rock", "indie"],
        limit: 10,
        ...seedParams,
      });

      res.json({ tracks: recommendations.body.tracks });
    } catch (error) {
      console.error("Get recommendations error:", error);
      res.status(500).json({ error: "Failed to fetch recommendations" });
    }
  }
);

// Add this to your server.js after your existing routes

// OpenAI Integration
const { OpenAI } = require("openai");
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// AI-powered mood analysis and recommendations
app.post(
  "/api/ai/mood-recommendations",
  authenticateToken,
  async (req, res) => {
    try {
      const userId = req.user.userId;

      // Get user's recent mood logs
      const moodResult = await db.query(
        "SELECT mood, intensity, note, created_at FROM moods WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10",
        [userId]
      );

      const moods = moodResult.rows;
      if (!moods || moods.length === 0) {
        return res.json({
          recommendations: [
            "Start logging your moods to get personalized recommendations!",
          ],
          insights: "No mood data available yet.",
          suggested_genres: ["pop", "indie", "chill"],
        });
      }

      try {
        // Create a mood summary for OpenAI
        const moodSummary = moods
          .map(
            (m) =>
              `${m.mood} (intensity: ${m.intensity}/10) - ${
                m.note || "no note"
              }`
          )
          .join("\n");

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
          temperature: 0.7,
        });

        const aiResponse = completion.choices[0].message.content;

        try {
          const parsedResponse = JSON.parse(aiResponse);
          res.json(parsedResponse);
        } catch (parseError) {
          // Fallback if JSON parsing fails
          res.json({
            insights: aiResponse,
            recommendations: [
              "Try listening to music that matches your current mood",
            ],
            suggested_genres: ["pop", "indie", "alternative"],
            playlist_theme: "Your Mood Mix",
          });
        }
      } catch (aiError) {
        console.error("OpenAI API error:", aiError);
        res
          .status(500)
          .json({ error: "Failed to generate AI recommendations" });
      }
    } catch (error) {
      console.error("Mood recommendations error:", error);
      res.status(500).json({ error: "Failed to process request" });
    }
  }
);

// AI mood insights for dashboard
app.get("/api/ai/mood-insights", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await db.query(
      "SELECT mood, intensity, created_at FROM moods WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20",
      [userId]
    );

    const moods = result.rows;
    if (!moods.length) {
      return res.json({
        insight: "Start logging moods to see AI insights!",
      });
    }

    const moodCounts = {};
    let totalIntensity = 0;

    moods.forEach((mood) => {
      moodCounts[mood.mood] = (moodCounts[mood.mood] || 0) + 1;
      totalIntensity += mood.intensity;
    });

    const averageIntensity = totalIntensity / moods.length;
    const dominantMood = Object.entries(moodCounts).reduce((a, b) =>
      b[1] > a[1] ? b : a
    )[0];

    res.json({
      insight: `Your dominant mood is ${dominantMood} with an average intensity of ${averageIntensity.toFixed(
        1
      )}/10.`,
      moodCounts,
      averageIntensity,
    });
  } catch (error) {
    console.error("Error generating mood insights:", error);
    res.status(500).json({ error: "Failed to generate mood insights" });
  }

  moods.forEach((mood) => {
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
- Recent moods: ${moods
      .slice(0, 5)
      .map((m) => m.mood)
      .join(", ")}

Provide a brief, encouraging insight (1-2 sentences) about their emotional patterns and how music might help.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 100,
      temperature: 0.8,
    });

    res.json({
      insight: completion.choices[0].message.content.trim(),
      dominantMood,
      averageIntensity,
      totalLogs: moods.length,
    });
    const dominantMood = Object.entries(moodCounts).sort(
      (a, b) => b[1] - a[1]
    )[0][0];

    res.json({
      insight: `You've been feeling mostly ${dominantMood} lately. Music can be a great way to support your emotional journey!`,
      dominantMood,
      averageIntensity,
      totalLogs: moods.length,
    });
  } catch (error) {
    console.error("Mood insights error:", error);
    res.status(500).json({ error: "Failed to get insights" });
  }
});

// ===== MOOD ROUTES =====

// Get user moods
app.get("/api/moods", authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM moods WHERE user_id = $1 ORDER BY created_at DESC",
      [req.user.userId]
    );
    res.json({ moods: result.rows });
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// Create mood
app.post("/api/moods", authenticateToken, async (req, res) => {
  const { mood, intensity, note } = req.body;

  console.log("🎵 Creating mood:", {
    mood,
    intensity,
    note,
    userId: req.user.userId,
  });

  try {
    // Use explicit local time instead of database CURRENT_TIMESTAMP
    const now = new Date().toISOString();

    const result = await db.query(
      "INSERT INTO moods (user_id, mood, intensity, note, created_at) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [req.user.userId, mood, intensity, note, now]
    );

    const newMood = result.rows[0];
    console.log("✅ Mood saved with ID:", newMood.id);
    res.status(201).json(newMood);
  } catch (error) {
    console.error("❌ Database error:", error);
    res
      .status(500)
      .json({ error: "Failed to save mood", details: error.message });
  }
});

// ===== FAVORITES ROUTES =====

// ===== FAVORITES ROUTES =====

// Get user's favorites
app.get("/api/favorites", authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM favorites WHERE user_id = $1 ORDER BY created_at DESC",
      [req.user.userId]
    );
    res.json({ favorites: result.rows });
  } catch (error) {
    console.error("❌ Failed to get favorites:", error);
    res.status(500).json({ error: "Failed to get favorites" });
  }
});

// Add to favorites
app.post("/api/favorites", authenticateToken, async (req, res) => {
  const {
    item_type,
    item_id,
    item_name,
    artist_name,
    album_name,
    artwork_url,
    track_uri,
  } = req.body;

  console.log("❤️ Adding to favorites:", { item_name, artist_name });

  try {
    const result = await db.query(
      `INSERT INTO favorites (user_id, item_type, item_id, item_name, artist_name, album_name, artwork_url, track_uri) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
      [
        req.user.userId,
        item_type,
        item_id,
        item_name,
        artist_name,
        album_name,
        artwork_url,
        track_uri,
      ]
    );

    const newId = result.rows[0].id;
    console.log("✅ Added to favorites with ID:", newId);
    res.status(201).json({ message: "Added to favorites", id: newId });
  } catch (error) {
    if (error.code === "23505") {
      // PostgreSQL unique violation error code
      return res.status(400).json({ error: "Already in favorites" });
    }
    console.error("❌ Failed to add favorite:", error);
    res.status(500).json({ error: "Failed to add to favorites" });
  }
});

// Remove from favorites
app.delete("/api/favorites/:itemId", authenticateToken, async (req, res) => {
  const { itemId } = req.params;

  console.log("💔 Removing from favorites:", itemId);

  try {
    const result = await db.query(
      "DELETE FROM favorites WHERE user_id = $1 AND item_id = $2",
      [req.user.userId, itemId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Favorite not found" });
    }

    res.json({ message: "Removed from favorites" });
  } catch (error) {
    console.error("❌ Failed to remove favorite:", error);
    res.status(500).json({ error: "Failed to remove from favorites" });
  }
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Moodio server running!",
    timestamp: new Date().toISOString(),
    port: PORT,
    environment: process.env.NODE_ENV || "development",
    buildPath: path.join(__dirname, "../frontend/build"),
    buildExists: require("fs").existsSync(
      path.join(__dirname, "../frontend/build")
    ),
  });
});

// Root health check for Render (only in development)
if (process.env.NODE_ENV !== "production") {
  app.get("/", (req, res) => {
    res.json({
      status: "OK",
      message: "Moodio API is running!",
      timestamp: new Date().toISOString(),
      port: PORT,
    });
  });
}

// Migration routes removed - All columns are now in initial table creation

// Database health check route
app.get("/test/database", async (req, res) => {
  try {
    const result = await db.query("SELECT version()");
    const tableInfo = await db.query(
      `SELECT table_name 
       FROM information_schema.tables 
       WHERE table_schema = 'public'`
    );

    return res.json({
      status: "Connected",
      version: result.rows[0].version,
      tables: tableInfo.rows.map((r) => r.table_name),
    });
  } catch (error) {
    console.error("Database health check failed:", error);
    return res.status(500).json({
      error: "Database health check failed",
      details: error.message,
    });
  }
});

// Add this simple debug route to test backend
app.get("/debug/test", (req, res) => {
  res.json({
    message: "Backend is working",
    timestamp: new Date().toISOString(),
    userTokensCount: userTokens.size,
  });
});

// ===== ADD THESE TEST ROUTES TO YOUR server.js =====

// Test if Spotify OAuth is working at all
app.get("/test/spotify-auth", (req, res) => {
  console.log("🧪 Testing Spotify OAuth redirect...");

  const scopes = ["user-read-private", "user-read-email", "user-top-read"];

  try {
    const authorizeURL = spotifyApi.createAuthorizeURL(scopes, "test-state");
    console.log("✅ Generated test OAuth URL:", authorizeURL);

    res.json({
      message: "Spotify OAuth test",
      redirect_url: authorizeURL,
      client_id: process.env.SPOTIFY_CLIENT_ID,
      redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
    });
  } catch (error) {
    console.error("❌ OAuth URL generation failed:", error);
    res
      .status(500)
      .json({ error: "Failed to generate OAuth URL", details: error.message });
  }
});

// Test callback route
app.get("/test/callback", (req, res) => {
  console.log("🧪 Test callback hit with query params:", req.query);
  res.json({
    message: "Callback received",
    query_params: req.query,
    timestamp: new Date().toISOString(),
  });
});

// Check what tokens we have stored
app.get("/debug/stored-tokens", (req, res) => {
  const tokenInfo = [];

  userTokens.forEach((tokenData, userId) => {
    tokenInfo.push({
      userId: userId,
      hasAccessToken: !!tokenData.access_token,
      hasRefreshToken: !!tokenData.refresh_token,
      product: tokenData.product,
      accessTokenPreview: tokenData.access_token
        ? tokenData.access_token.substring(0, 10) + "..."
        : "None",
    });
  });

  res.json({
    totalUsers: userTokens.size,
    tokens: tokenInfo,
  });
});

// Simple manual token storage test
app.post("/test/store-token", (req, res) => {
  const { userId, testToken } = req.body;

  if (!userId || !testToken) {
    return res.status(400).json({ error: "userId and testToken required" });
  }

  userTokens.set(parseInt(userId), {
    access_token: testToken,
    refresh_token: "test_refresh",
    product: "premium",
  });

  console.log("🧪 Manually stored test token for user:", userId);

  res.json({
    message: "Test token stored",
    userId: userId,
    tokenCount: userTokens.size,
  });
});

// Serve static files from React build
// Serve static files from React build
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/build")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
  });
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`✅ Database initialized`);
  console.log(`✅ Spotify integration ready`);
  console.log(`✅ Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`✅ Health check available at /api/health`);
  if (process.env.NODE_ENV === "production") {
    console.log(
      `✅ Serving React app from ${path.join(__dirname, "../frontend/build")}`
    );
  } else {
    console.log(`✅ Root endpoint available at http://localhost:${PORT}/`);
  }
});
