import React, {useState, useEffect } from 'react';
import NavBar from './components/NavBar/NavBar';

function App() {
        
    const[currentUser, setCurrentUser ] = useState(null);
    const [cartItems, setCartItems ] = useState([]);

    useEffect(() => {
        async function fetchData() {
            try {
                //fetch logged-in user
                const userResponse = await fetch('/users/$1');
                const userData = await userResponse.json();

                setCurrentUser(userData);


                //fetch cart item for logged-in user
                const cartResponse= await fetch(`cart/${userData.id}`);
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
            </div>
        )
    };

    export default App;