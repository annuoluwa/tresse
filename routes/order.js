const express = require('express');
const orderRouter = express.Router();
const pool = require('../db');
orderRouter.get('/:userId', async (req, res, next) => {
  try {
    const userIdInt = parseInt(req.params.userId, 10);
    console.log('Fetching orders for userId:', userIdInt);

    const { rows: orders } = await pool.query(`
      SELECT o.id AS order_id,
             o.user_id,
             o.order_date,
             o.status,
             o.total_price,
             oi.id AS order_item_id,
             oi.product_id,
             oi.variant_id,
             oi.quantity,
             oi.unit_price
      FROM orders o
      LEFT JOIN order_items oi ON oi.order_id = o.id
      WHERE o.user_id = $1
      ORDER BY o.order_date DESC
    `, [userIdInt]);
    
    //Group items under respective orders
    const groupedOrders = [];
const map = {};

for (let row of orders) {
  if (!map[row.order_id]) {
    map[row.order_id] = {
      order_id: row.order_id,
      user_id: row.user_id,
      order_date: row.order_date,
      status: row.status,
      total_price: row.total_price,
      items: []
    };
    groupedOrders.push(map[row.order_id]);
  }
  if (row.order_item_id) {
    map[row.order_id].items.push({
      order_item_id: row.order_item_id,
      product_id: row.product_id,
      variant_id: row.variant_id,
      quantity: row.quantity,
      unit_price: row.unit_price
    });
  }
}
res.status(200).json(groupedOrders);
  } catch (err) {
    next(err);
  }
});


orderRouter.get('/:orderId', async (req, res, next)=>{
try {
    const {orderId} = req.params;

    //get order
    const {rows: orderRows} = await pool.query("SELECT * FROM orders WHERE id = $1", [orderId]);

    if (orderRows.lengt === 0) {
        return res.status(404).json({error: "order not found"})
    }
    const order = orderRows[0];
    //get all iten=ms in the order

const { rows: orderItems } = await pool.query(
    "SELECT oi.*, v.price, v.stock_quantity, p.name AS product_name " +
    "FROM order_items oi " +
    "JOIN variants v ON oi.variant_id = v.id " +   
    "JOIN products p ON oi.product_id = p.id " +  
    "WHERE oi.order_id = $1",
    [orderId]
);

    res.status(200).json({order, items: orderItems})
} catch(err){
    next(err)
}
});;

module.exports = orderRouter;