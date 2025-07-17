import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Clear existing data
  await knex('moods').del();

  // Insert seed data
  await knex('moods').insert([
    {
      user_id: 1,
      mood_type: 'happy',
      intensity: 8,
      description: 'Feeling great today!',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      user_id: 1,
      mood_type: 'calm',
      intensity: 6,
      description: 'Relaxed and peaceful',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      user_id: 2,
      mood_type: 'energetic',
      intensity: 9,
      description: 'Full of energy and ready to go!',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      user_id: 3,
      mood_type: 'melancholy',
      intensity: 4,
      description: 'A bit reflective today',
      created_at: new Date(),
      updated_at: new Date()
    }
  ]);
} 