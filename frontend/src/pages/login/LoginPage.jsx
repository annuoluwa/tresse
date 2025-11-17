import React, { useState, useEffect } from 'react';
import styles from './LoginPage.module.css';
import { Link, useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL;

function Login({ onLogin }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

// Fetch current user on load, including after OAuth redirect
useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const oauthSuccess = urlParams.get('oauth') === 'success';

  // fetching /users/me if OAuth redirect or page reload
  fetch(`${API_URL}/users/me`, {
    credentials: 'include'
  })
    .then(res => {
      return res.json();
    })
    .then(data => {
      // data should be the user object directly, not data.user
      if (data && data.id) {
        onLogin(data);
        navigate('/');
      }
    })
    .catch(err => {});
}, [onLogin, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) return alert(data.message || "Login failed");

      // Changed: pass data directly, not data.user
      onLogin(data);
      sessionStorage.setItem("currentUser", JSON.stringify(data));
      navigate('/');
    } catch (err) {
      alert("Something went wrong");
    }
  };

  const handleGoogleLogin = () => {
    // Redirect to backend Google OAuth
    window.location.href = '/auth/google';
  };

  return (
    <div className={styles.LoginContainer}>
      <div className={styles.LoginMessage}>
        <h3>Welcome Back</h3>
        <p>Sign in to your account to continue</p>
      </div>

      <div className={styles.LoginForm}>
        <form onSubmit={handleLogin}>
          <label>Email Address:</label>
          <input
            type="text"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label>Password:</label>
          <input
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <p className={styles.forgotPassword}>Forgot password?</p>

          <button type="submit">Sign in</button>
        </form>
      </div>

      <p>
        Don't have an account?{" "}
        <Link to="/signup" className={styles.signupLink}>
          Sign up
        </Link>
      </p>

      <p>Or continue with</p>

      <div className={styles.oAuth}>
        <button onClick={handleGoogleLogin}>Google</button>
      </div>
    </div>
  );
}

export default Login;
