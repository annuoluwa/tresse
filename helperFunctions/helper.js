const pool = require('../db');

module.exports.users = {
    findByEmail: (email, callback) => {
        pool.query('SELECT * FROM users WHERE email=$1', [email], (err, result) => {
            if(err) return callback(err);
            callback(null, result.rows[0]); //return first user found
        });
    },

    findById: (id, callback) => {
        pool.query('SELECT * FROM users WHERE id=$1', [id], (err, result) => {
            if(err) return callback(err);
        callback(null, result.rows[0]);
        });
    },

    createUser:(username, email, password, is_admin = false, callback) => {
        pool.query(
            'INSERT INTO users (username, email, password, is_admin) VALUES ($1, $2, $3, $4) RETURNING *',
            [username, email, password, is_admin], (err, result)=>{
                if(err) return callback(err);
                callback(null, result.rows[0]);
            }
        )
    }
};
