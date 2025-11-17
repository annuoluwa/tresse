import React, { useEffect, useState } from "react";
import styles from './OrderHistoryPage.module.css'

function OrderHistoryPage({currentUser}) {

    const [orderHistory, setOrderHistory] = useState([]);
    const [loading, setLoading] = useState(true)
    const API_URL = process.env.REACT_APP_API_URL

    useEffect(() => {
        
    if(!currentUser) return;
        async function fetchOrders() {
            
    try {
    const response= await fetch(`${API_URL}/order/${currentUser.id}`, {
        credentials: "include"
    })
    
    const data = await response.json();
    setOrderHistory(data);
    

    }catch (err) {

    }finally {
        setLoading(false)
    }

        }
        fetchOrders()
          }, [currentUser])

    if (!currentUser) return <p className={styles.empty}>Please login to view order history</p>;
    if (loading) return <p className={styles.loading}>Loading orders...</p>;
    

    return(
        < div className={styles.orderHistoryContainer}>
            {orderHistory.length === 0 && <h3>YOU have no recent order</h3>}

            {orderHistory.length >= 1 && orderHistory.map((order) => (
                <div key={order.id} className={styles.orderHistory}>
                    <p>Date: {order.order_date} </p>
                    <p>Total: {order.total_price}</p>
                    <p>Status: {order.status}</p>
                </div>
            ))}
            
        </div>

)
}

export default OrderHistoryPage;