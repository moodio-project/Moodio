import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Clear existing data
  await knex('moods').del();

  // Insert seed data
  await knex('moods').insert([
    {
      user_id: 7,
      mood: 'happy',
      intensity: 8,
      note: 'Feeling great today!',
      created_at: new Date()
    },
    {
      user_id: 7,
      mood: 'calm',
      intensity: 6,
      note: 'Relaxed and peaceful',
      created_at: new Date()
    },
    {
      user_id: 8,
      mood: 'energetic',
      intensity: 9,
      note: 'Full of energy and ready to go!',
      created_at: new Date()
    },
    {
      user_id: 9,
      mood: 'melancholy',
      intensity: 4,
      note: 'A bit reflective today',
      created_at: new Date()
    }
  ]);
} 