import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import styles from './ProductDetailPage.module.css';

function ProductDetails({ addToCart }) {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariantId, setSelectedVariantId] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const API_URL = process.env.REACT_APP_API_URL;

    async function fetchProduct() {
      try {
        const res = await fetch(`${API_URL}/products/${id}`);
        const data = await res.json();
        setProduct(data);

        // Set default variant
        if (data.variants?.length) {
          setSelectedVariantId(data.variants[0].id);
        }
      } catch (err) {

      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [id]);

  //Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAddToCart = () => {
    if (!product || !selectedVariantId) return;

    const variant = product.variants.find(v => v.id === selectedVariantId);
    if (!variant) return;

    const cartProduct = {
      id: product.id,
      name: product.name,
      imageUrl: product.main_page_url,
      variant_type: variant.variant_type,
      variant_value: variant.variant_value,
      price: variant.price,
      selectedVariant: variant,
    };

    addToCart(cartProduct);
  };

  if (loading) return <p className={styles.loading}>Loading...</p>;
  if (!product) return <p className={styles.error}>Product not found</p>;

  const currentVariant = product.variants?.find(v => v.id === selectedVariantId);

  return (
    <div className={styles.productDetailPage}>
      <h1>{product.name}</h1>
      <img src={product.main_page_url} alt={product.name} className={styles.image} />
      <p>{product.description}</p>

      {product.variants?.length > 0 && (
        <div className={styles.variantContainer} ref={dropdownRef}>
          <label>Choose variant:</label>

          {/* Custom dropdown*/}
          <div
            className={styles.variantDropdown}
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <span className={styles.selectedVariant}>
              {currentVariant
                ? `${currentVariant.variant_type}: ${currentVariant.variant_value} - £${Number(
                    currentVariant.price
                  ).toFixed(2)}`
                : "Select a variant"}
            </span>
            <span className={styles.dropdownArrow}>{dropdownOpen ? "▲" : "▼"}</span>

            {dropdownOpen && (
              <ul className={styles.dropdownList}>
                {product.variants.map((v) => (
                  <li
                    key={v.id}
                    onClick={() => {
                      setSelectedVariantId(v.id);
                      setDropdownOpen(false);
                    }}
                    className={
                      v.id === selectedVariantId ? styles.activeVariant : ""
                    }
                  >
                    {v.variant_type}: {v.variant_value} - £{Number(v.price).toFixed(2)}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <p className={styles.price}>
            Price: £{Number(currentVariant?.price || 0).toFixed(2)}
          </p>
        </div>
      )}

      <button onClick={handleAddToCart} className={styles.addToCartBtn}>
        Add to Cart
      </button>
    </div>
  );
}

export default ProductDetails;