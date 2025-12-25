// src/components/public/sections/FinalCTA.jsx
import React from 'react';

const FinalCTA = () => {
  return (
    <section className="section section-accent">
      <div className="container">
        <div className="cta-container">
          <h2 className="cta-title">Ready to Transform Your Export Business?</h2>
          <p className="cta-subtitle">
            Join 500+ successful exporters who trust our platform for their international trade
          </p>

          <div className="cta-stats">
            <div className="stat">
              <div className="stat-number">98%</div>
              <div className="stat-label">Client Satisfaction</div>
            </div>
            <div className="stat">
              <div className="stat-number">24/7</div>
              <div className="stat-label">Support Available</div>
            </div>
            <div className="stat">
              <div className="stat-number">30 Days</div>
              <div className="stat-label">Money-Back Guarantee</div>
            </div>
          </div>

          <div className="cta-actions">
            <a href="/signup" className="btn btn-primary btn-large">
              Start Your Free Trial
            </a>
            <a href="/demo" className="btn btn-secondary btn-large">
              Book Live Demo
            </a>
          </div>

          <div className="cta-features">
            <div className="feature">
              <span className="feature-icon">🚀</span>
              <span>No credit card required</span>
            </div>
            <div className="feature">
              <span className="feature-icon">⚡</span>
              <span>Setup in 30 minutes</span>
            </div>
            <div className="feature">
              <span className="feature-icon">🌍</span>
              <span>50+ countries supported</span>
            </div>
          </div>

          <div className="trust-signals">
            <div className="trust-title">Trusted by leading businesses worldwide</div>
            <div className="client-logos">
              {['Al Maya Group', 'Lulu International', 'Dubai Pharma', 'Emirates Builders'].map((client, index) => (
                <div key={index} className="client-logo">
                  {client}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;