import React, {useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from './components/Home/Home';
import NavBar from './components/NavBar/NavBar';
import Footer from './components/Footer/Footer';
import Login from './pages/login/LoginPage';

function App() {
        
        const API_URL = process.env.REACT_APP_API_URL;
        
    const[currentUser, setCurrentUser ] = useState(null);
    const [cartItems, setCartItems ] = useState([]);

    useEffect(() => {
        async function fetchData() {
            try {
                
                //fetch logged-in user
                const userId = 2;
                const userResponse = await fetch(`${API_URL}/users/${userId}`);
                const userData = await userResponse.json();

                setCurrentUser(userData);


                //fetch cart item for logged-in user
                const cartResponse= await fetch(`${API_URL}/cart/${userData.id}`);
                const cartData = await cartResponse.json();

                setCartItems(cartData);
            }catch (err) {
                console.error('Error fetching data:', err)
            }

        }
        fetchData();
        //eslint-disable-next-line react-hooks/exhaustive-deps
        }, []);

          const handleLogout = () => {
             setCurrentUser(null);
             setCartItems([]);
             localStorage.removeItem('token'); // optional if using JWT
             console.log("User logged out");
  };



        return (
            <Router>
             <NavBar cartCount={cartItems.length} user={currentUser} onLogout={handleLogout}/>
            <div>
                <Routes>
                <Route path="/" element={<Home />} />
                 <Route path="/login" element={<Login onLogin={setCurrentUser} />} />
                </Routes>
            </div>
            <Footer />
            </Router>
        )
    };

    export default App;