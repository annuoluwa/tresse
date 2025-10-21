import React, {useState, useEffect } from 'react';
import NavBar from './components/NavBar/NavBar';
import HeroBanner from './components/HeroBanner/HeroBanner';
import Category from './components/Category/Category';


function App() {
        
    const[currentUser, setCurrentUser ] = useState(null);
    const [cartItems, setCartItems ] = useState([]);

    useEffect(() => {
        async function fetchData() {
            try {
                
        const API_URL = process.env.REACT_APP_API_URL;
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
        }, [])

        return (
            <div>
                <NavBar cartCount={cartItems.length} user={currentUser} />
                <HeroBanner />
                <Category />
            </div>
        )
    };

    export default App;