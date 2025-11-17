// usersRouter.js
const express = require('express');
const usersRouter = express.Router();
const pool = require('../db');
const { Users } = require('../helperFunctions/helper');
const passport = require('passport');
const { passwordHash } = require('../passport');
const isLoggedIn = require('../middleware/isLoggedIn');
const isAdmin = require('../middleware/admin');


// LOGIN

// Browser login (sets cookies)
async function userBrowserLogin(req, res, next) {
  try {
    passport.authenticate('local', (err, user, info) => {
      if (err) return next(err);
      if (!user) return res.status(401).json(info);

      req.login(user, (err) => {
        if (err) return next(err);
        res.json(user); // Return user directly, not { user: user }
      });
    })(req, res, next);
  } catch (err) {
    next(err);
  }
}



// LOGOUT

function userLogout(req, res, next) {
  req.logout(err => {
    if (err) return next(err);

    req.session.destroy(err => {
      if (err) return next(err);

      res.clearCookie('connect.sid'); // clear session cookie
      res.json({ message: "Logged out successfully" });
    });
  });
}

//  REGISTER
async function registerNewUser(req, res, next) {
  try {
    let { username, email, password, is_admin } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: "Username, email, and password required" });
    }

    const adminFlag = is_admin === true || is_admin === 'true';

    // Check if user exists
    const existingUser = await Users.findByEmail(email);
    if (existingUser) return res.status(409).json({ message: 'User already exists' });

    // Hash password
    const hashedPassword = await passwordHash(password, 10);
    if (!hashedPassword) return next(new Error('Password hashing failed'));

    // Create user
    const newUser = await Users.createUser(username, email, hashedPassword, adminFlag);
    res.status(201).json({ message: "User registered successfully", user: newUser });

  } catch (err) {
    next(err);
  }
}

//  USER PROFILE

// Server-side rendered dashboard (if needed)
usersRouter.get('/profile', isLoggedIn, (req, res) => {
  res.render("dashboard", { user: req.user });
});

// React SPA: get current user
usersRouter.get("/me", isLoggedIn, (req, res) => {
  res.json(req.user);
});

//  CRUD ROUTES

// Get all users (admin)
async function getAllProfilesByAdmin(req, res, next) {
  try {
    const result = await pool.query("SELECT id, username, email FROM users");
    res.status(200).json({ users: result.rows });
  } catch (err) {
    next(err);
  }
}

// Get user by ID
async function getUserById(req, res, next) {
  try {
    const userId = req.params.id;
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    if (result.rows.length === 0) return res.status(404).json({ error: "User not found" });

    res.status(200).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

// Update user by ID
async function updateUserRoute(req, res, next) {
  try {
    const userId = req.params.id;
    const { username, email, password } = req.body;
    const fields = [];
    const values = [];
    let idx = 1;

    if (username) { fields.push(`username = $${idx++}`); values.push(username); }
    if (email) { fields.push(`email = $${idx++}`); values.push(email); }
    if (password) {
      const hashedPassword = await passwordHash(password, 10);
      if (!hashedPassword) return next(new Error('Password hashing failed'));
      fields.push(`password = $${idx++}`); values.push(hashedPassword);
    }

    if (fields.length === 0) return res.status(400).json({ error: "No fields provided" });

    values.push(userId);
    const query = `UPDATE users SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`;
    const result = await pool.query(query, values);

    if (result.rows.length === 0) return res.status(404).json({ error: "User not found" });
    res.json({ message: "User updated successfully", user: result.rows[0] });

  } catch (err) {
    next(err);
  }
}

// Delete user by ID
async function deleteUserPath(req, res, next) {
  try {
    const userId = req.params.id;
    const result = await pool.query("DELETE FROM users WHERE id = $1", [userId]);
    if (result.rowCount === 0) return res.status(404).json({ error: "Delete unsuccessful" });
    res.json({ message: "Account deleted successfully" });
  } catch (err) {
    next(err);
  }
}


// ROUTE DEFINITIONS

usersRouter.post('/login', userBrowserLogin);
usersRouter.post('/logout', userLogout);
usersRouter.post('/register', registerNewUser);

// Admin protected
usersRouter.get('/', isLoggedIn, isAdmin, getAllProfilesByAdmin);

// User routes
usersRouter.get('/:id', getUserById);
usersRouter.put('/:id', updateUserRoute);
usersRouter.delete('/:id', isLoggedIn, isAdmin, deleteUserPath);

module.exports = {
  usersRouter,
  userBrowserLogin,
  userLogout,
  registerNewUser,
  getAllProfilesByAdmin,
  getUserById,
  updateUserRoute,
  deleteUserPath
};
