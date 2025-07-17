import db from '../db/knex';

// TypeScript interfaces
export interface Mood {
  id: number;
  user_id: number;
  mood_type: string;
  intensity: number;
  description?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateMoodData {
  user_id: number;
  mood_type: string;
  intensity: number;
  description?: string;
}

export interface UpdateMoodData {
  mood_type?: string;
  intensity?: number;
  description?: string;
}

// Mood model class
export class MoodModel {
  private tableName = 'moods';

  // Get all moods
  async findAll(): Promise<Mood[]> {
    return db(this.tableName).select('*').orderBy('created_at', 'desc');
  }

  // Get moods by user ID
  async findByUserId(userId: number): Promise<Mood[]> {
    return db(this.tableName)
      .where({ user_id: userId })
      .select('*')
      .orderBy('created_at', 'desc');
  }

  // Get mood by ID
  async findById(id: number): Promise<Mood | null> {
    const moods = await db(this.tableName).where({ id }).select('*');
    return moods[0] || null;
  }

  // Create new mood
  async create(moodData: CreateMoodData): Promise<Mood> {
    const [mood] = await db(this.tableName)
      .insert({
        ...moodData,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning('*');
    return mood;
  }

  // Update mood
  async update(id: number, moodData: UpdateMoodData): Promise<Mood | null> {
    const [mood] = await db(this.tableName)
      .where({ id })
      .update({
        ...moodData,
        updated_at: new Date()
      })
      .returning('*');
    return mood || null;
  }

  // Delete mood
  async delete(id: number): Promise<boolean> {
    const deletedRows = await db(this.tableName).where({ id }).del();
    return deletedRows > 0;
  }

  // Get mood statistics for a user
  async getMoodStats(userId: number): Promise<any> {
    return db(this.tableName)
      .where({ user_id: userId })
      .select('mood_type')
      .count('* as count')
      .groupBy('mood_type');
  }
}

export default new MoodModel(); 