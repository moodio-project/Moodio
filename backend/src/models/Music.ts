import db from '../db/knex';

// TypeScript interfaces
export interface Music {
  id: number;
  title: string;
  artist: string;
  album?: string;
  genre: string;
  mood_type: string;
  url?: string;
  duration?: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreateMusicData {
  title: string;
  artist: string;
  album?: string;
  genre: string;
  mood_type: string;
  url?: string;
  duration?: number;
}

export interface UpdateMusicData {
  title?: string;
  artist?: string;
  album?: string;
  genre?: string;
  mood_type?: string;
  url?: string;
  duration?: number;
}

// Music model class
export class MusicModel {
  private tableName = 'music';

  // Get all music
  async findAll(): Promise<Music[]> {
    return db(this.tableName).select('*').orderBy('title', 'asc');
  }

  // Get music by mood type
  async findByMoodType(moodType: string): Promise<Music[]> {
    return db(this.tableName)
      .where({ mood_type: moodType })
      .select('*')
      .orderBy('title', 'asc');
  }

  // Get music by genre
  async findByGenre(genre: string): Promise<Music[]> {
    return db(this.tableName)
      .where({ genre })
      .select('*')
      .orderBy('title', 'asc');
  }

  // Get music by ID
  async findById(id: number): Promise<Music | null> {
    const music = await db(this.tableName).where({ id }).select('*');
    return music[0] || null;
  }

  // Create new music
  async create(musicData: CreateMusicData): Promise<Music> {
    const [music] = await db(this.tableName)
      .insert({
        ...musicData,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning('*');
    return music;
  }

  // Update music
  async update(id: number, musicData: UpdateMusicData): Promise<Music | null> {
    const [music] = await db(this.tableName)
      .where({ id })
      .update({
        ...musicData,
        updated_at: new Date()
      })
      .returning('*');
    return music || null;
  }

  // Delete music
  async delete(id: number): Promise<boolean> {
    const deletedRows = await db(this.tableName).where({ id }).del();
    return deletedRows > 0;
  }

  // Search music by title or artist
  async search(query: string): Promise<Music[]> {
    return db(this.tableName)
      .where('title', 'ilike', `%${query}%`)
      .orWhere('artist', 'ilike', `%${query}%`)
      .select('*')
      .orderBy('title', 'asc');
  }
}

export default new MusicModel(); 