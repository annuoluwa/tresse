const pool = require('../db');

module.exports.Users = {
  findByEmail: (email) => {
    return new Promise((resolve, reject) => {
      pool.query('SELECT * FROM users WHERE email=$1', [email], (err, result) => {
        if (err) return reject(err);
        resolve(result.rows[0]); // return first user found
      });
    });
  },

  findById: (id) => {
    return new Promise((resolve, reject) => {
      pool.query('SELECT * FROM users WHERE id=$1', [id], (err, result) => {
        if (err) return reject(err);
        resolve(result.rows[0]);
      });
    });
  },

  createUser: (username, email, password, is_admin = false) => {
    return new Promise((resolve, reject) => {
      pool.query(
        'INSERT INTO users (username, email, password, is_admin) VALUES ($1, $2, $3, $4) RETURNING *',
        [username, email, password, is_admin],
        (err, result) => {
          if (err) return reject(err);
          resolve(result.rows[0]);
        }
      );
    });
  },

  findByGoogleId: (googleId) => {
    return new Promise((resolve, reject) => {
      pool.query('SELECT * FROM users WHERE google_id=$1', [googleId], (err, result) => {
        if (err) return reject(err);
        resolve(result.rows[0]);
      });
    });
  },

  createFromGoogle: (profile) => {
    return new Promise((resolve, reject) => {
      const username = profile.displayName;
      const email = profile.emails[0].value;
      const googleId = profile.id;
      pool.query(
        'INSERT INTO users (username, email, google_id) VALUES ($1, $2, $3) RETURNING *',
        [username, email, googleId],
        (err, result) => {
          if (err) return reject(err);
          resolve(result.rows[0]);
        }
      );
    });
  }
};