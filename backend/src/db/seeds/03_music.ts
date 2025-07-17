import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Clear existing data
  await knex('music').del();

  // Insert seed data
  await knex('music').insert([
    {
      title: 'Happy',
      artist: 'Pharrell Williams',
      album: 'G I R L',
      genre: 'Pop',
      mood_type: 'happy',
      duration: 233,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      title: 'Weightless',
      artist: 'Marconi Union',
      album: 'Different Colours',
      genre: 'Ambient',
      mood_type: 'calm',
      duration: 480,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      title: 'Eye of the Tiger',
      artist: 'Survivor',
      album: 'Eye of the Tiger',
      genre: 'Rock',
      mood_type: 'energetic',
      duration: 263,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      title: 'Mad World',
      artist: 'Gary Jules',
      album: 'Trading Snakeoil for Wolftickets',
      genre: 'Alternative',
      mood_type: 'melancholy',
      duration: 203,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      title: 'Don\'t Stop Believin\'',
      artist: 'Journey',
      album: 'Escape',
      genre: 'Rock',
      mood_type: 'energetic',
      duration: 251,
      created_at: new Date(),
      updated_at: new Date()
    }
  ]);
} 