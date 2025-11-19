import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./CategoryPage.module.css";

const API_URL = process.env.REACT_APP_API_URL;

function CategoryProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { name } = useParams();
  const navigate = useNavigate();

  const categoryName = decodeURIComponent(name);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const res = await fetch(
          `${API_URL}/products/category/${encodeURIComponent(categoryName)}`,
          { credentials: 'include' }
        );
        
        if (!res.ok) {
          throw new Error(res.status === 404 ? 'Category not found' : 'Failed to load products');
        }
        
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    if (categoryName) {
      fetchProducts();
    }
  }, [categoryName]);

  const handleProductClick = (productId) => {
    navigate(`/products/${productId}`);
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
        <button onClick={() => navigate('/products')} className={styles.backBtn}>
          Back to All Products
        </button>
      </div>
    );
  }

  return (
    <div className={styles.productPage}>
      <h2 className={styles.title}>{categoryName}</h2>
      <p className={styles.subtitle}>
        {products.length} {products.length === 1 ? 'product' : 'products'} found
      </p>

      {products.length > 0 ? (
        <div className={styles.grid}>
          {products.map((product) => (
            <div
              key={product.id}
              className={styles.card}
              onClick={() => handleProductClick(product.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleProductClick(product.id)}
            >
              <img
                src={product.main_page_url}
                alt={product.name}
                className={styles.image}
                loading="lazy"
              />
              <h3 className={styles.name}>{product.name}</h3>
              <p className={styles.brand}>{product.brand}</p>
              <p className={styles.description}>
                {product.description?.length > 100
                  ? `${product.description.substring(0, 100)}...`
                  : product.description}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <p className={styles.noProducts}>No products found in this category.</p>
          <button onClick={() => navigate('/products')} className={styles.backBtn}>
            Browse All Products
          </button>
        </div>
      )}
    </div>
  );
}

export default CategoryProductsPage;