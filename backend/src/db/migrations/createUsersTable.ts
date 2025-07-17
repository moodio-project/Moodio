import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('spotify_users', (table) => {
    table.increments('id').primary();
    table.string('spotify_id').unique();
    table.string('email').unique();
    table.string('display_name');
    table.string('avatar_url');
    table.string('access_token');
    table.string('refresh_token');
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('spotify_users');
} 