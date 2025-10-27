const request = require('supertest');
const {addToCart, usersItemsInCartById, deleteCartbyUsersId} = require('../routes/cart');
const pool = require('../db')

describe('POST/customer adds to cart', () => {
    let req, res, next;
    let mockItem = {
            userId: 2,
            productId: 4
        };

    beforeEach(() =>{
        req = {body: {
            userId: 2,
            productId: 4
        }};

        res = {status: jest.fn().mockReturnThis(), json: jest.fn()};

        next = jest.fn();

        pool.query = jest.fn();

        pool.query.mockClear();

    });
test('update quantity if product already exists in cart', async () => {
    req.body.productId = 4; 
    mockItem = { userId: 2, productId: 4, quantity: 1 };

    pool.query
      .mockResolvedValueOnce({ rows: [mockItem] }) // SELECT
      .mockResolvedValueOnce({ rows: [{ ...mockItem, quantity: 2 }] }); // UPDATE

    await addToCart(req, res, next);

    expect(pool.query).toHaveBeenCalledWith(
        "SELECT * FROM carts WHERE userId = $1 AND productId = $2",
        [req.body.userId, req.body.productId]
    );

    expect(pool.query).toHaveBeenCalledWith(
        "UPDATE carts SET quantity = quantity + 1 WHERE userId = $1 AND productId = $2 RETURNING *",
        [req.body.userId, req.body.productId]
    );

    expect(res.json).toHaveBeenCalledWith({ ...mockItem, quantity: 2 });
});

    
});


describe('GET/cart Items using user\'s Id', () => {
    let req, res, next;
    const mockCart = {id: 5, userid: 9, productId: 4};

    beforeEach(() => {
        req = {params: {userId: 9}}
        res ={status: jest.fn().mockReturnThis(), json: jest.fn()};
        next = jest.fn();

        pool.query = jest.fn();

    });

    test('returns 200 and result if successful', async() => {
        
        pool.query.mockResolvedValue({rows: [mockCart]});

        await usersItemsInCartById(req, res, next);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith([mockCart]);
    });

    test('returns 500 if internal error', async() => {
        const error = new Error('DB failure');
        pool.query.mockRejectedValue(error);

        await usersItemsInCartById(req, res, next);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({error: "Server error while fetching cart"})
    })
});

describe('DELETE/ users cart by user\'s ID', () => {
let req, res, next;
beforeEach(()=>{
    req = {params: {userId: 6}};
    res = {status: jest.fn().mockReturnThis(), json: jest.fn()};
    next = jest.fn();
    pool.query = jest.fn();

});

test('return 404 if there is nothing to delete in cart', async()=> {
    
pool.query.mockResolvedValue({rowCount: 0});

await deleteCartbyUsersId(req, res, next);

expect(pool.query).toHaveBeenCalledWith("DELETE FROM carts WHERE userId = $1", [6]);
expect(res.status).toHaveBeenCalledWith(404);
expect(res.json).toHaveBeenCalledWith({error: "No cart items"});

});

test('returns 200 if cart gets deleted', async() => {
    pool.query.mockResolvedValue({rowCount: 1});

    await deleteCartbyUsersId(req, res, next);
    expect(pool.query).toHaveBeenCalledWith("DELETE FROM carts WHERE userId = $1", [6]);
    expect(res.json).toHaveBeenCalledWith({message: "cart emptied"});
    expect(res.status).toHaveBeenCalledWith(200);
})
});

describe('PUT/udpdateQuantity')