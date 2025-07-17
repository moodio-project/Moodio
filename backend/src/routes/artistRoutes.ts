import { Router } from 'express';
import artistController from '../controllers/artistController';

const router = Router();

router.get('/search', artistController.search);
router.get('/:id', artistController.getArtistDetails);

export default router; 