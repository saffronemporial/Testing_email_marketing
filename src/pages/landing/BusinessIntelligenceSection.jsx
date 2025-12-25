// src/components/Landing/BusinessIntelligenceSection.jsx
import React from 'react';
import './BusinessIntelligenceSection.css';
import { Link } from 'react-router-dom';

const BusinessIntelligenceSection = () => {
  return (
    <section
      id="business-intelligence"
      className="bi-wrapper"
    >
      <div className="bi-inner">
        <div className="bi-left">
          <h2>Business Intelligence for Your Import Desk</h2>
          <p>
            Your private buyer console combines shipment tracking, product
            pricing, quality scores and contract performance in one place,
            powered by your Supabase data.
          </p>

          <ul className="bi-list">
            <li>Order and shipment status in one real-time dashboard</li>
            <li>Product-wise price & volume trends over seasons</li>
            <li>Document vault for invoices, BLs and certificates</li>
            <li>Automated alerts for delays, temperature and stock-outs</li>
          </ul>

          <div className="bi-cta-row">
            <Link to="/login" className="bi-cta primary">
              Login to Buyer Console
            </Link>
            <Link to="/signup" className="bi-cta ghost">
              Request Access
            </Link>
          </div>
        </div>

        <div className="bi-right">
          <div className="bi-card">
            <div className="bi-card-header">
              <span className="bi-chip">Live Analytics</span>
              <span className="bi-chip-soft">Demo view</span>
            </div>
            <div className="bi-chart">
              <div className="bi-bar" style={{ height: '65%' }}>
                <span>Pomegranate</span>
              </div>
              <div className="bi-bar" style={{ height: '45%' }}>
                <span>Onion</span>
              </div>
              <div className="bi-bar" style={{ height: '55%' }}>
                <span>Grapes</span>
              </div>
              <div className="bi-bar" style={{ height: '35%' }}>
                <span>Banana</span>
              </div>
            </div>
            <p className="bi-footnote">
              Actual data will load from your Supabase tables (&ldquo;orders&rdquo;,
              &ldquo;shipments&rdquo;, &ldquo;export_orders&rdquo;) in the buyer console.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BusinessIntelligenceSection;