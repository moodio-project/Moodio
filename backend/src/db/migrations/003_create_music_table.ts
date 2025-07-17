import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('music', (table) => {
    table.increments('id').primary();
    table.string('title').notNullable();
    table.string('artist').notNullable();
    table.string('album');
    table.string('genre').notNullable();
    table.string('mood_type').notNullable();
    table.string('url');
    table.integer('duration'); // in seconds
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('music');
} 