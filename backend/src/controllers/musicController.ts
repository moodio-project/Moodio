import { Request, Response } from 'express';
import MusicModel, { CreateMusicData, UpdateMusicData } from '../models/Music';

export class MusicController {
  // Get all music
  async getAllMusic(req: Request, res: Response): Promise<void> {
    try {
      const music = await MusicModel.findAll();
      res.json(music);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch music' });
    }
  }

  // Get music by ID
  async getMusicById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const music = await MusicModel.findById(id);
      
      if (!music) {
        res.status(404).json({ error: 'Music not found' });
        return;
      }
      
      res.json(music);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch music' });
    }
  }

  // Get music by mood type
  async getMusicByMood(req: Request, res: Response): Promise<void> {
    try {
      const moodType = req.params.moodType;
      const music = await MusicModel.findByMoodType(moodType);
      res.json(music);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch music by mood' });
    }
  }

  // Get music by genre
  async getMusicByGenre(req: Request, res: Response): Promise<void> {
    try {
      const genre = req.params.genre;
      const music = await MusicModel.findByGenre(genre);
      res.json(music);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch music by genre' });
    }
  }

  // Search music
  async searchMusic(req: Request, res: Response): Promise<void> {
    try {
      const query = req.query.q as string;
      
      if (!query) {
        res.status(400).json({ error: 'Search query is required' });
        return;
      }

      const music = await MusicModel.search(query);
      res.json(music);
    } catch (error) {
      res.status(500).json({ error: 'Failed to search music' });
    }
  }

  // Create new music
  async createMusic(req: Request, res: Response): Promise<void> {
    try {
      const musicData: CreateMusicData = req.body;

      // Validate input
      if (!musicData.title || !musicData.artist || !musicData.genre || !musicData.mood_type) {
        res.status(400).json({ error: 'Title, artist, genre, and mood type are required' });
        return;
      }

      const music = await MusicModel.create(musicData);
      res.status(201).json({ message: 'Music created successfully', music });
    } catch (error) {
      res.status(500).json({ error: 'Failed to create music' });
    }
  }

  // Update music
  async updateMusic(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const updateData: UpdateMusicData = req.body;

      const music = await MusicModel.update(id, updateData);
      
      if (!music) {
        res.status(404).json({ error: 'Music not found' });
        return;
      }
      
      res.json({ message: 'Music updated successfully', music });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update music' });
    }
  }

  // Delete music
  async deleteMusic(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const deleted = await MusicModel.delete(id);
      
      if (!deleted) {
        res.status(404).json({ error: 'Music not found' });
        return;
      }
      
      res.json({ message: 'Music deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete music' });
    }
  }
}

export default new MusicController(); 