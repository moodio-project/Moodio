// controllers/auth.controller.js
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const db = require("../config/database");

// Generate JWT token
const generateToken = (userId, email) => {
  return jwt.sign({ userId, email }, process.env.JWT_SECRET || "secret", {
    expiresIn: "7d",
  });
};

// Register a new user
const register = (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: "All fields required" });
  }

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

      try {
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
            const token = generateToken(userId, email);

            res.status(201).json({
              user: { id: userId, username, email },
              token,
            });
          },
        );
      } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ error: "Server error" });
      }
    },
  );
};

// Login user
const login = (req, res) => {
  const { email, password } = req.body;

  db.get("SELECT * FROM users WHERE email = ?", [email], async (err, user) => {
    if (err) {
      console.error("Login error:", err);
      return res.status(500).json({ error: "Server error" });
    }

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    try {
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const token = generateToken(user.id, user.email);

      res.json({
        user: { id: user.id, username: user.username, email: user.email },
        token,
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Server error" });
    }
  });
};

// Get user profile
const getProfile = (req, res) => {
  db.get(
    "SELECT id, username, display_name, email FROM users WHERE id = ?",
    [req.user.userId],
    (err, user) => {
      if (err) {
        console.error("Error fetching user profile:", err);
        return res.status(500).json({ error: "Failed to fetch user profile" });
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
};

// Find or create Spotify user
const findOrCreateSpotifyUser = (spotifyUser, callback) => {
  db.get(
    "SELECT * FROM users WHERE spotify_id = ?",
    [spotifyUser.id],
    (err, existingUser) => {
      if (err) return callback(err, null);

      if (existingUser) {
        return callback(null, existingUser);
      }

      // Create new user
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
          if (insertErr) return callback(insertErr, null);

          // Return the newly created user
          const newUser = {
            id: this.lastID,
            spotify_id: spotifyUser.id,
            display_name: spotifyUser.display_name,
            username: spotifyUser.display_name,
            email: spotifyUser.email,
            avatar_url: spotifyUser.images?.[0]?.url || null,
          };
          callback(null, newUser);
        },
      );
    },
  );
};

module.exports = {
  generateToken,
  register,
  login,
  getProfile,
  findOrCreateSpotifyUser,
};
