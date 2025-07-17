import { Request, Response } from 'express';

const spotifyController = {
  search: (req: Request, res: Response) => {
    // TODO: Search Spotify
    res.send('Spotify search');
  },
  getTrack: (req: Request, res: Response) => {
    // TODO: Get track details
    res.send('Track details');
  },
  getArtist: (req: Request, res: Response) => {
    // TODO: Get artist details
    res.send('Artist details');
  },
  getAlbum: (req: Request, res: Response) => {
    // TODO: Get album details
    res.send('Album details');
  },
};

export default spotifyController; 