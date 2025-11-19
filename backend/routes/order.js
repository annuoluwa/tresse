const express = require('express');
const orderRouter = express.Router();
const pool = require('../db');

// Get all orders for a user
async function getOrdersByUser(req, res, next) {
  try {
    const userId = parseInt(req.params.userId, 10);

    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const { rows: orders } = await pool.query(
      `SELECT o.id AS order_id,
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
       ORDER BY o.order_date DESC`,
      [userId]
    );

    // Group items under respective orders
    const groupedOrders = [];
    const orderMap = {};

    for (const row of orders) {
      if (!orderMap[row.order_id]) {
        orderMap[row.order_id] = {
          order_id: row.order_id,
          user_id: row.user_id,
          order_date: row.order_date,
          status: row.status,
          total_price: row.total_price,
          items: []
        };
        groupedOrders.push(orderMap[row.order_id]);
      }

      if (row.order_item_id) {
        orderMap[row.order_id].items.push({
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
}

// Get single order by order ID
async function getOrderByOrderId(req, res, next) {
  try {
    const orderId = parseInt(req.params.orderId, 10);

    if (isNaN(orderId)) {
      return res.status(400).json({ error: "Invalid order ID" });
    }

    // Get order
    const { rows: orderRows } = await pool.query(
      "SELECT * FROM orders WHERE id = $1",
      [orderId]
    );

    if (orderRows.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    const order = orderRows[0];

    // Get all items in the order
    const { rows: orderItems } = await pool.query(
      `SELECT oi.*, v.price, v.stock_quantity, p.name AS product_name, p.image_url
       FROM order_items oi
       JOIN variants v ON oi.variant_id = v.id
       JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = $1`,
      [orderId]
    );

    res.status(200).json({ order, items: orderItems });
  } catch (err) {
    next(err);
  }
}

// Complete order (mark as paid and clear cart)
async function completeOrder(req, res, next) {
  try {
    const userId = parseInt(req.params.userId, 10);

    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    // Find the most recent pending order
    const { rows: pendingOrders } = await pool.query(
      `SELECT id FROM orders 
       WHERE user_id = $1 AND status = 'pending' 
       ORDER BY id DESC 
       LIMIT 1`,
      [userId]
    );

    if (pendingOrders.length === 0) {
      return res.status(404).json({ error: "No pending order found" });
    }

    const orderId = pendingOrders[0].id;

    // Mark as paid
    await pool.query(
      `UPDATE orders SET status = 'paid' WHERE id = $1`,
      [orderId]
    );

    // Clear cart
    await pool.query(`DELETE FROM carts WHERE userid = $1`, [userId]);

    res.json({ message: "Order completed successfully", orderId });
  } catch (err) {
    next(err);
  }
}

// Routes
orderRouter.get('/user/:userId', getOrdersByUser);
orderRouter.get('/:orderId', getOrderByOrderId);
orderRouter.post('/:userId/complete', completeOrder);

// Exports
module.exports = { orderRouter, getOrdersByUser, getOrderByOrderId, completeOrder };