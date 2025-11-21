import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import styles from "./ProductPage.module.css";

const API_URL = process.env.REACT_APP_API_URL;

const ProductPage = ({ selectedBrand, addToCart }) => {
  const [products, setProducts] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVariants, setSelectedVariants] = useState({});
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);

      try {
        const searchTerm = searchParams.get('search');
        let url = `${API_URL}/products`;

        if (searchTerm) {
          url = `${API_URL}/products/search?term=${encodeURIComponent(searchTerm)}`;
        } else if (selectedBrand) {
          url = `${API_URL}/products/brand/${encodeURIComponent(selectedBrand)}`;
        }

        const res = await fetch(url, { credentials: 'include' });
        
        if (!res.ok) {
          throw new Error(res.status === 404 ? 'No products found' : 'Failed to fetch products');
        }

        const data = await res.json();
        setProducts(data);

        const initialVariants = {};
        data.forEach((product) => {
          if (product.variants?.length > 0) {
            initialVariants[product.id] = product.variants[0].id;
          }
        });
        setSelectedVariants(initialVariants);
      } catch (err) {
        setError(err.message || "Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedBrand, searchParams]);

  const handleVariantChange = (productId, variantId) => {
    setSelectedVariants((prev) => ({ ...prev, [productId]: variantId }));
  };

  const handleAddToCart = (product) => {
    if (!product.variants?.length) return;

    const variantId = selectedVariants[product.id] || product.variants[0].id;
    const variant = product.variants.find((v) => v.id === variantId);

    if (!variant) return;

    addToCart({
      id: product.id,
      name: product.name,
      imageUrl: product.imageUrl,
      selectedVariant: variant,
    });
  };

  const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  if (loading) {
    return (
      <div className={styles.productPage}>
        <p className={styles.loading}>Loading products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.productPage}>
        <p className={styles.error}>Error: {error}</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className={styles.productPage}>
        <p className={styles.empty}>No products found</p>
      </div>
    );
  }

  return (
    <div className={styles.productPage}>
      <h2 className={styles.title}>
        {selectedBrand ? `${selectedBrand} Products` : 'Our Products'}
      </h2>
      <p className={styles.subtitle}>{products.length} products found</p>

      <div className={styles.grid}>
        {products.map((product) => {
          const selectedVariantId = selectedVariants[product.id];
          const currentVariant = product.variants?.find(v => v.id === selectedVariantId);

          return (
            <div key={product.id} className={styles.card}>
              <Link to={`/products/${product.id}`}>
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className={styles.image}
                  loading="lazy"
                />
              </Link>

              <Link to={`/products/${product.id}`} className={styles.nameLink}>
                <h3 className={styles.name}>{product.name}</h3>
              </Link>

              {product.brand && (
                <p className={styles.brand}>{product.brand}</p>
              )}

              <p className={styles.description}>
                {truncateText(product.description, 100)}
                {product.description?.length > 100 && (
                  <>
                    {' '}
                    <Link className={styles.read} to={`/products/${product.id}`}>
                      Read More
                    </Link>
                  </>
                )}
              </p>

              {product.variants?.length > 0 && (
                <select
                  value={selectedVariantId}
                  onChange={(e) => handleVariantChange(product.id, Number(e.target.value))}
                  className={styles.variantSelector}
                  aria-label={`Select variant for ${product.name}`}
                >
                  {product.variants.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.variant_type}: {v.variant_value} - £{Number(v.price).toFixed(2)}
                      {v.stock_quantity === 0 && ' (Out of stock)'}
                      {v.stock_quantity > 0 && v.stock_quantity < 5 && ` (${v.stock_quantity} left)`}
                    </option>
                  ))}
                </select>
              )}

              {currentVariant && (
                <p className={styles.price}>
                  £{Number(currentVariant.price).toFixed(2)}
                </p>
              )}

              {product.variants?.length > 0 && (
                <button
                  className={styles.addBtn}
                  onClick={() => handleAddToCart(product)}
                  disabled={currentVariant?.stock_quantity === 0}
                  aria-label={`Add ${product.name} to cart`}
                >
                  {currentVariant?.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProductPage;