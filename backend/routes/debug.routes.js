const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/auth");
const { spotifyApi } = require("../config/spotify");

// userTokens is passed in via the factory function at the bottom
let userTokens;

// Basic route check
router.get("/check-route", (req, res) => {
  res.json({
    message: "Route working",
    timestamp: new Date().toISOString(),
  });
});

// Test backend is working
router.get("/test", (req, res) => {
  res.json({
    message: "Backend is working",
    timestamp: new Date().toISOString(),
    userTokensCount: userTokens.size,
  });
});

// Auth test
router.get("/auth-test", authenticateToken, (req, res) => {
  console.log("🔍 Auth test - User:", req.user);
  res.json({
    message: "Authentication working",
    user: req.user,
    hasUserTokens: userTokens.has(req.user.userId),
    userTokensCount: userTokens.size,
    availableUserIds: Array.from(userTokens.keys()),
  });
});

// Check Spotify user / Premium status
router.get("/spotify-user", authenticateToken, async (req, res) => {
  const userSpotifyData = userTokens.get(req.user.userId);

  if (!userSpotifyData) {
    return res.json({ error: "No Spotify token found for user" });
  }

  try {
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

// Check stored tokens
router.get("/stored-tokens", (req, res) => {
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

// Test Spotify OAuth URL generation
router.get("/test-spotify-auth", (req, res) => {
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

// Test callback
router.get("/test-callback", (req, res) => {
  console.log("🧪 Test callback hit with query params:", req.query);
  res.json({
    message: "Callback received",
    query_params: req.query,
    timestamp: new Date().toISOString(),
  });
});

// Manual token storage test
router.post("/store-token", (req, res) => {
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

// ===== FACTORY EXPORT =====
module.exports = function (tokens) {
  userTokens = tokens;
  return router;
};
