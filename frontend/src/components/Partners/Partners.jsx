import React from 'react';
import styles from './Partners.module.css';

function Partners() {
    return (
        <section className={styles.partners}>
            <div className={styles.partnersContainer}>
        <div className={styles.partnersCaption}>
            <h3>Luxury Brands</h3>
            <p>We partner with the world's most prestigious beauty and hair care brands</p>
        </div>
        
        <div className={styles.partnersBtns} id='partners'>
            <button className={styles.partnerBtn}>Remington</button>
            <button className={styles.partnerBtn}>Dyson</button>
            <button className={styles.partnerBtn}>Conair</button>
            <button className={styles.partnerBtn}>L'Oreal</button>
            <button className={styles.partnerBtn}>Morroccanoil</button>
            <button className={styles.partnerBtn}>Pantene</button>
            <button className={styles.partnerBtn}>Olaplex</button>
            <button className={styles.partnerBtn}>EIS</button>
        </div>
        
        </div>


        <div className={styles.joinContainer}>
            <div className={styles.joinCaption}>
            <p>Join the Tresse community</p>
            <p>Subscribe to receive exclusive offers, beauty tips, and early access to new products.

</p>
</div>

<input type='text' placeholder='Enter your email'>
</input> <button className={styles.subBtn}>Subscribe</button>

        </div>
        </section>
    )
}

export default Partners;