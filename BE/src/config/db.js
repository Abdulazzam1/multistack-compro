const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false,
});

pool.on('connect', () => {
  if (process.env.NODE_ENV !== 'test') {
    console.log('🐘  PostgreSQL terhubung');
  }
});

pool.on('error', (err) => {
  console.error('❌  PostgreSQL error:', err.message);
});

const query = (text, params) => pool.query(text, params);

module.exports = { query, pool };
