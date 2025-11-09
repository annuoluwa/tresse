import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Partners.module.css';

function Partners({onBrandSelect}) {
//subscribe logic
 const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

const API_URL = process.env.REACT_APP_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await fetch(`${API_URL}/newsletter/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
        credentials: "include",
      });

      const data = await res.json();
      setMessage(data.message || "Subscription successful!");
    } catch (err) {
      setMessage("Something went wrong. Please try again.");
    }
  };

const navigate = useNavigate();

  const handleBrandClick = (brand) => {
    onBrandSelect(brand);
    navigate("/products"); 
  };


    return (
        
        <section className={styles.partners}>       {/*partner brands*/}
            <div className={styles.partnersContainer}>
        <div className={styles.partnersCaption}>
            <h3>Luxury Brands</h3>
            <p>We partner with the world's most prestigious beauty and hair care brands</p>
        </div>
        
        <div className={styles.partnersBtns} id='partners'>
            <button onClick={() => handleBrandClick("Remington")}className={styles.partnerBtn}>Remington</button>
            <button onClick={() => handleBrandClick("Dyson")}className={styles.partnerBtn}>Dyson</button>
            <button onClick={() => handleBrandClick("Conair")}className={styles.partnerBtn}>Conair</button>
            <button onClick={() => handleBrandClick("L'Oreal")}className={styles.partnerBtn}>L'Oreal</button>
            <button onClick={() => handleBrandClick("Moroccanoil")}className={styles.partnerBtn}>Morroccanoil</button>
            <button onClick={() => handleBrandClick("Pantene")}className={styles.partnerBtn}>Pantene</button>
            <button onClick={() => handleBrandClick("Olaplex")}className={styles.partnerBtn}>Olaplex</button>
           
        </div>
        
        </div>


        <div className={styles.joinContainer}>
            <div className={styles.joinCaption}>
            <p>Join the Tresse community</p>
            <p>Subscribe to receive exclusive offers, beauty tips, and early access to new products.

</p>
</div>

{/*subscribe section */}
         <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        required
      />
      <button type="submit" className={styles.subBtn}>Subscribe</button>
      {message && <p>{message}</p>}
    </form>

        </div>
        </section>
    )
}

export default Partners;