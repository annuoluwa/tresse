// usersRouter.js
const express = require('express');
const usersRouter = express.Router();
const pool = require('../db');
const { Users } = require('../helperFunctions/helper');
const passport = require('passport');
const { passwordHash } = require('../passport');
const isLoggedIn = require('../middleware/isLoggedIn');
const isAdmin = require('../middleware/admin');
const { body, validationResult } = require('express-validator');

// ====== VALIDATORS ======
const registerValidator = [
  body('username').trim().escape().isLength({ min: 2, max: 32 }),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('is_admin').optional().isBoolean()
];

const updateUserValidator = [
  body('username').optional().trim().escape().isLength({ min: 2, max: 32 }),
  body('email').optional().isEmail().normalizeEmail(),
  body('password').optional().isLength({ min: 6 })
];

// ====== HANDLERS ======

// LOGIN - Browser login (sets cookies)
async function userBrowserLogin(req, res, next) {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).json(info);

    req.login(user, (err) => {
      if (err) return next(err);
      res.json(user);
    });
  })(req, res, next);
}

// LOGOUT
function userLogout(req, res, next) {
  req.logout(err => {
    if (err) return next(err);

    req.session.destroy(err => {
      if (err) return next(err);
      res.clearCookie('connect.sid');
      res.json({ message: "Logged out successfully" });
    });
  });
}

// REGISTER
async function registerNewUser(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { username, email, password, is_admin } = req.body;

    // Check if user exists
    const existingUser = await Users.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await passwordHash(password, 10);
    if (!hashedPassword) {
      return res.status(500).json({ error: 'Password hashing failed' });
    }

    // Create user (admin flag)
    const adminFlag = is_admin === true || is_admin === 'true';
    const newUser = await Users.createUser(username, email, hashedPassword, adminFlag);

    res.status(201).json({
      message: "User registered successfully",
      user: newUser
    });
  } catch (err) {
    next(err);
  }
}

// Get current authenticated user
usersRouter.get("/me", isLoggedIn, (req, res) => {
  res.json(req.user);
});

// Get all users (admin only)
async function getAllProfilesByAdmin(req, res, next) {
  try {
    const result = await pool.query(
      "SELECT id, username, email, is_admin, created_at FROM users ORDER BY id"
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
}

// Get user by ID
async function getUserById(req, res, next) {
  try {
    const userId = parseInt(req.params.id, 10);

    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const result = await pool.query(
      'SELECT id, username, email, is_admin, created_at FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

// Update user by ID
async function updateUserRoute(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const userId = parseInt(req.params.id, 10);
    const { username, email, password } = req.body;

    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    // Build dynamic update
    const fields = [];
    const values = [];
    let idx = 1;

    if (username) {
      fields.push(`username = $${idx++}`);
      values.push(username);
    }
    if (email) {
      fields.push(`email = $${idx++}`);
      values.push(email);
    }
    if (password) {
      const hashedPassword = await passwordHash(password, 10);
      if (!hashedPassword) {
        return res.status(500).json({ error: 'Password hashing failed' });
      }
      fields.push(`password = $${idx++}`);
      values.push(hashedPassword);
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: "No fields provided to update" });
    }

    values.push(userId);
    const query = `UPDATE users SET ${fields.join(', ')} WHERE id = $${idx} RETURNING id, username, email, is_admin`;
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      message: "User updated successfully",
      user: result.rows[0]
    });
  } catch (err) {
    next(err);
  }
}

// Delete user by ID
async function deleteUserPath(req, res, next) {
  try {
    const userId = parseInt(req.params.id, 10);

    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const result = await pool.query("DELETE FROM users WHERE id = $1", [userId]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "Account deleted successfully" });
  } catch (err) {
    next(err);
  }
}

// ====== ROUTES ======
usersRouter.post('/login', userBrowserLogin);
usersRouter.post('/logout', userLogout);
usersRouter.post('/register', registerValidator, registerNewUser);
usersRouter.get('/', isLoggedIn, isAdmin, getAllProfilesByAdmin);
usersRouter.get('/:id', getUserById);
usersRouter.put('/:id', isLoggedIn, updateUserValidator, updateUserRoute);
usersRouter.delete('/:id', isLoggedIn, isAdmin, deleteUserPath);

// ====== EXPORTS ======
module.exports = {
  usersRouter,
  userBrowserLogin,
  userLogout,
  registerValidator,
  registerNewUser,
  getAllProfilesByAdmin,
  getUserById,
  updateUserValidator,
  updateUserRoute,
  deleteUserPath
};
