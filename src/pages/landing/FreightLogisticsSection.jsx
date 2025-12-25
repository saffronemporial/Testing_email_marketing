// src/components/Landing/FreightLogisticsSection.jsx
import React from 'react';
import './FreightLogisticsSection.css';

const FreightLogisticsSection = () => {
  const showShipDetails = (id) => {
    alert(`Ship details for: ${id}`);
  };

  return (
    <section id="freight-logistics" className="freight-wrapper">
      <div className="freight-inner">
        <div className="freight-header">
          <h2>Live Freight & Logistics Command Center</h2>
          <p>
            Real-time visibility for containers moving fresh produce, spices,
            and stone from India to Dubai and the world.
          </p>
        </div>

        <div className="freight-panel">
          <div className="freight-panel-header">
            <div>
              <h3>🗺️ Ocean Freight – Live Route Simulation</h3>
              <p>Illustrative view. Your buyer console shows the real feed.</p>
            </div>
            <div className="freight-status">
              <span className="pill green">3 Active Shipments</span>
              <span className="pill soft">Last update: 2 min ago</span>
            </div>
          </div>

          <div className="freight-map">
            <div className="freight-ocean-bg" />
            <svg className="freight-svg" viewBox="0 0 800 400">
              <path
                d="M 80 260 Q 280 210 520 240"
                stroke="#38bdf8"
                strokeWidth="2.5"
                fill="none"
                strokeDasharray="10,4"
                opacity="0.8"
              />
              <path
                d="M 90 240 Q 260 150 520 190"
                stroke="#fde047"
                strokeWidth="2.5"
                fill="none"
                strokeDasharray="10,4"
                opacity="0.8"
              />
            </svg>

            <div
              className="freight-ship bubble-ship"
              style={{ left: '18%', top: '55%' }}
            >
              <button
                className="freight-ship-dot"
                onClick={() => showShipDetails('MV_SAFFRON_EXPRESS')}
              >
                🚢
              </button>
              <span className="freight-ship-label">MV Saffron Express</span>
            </div>

            <div
              className="freight-ship bubble-ship"
              style={{ left: '30%', top: '40%' }}
            >
              <button
                className="freight-ship-dot"
                onClick={() => showShipDetails('MV_GOLDEN_HARVEST')}
              >
                🚢
              </button>
              <span className="freight-ship-label">MV Golden Harvest</span>
            </div>

            <div
              className="freight-ship bubble-ship"
              style={{ left: '22%', top: '30%' }}
            >
              <button
                className="freight-ship-dot"
                onClick={() => showShipDetails('MV_TRUST_CARRIER')}
              >
                🚢
              </button>
              <span className="freight-ship-label">MV Trust Carrier</span>
            </div>

            <div className="freight-ship-cam">
              <div className="ship-cam-title">LIVE SHIP CAM</div>
              <div className="ship-cam-meta">MV Saffron Express</div>
              <div className="ship-cam-meta small">Deck Camera • Demo</div>
            </div>
          </div>

          <div className="freight-cards">
            <div className="freight-card green">
              <div className="freight-card-head">
                <h4>MV Saffron Express</h4>
                <span className="badge">IN TRANSIT</span>
              </div>
              <dl>
                <div>
                  <dt>Cargo</dt>
                  <dd>2,400kg Bhagwa Pomegranates</dd>
                </div>
                <div>
                  <dt>Client</dt>
                  <dd>Dubai Fresh Market Chain</dd>
                </div>
                <div>
                  <dt>ETA Jebel Ali</dt>
                  <dd>18 Dec 2025 • 14:30 GST</dd>
                </div>
                <div>
                  <dt>Reefer Temp</dt>
                  <dd>4.2°C (Optimal)</dd>
                </div>
              </dl>
              <div className="freight-progress">
                <div style={{ width: '68%' }} />
              </div>
            </div>

            <div className="freight-card blue">
              <div className="freight-card-head">
                <h4>MV Golden Harvest</h4>
                <span className="badge">LOADING</span>
              </div>
              <dl>
                <div>
                  <dt>Cargo</dt>
                  <dd>Onions, bananas, green chillies</dd>
                </div>
                <div>
                  <dt>Client</dt>
                  <dd>GCC Hypermarket Group</dd>
                </div>
                <div>
                  <dt>Departure</dt>
                  <dd>16 Dec 2025 • 09:00 IST</dd>
                </div>
              </dl>
              <div className="freight-progress">
                <div style={{ width: '82%' }} />
              </div>
            </div>

            <div className="freight-card purple">
              <div className="freight-card-head">
                <h4>MV Trust Carrier</h4>
                <span className="badge">CUSTOMS</span>
              </div>
              <dl>
                <div>
                  <dt>Cargo</dt>
                  <dd>Granite slabs, tiles, electric toys</dd>
                </div>
                <div>
                  <dt>Client</dt>
                  <dd>UAE / Oman distributors</dd>
                </div>
                <div>
                  <dt>Arrived</dt>
                  <dd>14 Dec 2025 • 11:20 GST</dd>
                </div>
              </dl>
              <div className="freight-progress">
                <div style={{ width: '91%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FreightLogisticsSection;
