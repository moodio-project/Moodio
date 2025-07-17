import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('songs', (table) => {
    table.string('id').primary(); // Spotify track ID
    table.string('title');
    table.string('artist_name');
    table.string('album_name');
    table.string('artwork_url');
    table.string('preview_url');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('songs');
} 