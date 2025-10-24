import React from 'react';
import styles from './Footer.module.css';
import { FaInstagram, FaFacebook, FaTwitter } from 'react-icons/fa6';
import {HiSparkles} from 'react-icons/hi2';
import { Link } from 'react-router-dom';
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap" rel="stylesheet"></link>

function Footer() {

    return (
        <footer className={styles.footer}>
            <div>
            <div className={styles.captionContainer}>
                <div className={styles.footerCaption}>
                <HiSparkles className={styles.logo}/> 
               <Link to='/'> <h4>Tresse</h4> </Link>
                <p>Premium hair, beauty, 
                    and self-care products for the modern woman. 
                    Elegance meets quality.</p>
                

                <div className={styles.footerIcon}>
                <Link to='#'><FaInstagram /> </Link>
               <Link to='#'><FaFacebook /> </Link>
                <Link to='#'><FaTwitter /> </Link>
                </div>
                </div>

                <div className={styles.footerColumn}>
                    
                   <h5>Shop</h5> 
                   <Link to='#'> Hair Care</Link>
                   <Link to='#'> Makeup </Link>
                   <Link to='#'> Fragrances </Link>
                   <Link to='#'> Supplements </Link>
                    
                </div>

                <div className={styles.footerColumn}>
                    
                        <h5> Customer Care </h5>
                        < Link to='#'> Contact Us </Link>
                        <Link to='#'> Shipping & Returns </Link>
                        <Link to='#'> FAQs </Link>
                        <Link to='#'> Track Order </Link>
                        <Link to='#'> Size Guide </Link>
                    
                </div>
                </div>

                <div className={styles.lastFooter}>
                    <p>&copy; 2025 Tresse. All rights reserved.</p>
                    <div className={styles.footerLinks}>
                    <Link to='#'>Privacy Policy</Link>
                    <Link to='#'>Terms of Service</Link>
                    <Link to='#'>Cookie Policy</Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer;