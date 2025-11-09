//link express to postgres
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER_LOCAL,
  host: process.env.DB_HOST_LOCAL,
  database: process.env.DB_NAME_LOCAL,
  password: process.env.DB_PASSWORD_LOCAL,
  port: process.env.DB_PORT_LOCAL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

module.exports = pool;