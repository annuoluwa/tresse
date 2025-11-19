import React from "react";
import { FaShoppingCart } from "react-icons/fa";
import styles from './CartPage.module.css';
import { useNavigate } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL;
const TAX_RATE = 0.1; // 10% tax
const SHIPPING_FLAT = 5; // $5 flat shipping
const FREE_SHIPPING_THRESHOLD = 50;

function CartPage({ cartItems, setCartItems, userId }) {
  const navigate = useNavigate();

  // Decrease quantity by 1
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
      await updateCart(updatedCart, existingItem);
    } else {
      removeFromCart(productId, variantId);
    }
  };

  // Increase quantity by 1
  const increaseQuantity = async (product) => {
    const variant = product.selectedVariant;
    const existingIndex = cartItems.findIndex(
      (item) => item.id === product.id && item.selectedVariant?.id === variant?.id
    );

    let updatedCart;
    if (existingIndex !== -1) {
      updatedCart = [...cartItems];
      updatedCart[existingIndex].quantity += 1;
    } else {
      updatedCart = [...cartItems, { ...product, quantity: 1 }];
    }

    setCartItems(updatedCart);
    await updateCart(updatedCart, product);
  };

  // Remove item from cart
  const removeFromCart = async (productId, variantId) => {
    const updatedCart = cartItems.filter(
      (item) => !(item.id === productId && item.selectedVariant?.id === variantId)
    );
    setCartItems(updatedCart);

    if (userId) {
      try {
        await fetch(`${API_URL}/cart/${userId}/${productId}`, {
          method: "DELETE",
          credentials: "include",
        });
      } catch (err) {
        console.error('Failed to remove item:', err);
      }
    } else {
      localStorage.setItem("guestCart", JSON.stringify(updatedCart));
    }
  };

  // Update cart (backend or localStorage)
  const updateCart = async (updatedCart, product) => {
    if (userId) {
      try {
        await fetch(`${API_URL}/cart/${userId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ product }),
        });
      } catch (err) {
        console.error('Failed to update cart:', err);
      }
    } else {
      localStorage.setItem("guestCart", JSON.stringify(updatedCart));
    }
  };

  // Calculate totals
  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.selectedVariant?.price || 0) * (item.quantity || 0),
    0
  );
  const tax = subtotal * TAX_RATE;
  const shipping = subtotal > FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT;
  const total = subtotal + tax + shipping;

  // Empty cart state
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
        {/* Cart Items */}
        <ul className={styles.cartList}>
          {cartItems.map((item) => (
            <li
              key={`${item.id}-${item.selectedVariant?.id || 0}`}
              className={styles.cartItem}
            >
              <img 
                src={item.imageUrl} 
                alt={item.name} 
                className={styles.cartImage} 
              />
              <div className={styles.itemDetails}>
                <span className={styles.itemName}>{item.name}</span>
                <span className={styles.itemVariant}>
                  {item.selectedVariant
                    ? `${item.selectedVariant.variant_type}: ${item.selectedVariant.variant_value}`
                    : "Standard"}
                </span>
                <div className={styles.itemQuantityControls}>
                  <button 
                    onClick={() => decreaseQuantity(item.id, item.selectedVariant?.id)}
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button 
                    onClick={() => increaseQuantity(item)}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
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

        {/* Order Summary */}
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
            <span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
          </div>
          {subtotal > 0 && subtotal < FREE_SHIPPING_THRESHOLD && (
            <p className={styles.shippingNote}>
              Add ${(FREE_SHIPPING_THRESHOLD - subtotal).toFixed(2)} more for free shipping!
            </p>
          )}
          <div className={styles.summaryTotal}>
            <span>Total:</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <button
            className={styles.checkoutBtn}
            onClick={() => navigate('/checkout')}
          >
            Proceed to Checkout
          </button>
          <button
            className={styles.continueBtn}
            onClick={() => navigate('/products')}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}

export default CartPage;
