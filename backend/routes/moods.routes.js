const express = require("express");
const router = express.Router();
const db = require("../config/database");
const authenticateToken = require("../middleware/auth");

// ===== MOOD ROUTES =====

// Get user moods
router.get("/", authenticateToken, (req, res) => {
  try {
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
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// Create mood
router.post("/", authenticateToken, (req, res) => {
  const { mood, intensity, note } = req.body;

  console.log("🎵 Creating mood:", {
    mood,
    intensity,
    note,
    userId: req.user.userId,
  });

  try {
    const now = new Date().toISOString();

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
  } catch (error) {
    console.error("❌ Database error:", error);
    res
      .status(500)
      .json({ error: "Failed to save mood", details: error.message });
  }
});

// ===== FAVORITES ROUTES =====

// Get user's favorites
router.get("/favorites", authenticateToken, (req, res) => {
  try {
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
  } catch (error) {
    console.error("❌ Failed to get favorites:", error);
    res.status(500).json({ error: "Failed to get favorites" });
  }
});

// Add to favorites
router.post("/favorites", authenticateToken, (req, res) => {
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
          // SQLite unique constraint error
          if (err.message.includes("UNIQUE constraint failed")) {
            return res.status(400).json({ error: "Already in favorites" });
          }
          console.error("❌ Failed to add favorite:", err);
          return res.status(500).json({ error: "Failed to add to favorites" });
        }

        console.log("✅ Added to favorites with ID:", this.lastID);
        res
          .status(201)
          .json({ message: "Added to favorites", id: this.lastID });
      },
    );
  } catch (error) {
    console.error("❌ Failed to add favorite:", error);
    res.status(500).json({ error: "Failed to add to favorites" });
  }
});

// Remove from favorites
router.delete("/favorites/:itemId", authenticateToken, (req, res) => {
  const { itemId } = req.params;

  console.log("💔 Removing from favorites:", itemId);

  try {
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
  } catch (error) {
    console.error("❌ Failed to remove favorite:", error);
    res.status(500).json({ error: "Failed to remove from favorites" });
  }
});

module.exports = router;
