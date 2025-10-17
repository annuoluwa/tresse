const request = require('supertest');
const pool = require('../db');
const {categoryHelper} = require('../routes/product')
//product param unit test
describe('parameter middleware', () =>  {
    let req, res, next, middleware;
    
    const mockProduct = {id: 2, name: 'Hair straightner'}

    beforeEach(() => {
        req = {params: {id: 5}};
        res = {
            status: jest.fn().mockReturnThis(), json: jest.fn()
        }
        next = jest.fn();
        pool.query =jest.fn(); 

        pool.query.mockClear()

        middleware = async (req, res, next) => {
            try {
    const result = await pool.query("SELECT * FROM products WHERE id =$1", [req.params.id]);
    if (!result.rows[0]) {
      return res.status(404).json({error: "Product not found"});
    }
    req.product = result.rows[0];
    next();
  }catch (err) {
    next(err);
  }
        }
    });

    
        test('calls next and set req.product when found', async() => {
            
            pool.query.mockResolvedValue({rows: [mockProduct]});

            await middleware(req, res, next);

            expect(req.product).toEqual(mockProduct);
            expect(next).toHaveBeenCalled();
        })
});

//category middleware unit test
 describe('Category Helper function', () => {
 beforeEach(()=> {
    pool.query = jest.fn();
 });

    test('return category result if category already exists', async () => {
        pool.query.mockResolvedValueOnce({rows: [{id:10}]});
       const id = await categoryHelper('Hair Care', 'Everything for your hair');
        expect(id).toBe(10)
        expect(pool.query).toHaveBeenCalledWith("SELECT id FROM categories WHERE name = $1", ['Hair Care'])
    }) 

    test('creates new category and return ID if category does not exist', async()=> {
        pool.query
        .mockResolvedValueOnce({rows: []})//no category found
        .mockResolvedValueOnce({rows: [{id: 5}]}); // newcategory created

        const id = await categoryHelper('Skincare', 'Products for healthy skin');

        expect(pool.query).toHaveBeenCalledWith(
            'SELECT id FROM categories WHERE name = $1',
            ['Skincare']
        );
        expect(pool.query).toHaveBeenCalledWith(
            'INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING id',
            ['Skincare', 'Products for healthy skin']
        );
        expect(id).toBe(5);
    })
 });


 //CRUD unit testing

describe('GET/all products', () => {
    let req, res, next, allProducts;
    beforeEach(()=>{
        req = {};
        res = {status: jest.fn().mockReturnThis(), json: jest.fn()}
        next = jest.fn();
        pool.query = jest.fn();
        pool.query.mockReset();
        res.status.mockClear();
        res.json.mockClear();
        next.mockClear();

         allProducts = async (req, res, next) => {
            try{
const result = await pool.query('SELECT * FROM products ORDER BY id ASC');
console.log(result.rows)
res.status(200).json(result.rows);
    }catch (err) {
        next (err);  
    }
         }
    })

    test('returns 200 and list of products on success', async()=> {
        pool.query.mockResolvedValue({
            rows:  [
                {id: 1, name: 'shampoo', category: 'Hair Care'},
                {id: 2, name: 'conditioner', category: 'Hair treatment'}
            ]
        });

        await allProducts(req, res, next);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(
             [
                {id: 1, name: 'shampoo', category: 'Hair Care'},
                {id: 2, name: 'conditioner', category: 'Hair treatment'}

            ]
        )
    });

    
    test('calls next(err) if query fails', async () => {
        const error = new Error('DB failure');
        pool.query.mockRejectedValue(error);

        await allProducts(req, res, next);

        expect(next).toHaveBeenCalledWith(error);
    });
});


//get product by ID 
describe('GET/product by ID', () => {
    let req, res, next, getProductById;
    const mockProduct = {id: 2, productName: 'Curler'}
    beforeEach(() => {
        req = {}
        res = {status: jest.fn().mockReturnThis(), json: jest.fn()};
        next= jest.fn();
        pool.query = jest.fn();
        pool.query.mockReset();
        res.status.mockClear();
        res.json.mockClear();
        next.mockClear();

        getProductById = async (req, res, next) => {
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
        }
    });

    test('returns 400 if product ID is NAN', async() => {

req = {params: {id: 'ab'}}

        await getProductById(req, res, next);
        
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({error:"Invalid product ID"});
        expect(pool.query).not.toHaveBeenCalled();
    })

    test('returns 404 if product is not found', async () => {
       req = {params: {id: 99}};
     pool.query.mockResolvedValue({rows: []});
await getProductById(req, res, next);

        expect(res.status).toHaveBeenCalledWith(404);
         expect(res.json).toHaveBeenCalledWith({error:"Product not found"});
         expect(pool.query).toHaveBeenCalledWith(
      'SELECT * FROM products WHERE id = $1', [99])
    })

    test('returns 200 if successful', async() => {
        req = {params: {id: 2}}
        pool.query.mockResolvedValue({rows: [mockProduct]});

        await getProductById(req, res, next);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(pool.query).toHaveBeenCalledWith(
      'SELECT * FROM products WHERE id = $1', [2]);
      expect(res.json).toHaveBeenCalledWith(mockProduct)

    });

    test('calls next(err) if there is an internal failure', async () => {
        req ={ params: {id: '6'}};
        const error = new Error('DB failure');
        pool.query.mockRejectedValue(error);

        await getProductById(req, res, next);

        expect(next).toHaveBeenCalledWith(error);
     });

});

//ADD products

describe('POST/add a new product to DB', () => {
    let req, res, next, addProduct;
    let mockProduct =  {name: 'Emily in Paris',
            description: 'Conditioner',
            category: 'nil',
            brand: 'generic',
            main_page_url: 'null'}
    
    beforeEach(() => {
        req = {};
        res = {status: jest.fn().mockReturnThis(), json: jest.fn()};
        next = jest.fn();
        pool.query = jest.fn();

        pool.query.mockClear();
        res.status.mockClear();

        addProduct = async( req, res, next) => {
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

        }

    });

    test('returns 400 if missing details', async() => {
        req = {body: {}};

        await addProduct(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(pool.query).not.toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith({error: "name, description, category, brand are required."})
    });

    test('returns 201 if successful', async() => {
        req = {body: {
            name: 'Emily in Paris',
            description: 'Conditioner',
            category: 'nil',
            brand: 'generic',
            main_page_url: 'null'
        }

        };
pool.query.mockResolvedValue({rows: [mockProduct]})
        await addProduct(req, res, next)

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(mockProduct)
    })
});


describe('PUT/update product info by ID', () => {
let req, res, next, updateProduct;

const mockField = {name: 'BB', description: 'ABV', category: 'CDE', brand: 'EFG', main_page_url: 'NL'}
beforeEach(() => {
    req = {
        params: { id: 2},
        body: { }
    }
    res= {status: jest.fn().mockReturnThis(), json: jest.fn()}
    next=jest.fn();

    pool.query.mockClear();
    

updateProduct = async(req,res, next) => {

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
    
}


});

test('return 404 if empty field', async () => {
    req = {params: {id: 2}, body: {}}

    await updateProduct(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({error: "No fields provided to update"})
})

test('return 404 if ID  does not exist in DB', async() => {
    req ={params: { id: 16}, body: {name: 'vague'}}
    pool.query.mockResolvedValue({rows: []});

    await updateProduct(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({error: 'Product not found'});
   });

   test('returns 200 if successful update', async() => {
    req = {params: {id: 2}, body: {name: 'CC'}};
    pool.query.mockResolvedValue({rows: [mockField]});

    await updateProduct(req, res, next);

    expect(res.status).not.toHaveBeenCalledWith();
    expect(res.json).toHaveBeenCalledWith(mockField);

   })

   test('calls next(err) if there is an internal failure', async () => {
    req = {params: {id: 2}, body: {name: 'CC'}};

        const error = new Error('DB failure');
        pool.query.mockRejectedValue(error);

        await updateProduct(req, res, next);

        expect(next).toHaveBeenCalledWith(error);
     });


});

//DELETE products

describe('DELETE/products from DB using ID', () => {
    let req, res, next, deleteProduct;

    const mockProduct = {id: 1}

    beforeEach(() => {
        req = {params: {id: 2}};
        res = {status: jest.fn().mockReturnThis(), json: jest.fn()};
        next = jest.fn();

        pool.query.mockClear();

        deleteProduct = async(req, res, next) => {
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
        }

    });

    test('returns 404 if delete unsuccessful', async () => {
        req = {params: {id: 12}};

        pool.query.mockResolvedValue({rowCount: 0});

        await deleteProduct(req, res, next);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({message: 'product not found'})
    });

    test('returns 204 if successful', async () => {
        req = {params: {id: 1}}

        pool.query.mockResolvedValue({mockProduct});

        await deleteProduct(req, res, next);

        expect(res.status).toHaveBeenCalledWith(204);

    });

    
test('calls next(err) if there is an internal failure', async () => {
    req = {params: {id: 1}};

    const error = new Error('DB failure');
        pool.query.mockRejectedValue(error);

        await deleteProduct(req, res, next);

        expect(next).toHaveBeenCalledWith(error);
     });
});
