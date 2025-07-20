import express from 'express';
import aiController from '../controllers/aiController';

const router = express.Router();

// Test route to check environment variables
router.get('/test-env', (req, res) => {
  res.json({
    genius_key: process.env.GENIUS_API_KEY ? 'Present' : 'Missing',
    openai_key: process.env.OPENAI_API_KEY ? 'Present' : 'Missing',
    spotify_client: process.env.SPOTIFY_CLIENT_ID ? 'Present' : 'Missing',
    spotify_secret: process.env.SPOTIFY_CLIENT_SECRET ? 'Present' : 'Missing',
    database_url: process.env.DATABASE_URL ? 'Present' : 'Missing'
  });
});

// AI-powered mood analysis
router.post('/analyze-mood', aiController.analyzeMood);

// AI-powered song recommendations
router.get('/song-recommendations', aiController.getSongRecommendations);

// Smart recommendations based on user mood history
router.post('/smart-recommendations', aiController.getSmartRecommendations);

// Genius API routes
router.get('/search-songs', aiController.searchSongs);
router.get('/artist/:artistId', aiController.getArtistDetails);
router.get('/song/:songId', aiController.getSongDetails);
router.get('/lyrics/:songPath', aiController.getLyricsUrl);

export default router; 