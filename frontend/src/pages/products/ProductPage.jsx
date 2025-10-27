import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styles from "./ProductPage.module.css";

const API_URL = process.env.REACT_APP_API_URL;

const ProductPage = ({ addToCart }) => {
  const [products, setProducts] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedVariants, setSelectedVariants] = useState({});

  useEffect(() => {
    // Fetch products from backend
    fetch(`${API_URL}/products`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch products");
        return res.json();
      })
      .then((data) => {
        setProducts(data);
        setLoading(false);

        // Initialize selectedVariants with first variant for each product
        const initialVariants = {};
        data.forEach((product) => {
          if (product.variants?.length) {
            initialVariants[product.id] = product.variants[0].id;
          }
        });
        setSelectedVariants(initialVariants);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading products...</p>;
  if (error) return <p>Error: {error}</p>;

  const handleVariantChange = (productId, variantId) => {
    setSelectedVariants((prev) => ({ ...prev, [productId]: variantId }));
  };

  const handleAddToCart = (product) => {
    const variantId = selectedVariants[product.id];
    const variant =
      product.variants.find((v) => v.id === variantId) || {
        id: 0,
        price: 0,
        size: "N/A",
      };

    addToCart({ ...product, selectedVariant: variant });
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
                <p className={styles.description}>{product.description}</p>
                <Link to={`/products/${product.id}`}>Read More</Link>

            {/* Variant Selector */}
            {product.variants?.length > 0 && (
              <select
                value={selectedVariants[product.id]}
                onChange={(e) =>
                  handleVariantChange(product.id, Number(e.target.value))
                }
                className={styles.variantSelector}
              >
                
              {product.variants.map((v, idx) => (
                <option key={idx} value={v.variant_value}>
                  {v.variant_type}: {v.variant_value} - £{Number(v.price).toFixed(2)}
                </option>
              ))}

              </select>
            )}

            {/* Add to Cart button */}
            <button
              className={styles.addBtn}
              onClick={() => handleAddToCart(product)}
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