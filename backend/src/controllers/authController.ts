import { Request, Response } from 'express';
import axios from 'axios';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db/knex';
import { getSpotifyAuthUrl } from '../config/auth';
import { spotifyClient } from '../utils/spotifyClient';
import crypto from 'crypto';

const authController = {
  // Email/Password Registration
  signup: async (req: Request, res: Response): Promise<void> => {
    try {
      const { username, email, password } = req.body;

      if (!username || !email || !password) {
        res.status(400).json({ error: 'Username, email, and password are required' });
        return;
      }

      // Check if user already exists
      const existingUser = await db('users').where({ email }).first();
      if (existingUser) {
        res.status(400).json({ error: 'User already exists with this email' });
        return;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const [newUser] = await db('users').insert({
        display_name: username,
        email,
        password: hashedPassword,
      }).returning('*');

      // Generate JWT token
      const token = jwt.sign(
        { userId: newUser.id, email: newUser.email },
        process.env.SESSION_SECRET || 'secret',
        { expiresIn: '7d' }
      );

      // Store user ID in session
      if (req.session) {
        (req.session as any).userId = newUser.id;
      }

      res.status(201).json({
        user: {
          id: newUser.id,
          display_name: newUser.display_name,
          email: newUser.email,
          avatar_url: newUser.avatar_url,
        },
        token
      });
    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({ error: 'Failed to create account' });
    }
  },

  // Email/Password Login
  login: async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required' });
        return;
      }

      // Find user
      const user = await db('users').where({ email }).first();
      if (!user || !user.password) {
        res.status(401).json({ error: 'Invalid email or password' });
        return;
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        res.status(401).json({ error: 'Invalid email or password' });
        return;
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.SESSION_SECRET || 'secret',
        { expiresIn: '7d' }
      );

      // Store user ID in session
      if (req.session) {
        (req.session as any).userId = user.id;
      }

      res.json({
        user: {
          id: user.id,
          display_name: user.display_name,
          email: user.email,
          avatar_url: user.avatar_url,
        },
        token
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Failed to login' });
    }
  },

  // Spotify OAuth (existing code)
  spotifyLogin: (req: Request, res: Response): void => {
    try {
      const state = crypto.randomBytes(16).toString('hex');
      
      if (req.session) {
        (req.session as any).spotifyState = state;
      }
      
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

      if (!state || !sessionState || state !== sessionState) {
        res.status(400).json({ error: 'Invalid state parameter' });
        return;
      }

      if (!code || typeof code !== 'string') {
        res.status(400).json({ error: 'Authorization code is required' });
        return;
      }

      const tokenResponse = await spotifyClient.exchangeCodeForTokens(code);
      
      spotifyClient.setTokens(
        tokenResponse.access_token,
        tokenResponse.refresh_token,
        tokenResponse.expires_in
      );

      const spotifyProfile = await spotifyClient.getUserProfile();

      let user = await db('users').where({ spotify_id: spotifyProfile.id }).first();

      if (!user) {
        const [newUser] = await db('users').insert({
          spotify_id: spotifyProfile.id,
          display_name: spotifyProfile.display_name,
          email: spotifyProfile.email,
          avatar_url: spotifyProfile.images?.[0]?.url || null,
        }).returning('*');
        
        user = newUser;
      } else {
        await db('users').where({ id: user.id }).update({
          display_name: spotifyProfile.display_name,
          email: spotifyProfile.email,
          avatar_url: spotifyProfile.images?.[0]?.url || null,
        });
      }

      if (req.session) {
        (req.session as any).spotifyAccessToken = tokenResponse.access_token;
        (req.session as any).spotifyRefreshToken = tokenResponse.refresh_token;
        (req.session as any).userId = user.id;
        delete (req.session as any).spotifyState;
      }

      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      res.redirect(`${frontendUrl}/dashboard?login=success&token=${tokenResponse.access_token}`);
    } catch (error) {
      console.error('Spotify callback error:', error);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      res.redirect(`${frontendUrl}/login?error=auth_failed`);
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

      let spotifyProfile = null;
      if ((req.session as any)?.spotifyAccessToken) {
        try {
          spotifyClient.setTokens(
            (req.session as any).spotifyAccessToken,
            (req.session as any).spotifyRefreshToken || '',
            3600
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

  getMe: async (req: Request, res: Response): Promise<void> => {
    await authController.getProfile(req, res);
  },
};

export default authController;