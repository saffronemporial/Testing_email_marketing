// src/components/public/interactive/CertificationBadges.jsx
import React, { useState } from 'react';
import { indianCertifications } from '../data/indianExportData';
import './CertificationBadges.css';

const CertificationBadges = () => {
  const [selectedCert, setSelectedCert] = useState(null);
  const [showAll, setShowAll] = useState(false);

  const displayedCerts = showAll ? indianCertifications : indianCertifications.slice(0, 6);

  const openVerification = (cert) => {
    setSelectedCert(cert);
  };

  const closeVerification = () => {
    setSelectedCert(null);
  };

  return (
    <div className="gold-certification-section">
      <div className="certification-container">
        <div className="certification-header">
          <div className="header-gold-bar"></div>
          <h2>Government Certified & Quality Assured</h2>
          <p>Trusted by Indian regulatory authorities and international quality standards</p>
          <div className="india-badge">
            <span className="flag">🇮🇳</span>
            <span>Made in India</span>
            <span className="flag">🇮🇳</span>
          </div>
        </div>

        <div className="certification-grid">
          {displayedCerts.map((cert, index) => (
            <div 
              key={cert.id} 
              className={`certification-card ${selectedCert?.id === cert.id ? 'active' : ''}`}
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => openVerification(cert)}
            >
              <div className="certification-visual">
                <div className="cert-badge">
                  <div className="badge-icon">🏆</div>
                  <div className="badge-glow"></div>
                </div>
                <div className="verified-ribbon">Verified</div>
              </div>

              <div className="certification-content">
                <h3>{cert.name}</h3>
                <div className="issuer-info">
                  <span className="issuer-icon">🏛️</span>
                  <span className="issuer-name">{cert.issuer}</span>
                </div>
                <p className="cert-description">{cert.description}</p>
                
                <div className="certification-features">
                  <div className="feature">
                    <span className="feature-icon">✓</span>
                    <span>Government Approved</span>
                  </div>
                  <div className="feature">
                    <span className="feature-icon">✓</span>
                    <span>Regularly Audited</span>
                  </div>
                  <div className="feature">
                    <span className="feature-icon">✓</span>
                    <span>Internationally Recognized</span>
                  </div>
                </div>

                <button className="verify-button">
                  <span className="button-icon">🔍</span>
                  Verify Certification
                  <span className="button-arrow">→</span>
                </button>
              </div>

              <div className="certification-footer">
                <div className="validity">
                  <span className="validity-icon">📅</span>
                  <span>Valid until Dec 2025</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {!showAll && indianCertifications.length > 6 && (
          <div className="view-more-section">
            <button 
              className="view-more-btn"
              onClick={() => setShowAll(true)}
            >
              <span>View All {indianCertifications.length} Certifications</span>
              <span className="arrow-down">↓</span>
            </button>
          </div>
        )}

        <div className="certification-stats">
          <div className="stat-item">
            <div className="stat-number">100%</div>
            <div className="stat-label">Compliance Rate</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">24/7</div>
            <div className="stat-label">Audit Ready</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">0</div>
            <div className="stat-label">Quality Complaints</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">50+</div>
            <div className="stat-label">Countries Accepted</div>
          </div>
        </div>
      </div>

      {/* Verification Modal */}
      {selectedCert && (
        <div className="verification-modal">
          <div className="modal-backdrop" onClick={closeVerification}></div>
          <div className="modal-content">
            <div className="modal-header">
              <h3>Certification Verification</h3>
              <button className="close-button" onClick={closeVerification}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="verification-badge-large">
                <div className="large-badge-icon">🏆</div>
                <div className="badge-title">{selectedCert.name}</div>
              </div>

              <div className="verification-details">
                <div className="detail-row">
                  <span className="detail-label">Issuing Authority:</span>
                  <span className="detail-value">{selectedCert.issuer}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Certification ID:</span>
                  <span className="detail-value">CERT-IN-{selectedCert.id.toString().padStart(4, '0')}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Valid Until:</span>
                  <span className="detail-value">December 31, 2025</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Scope:</span>
                  <span className="detail-value">All Indian Export Products</span>
                </div>
              </div>

              <div className="verification-actions">
                <button className="action-btn primary">
                  <span>Download Certificate PDF</span>
                  <span className="action-icon">📄</span>
                </button>
                <button className="action-btn secondary">
                  <span>Verify Online Portal</span>
                  <span className="action-icon">🌐</span>
                </button>
              </div>

              <div className="compliance-note">
                <div className="compliance-icon">ℹ️</div>
                <p>This certification complies with international standards and is recognized by regulatory authorities in 50+ countries including UAE, USA, UK, EU, and Australia.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CertificationBadges;