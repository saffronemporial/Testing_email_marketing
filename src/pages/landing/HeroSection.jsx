// src/components/Landing/HeroSection.jsx
import React from 'react';
import './HeroSection.css';
import { Link } from 'react-router-dom';


const HeroSection = () => {
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section id="home" className="hero-wrapper">
      <div className="hero-background-orbit" aria-hidden="true" />
      <div className="hero-grid">
        <div className="hero-left">
          <p className="hero-eyebrow">Export Intelligence • Farm to Freight</p>
          <h1 className="hero-title">
            The Trust Engine
            <span className="hero-title-highlight">
              {' '}
              for Global Agro Trade
            </span>
            <div className="hero-subtitle">
        
            </div>
          </h1>
          <p className="hero-subtitle">
            Live farms, live containers, live payments. Saffron Emporial gives
            importers real-time visibility on every shipment of pomegranates,
            onions, grapes, bananas, chillies, cumin, coconuts, granite, tiles
            and more.
          </p>
          <div className="hero-cta-row">
            <button
              className="hero-cta primary"
              onClick={() => scrollTo('live-farm')}
            >
              🔴 Watch Live Farm Feed
            </button>
             <div className="feature-card " >
             <Link to="/LiveFarmAi" className="live-farm-btn">
              🚜 Jump To Live Farm
              </Link>
              </div>
              <div className="feature-card " >
             <Link to="/ProductShowcaseLive" className="live-farm-btn">
              🚜 Product Showcase
              </Link>
              </div>

            <button
              className="hero-cta ghost"
              onClick={() => scrollTo('freight-logistics')}
            >
              🚢 Track Live Shipments
            </button>
          </div>
          <div className="hero-meta-row">
            <div className="hero-meta-pill">
              <span className="dot live" /> Live visibility from farm to port
            </div>
            <div className="hero-meta-pill">
              <span className="dot verified" /> End-to-end export compliance
            </div>
          </div>
          <div className="hero-login-row">
            <span className="hero-login-label">For existing buyers:</span>
            <Link to="/login" className="hero-login-link">
              Login to Buyer Console →
            </Link>

                        <Link to="/signup" className="hero-login-link">
              Create New Account →
            </Link>

          </div>
        </div>

        <div className="hero-right">
          <div className="hero-card-main">
            <div className="hero-card-header">
              <span className="hero-chip">Live Export Snapshot</span>
              <span className="hero-chip-outline">Updated 2 min ago</span>
            </div>
            <div className="hero-card-stats">
              <div className="hero-stat">
                <div className="hero-stat-label">Active Containers</div>
                <div className="hero-stat-value">06</div>
                <div className="hero-stat-meta">Jebel Ali • Rotterdam • Dubai</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-label">On-Route Volume</div>
                <div className="hero-stat-value">42 MT</div>
                <div className="hero-stat-meta">Pomegranate, onion, banana mix</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-label">OTIF Performance</div>
                <div className="hero-stat-value green">98.3%</div>
                <div className="hero-stat-meta">On-time in-full last 90 days</div>
              </div>
            </div>
            <div className="hero-mini-strip">
              <div>
                <span className="mini-label">Featured commodity</span>
                <span className="mini-value">Bhagwa Pomegranate (India)</span>
              </div>
              <div>
                <span className="mini-label">Avg. spot price</span>
                <span className="mini-value">On request • FOB Nhava Sheva</span>
              </div>
            </div>
          </div>

          <div className="hero-badges-row">
            <div className="hero-badge">
              <span>📡</span> Live IoT temperature monitoring
            </div>
            <div className="hero-badge">
              <span>✅</span> Pre-vetted farmer & packhouse network
            </div>
            <div className="hero-badge">
              <span>🌍</span> Dubai • GCC • EU focused routing
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
