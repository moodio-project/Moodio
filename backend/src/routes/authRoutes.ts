import { Router } from 'express';
import authController from '../controllers/authController';
import { checkAuth } from '../middleware/checkAuth';

const router = Router();

// Email/Password Authentication
router.post('/signup', authController.signup);
router.post('/login', authController.login);

// Spotify OAuth
router.get('/spotify', authController.spotifyLogin);
router.get('/spotify/callback', authController.spotifyCallback);
router.post('/logout', authController.logout);

// Protected routes
router.get('/profile', checkAuth, authController.getProfile);
router.get('/me', checkAuth, authController.getMe);

export default router;