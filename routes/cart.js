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

module.exports = cartRouter;