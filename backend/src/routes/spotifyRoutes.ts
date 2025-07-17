import { Router } from 'express';
import spotifyController from '../controllers/spotifyController';

const router = Router();

router.get('/search', spotifyController.search);
router.get('/track/:id', spotifyController.getTrack);
router.get('/artist/:id', spotifyController.getArtist);
router.get('/album/:id', spotifyController.getAlbum);

export default router; 