import React, {useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from './pages/home/Home';
import NavBar from './components/NavBar/NavBar';
import Footer from './components/Footer/Footer';
import Login from './pages/login/LoginPage';
import CartPage from './pages/cart/CartPage';

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
          // no logged-in user
          setCurrentUser(null);
          setCartItems([]);
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

  return (
    <Router>
      <NavBar cartCount={cartItems.length} user={currentUser} onLogout={handleLogout} />
      <div>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login onLogin={setCurrentUser} />} />
          <Route path="/cart" element={<CartPage cartItems={cartItems} setCartItems={setCartItems} userId={currentUser} />} />
        </Routes>
      </div>
      <Footer />
    </Router>
  );
}

export default App;