// src/components/public/sections/HowItWorks.jsx
import React from 'react';

const HowItWorks = () => {
  const steps = [
    {
      number: "01",
      title: "Select Products & Get Quote",
      description: "Browse our catalog and get instant pricing for your order",
      icon: "📦",
      features: ["Live Pricing", "Quality Grades", "Minimum Orders"]
    },
    {
      number: "02",
      title: "Place Order & Manage Documents",
      description: "Complete your order and access all export documentation digitally",
      icon: "📝",
      features: ["Digital Invoices", "Export Certificates", "Quality Reports"]
    },
    {
      number: "03",
      title: "Track Shipment in Real-Time",
      description: "Monitor your order from farm to destination with live tracking",
      icon: "🚢",
      features: ["Live GPS Tracking", "Port Updates", "Customs Clearance"]
    },
    {
      number: "04",
      title: "Receive & Verify Quality",
      description: "Get delivery confirmation and quality verification at destination",
      icon: "✅",
      features: ["Quality Verification", "Delivery Confirmation", "Payment Processing"]
    }
  ];

  return (
    <section id="how-it-works" className="section section-light">
      <div className="container">
        <h2 className="section-title">How Exporting Works</h2>
        <p className="section-subtitle">
          Simple 4-step process from order to delivery. Everything handled for you.
        </p>

        <div className="process-steps">
          {steps.map((step, index) => (
            <div key={index} className="process-step">
              <div className="step-header">
                <div className="step-number">{step.number}</div>
                <div className="step-icon">{step.icon}</div>
              </div>
              
              <h3 className="step-title">{step.title}</h3>
              <p className="step-description">{step.description}</p>
              
              <div className="step-features">
                {step.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="step-feature">
                    <span className="feature-check">✓</span>
                    {feature}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="process-demo">
          <div className="demo-card">
            <h4>See It In Action</h4>
            <p>Watch how Dubai-based Al Maya Group manages their exports through our platform</p>
            <button className="btn btn-primary">
              Watch Client Demo (2 min)
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;