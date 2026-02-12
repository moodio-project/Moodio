// config/database.js
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Initialize SQLite database
const db = new sqlite3.Database(
  path.join(__dirname, "..", "database.sqlite"),
  (err) => {
    if (err) {
      console.error("❌ Database connection error:", err);
    } else {
      console.log("✅ SQLite database connected");
    }
  },
);

// Create tables if they don't exist
db.serialize(() => {
  // Users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    spotify_id TEXT UNIQUE,
    username TEXT,
    display_name TEXT,
    email TEXT,
    password TEXT,
    avatar_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Moods table
  db.run(`CREATE TABLE IF NOT EXISTS moods (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    mood TEXT,
    intensity INTEGER,
    note TEXT,
    song_id TEXT,
    song_name TEXT,
    artist_name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);

  // Songs table
  db.run(`CREATE TABLE IF NOT EXISTS songs (
    id TEXT PRIMARY KEY,
    title TEXT,
    artist_name TEXT,
    album_name TEXT,
    artwork_url TEXT,
    preview_url TEXT
  )`);

  // Artists table
  db.run(`CREATE TABLE IF NOT EXISTS artists (
    id TEXT PRIMARY KEY,
    name TEXT,
    image_url TEXT,
    bio TEXT
  )`);

  // Audio features table
  db.run(`CREATE TABLE IF NOT EXISTS audio_features (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    song_id TEXT,
    danceability REAL,
    energy REAL,
    valence REAL,
    tempo REAL,
    speechiness REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (song_id) REFERENCES songs (id)
  )`);

  // Listening history table
  db.run(`CREATE TABLE IF NOT EXISTS listening_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    song_id TEXT,
    listened_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (song_id) REFERENCES songs (id)
  )`);

  console.log("✅ Database tables initialized");
});

module.exports = db;
