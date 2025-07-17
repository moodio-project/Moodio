import knex from 'knex';

// Import knexfile configuration
const knexConfig = {
  development: {
    client: 'pg',
    connection: {
      host: process.env.PG_HOST || 'localhost',
      port: Number(process.env.PG_PORT) || 5432,
      user: process.env.PG_USER || 'postgres',
      password: process.env.PG_PASS || '123',
      database: process.env.PG_DB || 'moodio',
    },
    migrations: {
      directory: './src/db/migrations',
    },
    seeds: {
      directory: './src/db/seeds',
    },
  },
};

const environment = process.env.NODE_ENV || 'development';
const config = knexConfig[environment as keyof typeof knexConfig];

if (!config) {
  throw new Error(`Knex configuration not found for environment: ${environment}`);
}

const db = knex(config);

export default db; 