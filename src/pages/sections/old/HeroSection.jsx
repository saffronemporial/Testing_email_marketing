// components/LandingPage/sections/HeroSection.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './HeroSection.css';
import CalculatorDashboard from '../../components/CalculatorSystem/CalculatorDashboard.jsx';

const HeroSection = ({ scrollToSection, handleDemoAction, user }) => {
  const [showCalculator, setShowCalculator] = useState(false);

  const toggleCalculator = () => {
    setShowCalculator(!showCalculator);
  };

  return (
    <section id="home" className="hero-section hero-gradient text-white py-20 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="floating absolute top-20 left-10 text-6xl">🌱</div>
        <div className="floating absolute top-40 right-20 text-5xl" style={{animationDelay: '0.5s'}}>📊</div>
        <div className="floating absolute bottom-32 left-20 text-4xl" style={{animationDelay: '1s'}}>🔗</div>
        <div className="floating absolute bottom-20 right-10 text-5xl" style={{animationDelay: '1.5s'}}>🎓</div>
      </div>

      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        {/* Centered Background Logo */}
        <div className="absolute inset-0 flex items-center justify-center z-0 opacity-10">
          <div className="w-96 h-96">
            <img 
              src="https://nylqihwnftbmkxuysgko.supabase.co/storage/v1/object/public/Saffron_Emporial/Logo.JPG" 
              alt="Saffron Emporial Logo" 
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Navigation Bar */}
        <nav className="absolute top-0 left-0 right-0 p-4 z-20">
          <div className="flex justify-between items-center max-w-7xl mx-auto">
            <div className="hidden md:flex space-x-6">
              <a href="#home" className="text-white hover:text-gray-300">Home</a>
              <a href="#about" className="text-white hover:text-gray-300">About</a>
              <a href="#services" className="text-white hover:text-gray-300">Services</a>
              <a href="#contact" className="text-white hover:text-gray-300">Contact</a>
            </div>
          </div>
        </nav>

        {/* Conditional Rendering: Calculator or Hero Content */}
        {showCalculator ? (
          <div className="relative z-10 pt-20">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl md:text-4xl font-bold">Saffron Business Calculator</h2>
              <button 
                onClick={toggleCalculator}
                className="bg-white text-saffron px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105"
              >
                ← Back to Home
              </button>
            </div>
            <CalculatorDashboard />
          </div>
        ) : (
          <div className="relative z-10 pt-20">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 fade-in">The Trust Engine</h1>
            <p className="text-2xl md:text-3xl mb-4 gradient-text">Radical Transparency Meets Natural Excellence</p>
            <p className="text-xl mb-8 max-w-4xl mx-auto">
              Experience the world's first live-streaming farm technology, blockchain transparency ledger, 
              and educational academy - all in one revolutionary platform that redefines trust in natural produce.
            </p>

            <div className="space-x-4 fade-in">
              {user ? (
                <Link 
                  to="/dashboard"
                  className="bg-white text-saffron px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 pulse-glow"
                >
                  🚀 Go to Dashboard
                </Link>
              ) : (
                <>
                  <button 
                    onClick={() => handleDemoAction('watch_farm', 'Live Farm Feed')}
                    className="bg-white text-saffron px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 pulse-glow"
                  >
                    🔴 Watch Live Farm Feed
                  </button>
                  <button 
                    onClick={() => scrollToSection('business-intelligence')}
                    className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-saffron transition-all transform hover:scale-105"
                  >
                    View Business Intelligence
                  </button>
                  <button
                    onClick={toggleCalculator}
                    className="bg-white text-black px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 pulse-glow"
                  >
                    📊 Saffron Calculator
                  </button>
              
                  <Link
                    to='./SignUp'
                    className="bg-white text-black px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 pulse-glow"
                  >
                    <span className="inline-flex items-center mr-2">📝 New to Saffron?</span>
                    Create New Account
                  </Link>
                  <Link
                    to="./login"
                    className="bg-white text-black px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 pulse-glow"
                  >
                    📝 Login
                  </Link>
                </>
              )}
            </div>

            {/* Trust Indicators */} 
            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-2xl mb-2">🌱</div>
                <div className="font-semibold">Live Farm Monitoring</div>
                <div className="text-sm opacity-80">Real-time farm data</div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">🔗</div>
                <div className="font-semibold">Blockchain Ledger</div>
                <div className="text-sm opacity-80">Every transaction verified</div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">📊</div>
                <div className="font-semibold">AI Analytics</div>
                <div className="text-sm opacity-80">Predictive insights</div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">🎓</div>
                <div className="font-semibold">Saffron Academy</div>
                <div className="text-sm opacity-80">Industry education</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default HeroSection;