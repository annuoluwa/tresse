const express = require("express");
const pool = require('../db');
const { body, validationResult } = require('express-validator');
const newsletterRouter = express.Router();

// Validator middleware
const newsletterValidator = [
  body('email').isEmail().normalizeEmail()
];

async function Newsletter(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { email } = req.body;

    // Check if already subscribed
    const existing = await pool.query(
      "SELECT id FROM newsletter WHERE email = $1", 
      [email.toLowerCase()]
    );
    
    if (existing.rows.length > 0) {
      return res.status(409).json({ message: "You're already subscribed!" });
    }

    // Insert new subscriber
    const result = await pool.query(
      "INSERT INTO newsletter (email, created_at) VALUES ($1, NOW()) RETURNING id, email",
      [email.toLowerCase()]
    );

    res.status(201).json({
      message: "Thank you for subscribing!",
      subscriber: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
}

// Routes
newsletterRouter.post("/subscribe", newsletterValidator, Newsletter);

// Exports
module.exports = {
  newsletterRouter,
  Newsletter,
  newsletterValidator
};

