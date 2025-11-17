const { Pool } = require('pg');

const pool = new Pool(
  process.env.NODE_ENV === 'production'
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
      }
    : {
        user: process.env.DB_USER_LOCAL,
        password: process.env.DB_PASSWORD_LOCAL,
        host: process.env.DB_HOST_LOCAL,
        database: process.env.DB_NAME_LOCAL,
        port: Number(process.env.DB_PORT_LOCAL),
        ssl: false,
      }
);

module.exports = pool;
