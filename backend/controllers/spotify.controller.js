// controllers/spotify.controller.js
const { spotifyApi, getSpotifyToken } = require("../config/spotify");

// Get user's Spotify access token
const getToken = (userTokens, req, res) => {
  const userSpotifyData = userTokens.get(req.user.userId);

  if (!userSpotifyData) {
    return res.status(401).json({ error: "No Spotify token found" });
  }

  res.json({ access_token: userSpotifyData.access_token });
};

// Refresh Spotify token
const refreshToken = async (userTokens, req, res) => {
  const userSpotifyData = userTokens.get(req.user.userId);

  if (!userSpotifyData || !userSpotifyData.refresh_token) {
    return res.status(401).json({ error: "No refresh token found" });
  }

  try {
    spotifyApi.setRefreshToken(userSpotifyData.refresh_token);
    const data = await spotifyApi.refreshAccessToken();
    const { access_token } = data.body;

    userSpotifyData.access_token = access_token;
    userTokens.set(req.user.userId, userSpotifyData);

    res.json({ access_token });
  } catch (error) {
    console.error("Token refresh failed:", error);
    res.status(500).json({ error: "Failed to refresh token" });
  }
};

// Start playback
const play = async (userTokens, req, res) => {
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
};

// Get currently playing track
const getCurrentlyPlaying = async (userTokens, req, res) => {
  const userSpotifyData = userTokens.get(req.user.userId);

  if (!userSpotifyData) {
    return res.status(401).json({ error: "No Spotify token found" });
  }

  try {
    const response = await fetch(
      "https://api.spotify.com/v1/me/player/currently-playing",
      {
        headers: { Authorization: `Bearer ${userSpotifyData.access_token}` },
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
};

// Search Spotify
const search = async (req, res) => {
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

    if (error.statusCode === 401) {
      try {
        await getSpotifyToken();
        const { q, type = "track,artist,album", limit = 20 } = req.query;
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
};

// Get enhanced artist details
const getEnhancedArtist = async (userTokens, req, res) => {
  try {
    const { id: artistId } = req.params;
    const userSpotifyData = userTokens.get(req.user.userId);

    if (!userSpotifyData) {
      return res.status(401).json({ error: "No Spotify token available" });
    }

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
};

// Get artist top tracks
const getArtistTopTracks = async (req, res) => {
  try {
    const { id } = req.params;
    const topTracks = await spotifyApi.getArtistTopTracks(id, "US");
    res.json({ tracks: topTracks.body.tracks });
  } catch (error) {
    console.error("Get artist top tracks error:", error);
    res.status(500).json({ error: "Failed to fetch top tracks" });
  }
};

// Get audio features for mood analysis
const getAudioFeatures = async (req, res) => {
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

    res.json({ ...audioFeatures, mood });
  } catch (error) {
    console.error("Get audio features error:", error);
    res.status(500).json({ error: "Failed to fetch audio features" });
  }
};

// Get top tracks
const getTopTracks = async (req, res) => {
  try {
    const topTracks = await spotifyApi.search("year:2024", ["track"], {
      limit: 10,
    });
    res.json(topTracks.body.tracks);
  } catch (error) {
    console.error("Get top tracks error:", error);
    res.status(500).json({ error: "Failed to fetch top tracks" });
  }
};

// Get mood-based recommendations
const getRecommendations = async (req, res) => {
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
};

module.exports = {
  getToken,
  refreshToken,
  play,
  getCurrentlyPlaying,
  search,
  getEnhancedArtist,
  getArtistTopTracks,
  getAudioFeatures,
  getTopTracks,
  getRecommendations,
};
