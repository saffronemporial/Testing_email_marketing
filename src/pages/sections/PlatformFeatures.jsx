// src/components/public/sections/PlatformFeatures.jsx
import React from 'react';

const PlatformFeatures = () => {
  const features = [
    {
      icon: "📱",
      title: "Real-Time Order Tracking",
      description: "Monitor your shipments from farm to destination with live GPS tracking and status updates",
      benefits: ["Live GPS Tracking", "Port Updates", "Customs Clearance Status", "ETA Predictions"]
    },
    {
      icon: "🔗", 
      title: "Blockchain Verification",
      description: "Every product is verified on blockchain for authenticity and quality assurance",
      benefits: ["Product Authenticity", "Quality Verification", "Immutable Records", "Public Verification"]
    },
    {
      icon: "🤖",
      title: "AI Quality Prediction",
      description: "Advanced AI algorithms predict crop quality and optimize harvest timing",
      benefits: ["Quality Forecasting", "Optimal Harvest Times", "Yield Predictions", "Market Insights"]
    },
    {
      icon: "📄",
      title: "Digital Documentation",
      description: "All export documents in one place - invoices, certificates, and compliance papers",
      benefits: ["Digital Invoices", "Export Certificates", "Compliance Docs", "Instant Downloads"]
    },
    {
      icon: "💳",
      title: "Secure Multi-Currency Payments",
      description: "Safe international payments in multiple currencies with fraud protection",
      benefits: ["Multiple Currencies", "Secure Transactions", "Fraud Protection", "Quick Settlements"]
    },
    {
      icon: "🌐",
      title: "24/7 Global Support",
      description: "Dedicated export managers and round-the-clock customer support",
      benefits: ["Dedicated Manager", "24/7 Support", "Multi-language", "Quick Resolution"]
    }
  ];

  return (
    <section className="section section-dark">
      <div className="container">
        <h2 className="section-title">Platform Features</h2>
        <p className="section-subtitle">
          Everything you need for successful international exports in one integrated platform
        </p>

        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
              
              <div className="feature-benefits">
                {feature.benefits.map((benefit, benefitIndex) => (
                  <div key={benefitIndex} className="benefit-item">
                    <span className="benefit-check">✓</span>
                    {benefit}
                  </div>
                ))}
              </div>

              <button className="btn btn-secondary">
                Learn More
              </button>
            </div>
          ))}
        </div>

        <div className="platform-demo">
          <div className="demo-container">
            <h3>See the Platform in Action</h3>
            <p>Experience how our platform simplifies export management for businesses of all sizes</p>
            <div className="demo-actions">
              <button className="btn btn-primary btn-large">
                Watch Platform Tour
              </button>
              <button className="btn btn-secondary btn-large">
                Request Live Demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PlatformFeatures;