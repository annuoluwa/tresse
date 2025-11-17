// OAuthSuccessPage.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./OAuthSuccess.module.css";


const API_URL = process.env.REACT_APP_API_URL;

export default function OAuthSuccessPage({ onLogin }) {
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch(`${API_URL}/users/me`, {
          credentials: "include"
        });
        const data = await res.json();
        if (data) {
          onLogin(data);
        }
      } catch (err) {

      } finally {
        navigate("/"); // go to homepage
      }
    }
    fetchUser();
  }, [navigate, onLogin]);

  return (
    <div className={styles.loadingContainer}>
      <div className={styles.spinner}></div>
      <p>Logging you in...</p>
    </div>
  )
    
}
