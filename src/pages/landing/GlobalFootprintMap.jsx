import React from 'react';
import './GlobalFootprintMap.css';

export default function GlobalFootprintMap() {
  const lanes = [
    { id: 1, label: 'India → UAE / GCC', volume: 'Fresh fruits & vegetables', tag: 'High frequency' },
    { id: 2, label: 'India → Europe', volume: 'Granite, tiles, naturals', tag: 'Project cargo' },
    { id: 3, label: 'India → Africa / Asia', volume: 'Onions, spices, FMCG', tag: 'Emerging lanes' },
  ];

  return (
    <section id="global-footprint" className="gf-section">
      <div className="gf-inner">
        <div className="gf-left">
          <p className="gf-kicker">GLOBAL EXPORT FOOTPRINT</p>
          <h2 className="gf-title">
            One export hub in India, multiple destinations across the globe
          </h2>
          <p className="gf-subtitle">
            Saffron Emporial operates as an integrated export partner for
            pomegranates, onions, grapes, bananas, green chillies, cumin,
            coconuts, granite, tiles and kids electric toys – consolidating
            multi-product shipments into predictable, repeatable lanes.
          </p>

          <div className="gf-lane-list">
            {lanes.map((lane) => (
              <div key={lane.id} className="gf-lane-card">
                <div className="gf-lane-dot" />
                <div className="gf-lane-body">
                  <div className="gf-lane-label">{lane.label}</div>
                  <div className="gf-lane-volume">{lane.volume}</div>
                  <div className="gf-lane-tag">{lane.tag}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="gf-right">
          <div className="gf-map-card">
            <div className="gf-map-header">
              <div>
                <div className="gf-map-title">Live Export Footprint</div>
                <div className="gf-map-sub">Representative routes for active and emerging markets</div>
              </div>
              <div className="gf-map-pill">
                <span className="gf-map-dot" />
                <span>Updated monthly</span>
              </div>
            </div>

            {/* Stylised world map */}
            <div className="gf-map-body">
              <div className="gf-map-bg" />
              <svg
                className="gf-map-svg"
                viewBox="0 0 800 400"
                preserveAspectRatio="xMidYMid meet"
              >
                {/* India hub */}
                <circle cx="420" cy="210" r="6" className="gf-node-india" />
                <text x="430" y="205" className="gf-label">India Hub</text>

                {/* UAE / GCC */}
                <circle cx="470" cy="205" r="4" className="gf-node-gcc" />
                <path d="M 420 210 Q 445 195 470 205" className="gf-route-main" />
                <text x="475" y="200" className="gf-label-small">UAE / GCC</text>

                {/* Europe */}
                <circle cx="430" cy="130" r="4" className="gf-node-eu" />
                <path d="M 420 210 Q 410 160 430 130" className="gf-route-secondary" />
                <text x="440" y="125" className="gf-label-small">Europe</text>

                {/* Africa */}
                <circle cx="390" cy="240" r="4" className="gf-node-africa" />
                <path d="M 420 210 Q 400 220 390 240" className="gf-route-secondary" />
                <text x="360" y="245" className="gf-label-small">Africa</text>

                {/* Asia / Far East */}
                <circle cx="550" cy="200" r="4" className="gf-node-asia" />
                <path d="M 420 210 Q 500 180 550 200" className="gf-route-secondary" />
                <text x="560" y="195" className="gf-label-small">Asia</text>
              </svg>
            </div>

            <div className="gf-map-footer">
              <div className="gf-legend">
                <span className="gf-legend-item">
                  <span className="gf-legend-dot main" /> Primary lanes
                </span>
                <span className="gf-legend-item">
                  <span className="gf-legend-dot secondary" /> Expansion lanes
                </span>
              </div>
              <div className="gf-footnote">
                Detailed lane information, frequency and latest sailing schedule
                is shared privately with onboarded buyers.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
