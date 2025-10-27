import React, {useState} from 'react';
import styles from './LoginPage.module.css';
import { Link, useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL;

function Login({ onLogin }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_URL}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include", // important if using sessions/cookies
      });

      const data = await response.json();
console.log("Response status:", response.status);
console.log("Response data:", data);
      if (!response.ok) {
        alert(data.message || "Invalid credentials");
        return;
      }

      // ✅ Save user to App state
      onLogin(data.user);

      // ✅ Redirect to home
      navigate("/");
    } catch (err) {
      console.error("Login error:", err);
      alert("Something went wrong. Please try again.");
    }
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

      <button type="button">Continue as Guest</button>

      <p>
        Don't have an account?{" "}
        <Link to="#" className={styles.signupLink}>
          Sign up
        </Link>
      </p>

      <p>Or continue with</p>

      <div className={styles.oAuth}>
        <button>Google</button>
        <button>Facebook</button>
      </div>
    </div>
  );
}

export default Login;