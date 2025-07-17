import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('moods', (table) => {
    table.renameColumn('intensity', 'mood_intensity');
    table.string('song_id');
    table.dropColumn('ai_generated');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('moods', (table) => {
    table.renameColumn('mood_intensity', 'intensity');
    table.dropColumn('song_id');
    table.boolean('ai_generated').defaultTo(false);
  });
} 