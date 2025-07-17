import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('artists', (table) => {
    table.string('id').primary(); // Spotify artist ID
    table.string('name');
    table.specificType('genre', 'text[]'); // Array of genres
    table.string('image_url');
    table.text('bio');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('artists');
} 