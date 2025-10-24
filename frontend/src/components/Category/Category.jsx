import React, { useState, useEffect } from "react";
import styles from "./Category.module.css"
import {FaScissors, FaSpa, FaPumpSoap, FaSprayCan, FaCapsules} from "react-icons/fa6";


const API_URL = process.env.REACT_APP_API_URL;

function Category() {
    
  const [categories, setCategories] = useState([]);

  // Map icons to category names (to display beside fetched data)
  const icons = {
    "Hair Care": <FaScissors />,
    "Skin Care": <FaSpa />,
    "Makeup": <FaPumpSoap />,
    "Fragrances": <FaSprayCan />,
    "Supplements": <FaCapsules />,
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_URL}/category/summary`); 
        const data = await res.json();
        setCategories(data);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
// eslint-disable-next-line
    fetchCategories();
  }, []);

  const handleClick = (categoryName) => {
    alert(`You clicked on ${categoryName}`);
  };

  return (
    <section className={styles.categories}>
      <div className={styles.categoryHeader}>
        <h2>Shop by Category</h2>
        <p>Explore our curated selection of premium products across multiple categories</p>
      </div>

      <div className={styles.categoryGrid}>
        {categories.length > 0 ? (
          categories.map((cat) => (
            <div 
              key={cat.id} 
              className={styles.categoryCard} 
              onClick={() => handleClick(cat.name)}
            >
              <div className={styles.icon}>{icons[cat.name]}</div>
              <h3>{cat.name}</h3>
              <p>{cat.product_count || 0} products</p>
            </div>
          ))
        ) : (
          <p>Loading categories...</p>
        )}
      </div>
    </section>
  );
}

export default Category;