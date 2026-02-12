// routes/debug.routes.js
const express = require("express");
const router = express.Router();
const { spotifyApi } = require("../config/spotify");
const { userTokens } = require("../server");

// Debug configuration
router.get("/config", (req, res) => {
  res.json({
    spotifyClientId: process.env.SPOTIFY_CLIENT_ID,
    spotifyRedirectUri: process.env.SPOTIFY_REDIRECT_URI,
    actualSpotifyRedirectUri: spotifyApi.getRedirectURI(),
  });
});

// Debug OAuth URL
router.get("/oauth-url", (req, res) => {
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
  res.json({
    url: authorizeURL,
    clientId: process.env.SPOTIFY_CLIENT_ID,
    redirectUri: process.env.SPOTIFY_REDIRECT_URI,
  });
});

module.exports = router;
