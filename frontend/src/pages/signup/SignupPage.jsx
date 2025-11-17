import React, { useState } from "react";
import styles from "./SignupPage.module.css";
import { useNavigate } from "react-router-dom";

function SignupPage() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("")
const navigate = useNavigate();

const API_URL =process.env.REACT_APP_API_URL

const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");


try {
    const response = await fetch(`${API_URL}/users/register`, {
        credentials: "include",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({username, email, password}),
    });


    const data = await response.json();

    if (!response.ok) {
        setError(data.error || "Signup failed");
    } else {
        setSuccess("Signup successful! Redirecting to login");
        setUsername("");
        setEmail("");
        setPassword("");

        setTimeout(() => navigate("/login"), 2000);
    }
} catch (err) {
    setError("Something went wrong. Please try again.")
} finally {
    setLoading(false); 
}
}

return (
    <div className={styles.signupContainer}>
        <h2>Sign Up</h2>

        {error && <p className={styles.errorMsg}>{error}</p>}
        {success && <p className={styles.successMsg}>{success}</p>}

        <form onSubmit={handleSubmit} className={styles.signupForm}>
            <label>
                Username:
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}required
                    />
                    </label>

                    <label>
                    Email:
                    <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}required
                    />
            </label>

            <label>
               Password: 
               <input
               type="password"
               value={password}
               onChange={(e) => setPassword(e.target.value)}required
               
               />
            </label>

            <button type="submit" disabled={loading}>
                {loading ? "Signing up..." : "Sign Up"}
            </button>
        </form>
    </div>
)
    
}

export default SignupPage;