import React, { useEffect, useState } from "react";
import styles from './OrderHistoryPage.module.css';

const API_URL = process.env.REACT_APP_API_URL;

function OrderHistoryPage({ currentUser }) {
  const [orderHistory, setOrderHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        const response = await fetch(`${API_URL}/order/user/${currentUser.id}`, {
          credentials: "include"
        });

        if (!response.ok) {
          throw new Error("Failed to fetch orders");
        }

        const data = await response.json();
        setOrderHistory(data);
      } catch (err) {
        setError(err.message || "Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className={styles.orderHistoryContainer}>
        <p className={styles.empty}>Please log in to view order history</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.orderHistoryContainer}>
        <p className={styles.loading}>Loading orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.orderHistoryContainer}>
        <p className={styles.error}>Error: {error}</p>
      </div>
    );
  }

  if (orderHistory.length === 0) {
    return (
      <div className={styles.orderHistoryContainer}>
        <h3 className={styles.empty}>You have no recent orders</h3>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusClass = (status) => {
    return status === 'paid' ? styles.statusPaid : styles.statusPending;
  };

  return (
    <div className={styles.orderHistoryContainer}>
      <h2 className={styles.title}>Order History</h2>

      {orderHistory.map((order) => (
        <div key={order.order_id} className={styles.orderCard}>
          <div className={styles.orderHeader}>
            <p className={styles.orderId}>Order #{order.order_id}</p>
            <p className={styles.orderDate}>{formatDate(order.order_date)}</p>
          </div>

          <div className={styles.orderDetails}>
            <div className={styles.detailRow}>
              <span>Total:</span>
              <span className={styles.total}>£{Number(order.total_price).toFixed(2)}</span>
            </div>
            <div className={styles.detailRow}>
              <span>Status:</span>
              <span className={getStatusClass(order.status)}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </div>
          </div>

          {order.items && order.items.length > 0 && (
            <div className={styles.orderItems}>
              <h4>Items ({order.items.length})</h4>
              <ul>
                {order.items.map((item) => (
                  <li key={item.order_item_id} className={styles.orderItem}>
                    <span>Product ID: {item.product_id}</span>
                    <span>Qty: {item.quantity}</span>
                    <span>£{Number(item.unit_price).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default OrderHistoryPage;