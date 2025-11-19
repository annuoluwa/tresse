import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Partners.module.css';

const API_URL = process.env.REACT_APP_API_URL;

const BRANDS = [
  "Remington",
  "Dyson",
  "Conair",
  "L'Oreal",
  "Moroccanoil",
  "Pantene",
  "Olaplex"
];

function Partners({ onBrandSelect }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Handle newsletter subscription
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsSubmitting(true);

    try {
      const res = await fetch(`${API_URL}/newsletter/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
        credentials: "include",
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message || "Thank you for subscribing!");
        setEmail(""); // Clear input on success
      } else {
        setMessage(data.error || data.message || "Subscription failed");
      }
    } catch (err) {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle brand selection
  const handleBrandClick = (brand) => {
    if (onBrandSelect) onBrandSelect(brand);
    navigate("/products");
  };

  return (
    <section className={styles.partners}>
      {/* Partner Brands */}
      <div className={styles.partnersContainer}>
        <div className={styles.partnersCaption}>
          <h3>Luxury Brands</h3>
          <p>We partner with the world's most prestigious beauty and hair care brands</p>
        </div>

        <div className={styles.partnersBtns} id="partners">
          {BRANDS.map((brand) => (
            <button
              key={brand}
              onClick={() => handleBrandClick(brand)}
              className={styles.partnerBtn}
              aria-label={`View ${brand} products`}
            >
              {brand}
            </button>
          ))}
        </div>
      </div>

      {/* Newsletter Subscription */}
      <div className={styles.joinContainer}>
        <div className={styles.joinCaption}>
          <h4>Join the Tresse Community</h4>
          <p>
            Subscribe to receive exclusive offers, beauty tips, and early access to new products.
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.subscribeForm}>
          <div className={styles.inputGroup}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              disabled={isSubmitting}
              aria-label="Email address"
            />
            <button
              type="submit"
              className={styles.subBtn}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Subscribing..." : "Subscribe"}
            </button>
          </div>
          {message && (
            <p
              className={
                message.includes("successful") || message.includes("Thank you")
                  ? styles.successMessage
                  : styles.errorMessage
              }
            >
              {message}
            </p>
          )}
        </form>
      </div>
    </section>
  );
}

export default Partners;