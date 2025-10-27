const express = require('express');
const categoryRouter = express.Router();
const pool =require('../db');

//Category middleware/helper function
 async function categoryHelper(categoryName, categoryDescription) {
  let categoryResult = await pool.query("SELECT id FROM categories WHERE name = $1", [categoryName]);
    if(categoryResult.rows.length === 0) {
      //create new category
      const newCategory = await pool.query("INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING id", [categoryName, categoryDescription]);
      return newCategory.rows[0].id;
    }else {
      return categoryResult.rows[0].id;
    }
}  


async function categorySummary(req, res, next) {
try {
    const result = await pool.query('SELECT c.id, c.name, COUNT(p.id) AS product_count FROM categories c LEFT JOIN products p ON c.id = p.category_id GROUP BY c.id, c.name ORDER BY c.name;');
    res.json(result.rows); 
}catch(err) {
    next(err)
}
}

module.exports = { categoryRouter, categoryHelper };

categoryRouter.get('/summary', categorySummary)