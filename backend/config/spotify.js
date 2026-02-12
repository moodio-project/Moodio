// config/spotify.js
const SpotifyWebApi = require("spotify-web-api-node");

// Initialize Spotify API
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: process.env.SPOTIFY_REDIRECT_URI,
});

// Log Spotify configuration on startup
console.log("🎵 Spotify Configuration:");
console.log("Client ID:", process.env.SPOTIFY_CLIENT_ID ? "Set" : "Missing");
console.log(
  "Client Secret:",
  process.env.SPOTIFY_CLIENT_SECRET ? "Set" : "Missing",
);
console.log("Redirect URI:", process.env.SPOTIFY_REDIRECT_URI);

// Get Spotify access token using client credentials
const getSpotifyToken = async () => {
  try {
    const data = await spotifyApi.clientCredentialsGrant();
    spotifyApi.setAccessToken(data.body["access_token"]);
    console.log("✅ Spotify token obtained");

    // Refresh token every 50 minutes
    setTimeout(
      () => {
        getSpotifyToken();
      },
      50 * 60 * 1000,
    );

    return data.body["access_token"];
  } catch (error) {
    console.error("❌ Failed to get Spotify token:", error);
    throw error;
  }
};

// Initialize Spotify token on module load
getSpotifyToken().catch((err) => {
  console.error(
    "⚠️ Spotify token failed on startup - app will retry when needed",
  );
});

module.exports = { spotifyApi, getSpotifyToken };
