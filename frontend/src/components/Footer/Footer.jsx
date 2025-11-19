import React from 'react';
import styles from './Footer.module.css';
import { FaInstagram, FaFacebook, FaTwitter } from 'react-icons/fa6';
import { HiSparkles } from 'react-icons/hi2';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.captionContainer}>
        <div className={styles.footerCaption}>
          <HiSparkles className={styles.logo} /> 
          <Link to='/'>
            <h4>Tresse</h4>
          </Link>
          <p>
            Premium hair, beauty, and self-care products for the modern woman. 
            Elegance meets quality.
          </p>

          <div className={styles.footerIcon}>
            <a 
              href="https://instagram.com" 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <FaInstagram />
            </a>
            <a 
              href="https://facebook.com" 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="Facebook"
            >
              <FaFacebook />
            </a>
            <a 
              href="https://twitter.com" 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="Twitter"
            >
              <FaTwitter />
            </a>
          </div>
        </div>

        <div className={styles.footerColumn}>
          <h5>Shop</h5> 
          <Link to='/category/Hair%20Care'>Hair Care</Link>
          <Link to='/category/Makeup'>Makeup</Link>
          <Link to='/category/Fragrances'>Fragrances</Link>
          <Link to='/category/Supplements'>Supplements</Link>
        </div>

        <div className={styles.footerColumn}>
          <h5>Customer Care</h5>
          <Link to='/contact'>Contact Us</Link>
          <Link to='/shipping'>Shipping & Returns</Link>
          <Link to='/faq'>FAQs</Link>
          <Link to='/track-order'>Track Order</Link>
          <Link to='/size-guide'>Size Guide</Link>
        </div>
      </div>

      <div className={styles.lastFooter}>
        <p>&copy; 2025 Tresse. All rights reserved.</p>
        <div className={styles.footerLinks}>
          <Link to='/privacy'>Privacy Policy</Link>
          <Link to='/terms'>Terms of Service</Link>
          <Link to='/cookies'>Cookie Policy</Link>
        </div>
      </div>
    </footer>
  );
}

export default Footer;