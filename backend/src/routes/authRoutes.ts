import { Router } from 'express';
import authController from '../controllers/authController';

const router = Router();

// Spotify OAuth
router.get('/login', authController.spotifyLogin);
router.get('/callback', authController.spotifyCallback);
router.get('/logout', authController.logout);
router.get('/me', authController.getMe);

export default router; 