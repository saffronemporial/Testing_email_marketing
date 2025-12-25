// src/components/Auth/Logout.jsx
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import '../../styles/Buttons.css';
import './auth.css';

const Logout = () => {
  const { signOut } = useAuth();

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      try {
        await signOut();
      } catch (error) {
        console.error('Error logging out:', error);
        alert('Error logging out. Please try again.');
      }
    }
  };

  return (
    <button 
      onClick={handleLogout}
      className="logout-button"
      title="Logout"
    >
      <span className="logout-icon">🚪</span>
      <span className="logout-text">Logout</span>
    </button>
  );
};

export default Logout;
