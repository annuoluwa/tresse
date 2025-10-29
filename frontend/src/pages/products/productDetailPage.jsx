import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import styles from './ProductDetailPage.module.css';

function ProductDetails({ addToCart }) {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariantId, setSelectedVariantId] = useState(null);

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
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
  if (!product || !selectedVariantId) return;

  const variant = product.variants.find(v => v.id === selectedVariantId);
  if (!variant) return;

  const cartProduct = {
    id: product.id,
    name: product.name,
    imageUrl: product.main_page_url,
    // Flatten variant into top-level fields
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
        <div className={styles.variantContainer}>
          <label>
            Choose variant:
            <select
              value={selectedVariantId || ""}
              onChange={(e) => setSelectedVariantId(Number(e.target.value))}
              className={styles.variantSelect}
            >
              {product.variants.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.variant_type}: {v.variant_value} - £{Number(v.price).toFixed(2)}
                </option>
              ))}
            </select>
          </label>

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