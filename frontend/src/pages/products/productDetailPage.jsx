import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from './ProductDetailPage.module.css';

const API_URL = process.env.REACT_APP_API_URL;

function ProductDetails({ addToCart }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVariantId, setSelectedVariantId] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch product details
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${API_URL}/products/${id}`, {
          credentials: 'include'
        });

        if (!res.ok) {
          throw new Error(res.status === 404 ? 'Product not found' : 'Failed to load product');
        }

        const data = await res.json();
        setProduct(data);

        // Set default variant
        if (data.variants?.length > 0) {
          setSelectedVariantId(data.variants[0].id);
        }
      } catch (err) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle add to cart
  const handleAddToCart = () => {
    if (!product || !selectedVariantId) return;

    const variant = product.variants.find(v => v.id === selectedVariantId);
    if (!variant) return;

    const cartProduct = {
      id: product.id,
      name: product.name,
      imageUrl: product.main_page_url,
      variant_type: variant.variant_type,
      variant_variant_value: variant.variant_value,
      price: variant.price,
      selectedVariant: variant,
    };

    addToCart(cartProduct);
    setAddedToCart(true);

    // Reset feedback after 2 seconds
    setTimeout(() => setAddedToCart(false), 2000);
  };

  // Loading state
  if (loading) {
    return (
      <div className={styles.productDetailPage}>
        <p className={styles.loading}>Loading product...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={styles.productDetailPage}>
        <p className={styles.error}>Error: {error}</p>
        <button onClick={() => navigate('/products')} className={styles.backBtn}>
          Back to Products
        </button>
      </div>
    );
  }

  // Product not found
  if (!product) {
    return (
      <div className={styles.productDetailPage}>
        <p className={styles.error}>Product not found</p>
        <button onClick={() => navigate('/products')} className={styles.backBtn}>
          Back to Products
        </button>
      </div>
    );
  }

  const currentVariant = product.variants?.find(v => v.id === selectedVariantId);

  return (
    <div className={styles.productDetailPage}>
      <div className={styles.productHeader}>
        <h1>{product.name}</h1>
        {product.brand && <p className={styles.brand}>{product.brand}</p>}
      </div>

      <img 
        src={product.main_page_url} 
        alt={product.name} 
        className={styles.image}
        loading="lazy"
      />

      <p className={styles.description}>{product.description}</p>

      {/* Variant Selection */}
      {product.variants?.length > 0 && (
        <div className={styles.variantContainer} ref={dropdownRef}>
          <label htmlFor="variant-dropdown">Choose variant:</label>

          <div
            id="variant-dropdown"
            className={styles.variantDropdown}
            onClick={() => setDropdownOpen(!dropdownOpen)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && setDropdownOpen(!dropdownOpen)}
            aria-expanded={dropdownOpen}
          >
            <span className={styles.selectedVariant}>
              {currentVariant
                ? `${currentVariant.variant_type}: ${currentVariant.variant_value} - £${Number(currentVariant.price).toFixed(2)}`
                : "Select a variant"}
            </span>
            <span className={styles.dropdownArrow}>{dropdownOpen ? "▲" : "▼"}</span>

            {dropdownOpen && (
              <ul className={styles.dropdownList}>
                {product.variants.map((v) => (
                  <li
                    key={v.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedVariantId(v.id);
                      setDropdownOpen(false);
                    }}
                    className={v.id === selectedVariantId ? styles.activeVariant : ""}
                    role="option"
                    aria-selected={v.id === selectedVariantId}
                  >
                    {v.variant_type}: {v.variant_value} - £{Number(v.price).toFixed(2)}
                    {v.stock_quantity < 5 && v.stock_quantity > 0 && (
                      <span className={styles.lowStock}> (Only {v.stock_quantity} left)</span>
                    )}
                    {v.stock_quantity === 0 && (
                      <span className={styles.outOfStock}> (Out of stock)</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <p className={styles.price}>
            Price: £{Number(currentVariant?.price || 0).toFixed(2)}
          </p>

          {currentVariant && currentVariant.stock_quantity === 0 && (
            <p className={styles.stockWarning}>This variant is out of stock</p>
          )}
        </div>
      )}

      {/* Add to Cart Button */}
      <button
        onClick={handleAddToCart}
        className={styles.addToCartBtn}
        disabled={!selectedVariantId || currentVariant?.stock_quantity === 0 || addedToCart}
      >
        {addedToCart ? "✓ Added to Cart" : "Add to Cart"}
      </button>

      {addedToCart && (
        <p className={styles.successMsg}>Product added to cart!</p>
      )}
    </div>
  );
}

export default ProductDetails;