import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import styles from "./UsersProfilePage.module.css";

const API_URL = process.env.REACT_APP_API_URL;

const UserProfilePage = ({ currentUser }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ username: "", email: "" });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
        setError(null);
        const res = await fetch(`${API_URL}/users/${currentUser.id}`, {
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error("Failed to load profile");
        }

        const data = await res.json();
        setUser(data);
        setFormData({ username: data.username, email: data.email });
      } catch (err) {
        setError(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [currentUser]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    try {
      setSaveSuccess(false);
      const res = await fetch(`${API_URL}/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error("Failed to update profile");
      }

      const data = await res.json();
      setUser(data.user || data);
      setEditing(false);
      setSaveSuccess(true);

      // Hide success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setError(err.message || "Error updating profile");
    }
  };

  // Not logged in
  if (!currentUser) {
    return (
      <div className={styles.profileContainer}>
        <p className={styles.message}>Please log in to view your profile.</p>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className={styles.profileContainer}>
        <p className={styles.message}>Loading profile...</p>
      </div>
    );
  }

  // Error state
  if (error && !user) {
    return (
      <div className={styles.profileContainer}>
        <p className={styles.error}>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className={styles.profileContainer}>
      <div className={styles.header}>
        <h2 className={styles.title}>My Profile</h2>
        <button
          className={styles.orderBtn}
          onClick={() => navigate("/order-history")}
        >
          Order History
        </button>
      </div>

      {saveSuccess && (
        <p className={styles.successMsg}>Profile updated successfully!</p>
      )}

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.profileCard}>
        <div className={styles.avatar}>
          <img
            src={`https://i.pravatar.cc/150?u=${user.email}`}
            alt={`${user.username}'s avatar`}
            className={styles.avatarImg}
            loading="lazy"
          />
        </div>

        {editing ? (
          <>
            <label htmlFor="username">
              Username:
              <input
                id="username"
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className={styles.input}
                required
                aria-label="Username"
              />
            </label>

            <label htmlFor="email">
              Email:
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={styles.input}
                required
                aria-label="Email address"
              />
            </label>

            <div className={styles.buttonGroup}>
              <button onClick={handleSave} className={styles.saveBtn}>
                Save Changes
              </button>
              <button 
                onClick={() => {
                  setEditing(false);
                  setFormData({ username: user.username, email: user.email });
                  setError(null);
                }} 
                className={styles.cancelBtn}
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <div className={styles.infoRow}>
              <strong>Username:</strong>
              <span>{user.username}</span>
            </div>
            <div className={styles.infoRow}>
              <strong>Email:</strong>
              <span>{user.email}</span>
            </div>
            {user.created_at && (
              <div className={styles.infoRow}>
                <strong>Member since:</strong>
                <span>{new Date(user.created_at).toLocaleDateString('en-GB', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</span>
              </div>
            )}

            <button onClick={() => setEditing(true)} className={styles.editBtn}>
              Edit Profile
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default UserProfilePage;
