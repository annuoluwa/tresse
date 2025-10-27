import React from 'react';
import {FaHeart, FaUser, FaShoppingCart, FaSearch} from 'react-icons/fa'
import styles from './NavBar.module.css';
import { Link } from 'react-router-dom';


function NavBar({ cartCount, user, onLogout }) {

  return (
    <nav className={styles.navbar}>
      {/* Left: Logo */}
      <div className={styles.logo}>
        <Link to='/'>Tresse</Link>
      </div>

      {/* Center: Nav links */}
      <div className={styles.navLinks}>
        <Link to='/products'>Products</Link>
        <Link to='#'>Brands</Link>
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
          <button onClick={onLogout}>Logout</button>
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