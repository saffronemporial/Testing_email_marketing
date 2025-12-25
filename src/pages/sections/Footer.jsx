// src/components/public/sections/Footer.jsx
import React from 'react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-main">
            <div className="footer-brand">
              <div className="footer-logo">
                <div className="logo-icon">🌾</div>
                <span className="logo-text">Saffron Emporial</span>
              </div>
              <p className="footer-description">
                Connecting Indian agricultural excellence with global markets through technology and transparency.
              </p>
              <div className="social-links">
                {['LinkedIn', 'Twitter', 'Facebook', 'Instagram'].map(social => (
                  <a key={social} href="#" className="social-link">
                    {social}
                  </a>
                ))}
              </div>
            </div>

            <div className="footer-links">
              <div className="link-column">
                <h4>Products</h4>
                <a href="#">Pomegranates</a>
                <a href="#">Cardamom</a>
                <a href="#">Granite</a>
                <a href="#">Medicines</a>
                <a href="#">View All</a>
              </div>

              <div className="link-column">
                <h4>Platform</h4>
                <a href="#">How It Works</a>
                <a href="#">Features</a>
                <a href="#">Pricing</a>
                <a href="#">Case Studies</a>
                <a href="#">API Docs</a>
              </div>

              <div className="link-column">
                <h4>Company</h4>
                <a href="#">About Us</a>
                <a href="#">Our Farmers</a>
                <a href="#">Careers</a>
                <a href="#">Press</a>
                <a href="#">Contact</a>
              </div>

              <div className="link-column">
                <h4>Support</h4>
                <a href="#">Help Center</a>
                <a href="#">Documentation</a>
                <a href="#">Community</a>
                <a href="#">Status</a>
                <a href="#">Contact Support</a>
              </div>
            </div>
          </div>

          <div className="footer-cta">
            <div className="cta-content">
              <h4>Start Exporting Today</h4>
              <p>Join thousands of successful exporters</p>
              <a href="/signup" className="btn btn-primary">
                Create Free Account
              </a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-legal">
            <div className="legal-links">
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
              <a href="#">Cookie Policy</a>
              <a href="#">GDPR</a>
            </div>
            <div className="copyright">
              © 2024 Saffron Emporial. All rights reserved.
            </div>
          </div>

          <div className="footer-certifications">
            <div className="certification">
              <span>ISO 9001:2015 Certified</span>
            </div>
            <div className="certification">
              <span>APEDA Registered</span>
            </div>
            <div className="certification">
              <span>GDPR Compliant</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;