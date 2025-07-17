import { Knex } from 'knex';
import bcrypt from 'bcryptjs';

export async function seed(knex: Knex): Promise<void> {
  // Clear existing data
  await knex('users').del();

  // Hash passwords
  const passwordHash = await bcrypt.hash('password123', 10);

  // Insert seed data
  await knex('users').insert([
    {
      username: 'john_doe',
      email: 'john@example.com',
      password_hash: passwordHash,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      username: 'jane_smith',
      email: 'jane@example.com',
      password_hash: passwordHash,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      username: 'mike_wilson',
      email: 'mike@example.com',
      password_hash: passwordHash,
      created_at: new Date(),
      updated_at: new Date()
    }
  ]);
} 