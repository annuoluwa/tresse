import React from 'react';
import {FaHeart, FaUser, FaShoppingCart, FaSearch} from 'react-icons/fa'
import styles from './NavBar.module.css';


function NavBar({ cartCount, user }) {

  return (
    <nav className={styles.navbar}>
      {/* Left: Logo */}
      <div className={styles.logo}>
        <button>Tresse</button>
      </div>

      {/* Center: Nav links */}
      <div className={styles.navLinks}>
        <button>Products</button>
        <button>Brands</button>
        <button>About</button>
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
          <span className={styles.user}>Hi, {user.name}</span>
        ) : (
          <button>Login</button>
        )}

        <button className={styles.iconButton}>
          <FaHeart />
        </button>
        <button className={styles.iconButton}>
          <FaUser />
        </button>
        <button className={styles.iconButton}>
          <FaShoppingCart />
          <span className={styles.cartCount}>{cartCount}</span>
        </button>
      </div>
    </nav>
  );
}
export default NavBar;