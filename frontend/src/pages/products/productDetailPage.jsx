import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import styles from './ProductDetailPage.module.css'
function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const API_URL = process.env.REACT_APP_API_URL;

    async function fetchProduct() {
      try {
        const res = await fetch(`${API_URL}/products/${id}`);
        const data = await res.json();
        setProduct(data);

        // default to the first variant
        if (data.variants?.length) setSelectedVariant(data.variants[0]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (!product) return <p>Product not found</p>;

  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.description}</p>

      {product.variants?.length > 0 && (
        <div>
          <label>
            Choose variant:
            <select
              value={selectedVariant?.variant_value || ""}
              onChange={(e) =>
                setSelectedVariant(
                  product.variants.find(
                    (v) => v.variant_value === e.target.value
                  )
                )
              }
            >
              {product.variants.map((v, idx) => (
                <option key={idx} value={v.variant_value}>
                  {v.variant_type}: {v.variant_value} - £{Number(v.price).toFixed(2)}
                </option>
              ))}
            </select>
          </label>

          <p>Price: £{Number(selectedVariant?.price).toFixed(2)}</p>
        </div>
      )}
      
    </div>
  );
}

export default ProductDetails;