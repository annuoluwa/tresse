import React, { useState, useEffect } from "react";
import {useNavigate} from 'react-router-dom'
import styles from "./UsersProfilePage.module.css";

const UserProfilePage = ({ currentUser }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "" });
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) return;
    const API_URL = process.env.REACT_APP_API_URL;

    async function fetchUser() {
      try {
        const res = await fetch(`${API_URL}/users/${currentUser.id}`, {
          credentials: "include",
        });
        const data = await res.json();
        setUser(data);
        setFormData({ name: data.name, email: data.email });
      } catch (err) {

      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, [currentUser]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Failed to update profile");

      const updated = await res.json();
      setUser(updated);
      setEditing(false);
    } catch (err) {
      alert("Error updating profile");
    }
  };

  if (!currentUser) return <p className={styles.message}>Please log in to view your profile.</p>;
  if (loading) return <p className={styles.message}>Loading profile...</p>;

  return (
    <div className={styles.profileContainer}>
      <h2 className={styles.title}>My Profile</h2>
    <button
  className={styles.orderBtn}
  onClick={() => navigate("/orders")}
>
  Order history
</button>
      <div className={styles.profileCard}>
        <div className={styles.avatar}>
  <img
    src={`https://i.pravatar.cc/80?u=${user.email}`}
    alt={`${user.name}'s avatar`}
    className={styles.avatarImg}
  />
</div>

        {editing ? (
          <>
            <label>
              Name:
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={styles.input}
              />
            </label>

            <label>
              Email:
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={styles.input}
              />
            </label>

            <button onClick={handleSave} className={styles.saveBtn}>
              Save Changes
            </button>
            <button onClick={() => setEditing(false)} className={styles.cancelBtn}>
              Cancel
            </button>
          </>
        ) : (
          <>
            <p><strong>Name:</strong> {user.username}</p>
            <p><strong>Email:</strong> {user.email}</p>

            {/*<button onClick={() => setEditing(true)} className={styles.editBtn}>
              Edit Profile
            </button>*/}
          </>
        )}
      </div>
    </div>
  );
};

export default UserProfilePage;
