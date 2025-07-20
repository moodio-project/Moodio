import { Request, Response } from 'express';
import axios from 'axios';
import db from '../db/knex';
import { getSpotifyAuthUrl } from '../config/auth';
import { spotifyClient } from '../utils/spotifyClient';
import crypto from 'crypto';

const authController = {
  spotifyLogin: (req: Request, res: Response): void => {
    try {
      // Generate a random state parameter for security
      const state = crypto.randomBytes(16).toString('hex');
      
      // Store state in session for verification
      if (req.session) {
        (req.session as any).spotifyState = state;
      }
      
      // Generate Spotify authorization URL
      const authUrl = getSpotifyAuthUrl(state);
      
      res.json({ authUrl });
    } catch (error) {
      console.error('Spotify login error:', error);
      res.status(500).json({ error: 'Failed to initiate Spotify login' });
    }
  },

  spotifyCallback: async (req: Request, res: Response): Promise<void> => {
    try {
      const { code, state } = req.query;
      const sessionState = (req.session as any)?.spotifyState;

      // Verify state parameter
      if (!state || !sessionState || state !== sessionState) {
        res.status(400).json({ error: 'Invalid state parameter' });
        return;
      }

      if (!code || typeof code !== 'string') {
        res.status(400).json({ error: 'Authorization code is required' });
        return;
      }

      // Exchange authorization code for tokens
      const tokenResponse = await spotifyClient.exchangeCodeForTokens(code);
      
      // Set tokens in the client
      spotifyClient.setTokens(
        tokenResponse.access_token,
        tokenResponse.refresh_token,
        tokenResponse.expires_in
      );

      // Get user profile from Spotify
      const spotifyProfile = await spotifyClient.getUserProfile();

      // Check if user exists in database
      let user = await db('users').where({ spotify_id: spotifyProfile.id }).first();

      if (!user) {
        // Create new user
        const [newUser] = await db('users').insert({
          spotify_id: spotifyProfile.id,
          display_name: spotifyProfile.display_name,
          email: spotifyProfile.email,
          avatar_url: spotifyProfile.images?.[0]?.url || null,
        }).returning('*');
        
        user = newUser;
      } else {
        // Update existing user
        await db('users').where({ id: user.id }).update({
          display_name: spotifyProfile.display_name,
          email: spotifyProfile.email,
          avatar_url: spotifyProfile.images?.[0]?.url || null,
        });
      }

      // Store tokens in session
      if (req.session) {
        (req.session as any).spotifyAccessToken = tokenResponse.access_token;
        (req.session as any).spotifyRefreshToken = tokenResponse.refresh_token;
        (req.session as any).userId = user.id;
        delete (req.session as any).spotifyState;
      }

      // Redirect to frontend with success
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard?login=success`);
    } catch (error) {
      console.error('Spotify callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=auth_failed`);
    }
  },

  getProfile: async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req.session as any)?.userId;
      
      if (!userId) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const user = await db('users').where({ id: userId }).first();
      
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      // Get Spotify profile if we have access token
      let spotifyProfile = null;
      if ((req.session as any)?.spotifyAccessToken) {
        try {
          spotifyClient.setTokens(
            (req.session as any).spotifyAccessToken,
            (req.session as any).spotifyRefreshToken || '',
            3600 // Default expiry
          );
          spotifyProfile = await spotifyClient.getUserProfile();
        } catch (error) {
          console.error('Failed to get Spotify profile:', error);
        }
      }

      res.json({
        user: {
          id: user.id,
          spotify_id: user.spotify_id,
          display_name: user.display_name,
          email: user.email,
          avatar_url: user.avatar_url,
        },
        spotify_profile: spotifyProfile
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ error: 'Failed to get profile' });
    }
  },

  logout: (req: Request, res: Response): void => {
    if (req.session) {
      req.session.destroy((err: any) => {
        if (err) {
          console.error('Logout error:', err);
          res.status(500).json({ error: 'Failed to logout' });
          return;
        }
        res.json({ message: 'Logged out successfully' });
      });
    } else {
      res.json({ message: 'Logged out successfully' });
    }
  },

  // Legacy methods for email/password auth (if needed)
  getMe: (req: Request, res: Response): void => {
    // This is now handled by getProfile
    res.send('User info');
  },
};

export default authController; 