import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Home from './pages/home/Home';
import NavBar from './components/NavBar/NavBar';
import Footer from './components/Footer/Footer';
import Login from './pages/login/LoginPage';
import CartPage from './pages/cart/CartPage';
import ProductPage from './pages/products/ProductPage';
import ProductDetails from './pages/products/productDetailPage.jsx';
import SuccessPage from './pages/success/SuccessPage.jsx';
import CheckoutPageWrapper from './pages/checkout/CheckoutPage.jsx';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import UserProfilePage from './pages/usersProfile/UsersProfilePage.jsx';
import OrderHistoryPage from './pages/orderHistory/OrderHistoryPage.jsx';
import SignupPage from './pages/signup/SignupPage.jsx';
import CategoryProductsPage from './pages/categories/CategoryPage.jsx';
import OAuthSuccessPage from './pages/oauth/OAuthSuccess.jsx';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);
const API_URL = process.env.REACT_APP_API_URL;


function App() {
  return (
    <Router>
      <Elements stripe={stripePromise}>
        <AppInner />
      </Elements>
    </Router>
  );
}

function AppInner() {
  const [currentUser, setCurrentUser] = useState(null); // don't preload from sessionStorage
  const [cartItems, setCartItems] = useState([]);
  const [shippingCost, setShippingCost] = useState(5);
  const [loadingUser, setLoadingUser] = useState(true);
  const [selectedBrand, setSelectedBrand] = useState(null);
  

  const navigate = useNavigate();
useEffect(() => {
  async function fetchCurrentUser() {
    try {
      // Skip fetching immediately after OAuth redirect
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('oauth') === 'success') {
        setLoadingUser(false);
        return;
      }

      const userResponse = await fetch(`${API_URL}/users/me`, {
        credentials: 'include'
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        setCurrentUser(userData);
        sessionStorage.setItem("currentUser", JSON.stringify(userData));
      } else {
        setCurrentUser(null);
        sessionStorage.removeItem("currentUser");
      }
    } catch (err) {
      setCurrentUser(null);
      sessionStorage.removeItem("currentUser");
    } finally {
      setLoadingUser(false);
    }
  }
  fetchCurrentUser();
}, []);

  //Remove any stale cart data from past sessions
  useEffect(() => {
    sessionStorage.removeItem("cartItems");
  }, []);

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/users/logout`, { method: "POST", credentials: "include" });
      setCurrentUser(null);
      setCartItems([]);
      sessionStorage.removeItem("currentUser");

    } catch (err) {
    }
  };

  const addToCart = async (product) => {
    if (!currentUser?.id) {
      alert("Please login to add items to cart.");
      navigate("/login");
      return;
    }

    const variant = product.selectedVariant;

    try {
      setCartItems((prevCart) => {
        const existingIndex = prevCart.findIndex(
          (item) => item.id === product.id && item.selectedVariant?.id === variant.id
        );

        let updatedCart;
        if (existingIndex !== -1) {
          updatedCart = [...prevCart];
          updatedCart[existingIndex].quantity += 1;
        } else {
          updatedCart = [...prevCart, { ...product, selectedVariant: variant, quantity: 1 }];
        }

        return updatedCart;
      });

      await fetch(`${API_URL}/cart/${currentUser.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ 
          userId: currentUser.id, 
          productId: product.id, 
          variantId: product.selectedVariant.id 
        }),
      });

    } catch (err) {

    }
  };

  if (loadingUser) return <div>Loading...</div>;

  //logic for handling shop collections
     const handleShowAllProducts = () => {
    setSelectedBrand(null);         // reset any brand filter
    navigate("/products");         
  };


  
  return (
    <>

      <NavBar 
      cartCount={cartItems.length} 
      user={currentUser} 
      logoutHandler={handleLogout} 
      onShowAllProducts={() => setSelectedBrand(null)}
      />
      <div>
        <Routes>
          <Route path="/" element={<Home addToCart={addToCart}  onBrandSelect={setSelectedBrand}  onShowAllProducts={handleShowAllProducts}/>} />
          <Route
            path="/login"
            element={
              <Login
                onLogin={(user) => {
                  setCurrentUser(user);
                  sessionStorage.setItem("currentUser", JSON.stringify(user));
                }}
              />
            }
          />
          <Route
            path="/cart"
            element={
              currentUser ? (
                <CartPage
                  cartItems={cartItems || []}
                  setCartItems={setCartItems}
                  userId={currentUser.id}
                />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/products"
            element={
              <ProductPage
                cartItems={cartItems}
                setCartItems={setCartItems}
                addToCart={addToCart}
                userId={currentUser?.id}
                selectedBrand={selectedBrand}
              />
            }
          />
          <Route
            path="/checkout"
            element={
              currentUser ? (
                <CheckoutPageWrapper
                  cartItems={cartItems}
                  setCartItems={setCartItems}
                  currentUser={currentUser}
                  shippingCost={shippingCost}
                  setShippingCost={setShippingCost}
                />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route path="/products/:id" element={<ProductDetails addToCart={addToCart} />} />
          <Route path="/success" element={<SuccessPage />} />
          <Route path="/profile" element={<UserProfilePage currentUser={currentUser} />} />
          <Route path="/order-history" element={<OrderHistoryPage currentUser={currentUser} />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/category/:name" element={<CategoryProductsPage />} />
          <Route 
  path="/oauth-success" 
  element={
    <OAuthSuccessPage
      onLogin={(user) => {
        setCurrentUser(user);
        sessionStorage.setItem("currentUser", JSON.stringify(user));
      }} 
    />
  } 
/>
        </Routes>
      </div>
      <Footer />

    </>
  );
}
export default App;