// src/components/public/interactive/BlockchainVerification.jsx
import React, { useState, useEffect } from 'react';
import { blockchainBatches, indianFarmsAndFactories } from '../data/indianExportData';
import './BlockchainVerification.css';

const BlockchainVerification = () => {
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [verificationStep, setVerificationStep] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    // Auto-select first batch on load
    if (blockchainBatches.length > 0 && !selectedBatch) {
      setSelectedBatch(blockchainBatches[0]);
    }
  }, []);

  const handleBatchSelect = (batch) => {
    setSelectedBatch(batch);
    setVerificationStep(0);
    setIsVerifying(true);
    
    // Simulate verification process
    let step = 0;
    const interval = setInterval(() => {
      step++;
      setVerificationStep(step);
      if (step >= 4) {
        clearInterval(interval);
        setTimeout(() => setIsVerifying(false), 500);
      }
    }, 800);
  };

  const verifyBatch = (batchId) => {
    const batch = blockchainBatches.find(b => b.batchId === batchId);
    if (batch) {
      handleBatchSelect(batch);
    }
  };

  const getFarmInfo = (farmName) => {
    return indianFarmsAndFactories.find(farm => farm.name.includes(farmName)) || {};
  };

  const getStatusIcon = (stepIndex, currentStep) => {
    if (stepIndex < currentStep) return '✅';
    if (stepIndex === currentStep) return '⏳';
    return '⏱️';
  };

  const getVerificationStatus = () => {
    if (isVerifying) {
      return { status: 'verifying', message: 'Verifying on Blockchain...', color: '#3498db' };
    }
    if (selectedBatch) {
      return { status: 'verified', message: '✓ Blockchain Verified', color: '#27ae60' };
    }
    return { status: 'pending', message: 'Select a batch to verify', color: '#95a5a6' };
  };

  const status = getVerificationStatus();

  return (
    <div className="blockchain-verification-section">
      <div className="blockchain-container">
        <div className="blockchain-header">
          <div className="header-gold-bar"></div>
          <h2>Blockchain Product Verification</h2>
          <p>Verify the authenticity and journey of your Indian export products on our immutable blockchain</p>
          <div className="blockchain-badges">
            <div className="tech-badge">
              <span className="badge-icon">⛓️</span>
              <span>Hyperledger Blockchain</span>
            </div>
            <div className="tech-badge">
              <span className="badge-icon">🔒</span>
              <span>Immutable Records</span>
            </div>
            <div className="tech-badge">
              <span className="badge-icon">🌐</span>
              <span>Public Verification</span>
            </div>
          </div>
        </div>

        <div className="blockchain-content">
          <div className="verification-interface">
            <div className="search-section">
              <div className="search-header">
                <h3>Verify Product Authenticity</h3>
                <div className="search-subtitle">
                  Enter Batch ID or Scan QR Code to verify product journey from Indian farm to destination
                </div>
              </div>
              
              <div className="search-input-group">
                <div className="input-wrapper">
                  <input
                    type="text"
                    placeholder="Enter Batch ID (e.g., BATCH-KSH-2024-001)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                  />
                  <button 
                    className="search-btn"
                    onClick={() => verifyBatch(searchQuery)}
                    disabled={!searchQuery || isVerifying}
                  >
                    <span className="btn-icon">🔍</span>
                    Verify
                  </button>
                </div>
                <div className="qr-option">
                  <button className="qr-btn">
                    <span className="qr-icon">📱</span>
                    Scan QR Code
                  </button>
                </div>
              </div>

              <div className="recent-batches">
                <div className="section-label">Recent Export Batches</div>
                <div className="batches-grid">
                  {blockchainBatches.map((batch) => (
                    <div
                      key={batch.batchId}
                      className={`batch-card ${selectedBatch?.batchId === batch.batchId ? 'selected' : ''}`}
                      onClick={() => handleBatchSelect(batch)}
                    >
                      <div className="batch-header">
                        <div className="batch-id">{batch.batchId}</div>
                        <div className="batch-status verified">Verified</div>
                      </div>
                      <div className="batch-details">
                        <div className="detail">
                          <span className="label">Farm:</span>
                          <span className="value">{batch.farm}</span>
                        </div>
                        <div className="detail">
                          <span className="label">Harvest:</span>
                          <span className="value">{batch.harvestDate}</span>
                        </div>
                        <div className="detail">
                          <span className="label">Quality Score:</span>
                          <span className="value score">{batch.qualityScore}/100</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="verification-result">
              <div className="result-header">
                <div className="status-indicator" style={{ backgroundColor: status.color }}>
                  <div className="status-icon">
                    {isVerifying ? '⏳' : '✅'}
                  </div>
                  <span className="status-text">{status.message}</span>
                </div>
                
                {selectedBatch && (
                  <div className="batch-overview">
                    <div className="overview-card">
                      <div className="overview-header">
                        <h4>Batch Overview</h4>
                        <div className="quality-badge">
                          <span className="quality-score">{selectedBatch.qualityScore}</span>
                          <span className="quality-label">Quality Score</span>
                        </div>
                      </div>
                      <div className="overview-details">
                        <div className="overview-item">
                          <span className="label">Batch ID:</span>
                          <span className="value code">{selectedBatch.batchId}</span>
                        </div>
                        <div className="overview-item">
                          <span className="label">Origin Farm:</span>
                          <span className="value">{selectedBatch.farm}</span>
                        </div>
                        <div className="overview-item">
                          <span className="label">Harvest Date:</span>
                          <span className="value">{selectedBatch.harvestDate}</span>
                        </div>
                        <div className="overview-item">
                          <span className="label">Quantity:</span>
                          <span className="value">{selectedBatch.quantity}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {selectedBatch && (
                <div className="supply-chain-timeline">
                  <h4>Supply Chain Journey</h4>
                  <div className="timeline">
                    {selectedBatch.transactions.map((transaction, index) => (
                      <div key={index} className="timeline-item">
                        <div className="timeline-marker">
                          <div className="marker-icon">
                            {getStatusIcon(index, verificationStep)}
                          </div>
                          <div className="timeline-line"></div>
                        </div>
                        <div className="timeline-content">
                          <div className="transaction-step">{transaction.step}</div>
                          <div className="transaction-details">
                            <div className="detail">
                              <span className="icon">📅</span>
                              <span>{transaction.timestamp}</span>
                            </div>
                            <div className="detail">
                              <span className="icon">📍</span>
                              <span>{transaction.location}</span>
                            </div>
                          </div>
                          {transaction.verified && (
                            <div className="verification-badge">
                              <span className="verify-icon">✓</span>
                              <span>Blockchain Verified</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedBatch && (
                <div className="farm-info">
                  <h4>Origin Farm Information</h4>
                  <div className="farm-card">
                    <div className="farm-header">
                      <div className="farm-name">{selectedBatch.farm}</div>
                      <div className="farm-location">
                        <span className="location-icon">📍</span>
                        <span>{getFarmInfo(selectedBatch.farm).city}, India</span>
                      </div>
                    </div>
                    <div className="farm-details">
                      <div className="detail-grid">
                        <div className="detail-item">
                          <span className="label">Certifications:</span>
                          <span className="value">
                            {getFarmInfo(selectedBatch.farm).certification?.join(', ') || 'ISO 22000, Organic'}
                          </span>
                        </div>
                        <div className="detail-item">
                          <span className="label">Established:</span>
                          <span className="value">{getFarmInfo(selectedBatch.farm).established || '2005'}</span>
                        </div>
                        <div className="detail-item">
                          <span className="label">Workers:</span>
                          <span className="value">{getFarmInfo(selectedBatch.farm).workers || '120'}+</span>
                        </div>
                        <div className="detail-item">
                          <span className="label">Capacity:</span>
                          <span className="value">{getFarmInfo(selectedBatch.farm).capacity || '500 tons/month'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedBatch && !isVerifying && (
                <div className="verification-actions">
                  <button className="action-btn primary">
                    <span className="action-icon">📄</span>
                    Download Verification Certificate
                  </button>
                  <button className="action-btn secondary">
                    <span className="action-icon">🔗</span>
                    View on Blockchain Explorer
                  </button>
                  <button className="action-btn secondary">
                    <span className="action-icon">📧</span>
                    Share Verification
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="blockchain-features">
            <div className="feature-section">
              <h3>Why Blockchain Verification?</h3>
              <div className="features-grid">
                <div className="feature-item">
                  <div className="feature-icon">🔒</div>
                  <h4>Immutable Records</h4>
                  <p>Once recorded, product journey data cannot be altered or tampered with</p>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">🌐</div>
                  <h4>Transparent Supply Chain</h4>
                  <p>Complete visibility from Indian farms to international destinations</p>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">⚡</div>
                  <h4>Instant Verification</h4>
                  <p>Verify product authenticity and origin in seconds using Batch ID or QR</p>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">📊</div>
                  <h4>Quality Assurance</h4>
                  <p>Real-time quality metrics and compliance data for every batch</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlockchainVerification;