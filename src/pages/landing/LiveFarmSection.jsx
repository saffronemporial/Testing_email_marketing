// src/components/Landing/LiveFarmSection.jsx
import React, { useState, useEffect } from 'react'
import './LiveFarmSection.css';

const LiveFarmSection = () => {
  // Placeholder video URLs – replace with your Supabase public URLs
  const videos = [
    {
      id: 'farm-pomegranate',
      title: 'Pomegranate Orchard – Bhagwa Variety',
      location: 'Maharashtra, India',
      url: 'https://nylqihwnftbmkxuysgko.supabase.co/storage/v1/object/public/Saffron_Emporial/video/Fresh%20Global_%20Farm-to-Client%20Agri-Export%20Overview.mp4',
    },
    {
      id: 'farm-onion',
      title: 'Onion & Chilli Fields',
      location: 'Gujarat, India',
      url: 'https://nylqihwnftbmkxuysgko.supabase.co/storage/v1/object/public/Saffron_Emporial/video/Fresh%20Global_%20Farm-to-Client%20Agri-Export%20Overview.mp4',
    },
  ];

  return (
    <section id="live-farm" className="lf-wrapper">
      <div className="lf-inner">
        <div className="lf-header">
          <div>
            <h2>Live Farm Network</h2>
            <p>See where your produce is grown – in real time.</p>
          </div>
          <div className="lf-header">
           
            <div className="live-farm" >
             <button>
         
             </button>
             
            </div>
          </div>
          <div className="lf-pill">
            <span className="lf-dot" /> Pilot livestreams available for buyers
          </div>
        </div>

        <div className="lf-grid">
          <div className="lf-main">
            <div className="lf-main-video">
              <div className="lf-video-header">
                <span className="lf-live-pill">LIVE</span>
                <span className="lf-video-title">
                  Bhagwa Pomegranate – Orchard Feed
                </span>
                </div>
              <div className="lf-video-placeholder">
                <div className="lf-video-gradient" />
                <div className="lf-video-overlay">
                  <div className="lf-video-tag">Demo stream</div>
                  <div className="lf-video-center">
                    <span className="lf-play-ring" />
                    <span className="lf-play-icon">▶</span>
                  </div>
                  <div className="lf-video-footer">
                    <span>Farm: Nashik, Maharashtra</span>
                    <span>Commodity: Bhagwa Pomegranate</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="lf-metrics">
              <div className="lf-metric">
                <span className="lf-label">Active farms onboarded</span>
                <span className="lf-value">25+</span>
              </div>
              <div className="lf-metric">
                <span className="lf-label">Verified farmer network</span>
                <span className="lf-value">80+</span>
              </div>
              <div className="lf-metric">
                <span className="lf-label">Traceable SKUs</span>
                <span className="lf-value">120+</span>
              </div>
            </div>
          </div>

          <div className="lf-side">
            <h3 className="lf-side-title">Upcoming Live Windows</h3>
            <ul className="lf-slots">
              <li>
                <span className="lf-slot-time">Today • 17:30 IST</span>
                <span className="lf-slot-title">Onion Harvest Walkthrough</span>
                <span className="lf-slot-meta">Bhavnagar, Gujarat</span>
              </li>
              <li>
                <span className="lf-slot-time">Tomorrow • 10:00 IST</span>
                <span className="lf-slot-title">
                  Banana Grading & Packing Line
                </span>
                <span className="lf-slot-meta">Pune, Maharashtra</span>
              </li>
              <li>
                <span className="lf-slot-time">Friday • 16:00 IST</span>
                <span className="lf-slot-title">
                  Grapes Residue-Testing Process
                </span>
                <span className="lf-slot-meta">Nashik, Maharashtra</span>
              </li>
            </ul>

            <div className="lf-note">
              Buyers get private links for high-quality streams, signed QC
              reports, and lot-wise traceability.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LiveFarmSection;
