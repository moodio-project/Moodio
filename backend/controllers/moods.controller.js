// controllers/moods.controller.js
const db = require("../config/database");

// Get all moods for a user
const getUserMoods = (req, res) => {
  db.all(
    "SELECT * FROM moods WHERE user_id = ? ORDER BY created_at DESC",
    [req.user.userId],
    (err, rows) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Database error" });
      }
      res.json({ moods: rows || [] });
    },
  );
};

// Create a new mood entry
const createMood = (req, res) => {
  const { mood, intensity, note } = req.body;
  const now = new Date().toISOString();

  console.log("🎵 Creating mood:", {
    mood,
    intensity,
    note,
    userId: req.user.userId,
  });

  db.run(
    "INSERT INTO moods (user_id, mood, intensity, note, created_at) VALUES (?, ?, ?, ?, ?)",
    [req.user.userId, mood, intensity, note, now],
    function (err) {
      if (err) {
        console.error("❌ Database error:", err);
        return res
          .status(500)
          .json({ error: "Failed to save mood", details: err.message });
      }

      const newMood = {
        id: this.lastID,
        user_id: req.user.userId,
        mood,
        intensity,
        note,
        created_at: now,
      };

      console.log("✅ Mood saved with ID:", newMood.id);
      res.status(201).json(newMood);
    },
  );
};

// Get user's favorites
const getFavorites = (req, res) => {
  db.all(
    "SELECT * FROM favorites WHERE user_id = ? ORDER BY created_at DESC",
    [req.user.userId],
    (err, rows) => {
      if (err) {
        console.error("❌ Failed to get favorites:", err);
        return res.status(500).json({ error: "Failed to get favorites" });
      }
      res.json({ favorites: rows || [] });
    },
  );
};

// Add to favorites
const addFavorite = (req, res) => {
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

  db.run(
    `INSERT INTO favorites (user_id, item_type, item_id, item_name, artist_name, album_name, artwork_url, track_uri) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      req.user.userId,
      item_type,
      item_id,
      item_name,
      artist_name,
      album_name,
      artwork_url,
      track_uri,
    ],
    function (err) {
      if (err) {
        if (err.message.includes("UNIQUE constraint failed")) {
          return res.status(400).json({ error: "Already in favorites" });
        }
        console.error("❌ Failed to add favorite:", err);
        return res.status(500).json({ error: "Failed to add to favorites" });
      }

      console.log("✅ Added to favorites with ID:", this.lastID);
      res.status(201).json({ message: "Added to favorites", id: this.lastID });
    },
  );
};

// Remove from favorites
const removeFavorite = (req, res) => {
  const { itemId } = req.params;

  console.log("💔 Removing from favorites:", itemId);

  db.run(
    "DELETE FROM favorites WHERE user_id = ? AND item_id = ?",
    [req.user.userId, itemId],
    function (err) {
      if (err) {
        console.error("❌ Failed to remove favorite:", err);
        return res
          .status(500)
          .json({ error: "Failed to remove from favorites" });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: "Favorite not found" });
      }

      res.json({ message: "Removed from favorites" });
    },
  );
};

module.exports = {
  getUserMoods,
  createMood,
  getFavorites,
  addFavorite,
  removeFavorite,
};
