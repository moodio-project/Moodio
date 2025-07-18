import knex from 'knex';
// Use require to import the CommonJS knexfile.js
// eslint-disable-next-line @typescript-eslint/no-var-requires
const knexConfig = require('../../knexfile.js');

const environment = process.env.NODE_ENV || 'development';
const config = knexConfig[environment];

if (!config) {
  throw new Error(`Knex configuration not found for environment: ${environment}`);
}

const db = knex(config);

export default db; 