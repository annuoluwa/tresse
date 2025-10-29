const express = require('express');
const cartRouter = express.Router();
const pool = require('../db');
const Stripe = require('stripe');
const { isLoggedIn } = require('./users');
const stripe = Stripe(process.env.STRIPE_SK);

// ----------------------- ADD TO CART -----------------------
async function addToCart(req, res, next) {
  const userId = parseInt(req.params.userId, 10);
  const { productId, variantId, quantity = 1 } = req.body;

  if (isNaN(userId) || !productId || !variantId) {
    return res.status(400).json({ error: "Missing userId, productId, or variantId" });
  }

  try {
    // Check if item already in cart
    const { rows } = await pool.query(
      `SELECT * FROM carts WHERE userid=$1 AND productid=$2 AND variantid=$3`,
      [userId, productId, variantId]
    );

    if (rows.length > 0) {
      // Update quantity
      await pool.query(
        `UPDATE carts SET quantity = quantity + $1 WHERE userid=$2 AND productid=$3 AND variantid=$4`,
        [quantity, userId, productId, variantId]
      );
    } else {
      // Insert new cart item
      await pool.query(
        `INSERT INTO carts (userid, productid, variantid, quantity) VALUES ($1,$2,$3,$4)`,
        [userId, productId, variantId, quantity]
      );
    }

    // Return updated cart
    const cartRes = await pool.query(`SELECT * FROM carts WHERE userid=$1`, [userId]);
    res.status(200).json(cartRes.rows);
  } catch (err) {
    console.error("Add to cart error:", err);
    res.status(500).json({ error: "Server error while adding to cart" });
  }
}

// ----------------------- UPDATE QUANTITY -----------------------
async function updateQuantity(req, res, next) {
  try {
    let { userId, productId, variantId } = req.params;
    const { quantity } = req.body;

    userId = parseInt(userId, 10);
    productId = parseInt(productId, 10);
    variantId = parseInt(variantId, 10);

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

// ----------------------- GET CART ITEMS -----------------------
async function usersItemsInCartById(req, res, next) {
  try {
    let { userId } = req.params;
    userId = parseInt(userId, 10);
    if (isNaN(userId)) return res.status(400).json({ error: "Invalid userId" });

    const result = await pool.query(
      `SELECT c.productId, c.variantId, c.quantity, p.name AS productName, v.price, v.stock_quantity, v.variant_type, v.variant_value
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

// ----------------------- DELETE CART ITEMS -----------------------
async function deleteCartbyUsersId(req, res, next) {
  try {
    let { userId } = req.params;
    userId = parseInt(userId, 10);
    if (isNaN(userId)) return res.status(400).json({ error: "Invalid userId" });

    const del = await pool.query("DELETE FROM carts WHERE userid = $1", [userId]);
    if (del.rowCount === 0) {
      return res.status(404).json({ error: "No cart items" });
    } else {
      return res.status(200).json({ message: "Cart emptied" });
    }
  } catch (err) {
    next(err);
  }
}



// ----------------------- CHECKOUT -----------------------
async function checkout(req, res, next) {
  const userId = parseInt(req.params.userId, 10);
  const { shippingCost = 5 } = req.body;

  if (isNaN(userId)) return res.status(400).json({ error: "Invalid user ID" });

  try {
    console.log(`Checkout invoked for user: ${userId}`);

    const { rows: cartItems } = await pool.query(
      `SELECT c.productid, c.variantid, c.quantity, v.price, v.stock_quantity
       FROM carts c
       JOIN variants v ON c.variantid = v.id
       WHERE c.userid = $1`,
      [userId]
    );

    if (!cartItems.length) {
      return res.status(400).json({ error: "Your cart is empty." });
    }
    //check stock
    const outOfStock = cartItems.find(
      item => Number(item.quantity) > Number(item.stock_quantity)
    );
    if (outOfStock) {
      return res.status(400).json({
        error: `Product ${outOfStock.productid} is out of stock.`,
      });
    }
    //calculate total
    const cartTotal = cartItems.reduce(
      (sum, item) => sum + Number(item.price) * Number(item.quantity),
      0
    );
    const totalAmount = (cartTotal + Number(shippingCost)) * 100;

      //create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount),
      currency: "gbp",
      automatic_payment_methods: { enabled: true },
      metadata: { userId },
    });

  
    await pool.query(
      `INSERT INTO orders (user_id, total_price, shipping_cost, status)
      VALUES ($1, $2, $3, 'pending')`,
      [userId, totalAmount / 100, shippingCost]
);
    //await pool.query("DELETE FROM carts WHERE userid = $1", [userId]);
    //console.log(`Cart cleared for user ${userId}`);

    res.json({ clientSecret: paymentIntent.client_secret });

  } catch (error) {
    console.error("❌ Checkout error:", error);
    res.status(500).json({ error: "Server error during checkout." });
  }
}



// ----------------------- ROUTES -----------------------
cartRouter.post("/:userId", async (req, res, next) => {
  req.body.userId = req.params.userId;
  await addToCart(req, res, next);
});
cartRouter.get('/:userId',  usersItemsInCartById);
cartRouter.delete('/:userId', deleteCartbyUsersId);
cartRouter.put('/:userId/:productId/:variantId', updateQuantity);
cartRouter.post('/:userId/checkout', checkout);

// ----------------------- EXPORT -----------------------
module.exports = {
  cartRouter,
  addToCart,
  usersItemsInCartById,
  deleteCartbyUsersId,
  updateQuantity,
  checkout
};
