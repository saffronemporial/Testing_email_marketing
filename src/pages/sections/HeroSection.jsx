// src/components/public/sections/HeroSection.jsx
import React from 'react';

const HeroSection = ({ onProductSelect }) => {
  return (
    <section className="section section-dark">
      <div className="container">
        <div className="grid-2">
          <div className="hero-content">
            <h1 className="hero-title">
              From Indian Farms to 
              <span className="gradient-text"> Global Markets</span>
            </h1>
            <p className="hero-subtitle">
              Seamlessly export premium Indian products with our all-in-one platform. 
              Quality guaranteed, logistics handled, growth delivered.
            </p>
            
            <div className="trust-badges mb-3">
              <div className="trust-badge">
                <span className="trust-badge-icon">✅</span>
                Trusted by 500+ Global Importers
              </div>
              <div className="trust-badge">
                <span className="trust-badge-icon">🌍</span>
                50+ Countries Delivery
              </div>
              <div className="trust-badge">
                <span className="trust-badge-icon">⭐</span>
                4.9/5 Customer Rating
              </div>
            </div>

            <div className="hero-actions">
              <button className="btn btn-primary btn-large">
                Start Exporting Now
              </button>
              <button className="btn btn-secondary btn-large">
                Watch Platform Demo
              </button>
            </div>

            <div className="signup-prompt">
              <p>Already have an account? 
                <a href="/login" className="text-gold"> Sign In</a> 
                or 
                <a href="/signup" className="text-gold"> Create Account</a>
              </p>
            </div>
          </div>

          <div className="hero-visual">
            <div className="floating">
              <div className="product-grid-mini">
                {/* Mini product previews that can be clicked */}
                {['Pomegranates', 'Cardamom', 'Granite', 'Toys'].map((product, index) => (
                  <div 
                    key={index}
                    className="product-mini-card"
                    onClick={() => onProductSelect({ name: product, video: `${product.toLowerCase()}-video.mp4` })}
                  >
                    <div className="product-icon">🌾</div>
                    <span>{product}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;