const express = require('express');
const productRouter = express.Router();
const pool =require('../db');
const {isAdmin} = require('./users')


//router.param for product id
productRouter.param,('id', async (req, res, next, id)=>{
  try {
    const result = await pool.query("SELECT * FROM producrs WHERE id =$1", [id]);
    if (!result.rows[0]) {
      return res.status(404).json({error: "Product not found"});
    }
    req.product = result.rows[0];
    next();
  }catch (err) {
    next(err);
  }
});

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

// GET all products
productRouter.get('/', async(req, res, next) => {
    try{
const result = await pool.query('SELECT * FROM products ORDER BY id ASC');
console.log(result.rows)
res.status(200).json(result.rows);
    }catch (err) {
        next (err); //express handles error 
    }
});

//Get product by ID
productRouter.get('/:id', async (req, res, next) => {
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

    res.status(200).json(results.rows[0]);
  } catch (err) {       
    next(err);          
  }
});

//Add products
productRouter.post('/', isAdmin, async(req, res,next)=>{
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
});


//Update products by ID
productRouter.put('/:id', async (req, res,next) => {
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
});

//Delete Products by ID
productRouter.delete('/:id', async(req, res,next)=>{
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
});

module.exports = productRouter;