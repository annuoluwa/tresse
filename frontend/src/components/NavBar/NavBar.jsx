import React from 'react';
import {createRoot} from 'react-dom/client';
import {FaHeart, FaUser, FaShoppingCart} from 'react-icons/fa'
import styles from './NavBar.module.css';


function NavBar({cartCount, user}) {

    return(
      <nav>
         {/*left side: Logo*/}
         <div className={styles.navbar}> 
            <button>Tresse</button>
         </div>

         {/*Center: Nav links */}
         <div className={styles.navLinks}>
            <button>Products</button>
            <button>Brands</button>
            <button>About</button>
         </div>

         {/* Right: Search, Profile/Login, Wishlist, Cart*/}
         <div className={styles.actions}>
            <input type='text' placeholder='Search products...' className={styles.searchInput}></input>
            <button>Search</button>

            {user ? (
               <span className={styles.user}>Hi, {user.name}</span>
            ) : (
               <button>Login</button>
            )}
            {/*icon buttons */}
            <button className={styles.iconButton}><FaHeart /></button>
            <button className={styles.iconButton}><FaUser/></button>
            <button className={styles.iconButton}><FaShoppingCart/>
            <span className={styles.cartCount}>{cartCount}</span>
            </button>
            
         </div>
      </nav>
    )
       
}

export default NavBar;