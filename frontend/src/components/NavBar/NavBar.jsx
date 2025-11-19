import React, { useState, useEffect, useRef } from 'react';
import { FaUser, FaShoppingCart, FaSearch } from 'react-icons/fa';
import styles from './NavBar.module.css';
import { Link, useNavigate } from 'react-router-dom';
import { HiSparkles } from 'react-icons/hi2';

const API_URL = process.env.REACT_APP_API_URL;

function NavBar({ cartCount, user, logoutHandler, onShowAllProducts }) {
  const [term, setTerm] = useState('');
  const [results, setResults] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 864);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  // Handle window resize for mobile detection
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 864);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    navigate("/products");
  };

  // Fetch search results from backend
  const handleSearch = async (searchTerm) => {
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }

    try {
      const res = await fetch(
        `${API_URL}/products/search?term=${encodeURIComponent(searchTerm)}`,
        { credentials: 'include' }
      );
      if (!res.ok) throw new Error('Search failed');
      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error('Search error:', err);
      setResults([]);
    }
  };

  // Execute search and navigate
  const executeSearch = () => {
    if (term.trim()) {
      navigate(`/products?search=${encodeURIComponent(term)}`);
      setResults([]);
      setMenuOpen(false);
    }
  };

  // Live search with debounce
  useEffect(() => {
    const timeout = setTimeout(() => {
      handleSearch(term);
    }, 300);
    return () => clearTimeout(timeout);
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

  // Handle product click from search results
  const handleProductClick = (productId) => {
    navigate(`/products/${productId}`);
    setResults([]);
    setTerm('');
    setMenuOpen(false);
  };

  // Close mobile menu
  const closeMobileMenu = () => setMenuOpen(false);

  return (
    <nav className={styles.navbar}>
      {/* Logo */}
      <div className={styles.footerCaption}>
        <HiSparkles className={styles.logo} />
        <Link to="/">
          <h4>Tresse</h4>
        </Link>
      </div>

      {/* Desktop Navigation Links */}
      {!isMobile && (
        <div className={styles.navLinks}>
          <Link to="/products" onClick={handleProductsClick}>
            Products
          </Link>
          <Link to="#brands" onClick={handleScrollToPartners}>
            Brands
          </Link>
          <Link to="/about">About</Link>
        </div>
      )}

      {/* Right Actions */}
      <div className={styles.actions}>
        {/* Desktop Search */}
        {!isMobile && (
          <div className={styles.searchWrapper} ref={searchRef}>
            <input
              type="text"
              placeholder="Search products..."
              className={styles.searchInput}
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && executeSearch()}
              aria-label="Search products"
            />
            <button
              className={styles.search}
              onClick={executeSearch}
              aria-label="Submit search"
            >
              <FaSearch />
            </button>

            {/* Search Results Dropdown */}
            {results.length > 0 && (
              <ul className={styles.searchDropdown}>
                {results.map((item) => (
                  <li
                    key={item.id}
                    onClick={() => handleProductClick(item.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && handleProductClick(item.id)}
                  >
                    <img 
                      src={item.imageUrl} 
                      alt={item.name} 
                      className={styles.searchResultImage}
                    />
                    <div>
                      <strong>{item.name}</strong>
                      <span className={styles.searchBrand}>{item.brand}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* User Actions */}
        {user ? (
          <button onClick={logoutHandler} className={styles.logoutBtn}>
            Logout
          </button>
        ) : (
          <Link to="/login" className={styles.loginLink}>
            Login
          </Link>
        )}

        <Link to="/profile" className={styles.iconButton} aria-label="Profile">
          <FaUser />
        </Link>

        <Link to="/cart" className={styles.iconButton} aria-label="Shopping cart">
          <FaShoppingCart />
          {cartCount > 0 && <span className={styles.cartCount}>{cartCount}</span>}
        </Link>
      </div>

      {/* Mobile Menu */}
      {isMobile && (
        <>
          <button
            className={styles.hamburger}
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
          >
            <span className={styles.bar}></span>
            <span className={styles.bar}></span>
            <span className={styles.bar}></span>
          </button>

          {menuOpen && (
            <div className={styles.mobileMenu}>
              {/* Mobile Search */}
              <div className={styles.searchWrapperMobile}>
                <input
                  type="text"
                  placeholder="Search products..."
                  className={styles.searchInput}
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && executeSearch()}
                  aria-label="Search products"
                />
                <button
                  className={styles.search}
                  onClick={executeSearch}
                  aria-label="Submit search"
                >
                  <FaSearch />
                </button>
              </div>

              {/* Mobile Navigation Links */}
              <Link
                to="/products"
                onClick={() => {
                  handleProductsClick();
                  closeMobileMenu();
                }}
              >
                Products
              </Link>
              <Link
                to="#brands"
                onClick={() => {
                  handleScrollToPartners();
                  closeMobileMenu();
                }}
              >
                Brands
              </Link>
              <Link to="/about" onClick={closeMobileMenu}>
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