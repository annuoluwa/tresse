const express = require('express');
const cartRouter =  express.Router();
const pool = require('../db');


cartRouter.post('/', async (req, res, next) => {
    const {userId, productId } = req.body;
    try{
        //check if product is in cart
        const check = await pool.query(
            "SELECT * FROM carts WHERE userId = $1 AND productId = $2", [userId, productId]
        );
    if(check.rows.length > 0) {
        //if exist, update quantity
        const updated = await pool.query(
            "UPDATE carts SET quantity = quantity + 1 WHERE userId = $1 AND productId = $2 RETURNING *",
            [userId, productId]
        );
        res.json(updated.rows[0])
    }else {
        //if not exist, insert new item
        const inserted = await pool.query("INSERT INTO carts (userId, productId, quantity) VALUES ( $1, $2, $3 ) RETURNING *", [userId, productId, 1] );
        res.json(inserted.rows[0]);
    }
} catch (err) {
        next(err)
    }
});

cartRouter.get('/:userId', async(req, res, next) => {
    try{
    const {userId} = req.params;
    const result = await pool.query("SELECT * FROM carts WHERE userId = $1", [userId])
    res.status(200).json(result.rows)
    } catch (err){
        res.status(500).json({error: "Server error while fetching cart"})
    }
});


cartRouter.delete('/:userId', async(req, res, next) => {
    try{
        const {userId} = req.params;
        const del = await pool.query("DELETE FROM carts WHERE userId = $1", [userId]);
        if(del.rowCount === 0) {
            return res.status(404).json({error: "No cart items"})
        } else {
            return res.status(200).json({message: "cart emptied"})
        }
    } catch(err) {
        next(err)
    };
});

//checkout endpoint

cartRouter.post('/:userId/checkout', async(req, res, next)=>{
    const {userId } = req.params; //Get userId from the request URL
    try{
        //Get cart items for this user, plus their variant details (price + stock)
        const {rows: cartItems} = await pool.query( "SELECT c.productid, c.quantity, v.id AS variant_id, v.stock_quantity, v.price FROM carts c JOIN variants v ON c.productId = v.product_id WHERE c.userId = $1", [userId])
        
        //if no cart items, stop here
        if(cartItems.length === 0) {
            return res.status(400).json({error: "cart is empty"});
        }
        
        //check product availability 
        for(let item of cartItems) {
            if(item.stock_quantity < item.quantity) {
                return res.status(400).json({
                    error: `Product ${item.productId} is out of stock`
                })
            }
        }
    // create a new order with "PAID status"
        const orderResult= await pool.query(
            "INSERT INTO orders (user_id, status, total_price) VALUES ($1, $2, $3) RETURNING *", [userId, 'paid', 0]); //start with 0, update later
        const order = orderResult.rows[0]; //The new order row from DB
    
        //if available, create new order
        let totalPrice = 0; //keep track of the order total
        for(let item of cartItems) {
            const itemTotal = item.price * item.quantity;
            totalPrice += itemTotal;
    await pool.query("INSERT INTO order_items( order_id, product_id, variant_id, quantity, unit_price) VALUES ($1, $2, $3, $4, $5) RETURNING *", [order.id, item.productid, item.variant_id, item.quantity, item.price]);
          await pool.query("UPDATE variants SET stock_quantity = stock_quantity - $1 WHERE id = $2", [item.quantity, item.variant_id]);
        }  
//Update total price in orders
        await pool.query(
            "UPDATE orders SET total_price = $1 WHERE id = $2", [totalPrice, order.id]
        );
//clear user cart
        await pool.query("DELETE FROM carts WHERE userId = $1", [userId]);
           return res.status(200).json({message: "Checkout successful", orderId: order.id, totalPrice});
        } catch(err) {
            next(err)
        }
    });

module.exports = cartRouter;