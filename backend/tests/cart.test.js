const { addToCart, usersItemsInCartById, deleteCartbyUsersId, updateQuantity } = require('../routes/cart');
const pool = require('../db');

jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    paymentIntents: {
      create: jest.fn().mockResolvedValue({ client_secret: 'test_secret' }),
    },
  }));
});

describe('POST /:userId - addToCart', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      params: { userId: '2' },
      body: { productId: 4, variantId: 1, quantity: 1 }
    };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
    pool.query = jest.fn();
  });

  test('inserts new item when not in cart', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [] }) // SELECT (no existing item)
      .mockResolvedValueOnce({}) // INSERT
      .mockResolvedValueOnce({ rows: [{ id: 1, userId: 2, productId: 4 }] }); // SELECT * WHERE userid=$1

    await addToCart(req, res, next);

    expect(pool.query).toHaveBeenCalledWith(
      `SELECT * FROM carts WHERE userid=$1 AND productid=$2 AND variantid=$3`,
      [2, 4, 1]
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([{ id: 1, userId: 2, productId: 4 }]);
  });

  test('updates quantity if product exists', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [{ userId: 2, productId: 4, variantId: 1 }] }) // existing
      .mockResolvedValueOnce({}) // UPDATE
      .mockResolvedValueOnce({ rows: [{ id: 1, userId: 2, productId: 4, quantity: 2 }] }); // SELECT * after update

    await addToCart(req, res, next);

    expect(pool.query).toHaveBeenCalledWith(
      `UPDATE carts SET quantity = quantity + $1 WHERE userid=$2 AND productid=$3 AND variantid=$4`,
      [1, 2, 4, 1]
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('returns 400 if required fields are missing', async () => {
    req.body = {};
    await addToCart(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Missing userId, productId, or variantId" });
  });

  test('returns 500 on database error', async () => {
    pool.query.mockRejectedValue(new Error('DB error'));
    await addToCart(req, res, next);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Server error while adding to cart" });
  });
});

describe('GET /:userId - usersItemsInCartById', () => {
  let req, res, next;

  beforeEach(() => {
    req = { params: { userId: '9' } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
    pool.query = jest.fn();
  });

  test('returns 200 and items on success', async () => {
    const mockCart = [{ productId: 4, variantId: 1 }];
    pool.query.mockResolvedValue({ rows: mockCart });
    await usersItemsInCartById(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockCart);
  });

  test('returns 400 on invalid userId', async () => {
    req.params.userId = 'abc';
    await usersItemsInCartById(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid userId" });
  });

  test('calls next on DB error', async () => {
    const err = new Error('DB failure');
    pool.query.mockRejectedValue(err);
    await usersItemsInCartById(req, res, next);
    expect(next).toHaveBeenCalledWith(err);
  });
});

describe('DELETE /:userId - deleteCartbyUsersId', () => {
  let req, res, next;

  beforeEach(() => {
    req = { params: { userId: '6' } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
    pool.query = jest.fn();
  });

  test('returns 404 if no items deleted', async () => {
    pool.query.mockResolvedValue({ rowCount: 0 });
    await deleteCartbyUsersId(req, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "No cart items" });
  });

  test('returns 200 if items deleted', async () => {
    pool.query.mockResolvedValue({ rowCount: 1 });
    await deleteCartbyUsersId(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: "Cart emptied" });
  });

  test('returns 400 on invalid userId', async () => {
    req.params.userId = 'invalid';
    await deleteCartbyUsersId(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid userId" });
  });

  test('calls next on DB error', async () => {
    const err = new Error('DB fail');
    pool.query.mockRejectedValue(err);
    await deleteCartbyUsersId(req, res, next);
    expect(next).toHaveBeenCalledWith(err);
  });
});

describe('PUT /:userId/:productId/:variantId - updateQuantity', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      params: { userId: '2', productId: '4', variantId: '1' },
      body: { quantity: 3 }
    };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
    pool.query = jest.fn();
  });

  test('successfully updates quantity', async () => {
    const updatedItem = { userId: 2, productId: 4, variantId: 1, quantity: 3 };
    pool.query.mockResolvedValue({ rows: [updatedItem] });
    await updateQuantity(req, res, next);
    expect(res.json).toHaveBeenCalledWith(updatedItem);
  });

  test('returns 404 if item not found', async () => {
    pool.query.mockResolvedValue({ rows: [] });
    await updateQuantity(req, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Cart item not found" });
  });

  test('returns 400 on invalid input', async () => {
    req.body.quantity = 0;
    await updateQuantity(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid input" });
  });

  test('calls next on DB error', async () => {
    const err = new Error('DB failure');
    pool.query.mockRejectedValue(err);
    await updateQuantity(req, res, next);
    expect(next).toHaveBeenCalledWith(err);
  });
});