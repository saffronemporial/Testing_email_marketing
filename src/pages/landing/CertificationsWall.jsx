import React from 'react';
import './CertificationsWall.css';

export default function CertificationsWall() {
  return (
    <section id="certifications" className="cw-section">
      <div className="cw-inner">
        <div className="cw-left">
          <div className="cw-pill">
            <span className="cw-dot" />
            <span>Global export-ready credentials</span>
          </div>
          <h2 className="cw-title">
            Certifications & Compliance you can rely on
          </h2>
          <p className="cw-subtitle">
            Saffron Emporial and its group companies follow strict export
            compliance and food safety norms so overseas buyers can
            onboard us as a long-term, low-risk supply partner.
          </p>

          <div className="cw-grid">
            <div className="cw-card">
              <div className="cw-badge">APEDA</div>
              <h3>APEDA Registered Exporter</h3>
              <p>
                Registered with India&apos;s official export promotion body for
                agricultural and processed foods. Enables smoother export of
                fresh fruits, vegetables and processed products.
              </p>
            </div>

            <div className="cw-card">
              <div className="cw-badge">FSSAI</div>
              <h3>Food Safety & Standards</h3>
              <p>
                FSSAI compliant handling, packing and cold-chain practices, with
                strong focus on hygiene, traceability and food safety norms.
              </p>
            </div>

            <div className="cw-card">
              <div className="cw-badge">IEC</div>
              <h3>IEC & Export Documentation</h3>
              <p>
                Valid IEC and complete export documentation support for every
                shipment: invoices, packing list, Phyto / health certificates,
                country-specific docs and more.
              </p>
            </div>

            <div className="cw-card">
              <div className="cw-badge">QUALITY</div>
              <h3>Grading & Pre-Shipment QC</h3>
              <p>
                Grading, size calibration and pre-shipment inspection for
                pomegranates, onions, grapes, bananas, chillies, cumin, coconuts,
                granite, tiles and kids electric toys.
              </p>
            </div>
          </div>
        </div>

        <div className="cw-right">
          <div className="cw-trust-score">
            <div className="cw-trust-header">
              <span className="cw-trust-label">Saffron Trust Score</span>
              <span className="cw-trust-value">A+</span>
            </div>
            <div className="cw-trust-bar">
              <div className="cw-trust-fill" />
            </div>
            <ul className="cw-trust-list">
              <li>On-time shipments & document accuracy</li>
              <li>Consistent product quality & packing</li>
              <li>Transparent communication on every order</li>
              <li>End-to-end logistics support for new buyers</li>
            </ul>
            <div className="cw-trust-footnote">
              Internal, evolving score based on delivery history, quality checks
              and client feedback across our group companies.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
