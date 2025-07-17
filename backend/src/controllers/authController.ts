import { Request, Response } from 'express';

const authController = {
  spotifyLogin: (req: Request, res: Response) => {
    // TODO: Redirect to Spotify OAuth
    res.send('Redirecting to Spotify OAuth...');
  },
  spotifyCallback: (req: Request, res: Response) => {
    // TODO: Handle Spotify OAuth callback
    res.send('Spotify OAuth callback');
  },
  logout: (req: Request, res: Response) => {
    // TODO: Destroy session
    res.send('Logged out');
  },
  getMe: (req: Request, res: Response) => {
    // TODO: Return current user info
    res.send('User info');
  },
};

export default authController; 