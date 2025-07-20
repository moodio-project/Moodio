import knex from 'knex';
import path from 'path';

// Use require to import the CommonJS knexfile.js
// eslint-disable-next-line @typescript-eslint/no-var-requires
let knexConfig;
try {
  // Try to load from the compiled location first
  knexConfig = require(path.join(__dirname, '../../knexfile.js'));
} catch (error) {
  // Fallback to the source location
  knexConfig = require(path.join(__dirname, '../../../knexfile.js'));
}

// Handle both default export and direct export
const config = knexConfig.default || knexConfig;

const environment = process.env.NODE_ENV || 'development';
const environmentConfig = config[environment];

if (!environmentConfig) {
  throw new Error(`Knex configuration not found for environment: ${environment}`);
}

const db = knex(environmentConfig);

export default db; 