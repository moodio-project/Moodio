import { Request, Response } from 'express';
import MoodModel, { CreateMoodData, UpdateMoodData } from '../models/Mood';

export class MoodController {
  // Get all moods
  async getAllMoods(req: Request, res: Response): Promise<void> {
    try {
      const moods = await MoodModel.findAll();
      res.json(moods);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch moods' });
    }
  }

  // Get moods by user ID
  async getMoodsByUserId(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.userId);
      const moods = await MoodModel.findByUserId(userId);
      res.json(moods);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch user moods' });
    }
  }

  // Get mood by ID
  async getMoodById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const mood = await MoodModel.findById(id);
      
      if (!mood) {
        res.status(404).json({ error: 'Mood not found' });
        return;
      }
      
      res.json(mood);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch mood' });
    }
  }

  // Create new mood
  async createMood(req: Request, res: Response): Promise<void> {
    try {
      const moodData: CreateMoodData = req.body;

      // Validate input
      if (!moodData.user_id || !moodData.mood_type || !moodData.intensity) {
        res.status(400).json({ error: 'User ID, mood type, and intensity are required' });
        return;
      }

      // Validate intensity range
      if (moodData.intensity < 1 || moodData.intensity > 10) {
        res.status(400).json({ error: 'Intensity must be between 1 and 10' });
        return;
      }

      const mood = await MoodModel.create(moodData);
      res.status(201).json({ message: 'Mood created successfully', mood });
    } catch (error) {
      res.status(500).json({ error: 'Failed to create mood' });
    }
  }

  // Update mood
  async updateMood(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const updateData: UpdateMoodData = req.body;

      // Validate intensity range if provided
      if (updateData.intensity && (updateData.intensity < 1 || updateData.intensity > 10)) {
        res.status(400).json({ error: 'Intensity must be between 1 and 10' });
        return;
      }

      const mood = await MoodModel.update(id, updateData);
      
      if (!mood) {
        res.status(404).json({ error: 'Mood not found' });
        return;
      }
      
      res.json({ message: 'Mood updated successfully', mood });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update mood' });
    }
  }

  // Delete mood
  async deleteMood(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const deleted = await MoodModel.delete(id);
      
      if (!deleted) {
        res.status(404).json({ error: 'Mood not found' });
        return;
      }
      
      res.json({ message: 'Mood deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete mood' });
    }
  }

  // Get mood statistics for a user
  async getMoodStats(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.userId);
      const stats = await MoodModel.getMoodStats(userId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch mood statistics' });
    }
  }
}

export default new MoodController(); 