const express = require("express");
const SpotifyWebApi = require("spotify-web-api-node");
const jwt = require("jsonwebtoken");
const router = express.Router();

let db;
const setDb = (pool) => {
  db = pool;
};

// Initialize Spotify API
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: process.env.SPOTIFY_REDIRECT_URI,
});

// Spotify OAuth login
router.get("/login", async (req, res) => {
  try {
    console.log("🔍 Starting Spotify OAuth...");

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

    const authorizeURL = await spotifyApi.createAuthorizeURL(
      scopes,
      "moodio-state"
    );
    console.log("🔗 Generated OAuth URL:", authorizeURL);

    res.redirect(authorizeURL);
  } catch (error) {
    console.error("❌ Error in Spotify login:", error);
    res.redirect("/login?error=spotify_login_failed");
  }
});

// Spotify OAuth callback
router.get("/callback", async (req, res) => {
  const { code, error } = req.query;

  console.log("📝 Spotify callback received:", { code: !!code, error });

  if (error) {
    console.error("❌ Spotify OAuth error:", error);
    return res.redirect("/login?error=spotify_oauth_failed");
  }

  try {
    const data = await spotifyApi.authorizationCodeGrant(code);

    // Use the access token
    const accessToken = data.body["access_token"];
    const refreshToken = data.body["refresh_token"];

    // Get user profile
    spotifyApi.setAccessToken(accessToken);
    const userProfile = await spotifyApi.getMe();

    // Create or update user in database
    const result = await db.query(
      `INSERT INTO users (spotify_id, display_name, email, avatar_url)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (spotify_id) 
       DO UPDATE SET 
         display_name = EXCLUDED.display_name,
         email = EXCLUDED.email,
         avatar_url = EXCLUDED.avatar_url
       RETURNING id`,
      [
        userProfile.body.id,
        userProfile.body.display_name,
        userProfile.body.email,
        userProfile.body.images[0]?.url,
      ]
    );

    const userId = result.rows[0].id;
    const token = jwt.sign(
      { userId, spotifyId: userProfile.body.id },
      process.env.JWT_SECRET
    );

    // Redirect to frontend with token
    res.redirect(`${process.env.FRONTEND_URL}/spotify-callback?token=${token}`);
  } catch (error) {
    console.error("❌ Error in Spotify callback:", error);
    res.redirect("/login?error=spotify_auth_failed");
  }
});

module.exports = { router, setDb };
