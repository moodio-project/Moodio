import express from 'express';
import aiController from '../controllers/aiController';

const router = express.Router();

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