import React from "react";
import { FaShoppingCart } from "react-icons/fa";
import styles from './CartPage.module.css';
import { useNavigate } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL;

function CartPage({ cartItems, setCartItems, userId }) {
    const navigate = useNavigate();
  const removeFromCart = async (itemId) => {
    const updatedCart = cartItems.filter((item) => item.id !== itemId);
    setCartItems(updatedCart);

    // Update backend to correspond with frontend cart
    await fetch(`${API_URL}/cart/${userId}/${itemId}`, {
      method: "DELETE",
      credentials: "include",
    });
  };

  return (
    <div className={styles.cartPage}>
      <h2 className={styles.cartTitle}>Your Cart</h2>

      {cartItems.length === 0 ? (
        <div className={styles.emptyCart}>
          <FaShoppingCart className={styles.cartIcon} />

          <p className={styles.emptyText}>Your cart is empty</p>
          <p className={styles.emptyTextCaption}>Looks like you haven't added any items to your cart yet. 
            Start shopping to discover our premium products. </p>
            
    <button 
      className={styles.continueBtn}
      onClick={() => navigate("/")} 
    >
      Continue Shopping
    </button>
        </div>

      ) : (
        <ul className={styles.cartList}>
          {cartItems.map((item) => (
            <li key={item.id} className={styles.cartItem}>
              <span className={styles.itemName}>{item.name}</span>
              <span className={styles.itemPrice}>${item.price.toFixed(2)}</span>
              <button
                className={styles.removeBtn}
                onClick={() => removeFromCart(item.id)}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default CartPage;