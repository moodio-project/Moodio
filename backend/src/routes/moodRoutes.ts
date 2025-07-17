import { Router } from 'express';
import moodController from '../controllers/moodController';

const router = Router();

// Mood routes
router.get('/', moodController.getAllMoods);
router.get('/user/:userId', moodController.getMoodsByUserId);
router.get('/stats/:userId', moodController.getMoodStats);
router.get('/:id', moodController.getMoodById);
router.post('/', moodController.createMood);
router.put('/:id', moodController.updateMood);
router.delete('/:id', moodController.deleteMood);

export default router; 