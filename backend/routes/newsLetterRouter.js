const express = require("express");
const pool = require('../db');
const newsletterRouter = express.Router();

 async function Newsletter (req, res, next) {
  try {
    const { email } = req.body;

    // basic validation
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // if already subscribed
    const existing = await pool.query("SELECT * FROM newsletter WHERE email = $1", [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ message: "You’re already subscribed!" });
    }

    // insert new subscriber
    const result = await pool.query(
      "INSERT INTO newsletter (email, created_at) VALUES ($1, NOW()) RETURNING *",
      [email]
    );

    res.status(201).json({
      message: "Thank you for subscribing!",
      subscriber: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
};


newsletterRouter.post("/subscribe", Newsletter);

module.exports = {
    newsletterRouter,
    Newsletter
};