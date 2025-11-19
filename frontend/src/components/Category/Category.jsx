import React, { useState, useEffect } from "react";
import styles from "./Category.module.css";
import { FaScissors, FaSpa, FaPumpSoap, FaSprayCan, FaCapsules } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL;

const CATEGORY_ICONS = {
  "Hair Care": <FaScissors />,
  "Skin Care": <FaSpa />,
  "Makeup": <FaPumpSoap />,
  "Fragrances": <FaSprayCan />,
  "Supplements": <FaCapsules />,
};

function Category() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_URL}/category/summary`, {
          credentials: 'include'
        });
        
        if (!res.ok) {
          throw new Error('Failed to fetch categories');
        }

        const data = await res.json();
        setCategories(data);
      } catch (err) {
        setError(err.message || "Failed to load categories");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryClick = (categoryName) => {
    navigate(`/category/${encodeURIComponent(categoryName)}`);
  };

  if (loading) {
    return (
      <section className={styles.categories}>
        <div className={styles.categoryHeader}>
          <h2>Shop by Category</h2>
          <p>Explore our curated selection of premium products</p>
        </div>
        <p className={styles.loading}>Loading categories...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className={styles.categories}>
        <div className={styles.categoryHeader}>
          <h2>Shop by Category</h2>
        </div>
        <p className={styles.error}>{error}</p>
      </section>
    );
  }

  return (
    <section className={styles.categories}>
      <div className={styles.categoryHeader}>
        <h2>Shop by Category</h2>
        <p>Explore our curated selection of premium products across multiple categories</p>
      </div>

      <div className={styles.categoryGrid}>
        {categories.length > 0 ? (
          categories.map((category) => (
            <div
              key={category.id}
              className={styles.categoryCard}
              onClick={() => handleCategoryClick(category.name)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleCategoryClick(category.name)}
            >
              <div className={styles.icon}>
                {CATEGORY_ICONS[category.name] || <FaCapsules />}
              </div>
              <h3>{category.name}</h3>
              <p>{category.product_count || 0} products</p>
            </div>
          ))
        ) : (
          <p className={styles.empty}>No categories available</p>
        )}
      </div>
    </section>
  );
}

export default Category;