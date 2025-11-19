const express = require('express');
const categoryRouter = express.Router();
const pool = require('../db');

// Category helper function - creates or returns existing category
async function categoryHelper(categoryName, categoryDescription) {
  try {
    const { rows } = await pool.query(
      "SELECT id FROM categories WHERE name = $1",
      [categoryName]
    );

    if (rows.length === 0) {
      const newCategory = await pool.query(
        "INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING id",
        [categoryName, categoryDescription]
      );
      return newCategory.rows[0].id;
    }

    return rows[0].id;
  } catch (err) {
    throw err;
  }
}

// Get category summary with product counts
async function categorySummary(req, res, next) {
  try {
    const result = await pool.query(
      `SELECT c.id, c.name, c.description, COUNT(p.id) AS product_count
       FROM categories c
       LEFT JOIN products p ON c.id = p.category_id
       GROUP BY c.id, c.name, c.description
       ORDER BY c.name`
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
}

// Routes
categoryRouter.get('/summary', categorySummary);

// Exports
module.exports = { categoryRouter, categoryHelper };