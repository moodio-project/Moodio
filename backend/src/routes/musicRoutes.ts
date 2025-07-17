import { Router } from 'express';
import musicController from '../controllers/musicController';

const router = Router();

// Music routes
router.get('/', musicController.getAllMusic);
router.get('/search', musicController.searchMusic);
router.get('/mood/:moodType', musicController.getMusicByMood);
router.get('/genre/:genre', musicController.getMusicByGenre);
router.get('/:id', musicController.getMusicById);
router.post('/', musicController.createMusic);
router.put('/:id', musicController.updateMusic);
router.delete('/:id', musicController.deleteMusic);

export default router; 