import React from "react";
import { FaCheckCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import styles from "./SuccessPage.module.css";

function SuccessPage() {
  const navigate = useNavigate();

  return (
    <div className={styles.successPage}>
      <FaCheckCircle 
        className={styles.icon} 
        size={80} 
        color="var(--accent-blush)" 
        aria-hidden="true"
      />
      <h1>Payment Successful!</h1>
      <p>Thank you for your order. Your payment has been processed successfully.</p>
      <p className={styles.subtitle}>
        You will receive a confirmation email shortly with your order details.
      </p>
      
      <div className={styles.buttonGroup}>
        <button 
          className={styles.actionButton} 
          onClick={() => navigate("/order-history")}
        >
          View Order History
        </button>
        <button 
          className={styles.actionButton} 
          onClick={() => navigate("/")}
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
}

export default SuccessPage;