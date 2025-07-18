import { Request, Response } from 'express';
import { openAiClient } from '../utils/openAiClient';
import { geniusClient } from '../utils/geniusClient';
import db from '../db/knex';

const aiController = {
  // Analyze mood using AI
  analyzeMood: async (req: Request, res: Response): Promise<void> => {
    try {
      const { description, intensity } = req.body;

      if (!description || intensity === undefined) {
        res.status(400).json({ error: 'Description and intensity are required' });
        return;
      }

      const analysis = await openAiClient.analyzeMood(description, intensity);
      
      res.json({
        success: true,
        analysis
      });
    } catch (error: any) {
      console.error('Mood analysis error:', error);
      res.status(500).json({ 
        error: 'Failed to analyze mood',
        details: error.message 
      });
    }
  },

  // Get AI-powered song recommendations
  getSongRecommendations: async (req: Request, res: Response): Promise<void> => {
    try {
      const { mood, limit = 5 } = req.query;

      if (!mood || typeof mood !== 'string') {
        res.status(400).json({ error: 'Mood parameter is required' });
        return;
      }

      const recommendations = await openAiClient.getSongRecommendations(mood, Number(limit));
      
      res.json({
        success: true,
        recommendations
      });
    } catch (error: any) {
      console.error('Song recommendations error:', error);
      res.status(500).json({ 
        error: 'Failed to get song recommendations',
        details: error.message 
      });
    }
  },

  // Get smart recommendations based on user mood history
  getSmartRecommendations: async (req: Request, res: Response): Promise<void> => {
    try {
      const { currentMood } = req.body;
      const userId = (req as any).user?.id;

      if (!currentMood) {
        res.status(400).json({ error: 'Current mood is required' });
        return;
      }

      if (!userId) {
        res.status(401).json({ error: 'User authentication required' });
        return;
      }

      // Get user's recent mood history
      const moodHistory = await db('moods')
        .where('user_id', userId)
        .orderBy('created_at', 'desc')
        .limit(5);

      const recommendations = await openAiClient.getSmartRecommendations(moodHistory, currentMood);
      
      res.json({
        success: true,
        recommendations,
        moodHistory: moodHistory.length
      });
    } catch (error: any) {
      console.error('Smart recommendations error:', error);
      res.status(500).json({ 
        error: 'Failed to get smart recommendations',
        details: error.message 
      });
    }
  },

  // Search songs using Genius API
  searchSongs: async (req: Request, res: Response): Promise<void> => {
    try {
      const { query, limit = 10 } = req.query;

      if (!query || typeof query !== 'string') {
        res.status(400).json({ error: 'Search query is required' });
        return;
      }

      const songs = await geniusClient.searchSongs(query, Number(limit));
      
      res.json({
        success: true,
        songs
      });
    } catch (error: any) {
      console.error('Song search error:', error);
      res.status(500).json({ 
        error: 'Failed to search songs',
        details: error.message 
      });
    }
  },

  // Get artist details from Genius
  getArtistDetails: async (req: Request, res: Response): Promise<void> => {
    try {
      const { artistId } = req.params;

      if (!artistId) {
        res.status(400).json({ error: 'Artist ID is required' });
        return;
      }

      const artist = await geniusClient.getArtistDetails(Number(artistId));
      
      res.json({
        success: true,
        artist
      });
    } catch (error: any) {
      console.error('Artist details error:', error);
      res.status(500).json({ 
        error: 'Failed to get artist details',
        details: error.message 
      });
    }
  },

  // Get song details from Genius
  getSongDetails: async (req: Request, res: Response): Promise<void> => {
    try {
      const { songId } = req.params;

      if (!songId) {
        res.status(400).json({ error: 'Song ID is required' });
        return;
      }

      const song = await geniusClient.getSongDetails(Number(songId));
      
      res.json({
        success: true,
        song
      });
    } catch (error: any) {
      console.error('Song details error:', error);
      res.status(500).json({ 
        error: 'Failed to get song details',
        details: error.message 
      });
    }
  },

  // Get lyrics URL (Genius doesn't provide lyrics directly via API)
  getLyricsUrl: async (req: Request, res: Response): Promise<void> => {
    try {
      const { songPath } = req.params;

      if (!songPath) {
        res.status(400).json({ error: 'Song path is required' });
        return;
      }

      const lyricsUrl = await geniusClient.getLyricsUrl(songPath);
      
      res.json({
        success: true,
        lyricsUrl
      });
    } catch (error: any) {
      console.error('Lyrics URL error:', error);
      res.status(500).json({ 
        error: 'Failed to get lyrics URL',
        details: error.message 
      });
    }
  }
};

export default aiController; 