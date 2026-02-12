const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

// ===== IMPORTS =====
const db = require("./config/database");
const { spotifyApi, getSpotifyToken } = require("./config/spotify");
const authenticateToken = require("./middleware/auth");

const app = express();
const PORT = process.env.PORT || 3001;

// Startup logging
console.log(`🚀 Starting Moodio server on port ${PORT}`);
console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);

// ===== SHARED STATE =====
const userTokens = new Map();

// ===== MIDDLEWARE =====
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? [
            "https://moodio.onrender.com",
            "https://moodio-frontend.onrender.com",
          ]
        : "http://localhost:3000",
    credentials: true,
  }),
);
app.use(express.json());

// ===== MOUNT ROUTES =====
// Routes that need userTokens use factory functions: require()(userTokens)
const debugRoutes = require("./routes/debug.routes")(userTokens);
const authRoutes = require("./routes/auth.routes")(userTokens);
const spotifyRoutes = require("./routes/spotify.routes")(userTokens);
const moodsRoutes = require("./routes/moods.routes");
const aiRoutes = require("./routes/ai.routes");

app.use("/debug", debugRoutes);
app.use("/auth", authRoutes);
app.use("/api/auth", authRoutes); // Support both /auth/* and /api/auth/* paths
app.use("/api/spotify", spotifyRoutes);
app.use("/api/moods", moodsRoutes);
app.use("/api/favorites", moodsRoutes); // Favorites are nested under moods router
app.use("/api/ai", aiRoutes);

// ===== HEALTH CHECKS =====
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Moodio server running!",
    timestamp: new Date().toISOString(),
    port: PORT,
    environment: process.env.NODE_ENV || "development",
  });
});

if (process.env.NODE_ENV !== "production") {
  app.get("/", (req, res) => {
    res.json({
      status: "OK",
      message: "Moodio API is running!",
      timestamp: new Date().toISOString(),
      port: PORT,
    });
  });
}

// ===== PRODUCTION: SERVE REACT BUILD =====
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/build")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
  });
}

// ===== START SERVER =====
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`✅ Database initialized`);
  console.log(`✅ Spotify integration ready`);
  console.log(`✅ Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`✅ Health check available at /api/health`);
  if (process.env.NODE_ENV === "production") {
    console.log(
      `✅ Serving React app from ${path.join(__dirname, "../frontend/build")}`,
    );
  } else {
    console.log(`✅ Root endpoint available at http://localhost:${PORT}/`);
  }
});
