import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./CategoryPage.module.css";

const API_URL = process.env.REACT_APP_API_URL;

const CategoryProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { name } = useParams();
  const categoryParam = decodeURIComponent(name);

  const navigate = useNavigate();

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/products/category/${categoryParam}`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [categoryParam]);

  if (loading) return <p>Loading products...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className={styles.productPage}>
      <h2 className={styles.title}>Products in {categoryParam}</h2>

      {products.length > 0 ? (
        <div className={styles.grid}>
          {products.map((product) => (
            <div
              key={product.id}
              className={styles.card}
              onClick={() => navigate(`/products/${product.id}`)}
            >
              <img
                src={product.main_page_url}
                alt={product.name}
                className={styles.image}
              />
              <h3 className={styles.name}>{product.name}</h3>
              <p className={styles.description}>{product.description}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className={styles.noProducts}>No products found in this category.</p>
      )}
    </div>
  );
};

export default CategoryProductsPage;