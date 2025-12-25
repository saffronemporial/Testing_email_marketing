// src/components/public/interactive/ClientResultsShowcase.jsx
import React, { useState, useEffect } from 'react';
import { indianClientStories } from '../data/indianExportData';
import './ClientResultsShowcase.css';

const ClientResultsShowcase = () => {
  const [activeClient, setActiveClient] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [metricsVisible, setMetricsVisible] = useState(false);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setActiveClient((prev) => (prev + 1) % indianClientStories.length);
      setMetricsVisible(false);
      setTimeout(() => setMetricsVisible(true), 300);
    }, 6000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  useEffect(() => {
    // Trigger metrics animation when client changes
    setMetricsVisible(false);
    const timer = setTimeout(() => setMetricsVisible(true), 500);
    return () => clearTimeout(timer);
  }, [activeClient]);

  const currentClient = indianClientStories[activeClient];

  const handleClientSelect = (index) => {
    setActiveClient(index);
    setIsAutoPlaying(false);
    setMetricsVisible(false);
    setTimeout(() => setMetricsVisible(true), 300);
  };

  const formatMetricValue = (value) => {
    if (typeof value === 'string' && value.includes('%')) {
      return value;
    }
    if (typeof value === 'number') {
      return value > 10 ? value.toLocaleString() : value;
    }
    return value;
  };

  return (
    <div className="client-showcase-section">
      <div className="showcase-container">
        <div className="showcase-header">
          <div className="header-gold-bar"></div>
          <h2>Success Stories from Dubai & Global Clients</h2>
          <p>See how Indian export businesses are transforming international supply chains</p>
          <div className="client-stats-overview">
            <div className="stat-overview">
              <div className="stat-number">150+</div>
              <div className="stat-label">Satisfied Clients</div>
            </div>
            <div className="stat-overview">
              <div className="stat-number">$25M+</div>
              <div className="stat-label">Annual Export Value</div>
            </div>
            <div className="stat-overview">
              <div className="stat-number">98%</div>
              <div className="stat-label">Client Retention</div>
            </div>
            <div className="stat-overview">
              <div className="stat-number">50+</div>
              <div className="stat-label">Countries Served</div>
            </div>
          </div>
        </div>

        <div className="showcase-content">
          <div className="client-navigation">
            {indianClientStories.map((client, index) => (
              <button
                key={client.id}
                className={`nav-client ${index === activeClient ? 'active' : ''}`}
                onClick={() => handleClientSelect(index)}
              >
                <div className="client-avatar">
                  <div className="avatar-placeholder">
                    {client.client.split(' ').map(word => word[0]).join('')}
                  </div>
                </div>
                <div className="client-info">
                  <div className="client-name">{client.client}</div>
                  <div className="client-industry">{client.industry}</div>
                </div>
              </button>
            ))}
          </div>

          <div className="client-details">
            <div className="client-hero">
              <div className="client-logo-section">
                <div className="logo-placeholder">
                  {currentClient.client.split(' ').map(word => word[0]).join('')}
                </div>
                <div className="client-badge">
                  <span className="badge-icon">🏆</span>
                  <span>Verified Success Story</span>
                </div>
              </div>

              <div className="client-overview">
                <h3>{currentClient.client}</h3>
                <div className="industry-tag">{currentClient.industry}</div>
                <div className="client-products">
                  <span className="products-label">Products:</span>
                  <div className="product-tags">
                    {currentClient.products.map(product => (
                      <span key={product} className="product-tag">{product}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="challenge-solution">
              <div className="challenge-card">
                <div className="card-header challenge">
                  <div className="header-icon">🎯</div>
                  <h4>Business Challenge</h4>
                </div>
                <div className="card-content">
                  <p>{currentClient.challenge}</p>
                </div>
              </div>

              <div className="solution-card">
                <div className="card-header solution">
                  <div className="header-icon">💡</div>
                  <h4>Our Solution</h4>
                </div>
                <div className="card-content">
                  <p>{currentClient.solution}</p>
                </div>
              </div>
            </div>

            <div className="results-section">
              <h4>Measurable Business Impact</h4>
              <div className="metrics-grid">
                {Object.entries(currentClient.results).map(([key, value], index) => (
                  <div 
                    key={key} 
                    className={`metric-card ${metricsVisible ? 'visible' : ''}`}
                    style={{ animationDelay: `${index * 0.2}s` }}
                  >
                    <div className="metric-value">
                      {formatMetricValue(value)}
                    </div>
                    <div className="metric-label">
                      {key.split(/(?=[A-Z])/).join(' ')}
                    </div>
                    <div className="metric-trend">
                      <span className="trend-icon">📈</span>
                      <span>Improvement</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="testimonial-section">
              <div className="testimonial-card">
                <div className="quote-icon">❝</div>
                <blockquote className="testimonial-text">
                  {currentClient.testimonial}
                </blockquote>
                <div className="testimonial-author">
                  <div className="author-info">
                    <div className="author-name">{currentClient.contact}</div>
                    <div className="author-role">{currentClient.client}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="case-study-actions">
              <button className="action-btn primary">
                <span className="action-icon">📊</span>
                Download Full Case Study
              </button>
              <button className="action-btn secondary">
                <span className="action-icon">🎥</span>
                Watch Client Interview
              </button>
              <button className="action-btn secondary">
                <span className="action-icon">🤝</span>
                Get Similar Results
              </button>
            </div>
          </div>
        </div>

        <div className="showcase-footer">
          <div className="trust-indicators">
            <div className="trust-item">
              <div className="trust-icon">✅</div>
              <div className="trust-text">Verified Results</div>
            </div>
            <div className="trust-item">
              <div className="trust-icon">🔒</div>
              <div className="trust-text">Client Confidentiality Protected</div>
            </div>
            <div className="trust-item">
              <div className="trust-icon">📞</div>
              <div className="trust-text">References Available</div>
            </div>
          </div>
          
          <div className="cta-section">
            <h3>Ready to Achieve Similar Results?</h3>
            <p>Join 150+ successful exporters who trust our platform</p>
            <button className="cta-button">
              <span className="cta-icon">🚀</span>
              Start Your Success Story
              <span className="cta-arrow">→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientResultsShowcase;