const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const SpotifyWebApi = require("spotify-web-api-node");
const db = require("../config/database");
const { spotifyApi } = require("../config/spotify");
const authenticateToken = require("../middleware/auth");

// userTokens is passed in via the factory function at the bottom
let userTokens;

// ===== SPOTIFY OAUTH =====

// Spotify OAuth login - redirect to Spotify
router.get("/spotify", (req, res) => {
  const scopes = [
    "user-read-private",
    "user-read-email",
    "user-top-read",
    "streaming",
    "user-read-playback-state",
    "user-modify-playback-state",
    "user-read-currently-playing",
  ];

  const authorizeURL = spotifyApi.createAuthorizeURL(scopes, "moodio-auth");
  console.log("🎵 Redirecting to Spotify OAuth:", authorizeURL);
  res.redirect(authorizeURL);
});

// Spotify OAuth callback
router.get("/spotify/callback", async (req, res) => {
  const { code, error } = req.query;

  console.log("📝 Spotify callback received:", { code: !!code, error });

  const getRedirectUrl = (path = "") => {
    const baseUrl =
      process.env.NODE_ENV === "production"
        ? "https://moodio-frontend.onrender.com"
        : "http://localhost:3000";
    return `${baseUrl}${path}`;
  };

  if (error) {
    console.error("❌ Spotify OAuth error:", error);
    return res.redirect(getRedirectUrl("/login?error=spotify_auth_failed"));
  }

  if (!code) {
    console.error("❌ No authorization code received");
    return res.redirect(getRedirectUrl("/login?error=no_code"));
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

    // Check if user exists in database (SQLite)
    db.get(
      "SELECT * FROM users WHERE spotify_id = ?",
      [spotifyUser.id],
      (err, existingUser) => {
        if (err) {
          console.error("❌ Database error:", err);
          return res.redirect(getRedirectUrl("/login?error=database_error"));
        }

        if (existingUser) {
          // User exists - log them in
          console.log("✅ User exists, logging in");

          userTokens.set(existingUser.id, {
            access_token,
            refresh_token,
            product: spotifyUser.product,
            expires_at: Date.now() + expires_in * 1000,
          });

          const token = jwt.sign(
            { userId: existingUser.id, email: existingUser.email },
            process.env.JWT_SECRET || "secret",
            { expiresIn: "7d" },
          );

          const userData = {
            id: existingUser.id,
            username: existingUser.display_name || existingUser.username,
            email: existingUser.email,
            spotify_token: access_token,
            has_premium: isPremium,
            spotify_product: spotifyUser.product,
          };

          const redirectURL = `${getRedirectUrl()}?token=${token}&user=${encodeURIComponent(JSON.stringify(userData))}`;
          res.redirect(redirectURL);
        } else {
          // Create new user (SQLite)
          console.log("👤 Creating new user for:", spotifyUser.display_name);

          db.run(
            "INSERT INTO users (spotify_id, display_name, username, email, avatar_url) VALUES (?, ?, ?, ?, ?)",
            [
              spotifyUser.id,
              spotifyUser.display_name,
              spotifyUser.display_name,
              spotifyUser.email,
              spotifyUser.images?.[0]?.url || null,
            ],
            function (insertErr) {
              if (insertErr) {
                console.error("❌ Insert error:", insertErr);
                return res.redirect(
                  getRedirectUrl("/login?error=database_error"),
                );
              }

              const newUserId = this.lastID;
              console.log("✅ User created successfully with ID:", newUserId);

              userTokens.set(newUserId, {
                access_token,
                refresh_token,
                product: spotifyUser.product,
                expires_at: Date.now() + expires_in * 1000,
              });

              const token = jwt.sign(
                { userId: newUserId, email: spotifyUser.email },
                process.env.JWT_SECRET || "secret",
                { expiresIn: "7d" },
              );

              const userData = {
                id: newUserId,
                username: spotifyUser.display_name,
                email: spotifyUser.email,
                spotify_token: access_token,
                has_premium: isPremium,
                spotify_product: spotifyUser.product,
              };

              const redirectURL = `${getRedirectUrl()}?token=${token}&user=${encodeURIComponent(JSON.stringify(userData))}`;
              res.redirect(redirectURL);
            },
          );
        }
      },
    );
  } catch (error) {
    console.error("❌ Spotify OAuth process error:", error);
    res.redirect(getRedirectUrl("/login?error=spotify_auth_failed"));
  }
});

// ===== REGULAR AUTH ROUTES =====

// Register
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: "All fields required" });
    }

    // Check if user exists (SQLite)
    db.get(
      "SELECT * FROM users WHERE email = ?",
      [email],
      async (err, existingUser) => {
        if (err) {
          console.error("Registration error:", err);
          return res.status(500).json({ error: "Server error" });
        }

        if (existingUser) {
          return res.status(400).json({ error: "User already exists" });
        }

        // Hash password and create user
        const hashedPassword = await bcrypt.hash(password, 10);

        db.run(
          "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
          [username, email, hashedPassword],
          function (insertErr) {
            if (insertErr) {
              console.error("Registration error:", insertErr);
              return res.status(500).json({ error: "Server error" });
            }

            const userId = this.lastID;

            const token = jwt.sign(
              { userId, email },
              process.env.JWT_SECRET || "secret",
              { expiresIn: "7d" },
            );

            res.status(201).json({
              user: { id: userId, username, email },
              token,
            });
          },
        );
      },
    );
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Login
router.post("/login", (req, res) => {
  try {
    const { email, password } = req.body;

    db.get(
      "SELECT * FROM users WHERE email = ?",
      [email],
      async (err, user) => {
        if (err) {
          console.error("Login error:", err);
          return res.status(500).json({ error: "Server error" });
        }

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
          { expiresIn: "7d" },
        );

        res.json({
          user: { id: user.id, username: user.username, email: user.email },
          token,
        });
      },
    );
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get profile
router.get("/me", authenticateToken, (req, res) => {
  try {
    db.get(
      "SELECT id, username, display_name, email FROM users WHERE id = ?",
      [req.user.userId],
      (err, user) => {
        if (err) {
          console.error("Error fetching user profile:", err);
          return res
            .status(500)
            .json({ error: "Failed to fetch user profile" });
        }

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
      },
    );
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ error: "Failed to fetch user profile" });
  }
});

// ===== FACTORY EXPORT =====
module.exports = function (tokens) {
  userTokens = tokens;
  return router;
};
