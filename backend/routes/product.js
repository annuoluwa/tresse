const express = require('express');
const productRouter = express.Router();
const pool = require('../db');
const isAdmin = require('../middleware/admin');
const { categoryHelper } = require('./category');

// Router param middleware for product ID
productRouter.param('id', async (req, res, next, id) => {
  try {
    const productId = parseInt(id, 10);
    
    if (isNaN(productId)) {
      return res.status(400).json({ error: "Invalid product ID" });
    }

    const result = await pool.query("SELECT * FROM products WHERE id = $1", [productId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }
    
    req.product = result.rows[0];
    next();
  } catch (err) {
    next(err);
  }
});

// GET all products with variants
async function getAllProducts(req, res, next) {
  try {
    const result = await pool.query(`
      SELECT 
        p.id, 
        p.name, 
        p.description, 
        p.brand, 
        p.main_page_url AS "imageUrl",
        COALESCE(
          json_agg(
            json_build_object(
              'id', v.id,
              'price', v.price,
              'variant_type', v.variant_type,
              'variant_value', v.variant_value,
              'stock_quantity', v.stock_quantity
            )
          ) FILTER (WHERE v.id IS NOT NULL),
          '[]'
        ) AS variants
      FROM products p
      LEFT JOIN variants v ON p.id = v.product_id
      GROUP BY p.id
      ORDER BY p.id ASC
    `);

    res.status(200).json(result.rows);
  } catch (err) {
    next(err);
  }
}

// GET product by ID with variants
async function getProductsById(req, res, next) {
  try {
    const productId = parseInt(req.params.id, 10);

    if (isNaN(productId)) {
      return res.status(400).json({ error: "Invalid product ID" });
    }

    const product = await pool.query(
      'SELECT * FROM products WHERE id = $1',
      [productId]
    );

    if (product.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    const variants = await pool.query(
      "SELECT * FROM variants WHERE product_id = $1",
      [productId]
    );

    res.status(200).json({ 
      ...product.rows[0], 
      variants: variants.rows 
    });
  } catch (err) {
    next(err);
  }
}

// GET products by category name
async function getProductByCategory(req, res, next) {
  try {
    const categoryName = decodeURIComponent(req.params.name);

    const products = await pool.query(
      `SELECT p.*, c.name AS category_name
       FROM products p
       JOIN categories c ON p.category_id = c.id
       WHERE LOWER(c.name) = LOWER($1)`,
      [categoryName]
    );

    if (products.rows.length === 0) {
      return res.status(404).json({ message: "No products found in this category" });
    }

    res.status(200).json(products.rows);
  } catch (err) {
    next(err);
  }
}

// GET products by brand name
async function getBrands(req, res, next) {
  try {
    const brandName = decodeURIComponent(req.params.name);

    const result = await pool.query(
      `SELECT 
        p.id,
        p.name,
        p.description,
        p.brand,
        p.main_page_url AS "imageUrl",
        COALESCE(
          json_agg(
            json_build_object(
              'id', v.id,
              'variant_type', v.variant_type,
              'variant_value', v.variant_value,
              'price', v.price,
              'stock_quantity', v.stock_quantity
            )
          ) FILTER (WHERE v.id IS NOT NULL),
          '[]'
        ) AS variants
      FROM products p
      LEFT JOIN variants v ON p.id = v.product_id
      WHERE LOWER(p.brand) = LOWER($1)
      GROUP BY p.id
      ORDER BY p.id`,
      [brandName]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No products found for this brand" });
    }

    res.status(200).json(result.rows);
  } catch (err) {
    next(err);
  }
}

// Search products by name
async function searchProducts(req, res, next) {
  try {
    const { term } = req.query;

    if (!term) {
      return res.status(400).json({ error: 'Search term required' });
    }

    const result = await pool.query(
      `SELECT 
        p.id,
        p.name,
        p.description,
        p.brand,
        p.main_page_url AS "imageUrl"
       FROM products p
       WHERE p.name ILIKE $1 OR p.description ILIKE $1 OR p.brand ILIKE $1`,
      [`%${term}%`]
    );

    res.json(result.rows);
  } catch (err) {
    next(err);
  }
}

// POST - Add new product (admin only)
async function addProduct(req, res, next) {
  try {
    const { name, description, category, brand, main_page_url } = req.body;

    // Validation
    if (!name || !description || !category || !brand) {
      return res.status(400).json({ 
        error: "name, description, category, and brand are required" 
      });
    }

    // Get or create category
    const categoryId = await categoryHelper(category);

    // Insert product
    const result = await pool.query(
      `INSERT INTO products (name, description, category_id, brand, main_page_url) 
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, description, categoryId, brand, main_page_url]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

// PUT - Update product by ID
async function updateProduct(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    const { name, description, category, brand, main_page_url } = req.body;

    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid product ID" });
    }

    // Get category ID if provided
    let categoryId;
    if (category) {
      categoryId = await categoryHelper(category);
    }

    // Build dynamic update query
    const fields = [];
    const values = [];
    let idx = 1;

    if (name) { fields.push(`name = $${idx++}`); values.push(name); }
    if (description) { fields.push(`description = $${idx++}`); values.push(description); }
    if (categoryId) { fields.push(`category_id = $${idx++}`); values.push(categoryId); }
    if (brand) { fields.push(`brand = $${idx++}`); values.push(brand); }
    if (main_page_url) { fields.push(`main_page_url = $${idx++}`); values.push(main_page_url); }

    if (fields.length === 0) {
      return res.status(400).json({ error: "No fields provided to update" });
    }

    values.push(id);
    const query = `UPDATE products SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

// DELETE - Delete product by ID
async function deleteProduct(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid product ID" });
    }

    const result = await pool.query("DELETE FROM products WHERE id = $1", [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

// Routes (order matters - specific before dynamic)
productRouter.get('/search', searchProducts);
productRouter.get('/category/:name', getProductByCategory);
productRouter.get('/brand/:name', getBrands);
productRouter.get('/', getAllProducts);
productRouter.get('/:id', getProductsById);
productRouter.post('/', isAdmin, addProduct);
productRouter.put('/:id', isAdmin, updateProduct);
productRouter.delete('/:id', isAdmin, deleteProduct);

// Exports
module.exports = {
  productRouter,
  getAllProducts,
  getProductsById,
  getProductByCategory,
  addProduct,
  updateProduct,
  deleteProduct,
  getBrands,
  searchProducts
};

