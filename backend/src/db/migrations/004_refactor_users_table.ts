import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Drop foreign key constraint in moods table
  await knex.schema.alterTable('moods', (table) => {
    table.dropForeign(['user_id']);
  });

  // Drop old users/spotify_users tables if they exist
  await knex.schema.hasTable('users').then(exists => { 
    if (exists) return knex.schema.dropTable('users'); 
    return Promise.resolve();
  });
  await knex.schema.hasTable('spotify_users').then(exists => { 
    if (exists) return knex.schema.dropTable('spotify_users'); 
    return Promise.resolve();
  });

  // Create new users table
  await knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.string('spotify_id').unique();
    table.string('display_name');
    table.string('email').unique();
    table.string('avatar_url');
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });

  // Re-add foreign key constraint in moods table
  await knex.schema.alterTable('moods', (table) => {
    table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE').alter();
  });
}

export async function down(knex: Knex): Promise<void> {
  // Drop foreign key constraint in moods table
  await knex.schema.alterTable('moods', (table) => {
    table.dropForeign(['user_id']);
  });
  await knex.schema.dropTable('users');
} 