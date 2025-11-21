const express = require('express');
const cartRouter = express.Router();
const pool = require('../db');
const Stripe = require('stripe');
const isLoggedIn = require('../middleware/isLoggedIn');
const stripe = Stripe(process.env.STRIPE_SK);
const { body, validationResult } = require('express-validator');

// ====== VALIDATORS ======
const checkoutValidator = [
  body('shippingCost').optional().isNumeric().toInt(),
  body('shippingInfo.name').optional().trim().escape().isLength({ min: 2, max: 64 }),
  body('shippingInfo.email').optional().isEmail().normalizeEmail(),
  body('shippingInfo.address').optional().trim().escape().isLength({ min: 4, max: 128 }),
  body('shippingInfo.city').optional().trim().escape().isLength({ min: 2, max: 64 }),
  body('shippingInfo.postalCode').optional().trim().escape().isLength({ min: 2, max: 16 })
];

// ====== HANDLERS ======

// ADD TO CART
async function addToCart(req, res, next) {
  const userId = parseInt(req.params.userId, 10);
  const { productId, variantId, quantity = 1 } = req.body;

  if (isNaN(userId) || !productId || !variantId) {
    return res.status(400).json({ error: "Missing userId, productId, or variantId" });
  }

  try {
    const { rows } = await pool.query(
      `SELECT * FROM carts WHERE userid=$1 AND productid=$2 AND variantid=$3`,
      [userId, productId, variantId]
    );

    if (rows.length > 0) {
      await pool.query(
        `UPDATE carts SET quantity = quantity + $1 WHERE userid=$2 AND productid=$3 AND variantid=$4`,
        [quantity, userId, productId, variantId]
      );
    } else {
      await pool.query(
        `INSERT INTO carts (userid, productid, variantid, quantity) VALUES ($1,$2,$3,$4)`,
        [userId, productId, variantId, quantity]
      );
    }

    const cartRes = await pool.query(`SELECT * FROM carts WHERE userid=$1`, [userId]);
    res.status(200).json(cartRes.rows);
  } catch (err) {
    next(err);
  }
}

// UPDATE QUANTITY
async function updateQuantity(req, res, next) {
  try {
    const userId = parseInt(req.params.userId, 10);
    const productId = parseInt(req.params.productId, 10);
    const variantId = parseInt(req.params.variantId, 10);
    const { quantity } = req.body;

    if (isNaN(userId) || isNaN(productId) || isNaN(variantId) || quantity < 1) {
      return res.status(400).json({ error: "Invalid input" });
    }

    const updated = await pool.query(
      "UPDATE carts SET quantity = $1 WHERE userid = $2 AND productid = $3 AND variantid = $4 RETURNING *",
      [quantity, userId, productId, variantId]
    );

    if (updated.rows.length === 0) {
      return res.status(404).json({ error: "Cart item not found" });
    }

    res.json(updated.rows[0]);
  } catch (err) {
    next(err);
  }
}

// GET CART ITEMS
async function usersItemsInCartById(req, res, next) {
  try {
    const userId = parseInt(req.params.userId, 10);
    
    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid userId" });
    }

    const result = await pool.query(
      `SELECT c.productId, c.variantId, c.quantity, 
              p.name AS productName, p.image_url,
              v.price, v.stock_quantity, v.variant_type, v.variant_value
       FROM carts c
       JOIN variants v ON c.variantid = v.id
       JOIN products p ON c.productid = p.id
       WHERE c.userid = $1`,
      [userId]
    );

    res.status(200).json(result.rows);
  } catch (err) {
    next(err);
  }
}

// DELETE CART ITEMS
async function deleteCartbyUsersId(req, res, next) {
  try {
    const userId = parseInt(req.params.userId, 10);
    
    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid userId" });
    }

    const del = await pool.query("DELETE FROM carts WHERE userid = $1", [userId]);
    
    if (del.rowCount === 0) {
      return res.status(404).json({ error: "No cart items found" });
    }
    
    res.status(200).json({ message: "Cart cleared successfully" });
  } catch (err) {
    next(err);
  }
}

// CHECKOUT
async function checkout(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const userId = parseInt(req.params.userId, 10);
  const { shippingCost = 5 } = req.body;

  if (isNaN(userId)) {
    return res.status(400).json({ error: "Invalid user ID" });
  }

  try {
    const { rows: cartItems } = await pool.query(
      `SELECT c.productid, c.variantid, c.quantity, v.price, v.stock_quantity
       FROM carts c
       JOIN variants v ON c.variantid = v.id
       WHERE c.userid = $1`,
      [userId]
    );

    if (!cartItems.length) {
      return res.status(400).json({ error: "Your cart is empty" });
    }

    // Check stock availability
    const outOfStock = cartItems.find(
      item => Number(item.quantity) > Number(item.stock_quantity)
    );
    
    if (outOfStock) {
      return res.status(400).json({
        error: `Insufficient stock for product ${outOfStock.productid}`,
      });
    }

    // Calculate total
    const cartTotal = cartItems.reduce(
      (sum, item) => sum + Number(item.price) * Number(item.quantity),
      0
    );
    const totalAmount = Math.round((cartTotal + Number(shippingCost)) * 100);

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount,
      currency: "gbp",
      automatic_payment_methods: { enabled: true },
      metadata: { userId: userId.toString() },
    });

    // Create pending order
    await pool.query(
      `INSERT INTO orders (user_id, total_price, shipping_cost, status)
       VALUES ($1, $2, $3, 'pending')`,
      [userId, totalAmount / 100, shippingCost]
    );

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    next(err);
  }
}

// ====== ROUTES ======
cartRouter.post("/:userId", addToCart);
cartRouter.get("/:userId", usersItemsInCartById);
cartRouter.delete("/:userId", deleteCartbyUsersId);
cartRouter.put("/:userId/:productId/:variantId", updateQuantity);
cartRouter.post("/:userId/checkout", checkoutValidator, checkout);

// ====== EXPORTS ======
module.exports = {
  cartRouter,
  addToCart,
  usersItemsInCartById,
  deleteCartbyUsersId,
  updateQuantity,
  checkoutValidator,
  checkout
};
