const express = require('express');
const productRouter = express.Router();
const pool =require('../db');
const isAdmin = require('../middleware/admin');
const {categoryHelper} = require('./category')

//router.param for product id
productRouter.param('id', async (req, res, next, id)=>{
  try {
    const result = await pool.query("SELECT * FROM products WHERE id =$1", [id]);
    if (!result.rows[0]) {
      return res.status(404).json({error: "Product not found"});
    }
    req.product = result.rows[0];
    next();
  }catch (err) {
    next(err);
  }
});


// GET all products
async function getAllProducts(req, res, next) {
  try {
    const result = await pool.query(`
      SELECT p.id, p.name, p.description, p.brand, p.main_page_url AS "imageUrl",
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
ORDER BY p.id ASC;
`);

    res.status(200).json(result.rows);
  } catch (err) {
    next(err);
  }
};

//Get product by ID
 async function getProductsById(req, res, next) {
  try {
    const productId = parseInt(req.params.id, 10);

    if (isNaN(productId)) {
      return res.status(400).json({ error: "Invalid product ID" });
    }

    const results = await pool.query(
      'SELECT * FROM products WHERE id = $1',
      [productId]
    );

    if (results.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    const variants = await pool.query(
    "SELECT * FROM variants WHERE product_id = $1",
    [productId]
  );
    res.status(200).json({...results.rows[0], variants: variants.rows});
  } catch (err) {       
    next(err);          
  }
};

//Add products
 async function addProduct(req, res,next) {
try {
  const {id, name, description, category, categoryDescription, brand, main_page_url} = req.body;

  //validation
  if (!name || !description || !category || !brand ) {
    return res.status(400).json({error: "name, description, category, brand are required."});
  }

    //checking if category exists
    const categoryId = await categoryHelper(category)

  //insert into Database
  const result = await pool.query(
    `INSERT INTO products (name, description, category_id, brand, main_page_url) 
    VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [name, description, categoryId, brand, main_page_url]
  )
  res.status(201).json(result.rows[0]);
  
} catch (error) {
  next(error)
}
};

//getproduct by categoryName
async function getProductByCategory(req, res, next) {
  try {
    const { name } = req.params;
const categoryName = decodeURIComponent(name); 
    const products = await pool.query(
      `SELECT p.*
       FROM products p
       JOIN categories c ON p.category_id = c.id
       WHERE c.name = $1`,
      [categoryName]
    );

    if (products.rows.length === 0) {
      return res.status(404).json({ message: "No products found in this category" });
    }

    res.status(200).json(products.rows);
  } catch (err) {
    console.error("Error fetching products by category:", err);
    res.status(500).json({ message: "Server error fetching category products" });
  }
}

//Update products by ID
 async function updateProduct(req, res,next) {
  try {
const id = parseInt(req.params.id, 10);
const {name, description, category, brand, main_page_url} = req.body;
//let category if provided
let categoryId
if (category) {
categoryId = await categoryHelper(category);
}
const fields = [];
const values = [];
let idx = 1;

if (name) {fields.push(`name = $${idx++}`); values.push(name);}
if (description) {fields.push(`description = $${idx++} `); values.push(description);};
//if (categoryId) {fields.push(`categoryId = $${idx++}`)};
if (brand) {fields.push(`brand = $${idx++}`); values.push(brand); };
if (main_page_url) {fields.push(`main_page_url = $${idx++}`); values.push(main_page_url);};

if (fields.length === 0) {
  return res.status(404).json({error: "No fields provided to update"})
};
values.push(id);
const query = `UPDATE products SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`;

const result = await pool.query(query, values);

if (result.rows.length === 0) {
  return res.status(404).json({error: "Product not found"})
} 
return res.json(result.rows[0])
} catch (err) {
  next(err)
}
};

//Delete Products by ID
 async function deleteProduct(req, res, next) {
  try {
        const id = parseInt(req.params.id)
    const result = await pool.query("DELETE FROM products WHERE id = $1", [id]);
    if(result.rowCount === 0) {
      return res.status(404).json({message: "product not found"});
    }
    res.status(204).send()
  } catch (err) {
    next(err)
  }
};


//Get products by brands
async function getBrands(req, res, next) {
  try{
const brandName = req.params.name;
const result = await pool.query(
  `
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
          'variant_type', v.variant_type,
          'variant_value', v.variant_value,
          'price', v.price
        )
      ) FILTER (WHERE v.id IS NOT NULL),
      '[]'
    ) AS variants
  FROM products p
  LEFT JOIN variants v ON p.id = v.product_id
  WHERE LOWER(p.brand) = LOWER($1)
  GROUP BY p.id, p.name, p.description, p.brand, p.main_page_url
  ORDER BY p.id;
  `,
  [brandName]
);
    console.log("Direct query result:", result.rows)
if(result.rows.length === 0) {
  return res.status(404).json({message: "No product for this brand"})
}
res.status(200).send(result.rows)

  }catch(err){
console.error(err)
res.status(500).json({message: "Server error"})
  }
}

// GET /products/search?term=...
async function searchProducts(req, res) {
  const { term } = req.query;
  if (!term) return res.status(400).json({ error: 'Search term required' });

  try {
    const searchTerm = String(term);

    const result = await pool.query(
      'SELECT * FROM products WHERE name ILIKE $1',
      [`%${searchTerm}%`]
    );

    console.log('Search results for', searchTerm, ':', result.rows.length);
    res.json(result.rows);
  } catch (err) {
    console.error('Database search error:', err.message);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
}

module.exports = {
  productRouter,
  categoryHelper,
  getAllProducts,
  getProductsById,
  getProductByCategory,
  addProduct,
  updateProduct,
  deleteProduct,
  getBrands,
  searchProducts
}


productRouter.get('/', getAllProducts);
productRouter.get('/search', searchProducts)
productRouter.get('/:id', getProductsById);
productRouter.get('/category/:name', getProductByCategory)
productRouter.post('/', isAdmin, addProduct);
productRouter.put('/:id', updateProduct);
productRouter.delete('/:id', deleteProduct);
productRouter.get('/brand/:name', getBrands);

