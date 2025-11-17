import React from "react";
import { FaShoppingCart } from "react-icons/fa";
import styles from './CartPage.module.css';
import { useNavigate } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL;
const TAX_RATE = 0.1; // 10% tax
const SHIPPING_FLAT = 5; // flat $5 shipping

function CartPage({ cartItems, setCartItems, userId }) {
  const navigate = useNavigate();

  // Remove a single unit from cart
  const decreaseQuantity = async (productId, variantId) => {
    const existingItem = cartItems.find(
      (item) => item.id === productId && item.selectedVariant?.id === variantId
    );
    if (!existingItem) return;

    if (existingItem.quantity > 1) {
      const updatedCart = cartItems.map((item) =>
        item.id === productId && item.selectedVariant?.id === variantId
          ? { ...item, quantity: item.quantity - 1 }
          : item
      );
      setCartItems(updatedCart);

      if (userId) {
        await fetch(`${API_URL}/cart/${userId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ product: existingItem }),
        });
      } else {
        localStorage.setItem("guestCart", JSON.stringify(updatedCart));
      }
    } else {
      removeFromCart(productId, variantId);
    }
  };

  // Increase quantity
  const increaseQuantity = async (product) => {
    const variant = product.selectedVariant;
    const existingIndex = cartItems.findIndex(
      (item) => item.id === product.id && item.selectedVariant?.id === variant.id
    );

    let updatedCart;
    if (existingIndex !== -1) {
      updatedCart = [...cartItems];
      updatedCart[existingIndex].quantity += 1;
    } else {
      updatedCart = [...cartItems, { ...product, quantity: 1 }];
    }

    setCartItems(updatedCart);

    if (userId) {
      await fetch(`${API_URL}/cart/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ product }),
      });
    } else {
      localStorage.setItem("guestCart", JSON.stringify(updatedCart));
    }
  };

  // Remove item completely
  const removeFromCart = async (productId, variantId) => {
    const updatedCart = cartItems.filter(
      (item) => item.id !== productId || item.selectedVariant?.id !== variantId
    );
    setCartItems(updatedCart);

    if (userId) {
      await fetch(`${API_URL}/cart/${userId}/${productId}`, {
        method: "DELETE",
        credentials: "include",
      });
    } else {
      localStorage.setItem("guestCart", JSON.stringify(updatedCart));
    }
  };

  // Calculate summary values- using a fallback check so that my calcuation always return a valid no before calling .toFixed()
  const subtotal = Array.isArray(cartItems)
  ? cartItems.reduce(
      (sum, item) =>
        sum + ((item.selectedVariant?.price || 0) * (item.quantity || 0)),
      0
    )
  : 0;

const tax = Number.isFinite(subtotal) ? subtotal * TAX_RATE : 0;
const shipping = Number.isFinite(subtotal) ? (subtotal > 50 ? 0 : SHIPPING_FLAT) : 0;
const total = subtotal + tax + shipping;


  if (cartItems.length === 0) {
    return (
      <div className={styles.cartPage}>
        <h2 className={styles.cartTitle}>Your Cart</h2>
        <div className={styles.emptyCart}>
          <FaShoppingCart className={styles.cartIcon} />
          <p className={styles.emptyText}>Your cart is empty</p>
          <p className={styles.emptyTextCaption}>
            Looks like you haven't added any items to your cart yet.
            Start shopping to discover our premium products.
          </p>
          <button
            className={styles.continueBtn}
            onClick={() => navigate("/")}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
    
  }

  return (
    <div className={styles.cartPage}>
      <h2 className={styles.cartTitle}>Your Cart</h2>
      <div className={styles.cartContent}>
        {/* Left column: Cart Items */}
        <ul className={styles.cartList}>
          {cartItems.map((item) => (
            <li
              key={item.id + (item.selectedVariant?.id || 0)}
              className={styles.cartItem}
            >
              <img src={item.imageUrl} alt={item.name} className={styles.cartImage} />
              <div className={styles.itemDetails}>
                <span className={styles.itemName}>{item.name}</span>
               <span className={styles.itemVariant}>
  {item.selectedVariant
    ? `${item.selectedVariant.variant_type}: ${item.selectedVariant.variant_value}`
    : "N/A"}
</span>
                <div className={styles.itemQuantityControls}>
                  <button onClick={() => decreaseQuantity(item.id, item.selectedVariant?.id)}>-</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => increaseQuantity(item)}>+</button>
                </div>
                <span className={styles.itemPrice}>
                  ${((item.selectedVariant?.price || 0) * item.quantity).toFixed(2)}
                </span>
              </div>
              <button
                className={styles.removeBtn}
                onClick={() => removeFromCart(item.id, item.selectedVariant?.id)}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>

        {/* Right column: Order Summary */}
        <div className={styles.orderSummary}>
          <h3>Order Summary</h3>
          <div className={styles.summaryLine}>
            <span>Subtotal:</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className={styles.summaryLine}>
            <span>Tax (10%):</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <div className={styles.summaryLine}>
            <span>Shipping:</span>
            <span>${shipping.toFixed(2)}</span>
          </div>
          <div className={styles.summaryTotal}>
            <span>Total:</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <button
            className={styles.checkoutBtn}
            onClick={() => navigate(`/checkout`)}
          >
            Proceed to Checkout
          </button>

            <button
            className={styles.checkoutBtn}
            onClick={() => navigate(`/products`)}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}

export default CartPage;
