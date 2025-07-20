require('dotenv').config();

console.log('Environment Variables Test:');
console.log('==========================');
console.log('GENIUS_API_KEY:', process.env.GENIUS_API_KEY ? 'Present' : 'Missing');
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? 'Present' : 'Missing');
console.log('SPOTIFY_CLIENT_ID:', process.env.SPOTIFY_CLIENT_ID ? 'Present' : 'Missing');
console.log('SPOTIFY_CLIENT_SECRET:', process.env.SPOTIFY_CLIENT_SECRET ? 'Present' : 'Missing');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Present' : 'Missing');
console.log('PG_HOST:', process.env.PG_HOST || 'localhost');
console.log('PG_USER:', process.env.PG_USER || 'postgres');
console.log('PG_DB:', process.env.PG_DB || 'moodio'); 