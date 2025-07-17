import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('tracks', (table) => {
    table.increments('id').primary();
    table.string('spotify_id').unique();
    table.string('title');
    table.string('artist');
    table.string('album');
    table.string('genre');
    table.string('cover_url');
    table.string('preview_url');
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('tracks');
} 