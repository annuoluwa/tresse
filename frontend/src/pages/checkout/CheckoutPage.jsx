import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { FaCheckCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import styles from "./CheckoutPage.module.css";

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);
const API_URL = process.env.REACT_APP_API_URL;
const TAX_RATE = 0.1;

const CheckoutForm = ({
  cartItems,
  setCartItems,
  shippingCost,
  currentUser,
  clientSecret,
  setClientSecret,
  shippingInfo,
  setShippingInfo,
  setShippingCost,
  setOrderCompleted
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();

  const [totals, setTotals] = useState({ subtotal: 0, tax: 0, total: 0 });
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const subtotal = cartItems.reduce(
      (sum, item) => sum + (item.price || 0) * (item.quantity || 0), 
      0
    );
    const tax = subtotal * TAX_RATE;
    const total = subtotal + tax + shippingCost;
    setTotals({ subtotal, tax, total });
  }, [cartItems, shippingCost]);

  const isShippingValid = () => {
    const { name, email, address, city, postalCode } = shippingInfo;
    return name && email && address && city && postalCode;
  };

  const handlePlaceOrder = async () => {
    if (!currentUser || cartItems.length === 0) {
      setError("Cart is empty");
      return;
    }

    if (!isShippingValid()) {
      setError("Please fill in all shipping fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/cart/${currentUser.id}/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ shippingCost, shippingInfo }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to create payment intent");
      }

      setClientSecret(data.clientSecret);
    } catch (err) {
      setError(err.message || "Failed to process order");
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!stripe || !elements) return;
    
    setLoading(true);
    setError("");
    setOrderSuccess(null);

    try {
      const result = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      const res = await fetch(`${API_URL}/order/${currentUser.id}/complete`, {
        method: "POST",
        credentials: "include"
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to complete order");
      }

      setCartItems([]);
      setOrderCompleted(true);
      setOrderSuccess({ message: "Payment successful! Redirecting..." });

      setTimeout(() => navigate("/success"), 1500);

    } catch (err) {
      setError(err.message || "Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.checkoutPage}>
      <div className={styles.formColumn}>
        <h3>Shipping Information</h3>
        <input
          type="text"
          placeholder="Full Name"
          value={shippingInfo.name}
          onChange={(e) => setShippingInfo({ ...shippingInfo, name: e.target.value })}
          required
          aria-label="Full name"
        />
        <input
          type="email"
          placeholder="Email"
          value={shippingInfo.email}
          onChange={(e) => setShippingInfo({ ...shippingInfo, email: e.target.value })}
          required
          aria-label="Email address"
        />
        <input
          type="text"
          placeholder="Address"
          value={shippingInfo.address}
          onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
          required
          aria-label="Street address"
        />
        <input
          type="text"
          placeholder="City"
          value={shippingInfo.city}
          onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
          required
          aria-label="City"
        />
        <input
          type="text"
          placeholder="Postal Code"
          value={shippingInfo.postalCode}
          onChange={(e) => setShippingInfo({ ...shippingInfo, postalCode: e.target.value })}
          required
          aria-label="Postal code"
        />

        <h3>Shipping Method</h3>
        <label>
          <input
            type="radio"
            name="shipping"
            value={5}
            checked={shippingCost === 5}
            onChange={(e) => setShippingCost(Number(e.target.value))}
          />
          Standard Shipping (£5)
        </label>
        <label>
          <input
            type="radio"
            name="shipping"
            value={10}
            checked={shippingCost === 10}
            onChange={(e) => setShippingCost(Number(e.target.value))}
          />
          Express Shipping (£10)
        </label>

        {!clientSecret ? (
          <button
            onClick={handlePlaceOrder}
            disabled={loading}
            className={styles.placeOrderBtn}
          >
            {loading ? "Processing..." : "Place Order"}
          </button>
        ) : (
          <>
            <h3>Payment Details</h3>
            <div className={styles.paymentElement}>
              <PaymentElement />
            </div>
            <button
              onClick={handlePayment}
              disabled={loading || !stripe || !elements}
              className={styles.payNowBtn}
            >
              {loading ? "Processing Payment..." : "Pay Now"}
            </button>
          </>
        )}

        {orderSuccess && (
          <p className={styles.successMsg}>
            <FaCheckCircle /> {orderSuccess.message}
          </p>
        )}

        {error && <p className={styles.errorMsg}>{error}</p>}
      </div>

      <div className={styles.summaryColumn}>
        <h3>Order Summary</h3>
        <div className={styles.summaryLine}>
          <span>Subtotal:</span>
          <span>£{totals.subtotal.toFixed(2)}</span>
        </div>
        <div className={styles.summaryLine}>
          <span>Tax ({(TAX_RATE * 100).toFixed(0)}%):</span>
          <span>£{totals.tax.toFixed(2)}</span>
        </div>
        <div className={styles.summaryLine}>
          <span>Shipping:</span>
          <span>£{shippingCost.toFixed(2)}</span>
        </div>
        <div className={styles.summaryTotal}>
          <span>Total:</span>
          <span>£{totals.total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

const CheckoutPageWrapper = ({
  currentUser,
  cartItems,
  setCartItems,
  shippingCost,
  setShippingCost,
}) => {
  const [clientSecret, setClientSecret] = useState(null);
  const [orderCompleted, setOrderCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [shippingInfo, setShippingInfo] = useState({
    name: "",
    email: "",
    address: "",
    city: "",
    postalCode: "",
  });

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const fetchCart = async () => {
      try {
        const res = await fetch(`${API_URL}/cart/${currentUser.id}`, {
          credentials: "include",
        });
        
        if (!res.ok) {
          throw new Error("Failed to fetch cart");
        }
        
        const data = await res.json();
        setCartItems(data);
      } catch (err) {
        console.error("Cart fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (cartItems.length === 0 && !orderCompleted) {
      fetchCart();
    } else {
      setLoading(false);
    }
  }, [currentUser, orderCompleted, cartItems.length, setCartItems]);

  if (loading) {
    return (
      <div className={styles.checkoutPage}>
        <p className={styles.loading}>Loading checkout...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className={styles.checkoutPage}>
        <p className={styles.empty}>Please log in to proceed to checkout.</p>
      </div>
    );
  }

  if (cartItems.length === 0 && !orderCompleted) {
    return (
      <div className={styles.checkoutPage}>
        <p className={styles.empty}>Your cart is empty.</p>
      </div>
    );
  }

  const commonProps = {
    cartItems,
    setCartItems,
    shippingCost,
    setShippingCost,
    currentUser,
    clientSecret,
    setClientSecret,
    shippingInfo,
    setShippingInfo,
    setOrderCompleted
  };

  return clientSecret ? (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <CheckoutForm {...commonProps} />
    </Elements>
  ) : (
    <CheckoutForm {...commonProps} />
  );
};

export default CheckoutPageWrapper;