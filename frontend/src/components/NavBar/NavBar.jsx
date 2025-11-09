import React, { useState, useEffect, useRef } from 'react';
import { FaUser, FaShoppingCart, FaSearch } from 'react-icons/fa';
import styles from './NavBar.module.css';
import { Link, useNavigate } from 'react-router-dom';
import { HiSparkles } from 'react-icons/hi2';

function NavBar({ cartCount, user, logoutHandler, onShowAllProducts }) {
  const [term, setTerm] = useState('');          // input value
  const [results, setResults] = useState([]);    // search results
  const searchRef = useRef(null);                // for outside-click detection
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
const [isMobile, setIsMobile] = useState(window.innerWidth <= 864);

//conditional mobile rendering
useEffect(() => {
  const handleResize = () => setIsMobile(window.innerWidth <= 864);
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);

  const API_URL = process.env.REACT_APP_API_URL;

  // Scroll to partners section
  const handleScrollToPartners = () => {
    const partnersSection = document.getElementById("partners");
    if (partnersSection) {
      const yOffset = -270; 
      const y = partnersSection.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  // Navigate to products page
  const handleProductsClick = () => {
    if (onShowAllProducts) onShowAllProducts();
    setTimeout(() => navigate("/products"), 0);
  };

  // Fetch search results from backend
  const handleSearch = async (searchTerm) => {
    if (!searchTerm) {
      setResults([]);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/products/search?term=${encodeURIComponent(searchTerm)}`);
      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error('Search error:', err);
    }
  };

  // Live search with debounce
  useEffect(() => {
    const timeout = setTimeout(() => {
      handleSearch(term);
    }, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [term]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setResults([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
  <nav className={styles.navbar}>
    {/* Logo */}
    <div className={styles.footerCaption}>
      <HiSparkles className={styles.logo} />
      <Link to="/"><h4>Tresse</h4></Link>
    </div>

    {/* Desktop NavLinks (always desktop) */}
    {!isMobile && (
      <div className={styles.navLinks}>
        <Link onClick={handleProductsClick}>Products</Link>
        <Link onClick={handleScrollToPartners}>Brands</Link>
        <Link to="#">About</Link>
      </div>
    )}

    {/* Right actions */}
    <div className={styles.actions} ref={searchRef}>
      {/* Desktop search only */}
      {!isMobile && (
        <div className={styles.searchWrapper}>
          <input
            type="text"
            placeholder="Search products..."
            className={styles.searchInput}
            value={term}
            onChange={(e) => setTerm(e.target.value)}
          />
          <button
            className={styles.search}
            onClick={() => {
              handleSearch(term);
              navigate(`/products?search=${encodeURIComponent(term)}`);
            }}
          >
            <FaSearch />
          </button>
          {results.length > 0 && (
            <ul className={styles.searchDropdown}>
              {results.map(item => (
                <li
                  key={item.id}
                  onClick={() => {
                    navigate(`/products/${item.id}`);
                    setResults([]);
                    setTerm('');
                  }}
                >
                  {item.name}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* User/Login */}
      {user ? (
        <button onClick={logoutHandler}>Logout</button>
      ) : (
        <Link to="/login">Login</Link>
      )}

      <Link to="/profile" className={styles.iconButton}>
        <FaUser />
      </Link>
      <Link to="/cart" className={styles.iconButton}>
        <FaShoppingCart />
        <span className={styles.cartCount}>{cartCount}</span>
      </Link>
    </div>

    {/* Mobile hamburger + menu (only render on mobile) */}
    {isMobile && (
      <>
        <button
          className={styles.hamburger}
          onClick={() => setMenuOpen(prev => !prev)}
          aria-label="Toggle menu"
        >
          <span className={styles.bar}></span>
          <span className={styles.bar}></span>
          <span className={styles.bar}></span>
        </button>

      {menuOpen && (
  <div className={styles.mobileMenu}>
    <div className={styles.searchWrapperMobile}>
      <input
        type="text"
        placeholder="Search products..."
        className={styles.searchInput}
        value={term}
        onChange={(e) => setTerm(e.target.value)}
      />
      <button
        className={styles.search}
        onClick={() => {
          handleSearch(term);
          navigate(`/products?search=${encodeURIComponent(term)}`);
          setMenuOpen(false); // <-- close menu after search
        }}
      >
        <FaSearch />
      </button>
    </div>

    <Link
      onClick={() => {
        handleProductsClick();
        setMenuOpen(false); // <-- close menu when clicked
      }}
    >
      Products
    </Link>
    <Link
      onClick={() => {
        handleScrollToPartners();
        setMenuOpen(false); // <-- close menu when clicked
      }}
    >
      Brands
    </Link>
    <Link
      onClick={() => setMenuOpen(false)} // closes menu for About
      to="#"
    >
      About
    </Link>
  </div>
)}
      </>
    )}
  </nav>
);

}

export default NavBar;