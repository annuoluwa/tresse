import React from "react";
import { FaCheckCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import styles from "./SuccessPage.module.css";

const SuccessPage = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.successPage}>
      <FaCheckCircle className={styles.icon} size={80} color="var(--accent-blush)" />
      <h1>Payment Successful!</h1>
      <p>Thank you for your order. Your payment has been processed successfully.</p>
      
      <button className={styles.homeButton} onClick={() => navigate("/")}>
        Back to Home
      </button>
    </div>
  );
};

export default SuccessPage;