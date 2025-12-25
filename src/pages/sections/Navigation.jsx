// src/components/public/sections/Navigation.jsx
import React, { useState, useEffect } from 'react';

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`navigation ${isScrolled ? 'scrolled' : ''}`}>
      <div className="nav-container">
        <div className="nav-logo">
          <div className="logo-icon">🌾</div>
          <span className="logo-text">Saffron Emporial</span>
        </div>

        <div className={`nav-links ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
          <a href="#products" className="nav-link">Products</a>
          <a href="#how-it-works" className="nav-link">How It Works</a>
          <a href="#farmers" className="nav-link">Our Farmers</a>
          <a href="#success" className="nav-link">Success Stories</a>
          <a href="#pricing" className="nav-link">Pricing</a>
        </div>

        <div className="nav-actions">
          <a href="/login" className="btn btn-secondary">Sign In</a>
          <a href="/signup" className="btn btn-primary">Get Started</a>
        </div>

        <button 
          className="mobile-menu-toggle"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>
  );
};

export default Navigation;