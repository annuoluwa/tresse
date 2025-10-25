import React, {useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from './pages/home/Home';
import NavBar from './components/NavBar/NavBar';
import Footer from './components/Footer/Footer';
import Login from './pages/login/LoginPage';
import CartPage from './pages/cart/CartPage';
import ProductPage from './pages/products/ProductPage';

const API_URL = process.env.REACT_APP_API_URL;

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [cartItems, setCartItems] = useState([]);

  // Fetch the logged-in user and their cart on mount
  useEffect(() => {
    async function fetchCurrentUser() {
      try {
        // Backend route should return the user based on session/cookie
        const userResponse = await fetch(`${API_URL}/users/me`, {
          credentials: "include", // send session cookie
        });

        if (!userResponse.ok) {
        // No logged-in user: restore guest cart
        const storedCart = localStorage.getItem("guestCart");
        if (storedCart) setCartItems(JSON.parse(storedCart));
        setCurrentUser(null);
        return;
      }

        const userData = await userResponse.json();
        setCurrentUser(userData);

        // fetch cart items for this user
        const cartResponse = await fetch(`${API_URL}/cart/${userData.id}`, {
          credentials: "include",
        });
        const cartData = await cartResponse.json();
        setCartItems(cartData);
      } catch (err) {
        console.error("Error fetching user or cart:", err);
      }
    }

    fetchCurrentUser();
  }, []);

  // Logout handler
  const handleLogout = async () => {
    try {
      // call backend logout route to destroy session
      await fetch(`${API_URL}/logout`, {
        method: "POST",
        credentials: "include",
      });

      // clear frontend state
      setCurrentUser(null);
      setCartItems([]);
      console.log("User logged out");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

//addToCart
  const addToCart = async (product) => {
  const variant = product.selectedVariant;

  try {
    setCartItems((prevCart) => {
      // Check if the product with the selected variant already exists in cart
      const existingIndex = prevCart.findIndex(
        (item) => item.id === product.id && item.selectedVariant?.id === variant.id
      );

      let updatedCart;

      if (existingIndex !== -1) {
        // If product exists, increase quantity by 1
        updatedCart = [...prevCart];
        updatedCart[existingIndex].quantity += 1;
      } else {
        // If new product, add it with quantity 1
        updatedCart = [...prevCart, { ...product, selectedVariant: variant, quantity: 1 }];
      }

      // Save guest cart in localStorage if no logged-in user
      if (!currentUser?.id) {
        localStorage.setItem("guestCart", JSON.stringify(updatedCart));
        console.log("Added to guest cart:", product);
      }

      return updatedCart;
    });

    // For logged-in users, sync with backend
    if (currentUser?.id) {
      await fetch(`${API_URL}/cart/${currentUser.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ product }),
      });
      console.log("Added to user cart:", product);
    }
  } catch (err) {
    console.error("Failed to add to cart:", err);
  }
};
  return (
    <Router>
      <NavBar cartCount={cartItems.length} user={currentUser} onLogout={handleLogout} />
      <div>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login onLogin={setCurrentUser} />} />
          <Route path="/cart" element={<CartPage cartItems={cartItems} setCartItems={setCartItems} userId={currentUser} />} />
          <Route path='/products' element={
            <ProductPage 
              cartItems={cartItems} 
              setCartItems={setCartItems}
              addToCart={addToCart} 
              userId={currentUser?.id} />} />
        </Routes>
      </div>
      <Footer />
    </Router>
  );
}

export default App;