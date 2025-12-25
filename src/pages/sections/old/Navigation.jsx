// components/LandingPage/sections/Navigation.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Navigation.css';

const Navigation = ({ user, scrollToSection, handleDemoAction }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="navigation bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="logo-container w-50 h-50 bg-gradient-to-br from-saffron to-gold rounded-lg flex items-center justify-center mr-3 animate-pulse">
                <img src="https://nylqihwnftbmkxuysgko.supabase.co/storage/v1/object/public/Saffron_Emporial/Logo.JPG" alt="Saffron Emporial Logo" className="w-full h-full object-cover rounded-lg" />
            </div>
            <div>
              <div className="text-2xl font-bold gradient-text">Saffron Emporial</div>
              <div className="text-xs text-gray-600 hidden sm:block">The Golden Standard of Natural Goodness</div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className=" md:flex space-x-6 items-center">
            <button onClick={() => scrollToSection('home')} className="nav-link">Home</button>
            <button onClick={() => scrollToSection('freight-logistics')} className="nav-link">
              Live Logistics
            </button>
            <button onClick={() => scrollToSection('business-intelligence')} className="nav-link">
              Business Intelligence
            </button>
            <button onClick={() => scrollToSection('live-farm')} className="nav-link">
              Live Farm
            </button>
            <button onClick={() => scrollToSection('trust-ledger')} className="nav-link">
              Transparency
            </button>
            <button onClick={() => scrollToSection('academy')} className="nav-link">
              Academy
            </button>

            {/* Auth Links */}
            {user ? (
              <Link 
                to="/dashboard" 
                className="bg-gradient-to-r from-saffron to-gold text-white px-6 py-2 rounded-lg font-semibold hover:from-gold hover:to-saffron transition-all"
              >
                Go to Dashboard
              </Link>
            ) : (
              <div className="flex space-x-4">
                <Link 
                  to="/login" 
                  className="bg-gradient-to-r from-saffron to-gold text-white px-6 py-2 rounded-lg font-semibold hover:from-gold hover:to-saffron transition-all"
                >
                  Login
                </Link>
                <Link 
                  to="/signup" 
                  className="bg-gradient-to-r from-saffron to-gold text-white px-6 py-2 rounded-lg font-semibold hover:from-gold hover:to-saffron transition-all"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="mobile-menu md:hidden bg-white border-t">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <button onClick={() => { scrollToSection('home'); setMobileMenuOpen(false); }} className="mobile-nav-link">
              Home
            </button>
            <button onClick={() => { scrollToSection('freight-logistics'); setMobileMenuOpen(false); }} className="mobile-nav-link">
              Live Logistics
            </button>
            <button onClick={() => { scrollToSection('business-intelligence'); setMobileMenuOpen(false); }} className="mobile-nav-link">
              Business Intelligence
            </button>
            <button onClick={() => { scrollToSection('live-farm'); setMobileMenuOpen(false); }} className="mobile-nav-link">
              Live Farm
            </button>
            <button onClick={() => { scrollToSection('trust-ledger'); setMobileMenuOpen(false); }} className="mobile-nav-link">
              Transparency
            </button>
            <button onClick={() => { scrollToSection('academy'); setMobileMenuOpen(false); }} className="mobile-nav-link">
              Academy
            </button>
            
            {!user && (
              <>
                <Link to="/login" className="mobile-nav-link block" onClick={() => setMobileMenuOpen(false)}>
                  Login
                </Link>
                <Link to="/signup" className="mobile-nav-link block" onClick={() => setMobileMenuOpen(false)}>
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;