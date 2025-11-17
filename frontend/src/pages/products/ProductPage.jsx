import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styles from "./ProductPage.module.css";

const API_URL = process.env.REACT_APP_API_URL;

const ProductPage = ({ selectedBrand, addToCart }) => {
  const [products, setProducts] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVariants, setSelectedVariants] = useState({});
  


useEffect(() => {
  setLoading(true);
  setError(null);

  const url = selectedBrand
    ? `${API_URL}/products/brand/${selectedBrand}`
    : `${API_URL}/products`;

  fetch(url)
    .then((res) => {
      if (!res.ok) throw new Error("Failed to fetch products");
      return res.json();
    })
    .then((data) => {
      setProducts(data);

      // initialize variants
      const initialVariants = {};
      data.forEach((product) => {
        if (product.variants?.length) {
          initialVariants[product.id] = product.variants[0].id;
        }
      });
      setSelectedVariants(initialVariants);
      setLoading(false);
    })
    .catch((err) => {
      setError(err.message);
      setLoading(false);
    });
}, [selectedBrand]);


if (loading) return <p>Loading products...</p>;
  if (error) return <p>Error: {error}</p>;

  const handleVariantChange = (productId, variantId) => {
    setSelectedVariants((prev) => ({ ...prev, [productId]: variantId }));
  };

const handleAddToCart = (product) => {
  // Ensure the product actually has variants
  if (!Array.isArray(product.variants) || product.variants.length === 0) {
    return; // hide the button for such products
  }

  // Get the selected variant ID from state, fallback to the first variant
  const variantId = selectedVariants[product.id] || product.variants[0].id;

  // Find the full variant object
  const variant = product.variants.find((v) => v.id === variantId);

  if (!variant) {
    return;
  }

  // Call addToCart with product + selected variant
  addToCart({
    ...product,
    selectedVariant: variant,
  });
};

  return (
    <div className={styles.productPage}>
      <h2 className={styles.title}>Our Products</h2>

      <div className={styles.grid}>
        {products.map((product) => (
          <div key={product.id} className={styles.card}>

            {/* Product Image */}
            <img
              src={product.imageUrl}
              alt={product.name}
              className={styles.image}
            />

            {/* Product Name */}
            <h3 className={styles.name}>{product.name}</h3>
            
                {/* Product Description*/}
                <p className={styles.description}>{product.description}
                  <Link className={styles.read} to={`/products/${product.id}`}>...Read More</Link>
                </p>
                

            {/* Variant Selector */}
{product.variants?.length > 0 && (
  <select
    value={selectedVariants[product.id]}
    onChange={(e) =>
      handleVariantChange(product.id, Number(e.target.value))
    }
    className={styles.variantSelector}
  >
    {product.variants.map((v) => (
      <option key={v.id} value={v.id}>
        {v.variant_type}: {v.variant_value} - £{Number(v.price).toFixed(2)}
      </option>
    ))}
  </select>
)}

            {/* Add to Cart button */}
            <button
              className={styles.addBtn} 
              onClick={() => handleAddToCart(product) }
            >
              Add to Cart 
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductPage;