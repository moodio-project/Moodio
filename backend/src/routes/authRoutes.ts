import { Router } from 'express';
import authController from '../controllers/authController';
import { checkAuth } from '../middleware/checkAuth';

const router = Router();

// Spotify OAuth
router.get('/login', authController.spotifyLogin);
router.get('/callback', authController.spotifyCallback);
router.get('/logout', authController.logout);

// Protected routes
router.get('/profile', checkAuth, authController.getProfile);
router.get('/me', checkAuth, authController.getMe);

export default router; 