const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/auth");
const { spotifyApi, getSpotifyToken } = require("../config/spotify");

// userTokens is passed in via the factory function at the bottom
let userTokens;

// ===== TOKEN ROUTES =====

// Get user's access token for Web Playback SDK
router.get("/token", authenticateToken, (req, res) => {
  const userSpotifyData = userTokens.get(req.user.userId);

  if (!userSpotifyData) {
    return res.status(401).json({ error: "No Spotify token found" });
  }

  res.json({
    access_token: userSpotifyData.access_token,
  });
});

// Refresh Spotify token if needed
router.post("/refresh-token", authenticateToken, async (req, res) => {
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

// ===== PLAYBACK ROUTES =====

// Start playback on a specific device
router.put("/play", authenticateToken, async (req, res) => {
  const { track_uri, device_id } = req.body;
  const userSpotifyData = userTokens.get(req.user.userId);

  if (!userSpotifyData) {
    return res.status(401).json({ error: "No Spotify token found" });
  }

  try {
    const response = await fetch(
      `https://api.spotify.com/v1/me/player/play${device_id ? `?device_id=${device_id}` : ""}`,
      {
        method: "PUT",
        body: JSON.stringify({ uris: [track_uri] }),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userSpotifyData.access_token}`,
        },
      },
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
router.get("/currently-playing", authenticateToken, async (req, res) => {
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
      },
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
});

// ===== SEARCH ROUTES =====

// Spotify search
router.get("/search", authenticateToken, async (req, res) => {
  try {
    console.log("🔍 Search query params:", req.query);
    const { q, type = "track,artist,album", limit } = req.query;

    if (!q) {
      return res.status(400).json({ error: "Search query required" });
    }

    const parsedLimit = Math.min(Math.max(parseInt(limit) || 20, 1), 50);

    const searchResults = await spotifyApi.search(q, type.split(","), {
      limit: 10,
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
        const { q, type = "track,artist,album", limit } = req.query;
        const retryLimit = Math.min(Math.max(parseInt(limit) || 20, 1), 50);
        const searchResults = await spotifyApi.search(q, type.split(","), {
          limit: retryLimit,
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

// ===== ARTIST ROUTES =====

// Get enhanced artist details
router.get("/artist/:id/enhanced", authenticateToken, async (req, res) => {
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
          headers: { Authorization: `Bearer ${userSpotifyData.access_token}` },
        },
      ),
    ]);

    const spotifyArtist = await artistResponse.json();
    const topTracksData = await topTracksResponse.json();

    // Genius integration temporarily disabled
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
});

// Get artist top tracks
router.get("/artist/:id/top-tracks", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const topTracks = await spotifyApi.getArtistTopTracks(id, "US");
    res.json({ tracks: topTracks.body.tracks });
  } catch (error) {
    console.error("Get artist top tracks error:", error);
    res.status(500).json({ error: "Failed to fetch top tracks" });
  }
});

// ===== AUDIO FEATURES / MOOD ANALYSIS =====

// Get audio features for mood analysis
router.get("/audio-features/:trackId", authenticateToken, async (req, res) => {
  try {
    const { trackId } = req.params;
    const features = await spotifyApi.getAudioFeaturesForTrack(trackId);

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
});

// ===== RECOMMENDATIONS =====

// Get user's top tracks
router.get("/top-tracks", authenticateToken, async (req, res) => {
  try {
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
router.get("/recommendations/:mood", authenticateToken, async (req, res) => {
  try {
    const { mood } = req.params;

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
});

// ===== FACTORY EXPORT =====
// We use a factory function so server.js can pass in userTokens

module.exports = function (tokens) {
  userTokens = tokens;
  return router;
};
