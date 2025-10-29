import React from 'react';
import {FaHeart, FaUser, FaShoppingCart, FaSearch} from 'react-icons/fa'
import styles from './NavBar.module.css';
import { Link } from 'react-router-dom';


function NavBar({ cartCount, user, logoutHandler }) {

  const handleScrollToPartners = () => {
    const partnersSection = document.getElementById("partners");
    if (partnersSection) { 
    const yOffset = -270; // negative means scroll up less (adjust to your navbar height)
    const y = partnersSection.getBoundingClientRect().top + window.pageYOffset + yOffset;
    window.scrollTo({ top: y, behavior: "smooth" });
    }
  }

  return (
    <nav className={styles.navbar}>
      {/* Left: Logo */}
      <div className={styles.logo}>
        <Link to='/'>Tresse</Link>
      </div>

      {/* Center: Nav links */}
      <div className={styles.navLinks}>

        <Link to='/products'>Products</Link>
        <Link onClick={handleScrollToPartners}>Brands</Link>
        <Link to='#'>About</Link>
      </div>

      {/* Right: Search + Actions */}
      <div className={styles.actions}>
        <input
          type="text"
          placeholder="Search products..."
          className={styles.searchInput}
        />
        <button className={styles.search}><FaSearch /></button>

        {user ? (
          <>
          <span className={styles.user}>Hi, {user.name}</span>
          <button onClick={logoutHandler}>Logout</button>
          </>
        ) : (
          <Link to='/login'>Login</Link>
        )}
          
        <Link to='#' className={styles.iconButton}>
          <FaHeart />
        </Link>
        <Link to='/profile' className={styles.iconButton}>
          <FaUser />
        </Link>
        <Link to='/cart' className={styles.iconButton}>
          <FaShoppingCart />
          <span className={styles.cartCount}>{cartCount}</span>
        </Link>
      </div>
    </nav>
  );
}
export default NavBar;