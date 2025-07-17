import { Request, Response } from 'express';

const artistController = {
  search: (req: Request, res: Response) => {
    // TODO: Search for artists
    res.send('Artist search');
  },
  getArtistDetails: (req: Request, res: Response) => {
    // TODO: Get artist details from Genius/Spotify
    res.send('Artist details');
  },
};

export default artistController; 