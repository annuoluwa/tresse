import React from 'react';
import styles from './Footer.module.css';
import { FaInstagram, FaFacebook, FaTwitter } from 'react-icons/fa6';
import {HiSparkles} from 'react-icons/hi2'
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap" rel="stylesheet"></link>

function Footer() {

    return (
        <footer className={styles.footer}>
            <div>
            <div className={styles.captionContainer}>
                <div className={styles.footerCaption}>
                <HiSparkles className={styles.logo}/> 
               <a href='#'> <h4>Tresse</h4> </a>
                <p>Premium hair, beauty, 
                    and self-care products for the modern woman. 
                    Elegance meets quality.</p>
                

                <div className={styles.footerIcon}>
                <FaInstagram />
                <FaFacebook />
                <FaTwitter />
                </div>
                </div>

                <div className={styles.footer.shop}>
                    
                   <h5>Shop</h5> 
                   <a href='#'> Hair Care</a>
                   <a href='#'> Makeup </a>
                   <a href='#'> Fragrances </a>
                   <a href='#'> Supplements </a>
                    
                </div>

                <div className={styles.footerContact}>
                    
                        <h5> Customer Care </h5>
                        <a href='#'> Contact Us </a>
                        <a href='#'> Shipping & Returns </a>
                        <a href='#'> FAQs </a>
                        <a href='#'> Track Order </a>
                        <a href='#'> Size Guide </a>
                    
                </div>
                </div>

                <div className={styles.lastFooter}>
                    <p>&copy; 2025 Tresse. All rights reserved.</p>
                    <div className={styles.footerLinks}>
                    <a href='#'>Privacy Policy</a>
                    <a href='#'>Terms of Service</a>
                    <a href='#'>Cookie Policy</a>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer;