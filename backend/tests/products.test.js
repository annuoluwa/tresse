const pool = require('../db');
const {
  categoryHelper,
  getAllProducts,
  getProductsById,
  addProduct,
  updateProduct,
  deleteProduct,
  getProductByCategory,
  getBrands,
  searchProducts
} = require('../routes/product');

// ------------------- router.param middleware -------------------
describe('parameter middleware', () => {
  let req, res, next, middleware;
  const mockProduct = { id: 2, name: 'Hair Straightener' };

  beforeEach(() => {
    req = { params: { id: 5 } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();

    pool.query = jest.fn();
    pool.query.mockClear();

    middleware = async (req, res, next) => {
      try {
        const result = await pool.query("SELECT * FROM products WHERE id =$1", [req.params.id]);
        if (!result.rows[0]) return res.status(404).json({ error: "Product not found" });
        req.product = result.rows[0];
        next();
      } catch (err) {
        next(err);
      }
    };
  });

  test('calls next and sets req.product when found', async () => {
    pool.query.mockResolvedValue({ rows: [mockProduct] });
    await middleware(req, res, next);

    expect(req.product).toEqual(mockProduct);
    expect(next).toHaveBeenCalled();
  });

  test('returns 404 if product not found', async () => {
    pool.query.mockResolvedValue({ rows: [] });
    await middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Product not found" });
  });

  test('calls next(err) if DB error occurs', async () => {
    const error = new Error('DB failure');
    pool.query.mockRejectedValue(error);

    await middleware(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});

// ------------------- categoryHelper -------------------
describe('Category Helper function', () => {
  beforeEach(() => { pool.query = jest.fn(); });

  test('returns existing category ID if found', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ id: 10 }] });
    const id = await categoryHelper('Hair Care', 'Everything for your hair');
    expect(id).toBe(10);
  });

  test('creates new category if not found and returns ID', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ id: 5 }] });

    const id = await categoryHelper('Skincare', 'Products for healthy skin');
    expect(id).toBe(5);
  });

  test('throws error if DB fails', async () => {
    const error = new Error('DB failure');
    pool.query.mockRejectedValue(error);
    await expect(categoryHelper('Test')).rejects.toThrow('DB failure');
  });
});

// ------------------- getAllProducts -------------------
describe('GET all products', () => {
  let req, res, next;
  beforeEach(() => {
    req = {};
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
    pool.query = jest.fn();
  });

  test('returns 200 with products', async () => {
    const mockProducts = [
      { id: 1, name: 'Shampoo' },
      { id: 2, name: 'Conditioner' }
    ];
    pool.query.mockResolvedValue({ rows: mockProducts });
    await getAllProducts(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockProducts);
  });

  test('calls next(err) if DB fails', async () => {
    const error = new Error('DB failure');
    pool.query.mockRejectedValue(error);
    await getAllProducts(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});

// ------------------- getProductsById -------------------
describe('GET product by ID', () => {
  let req, res, next;
  const mockProduct = { id: 2, productName: 'Curler' };

  beforeEach(() => {
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
    pool.query = jest.fn();
  });

  test('returns 400 if product ID is invalid', async () => {
    req = { params: { id: 'abc' } };
    await getProductsById(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid product ID" });
  });

  test('returns 404 if product not found', async () => {
    req = { params: { id: 99 } };
    pool.query.mockResolvedValue({ rows: [] });

    await getProductsById(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Product not found" });
  });

  test('returns 200 with product and variants', async () => {
    req = { params: { id: 2 } };
    pool.query
      .mockResolvedValueOnce({ rows: [mockProduct] }) // product
      .mockResolvedValueOnce({ rows: [{ id: 1, price: 10 }] }); // variants

    await getProductsById(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ ...mockProduct, variants: [{ id: 1, price: 10 }] });
  });

  test('calls next(err) if DB fails', async () => {
    req = { params: { id: 6 } };
    const error = new Error('DB failure');
    pool.query.mockRejectedValue(error);

    await getProductsById(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});

// ------------------- getProductByCategory -------------------
describe('GET /products by category', () => {
  let req, res, next;

  beforeEach(() => {
    req = { params: { name: 'Hair Care' } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
    pool.query = jest.fn();
  });

  test('returns 404 if no products found', async () => {
    pool.query.mockResolvedValue({ rows: [] });
    await getProductByCategory(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "No products found in this category" });
  });

  test('returns 200 if products found', async () => {
    const mockProducts = [{ id: 1 }, { id: 2 }];
    pool.query.mockResolvedValue({ rows: mockProducts });

    await getProductByCategory(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockProducts);
  });

  test('returns 500 if DB error occurs', async () => {
    const error = new Error('DB failure');
    pool.query.mockRejectedValue(error);

    await getProductByCategory(req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Server error fetching category products" });
  });
});

// ------------------- addProduct -------------------
describe('POST addProduct', () => {
  let req, res, next;
  const mockProduct = { id: 1, name: 'Test' };

  beforeEach(() => {
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
    pool.query = jest.fn();
  });

  test('returns 400 if required fields missing', async () => {
    req = { body: {} };
    await addProduct(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "name, description, category, brand are required." });
  });

  test('returns 201 if product added successfully', async () => {
    req = { body: { name: 'Test', description: 'desc', category: 'cat', brand: 'b', main_page_url: 'url' } };
    pool.query.mockResolvedValue({ rows: [mockProduct] });
    await addProduct(req, res, next);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(mockProduct);
  });

  test('calls next(err) if DB fails', async () => {
    req = { body: { name: 'Test', description: 'desc', category: 'cat', brand: 'b', main_page_url: 'url' } };
    const error = new Error('DB failure');
    pool.query.mockRejectedValue(error);

    await addProduct(req, res, next);
    expect(next).toHaveBeenCalledWith(error);
  });
});

// ------------------- updateProduct -------------------
describe('PUT updateProduct', () => {
  let req, res, next;
  const mockProduct = { id: 1, name: 'Updated' };

  beforeEach(() => {
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
    pool.query = jest.fn();
  });

  test('returns 404 if no fields provided', async () => {
    req = { params: { id: 2 }, body: {} };
    await updateProduct(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "No fields provided to update" });
  });

  test('returns 404 if product not found', async () => {
    req = { params: { id: 16 }, body: { name: 'vague' } };
    pool.query.mockResolvedValue({ rows: [] });

    await updateProduct(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Product not found' });
  });

  test('returns 200 on successful update', async () => {
    req = { params: { id: 2 }, body: { name: 'CC' } };
    pool.query.mockResolvedValue({ rows: [mockProduct] });

    await updateProduct(req, res, next);

    expect(res.json).toHaveBeenCalledWith(mockProduct);
  });

  test('calls next(err) if DB fails', async () => {
    req = { params: { id: 2 }, body: { name: 'CC' } };
    const error = new Error('DB failure');
    pool.query.mockRejectedValue(error);

    await updateProduct(req, res, next);
    expect(next).toHaveBeenCalledWith(error);
  });
});

// ------------------- deleteProduct -------------------
describe('DELETE deleteProduct', () => {
  let req, res, next;

  beforeEach(() => {
    res = { status: jest.fn().mockReturnThis(), json: jest.fn(), send: jest.fn() };
    next = jest.fn();
    pool.query = jest.fn();
  });

  test('returns 404 if delete fails', async () => {
    req = { params: { id: 12 } };
    pool.query.mockResolvedValue({ rowCount: 0 });

    await deleteProduct(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'product not found' });
  });

  test('returns 204 on successful delete', async () => {
    req = { params: { id: 1 } };
    pool.query.mockResolvedValue({ rowCount: 1 });

    await deleteProduct(req, res, next);

    expect(res.status).toHaveBeenCalledWith(204);
  });

  test('calls next(err) if DB fails', async () => {
    req = { params: { id: 1 } };
    const error = new Error('DB failure');
    pool.query.mockRejectedValue(error);

    await deleteProduct(req, res, next);
    expect(next).toHaveBeenCalledWith(error);
  });
});

// ------------------- getBrands -------------------
describe('GET getBrands', () => {
  let req, res, next;

  beforeEach(() => {
    res = { status: jest.fn().mockReturnThis(), send: jest.fn(), json: jest.fn() };
    next = jest.fn();
    pool.query = jest.fn();
  });

  test('returns 200 if products found', async () => {
    req = { params: { name: 'BrandX' } };
    pool.query.mockResolvedValue({ rows: [{ id: 1 }, { id: 2 }] });

    await getBrands(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith([{ id: 1 }, { id: 2 }]);
  });

  test('returns 404 if no products found', async () => {
    req = { params: { name: 'BrandY' } };
    pool.query.mockResolvedValue({ rows: [] });

    await getBrands(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'No product for this brand' });
  });

  test('returns 500 if DB error occurs', async () => {
    req = { params: { name: 'BrandZ' } };
    const error = new Error('DB failure');
    pool.query.mockRejectedValue(error);

    await getBrands(req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Server error' });
  });
});

// ------------------- searchProducts -------------------
describe('GET searchProducts', () => {
  let req, res;

  beforeEach(() => {
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    pool.query = jest.fn();
  });

  test('returns 400 if term missing', async () => {
    req = { query: {} };
    await searchProducts(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Search term required' });
  });

  test('returns 200 with results', async () => {
    req = { query: { term: 'Shampoo' } };
    pool.query.mockResolvedValue({ rows: [{ id: 1 }] });

    await searchProducts(req, res);
    expect(res.json).toHaveBeenCalledWith([{ id: 1 }]);
  });

  test('returns 500 if DB error', async () => {
    req = { query: { term: 'Shampoo' } };
    const error = new Error('DB failure');
    pool.query.mockRejectedValue(error);

    await searchProducts(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Database error',
      details: error.message
    });
  });
});