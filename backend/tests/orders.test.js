const request = require('supertest');
const pool = require('../db');
const {getOrdersByUser, getOrderByOrderId} = require('../routes/order');

describe('GET/orders/:userId', () => {
    let req, res, next;

    beforeEach(() =>{
        req = {params: { userId: 1}};
        res = {status: jest.fn().mockReturnThis(), json: jest.fn()};
        next = jest.fn();

        pool.query =jest.fn();
    });

    test('returns 200 with grouped orders', async() => {
        req.params.userId = '1';

        pool.query.mockResolvedValue({
    rows: [
      { order_id: 1, user_id: 1, order_date: '2025-10-01', status: 'shipped', total_price: 100,
        order_item_id: 1, product_id: 101, variant_id: 201, quantity: 2, unit_price: 50
      },
      { order_id: 1, user_id: 1, order_date: '2025-10-01', status: 'shipped', total_price: 100,
        order_item_id: 2, product_id: 102, variant_id: 202, quantity: 1, unit_price: 50
      },
      { order_id: 2, user_id: 1, order_date: '2025-09-20', status: 'pending', total_price: 75,
        order_item_id: null, product_id: null, variant_id: null, quantity: null, unit_price: null
      }
    ]
  });
  await getOrdersByUser(req, res, next);

  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith([
    {
      order_id: 1,
      user_id: 1,
      order_date: '2025-10-01',
      status: 'shipped',
      total_price: 100,
      items: [
        { order_item_id: 1, product_id: 101, variant_id: 201, quantity: 2, unit_price: 50 },
        { order_item_id: 2, product_id: 102, variant_id: 202, quantity: 1, unit_price: 50 }
      ]
    },
    {
      order_id: 2,
      user_id: 1,
      order_date: '2025-09-20',
      status: 'pending',
      total_price: 75,
      items: []
    }
  ])
    });

    
test('calls next(err) if there is an internal failure', async () => {
        const error = new Error('DB failure');
        pool.query.mockRejectedValue(error);

        await getOrdersByUser(req, res, next);

        expect(next).toHaveBeenCalledWith(error);
     });
});


describe('GET/order/:orderId', () => {
    let req, res, next;

    beforeEach(() =>{
        req = {params: { orderId: 1}};
        res = {status: jest.fn().mockReturnThis(), json: jest.fn()};
        next = jest.fn();

        pool.query =jest.fn();
    });

    test('returns 404 if order is not found', async () => {
        req.params.orderId = '9';
        pool.query.mockResolvedValue({rows: []});

        await getOrderByOrderId(req, res, next);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({error: "order not found"});
    });

    test('returns 200 if order is found', async() => {
const mockOrder = { id: 1, user_id: 2, total_price: 100 };

 const mockItems = [
      {
        id: 10,
        product_id: 5,
        variant_id: 3,
        quantity: 2,
        unit_price: 50,
        price: 50,
        stock_quantity: 20,
        product_name: 'Hair Straightener'
      }
    ];

     pool.query
      .mockResolvedValueOnce({ rows: [mockOrder] }) 
      .mockResolvedValueOnce({ rows: mockItems });  


      await getOrderByOrderId(req, res, next);

    expect(pool.query).toHaveBeenCalledTimes(2);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      order: mockOrder,
      items: mockItems
    })
})

test('calls next(err) if there is an internal failure', async () => {
        const error = new Error('DB failure');
        pool.query.mockRejectedValue(error);

        await getOrderByOrderId(req, res, next);

        expect(next).toHaveBeenCalledWith(error);
     });

});
