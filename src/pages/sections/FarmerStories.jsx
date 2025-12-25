// src/components/public/sections/FarmerStories.jsx
import React, { useState } from 'react';

const FarmerStories = () => {
  const [activeFarmer, setActiveFarmer] = useState(0);

  const farmers = [
    {
      id: 1,
      name: "Rajesh Kumar",
      farm: "Maharashtra Pomegranate Farms",
      location: "Solapur, Maharashtra",
      experience: "15+ years",
      story: "With Saffron Emporial, I've doubled my income while maintaining the highest quality standards. The platform connects me directly with international buyers.",
      achievements: ["500% Income Growth", "International Quality Certified", "Sustainable Farming"],
      image: "👨‍🌾",
      products: ["Pomegranates", "Grapes"]
    },
    {
      id: 2,
      name: "Priya Sharma",
      farm: "Kerala Cardamom Estates", 
      location: "Idukki, Kerala",
      experience: "12+ years",
      story: "As a woman farmer, this platform has given me financial independence and global recognition for my organic cardamom.",
      achievements: ["Women Entrepreneur Award", "Organic Certified", "Fair Trade Partner"],
      image: "👩‍🌾",
      products: ["Cardamom", "Black Pepper"]
    },
    {
      id: 3,
      name: "Vikram Singh",
      farm: "Rajasthan Granite Works",
      location: "Udaipur, Rajasthan", 
      experience: "20+ years",
      story: "We've expanded from local markets to international clients in Dubai and Europe through transparent quality verification.",
      achievements: ["Export Excellence Award", "Quality Certified", "50+ Intl Clients"],
      image: "👨‍💼",
      products: ["Granite", "Marble"]
    }
  ];

  return (
    <section id="farmers" className="section section-accent">
      <div className="container">
        <h2 className="section-title">Meet Our Farmers</h2>
        <p className="section-subtitle">
          Real stories from the heart of Indian agriculture. Quality you can trace back to source.
        </p>

        <div className="farmer-showcase">
          <div className="farmer-navigation">
            {farmers.map((farmer, index) => (
              <button
                key={farmer.id}
                className={`farmer-nav-btn ${activeFarmer === index ? 'active' : ''}`}
                onClick={() => setActiveFarmer(index)}
              >
                <div className="farmer-avatar">{farmer.image}</div>
                <div className="farmer-info">
                  <div className="farmer-name">{farmer.name}</div>
                  <div className="farmer-location">{farmer.location}</div>
                </div>
              </button>
            ))}
          </div>

          <div className="farmer-details">
            {farmers.map((farmer, index) => (
              <div 
                key={farmer.id}
                className={`farmer-card ${activeFarmer === index ? 'active' : ''}`}
              >
                <div className="farmer-header">
                  <div className="farmer-main-info">
                    <h3>{farmer.name}</h3>
                    <p className="farm-name">{farmer.farm}</p>
                    <p className="farmer-experience">{farmer.experience} experience</p>
                  </div>
                  <div className="farmer-products">
                    <strong>Products:</strong>
                    <div className="product-tags">
                      {farmer.products.map(product => (
                        <span key={product} className="product-tag">{product}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="farmer-story">
                  <p>"{farmer.story}"</p>
                </div>

                <div className="farmer-achievements">
                  <h4>Key Achievements</h4>
                  <div className="achievements-grid">
                    {farmer.achievements.map((achievement, achievementIndex) => (
                      <div key={achievementIndex} className="achievement">
                        <span className="achievement-icon">🏆</span>
                        {achievement}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="farmer-verification">
                  <div className="verification-badge">
                    <span className="verified-icon">✓</span>
                    Blockchain Verified Supply Chain
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FarmerStories;