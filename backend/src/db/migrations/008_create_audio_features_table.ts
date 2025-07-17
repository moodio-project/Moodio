import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('audio_features', (table) => {
    table.increments('id').primary();
    table.string('song_id').references('id').inTable('songs').onDelete('CASCADE');
    table.float('danceability');
    table.float('energy');
    table.float('valence');
    table.float('tempo');
    table.float('speechiness');
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('audio_features');
} 