import React, { useState, useEffect } from 'react';
import styles from './LoginPage.module.css';
import { Link, useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL;

function Login({ onLogin }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Check if user is already authenticated
  useEffect(() => {
    fetch(`${API_URL}/users/me`, {
      credentials: 'include'
    })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.id) {
          onLogin(data);
          navigate('/');
        }
      })
      .catch(() => {}); // Silent fail - user not logged in
  }, [onLogin, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Login failed");
        return;
      }

      onLogin(data);
      navigate('/');
    } catch (err) {
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
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
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password:</label>
          <input
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <p className={styles.forgotPassword}>Forgot password?</p>

          <button type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
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
