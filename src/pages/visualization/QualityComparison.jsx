// src/components/public/visualization/QualityComparison.jsx
import React, { useState, useEffect } from 'react';
import { indianProducts } from '../data/indianExportData';
import './QualityComparison.css';

const QualityComparison = () => {
  const [selectedProduct, setSelectedProduct] = useState('pomegranate');
  const [comparisonMode, setComparisonMode] = useState('global');
  const [activeMetric, setActiveMetric] = useState('purity');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);

  const product = indianProducts[selectedProduct];
  
  const competitors = {
    pomegranate: [
      { name: 'Turkish Pomegranate', country: 'Turkey', score: 82, price: '$85/kg' },
      { name: 'Iranian Pomegranate', country: 'Iran', score: 78, price: '$75/kg' },
      { name: 'Spanish Pomegranate', country: 'Spain', score: 85, price: '$95/kg' }
    ],
    cardamom: [
      { name: 'Guatemalan Cardamom', country: 'Guatemala', score: 80, price: '$1100/kg' },
      { name: 'Sri Lankan Cardamom', country: 'Sri Lanka', score: 76, price: '$1000/kg' },
      { name: 'Tanzanian Cardamom', country: 'Tanzania', score: 72, price: '$900/kg' }
    ],
    granite: [
      { name: 'Brazilian Granite', country: 'Brazil', score: 84, price: '$1800/sqm' },
      { name: 'Italian Marble', country: 'Italy', score: 88, price: '$2500/sqm' },
      { name: 'Chinese Granite', country: 'China', score: 75, price: '$1200/sqm' }
    ],
    medicines: [
      { name: 'European Generic', country: 'EU', score: 90, price: '$$$' },
      { name: 'US Generic', country: 'USA', score: 92, price: '$$$$' },
      { name: 'Chinese Generic', country: 'China', score: 70, price: '$' }
    ]
  };

  const qualityMetrics = {
    purity: { 
      label: 'Chemical Purity', 
      icon: '🧪',
      description: 'Absence of contaminants and chemicals',
      indianScore: 98,
      globalAvg: 85
    },
    freshness: { 
      label: 'Freshness Index', 
      icon: '⏱️',
      description: 'Time from harvest to market',
      indianScore: 95,
      globalAvg: 78
    },
    certification: { 
      label: 'Certification Level', 
      icon: '🏆',
      description: 'International quality certifications',
      indianScore: 96,
      globalAvg: 72
    },
    traceability: { 
      label: 'Supply Chain Traceability', 
      icon: '🔍',
      description: 'Blockchain verified journey',
      indianScore: 99,
      globalAvg: 45
    },
    sustainability: { 
      label: 'Sustainability Score', 
      icon: '🌱',
      description: 'Environmental impact assessment',
      indianScore: 92,
      globalAvg: 68
    },
    customer_satisfaction: { 
      label: 'Customer Satisfaction', 
      icon: '⭐',
      description: 'Client feedback and ratings',
      indianScore: 97,
      globalAvg: 82
    }
  };

  useEffect(() => {
    if (isAnalyzing) {
      const interval = setInterval(() => {
        setAnalysisProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsAnalyzing(false);
            return 100;
          }
          return prev + 2;
        });
      }, 50);
      return () => clearInterval(interval);
    }
  }, [isAnalyzing]);

  const startAnalysis = () => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);
  };

  const getQualityColor = (score) => {
    if (score >= 90) return '#27ae60';
    if (score >= 80) return '#f39c12';
    return '#e74c3c';
  };

  const getQualityLabel = (score) => {
    if (score >= 90) return 'EXCELLENT';
    if (score >= 80) return 'GOOD';
    if (score >= 70) return 'AVERAGE';
    return 'POOR';
  };

  const calculateOverallScore = () => {
    const scores = Object.values(qualityMetrics).map(metric => metric.indianScore);
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  };

  const renderRadarChart = () => {
    const metrics = Object.keys(qualityMetrics);
    const centerX = 200;
    const centerY = 200;
    const radius = 150;
    
    return (
      <div className="radar-chart">
        <svg width="400" height="400" viewBox="0 0 400 400">
          {/* Grid Circles */}
          <circle cx={centerX} cy={centerY} r={radius} fill="none" stroke="rgba(0, 180, 219, 0.2)" strokeWidth="1"/>
          <circle cx={centerX} cy={centerY} r={radius * 0.75} fill="none" stroke="rgba(0, 180, 219, 0.2)" strokeWidth="1"/>
          <circle cx={centerX} cy={centerY} r={radius * 0.5} fill="none" stroke="rgba(0, 180, 219, 0.2)" strokeWidth="1"/>
          <circle cx={centerX} cy={centerY} r={radius * 0.25} fill="none" stroke="rgba(0, 180, 219, 0.2)" strokeWidth="1"/>
          
          {/* Axes */}
          {metrics.map((_, index) => {
            const angle = (index * 2 * Math.PI) / metrics.length;
            const x = centerX + radius * Math.sin(angle);
            const y = centerY - radius * Math.cos(angle);
            return (
              <line 
                key={index}
                x1={centerX} 
                y1={centerY} 
                x2={x} 
                y2={y} 
                stroke="rgba(0, 180, 219, 0.3)" 
                strokeWidth="1"
              />
            );
          })}
          
          {/* Indian Product Data */}
          <polygon 
            points={metrics.map((metric, index) => {
              const angle = (index * 2 * Math.PI) / metrics.length;
              const score = qualityMetrics[metric].indianScore;
              const r = (score / 100) * radius;
              const x = centerX + r * Math.sin(angle);
              const y = centerY - r * Math.cos(angle);
              return `${x},${y}`;
            }).join(' ')}
            fill="rgba(0, 180, 219, 0.3)"
            stroke="#00b4db"
            strokeWidth="2"
            className="radar-fill"
          />
          
          {/* Global Average Data */}
          <polygon 
            points={metrics.map((metric, index) => {
              const angle = (index * 2 * Math.PI) / metrics.length;
              const score = qualityMetrics[metric].globalAvg;
              const r = (score / 100) * radius;
              const x = centerX + r * Math.sin(angle);
              const y = centerY - r * Math.cos(angle);
              return `${x},${y}`;
            }).join(' ')}
            fill="rgba(231, 76, 60, 0.3)"
            stroke="#e74c3c"
            strokeWidth="2"
            className="radar-fill"
          />
          
          {/* Labels */}
          {metrics.map((metric, index) => {
            const angle = (index * 2 * Math.PI) / metrics.length;
            const x = centerX + (radius + 20) * Math.sin(angle);
            const y = centerY - (radius + 20) * Math.cos(angle);
            return (
              <text 
                key={metric}
                x={x} 
                y={y} 
                textAnchor="middle" 
                dominantBaseline="middle"
                className="radar-label"
                fill="#b0bec5"
                fontSize="10"
              >
                {qualityMetrics[metric].label.split(' ')[0]}
              </text>
            );
          })}
        </svg>
        
        <div className="radar-legend">
          <div className="legend-item">
            <div className="legend-color indian"></div>
            <span>Indian Quality (Avg: {calculateOverallScore()}%)</span>
          </div>
          <div className="legend-item">
            <div className="legend-color global"></div>
            <span>Global Average (Avg: 72%)</span>
          </div>
        </div>
      </div>
    );
  };

  const renderMetricBar = (metric, score, avgScore, isIndian = true) => {
    return (
      <div className="metric-bar">
        <div className="metric-header">
          <div className="metric-info">
            <span className="metric-icon">{qualityMetrics[metric].icon}</span>
            <span className="metric-name">{qualityMetrics[metric].label}</span>
          </div>
          <div className="metric-score">
            <span className="score-value" style={{ color: getQualityColor(score) }}>
              {score}%
            </span>
            <span className="score-label" style={{ color: getQualityColor(score) }}>
              {getQualityLabel(score)}
            </span>
          </div>
        </div>
        
        <div className="progress-bars">
          <div className="progress-group">
            <div className="progress-label">{isIndian ? 'Indian Quality' : 'Global Avg'}</div>
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ 
                  width: `${score}%`,
                  backgroundColor: getQualityColor(score)
                }}
              ></div>
            </div>
            <div className="progress-value">{score}%</div>
          </div>
          
          <div className="progress-group">
            <div className="progress-label">{isIndian ? 'Global Avg' : 'Indian Quality'}</div>
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ 
                  width: `${avgScore}%`,
                  backgroundColor: getQualityColor(avgScore)
                }}
              ></div>
            </div>
            <div className="progress-value">{avgScore}%</div>
          </div>
        </div>
        
        <div className="metric-description">
          {qualityMetrics[metric].description}
        </div>
        
        <div className="quality-difference">
          <div className={`difference ${score > avgScore ? 'positive' : 'negative'}`}>
            {score > avgScore ? '↑' : '↓'} {Math.abs(score - avgScore)}% 
            {score > avgScore ? ' better' : ' worse'} than global average
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="quality-comparison-section">
      <div className="comparison-container">
        {/* Futuristic Header */}
        <div className="comparison-header">
          <div className="header-hologram"></div>
          <h2 className="neon-text">QUALITY INTELLIGENCE ANALYSIS</h2>
          <p className="subtitle">Scientific Comparison of Indian Export Quality vs Global Standards</p>
          
          <div className="control-panel">
            <div className="product-selector">
              <label className="selector-label">SELECT PRODUCT:</label>
              <select 
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="product-dropdown"
              >
                {Object.keys(indianProducts).map(key => (
                  <option key={key} value={key}>{indianProducts[key].name}</option>
                ))}
              </select>
            </div>
            
            <div className="mode-selector">
              <label className="selector-label">ANALYSIS MODE:</label>
              <div className="mode-buttons">
                <button 
                  className={`mode-btn ${comparisonMode === 'global' ? 'active' : ''}`}
                  onClick={() => setComparisonMode('global')}
                >
                  🌍 GLOBAL COMPARISON
                </button>
                <button 
                  className={`mode-btn ${comparisonMode === 'detailed' ? 'active' : ''}`}
                  onClick={() => setComparisonMode('detailed')}
                >
                  🔍 DETAILED METRICS
                </button>
              </div>
            </div>
            
            <button 
              className={`analyze-btn ${isAnalyzing ? 'analyzing' : ''}`}
              onClick={startAnalysis}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <>
                  <div className="analyze-spinner"></div>
                  ANALYZING... {analysisProgress}%
                </>
              ) : (
                <>
                  <span className="btn-icon">🔬</span>
                  START QUALITY ANALYSIS
                </>
              )}
            </button>
          </div>
        </div>

        <div className="comparison-content">
          {/* Left Panel - Product Overview */}
          <div className="left-panel">
            <div className="product-card robotic">
              <div className="card-header">
                <h3>PRODUCT ANALYSIS</h3>
                <div className="quality-badge">
                  <span className="quality-score">{calculateOverallScore()}</span>
                  <span className="quality-label">QUALITY SCORE</span>
                </div>
              </div>
              
              <div className="product-overview">
                <div className="product-visual">
                  <div className="product-icon">
                    {selectedProduct === 'pomegranate' ? '🍎' :
                     selectedProduct === 'cardamom' ? '🌿' :
                     selectedProduct === 'granite' ? '🏔️' :
                     selectedProduct === 'medicines' ? '💊' :
                     selectedProduct === 'agroProducts' ? '🌾' :
                     selectedProduct === 'electricToys' ? '🤖' :
                     selectedProduct === 'onions' ? '🧅' :
                     selectedProduct === 'redChilly' ? '🌶️' :
                     selectedProduct === 'grapes' ? '🍇' : '📦'}
                  </div>
                  <div className="product-glow"></div>
                </div>
                
                <div className="product-details">
                  <h4>{product.name}</h4>
                  <div className="product-origin">
                    <span className="origin-flag">🇮🇳</span>
                    <span>Made in India</span>
                  </div>
                  
                  <div className="product-specs">
                    <div className="spec-item">
                      <span className="spec-label">Grade:</span>
                      <span className="spec-value">{product.grades[0]}</span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-label">Season:</span>
                      <span className="spec-value">{product.seasons.peak}</span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-label">Origin:</span>
                      <span className="spec-value">{product.states[0]}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="quality-highlights">
                <h5>QUALITY HIGHLIGHTS</h5>
                <div className="highlights-grid">
                  <div className="highlight-item">
                    <div className="highlight-icon">🔬</div>
                    <div className="highlight-content">
                      <div className="highlight-value">98%</div>
                      <div className="highlight-label">Chemical Purity</div>
                    </div>
                  </div>
                  <div className="highlight-item">
                    <div className="highlight-icon">⏱️</div>
                    <div className="highlight-content">
                      <div className="highlight-value">24h</div>
                      <div className="highlight-label">Farm to Port</div>
                    </div>
                  </div>
                  <div className="highlight-item">
                    <div className="highlight-icon">🏆</div>
                    <div className="highlight-content">
                      <div className="highlight-value">6+</div>
                      <div className="highlight-label">Certifications</div>
                    </div>
                  </div>
                  <div className="highlight-item">
                    <div className="highlight-icon">🌱</div>
                    <div className="highlight-content">
                      <div className="highlight-value">100%</div>
                      <div className="highlight-label">Sustainable</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="competitors-card robotic">
              <div className="card-header">
                <h3>GLOBAL COMPETITORS</h3>
                <div className="comparison-score">
                  <span className="score-value">+{calculateOverallScore() - 72}%</span>
                  <span className="score-label">VS GLOBAL AVG</span>
                </div>
              </div>
              
              <div className="competitors-list">
                {competitors[selectedProduct]?.map((competitor, index) => (
                  <div key={index} className="competitor-item">
                    <div className="competitor-header">
                      <div className="competitor-info">
                        <div className="competitor-name">{competitor.name}</div>
                        <div className="competitor-country">{competitor.country}</div>
                      </div>
                      <div className="competitor-score">
                        <div 
                          className="score-circle"
                          style={{ 
                            backgroundColor: getQualityColor(competitor.score),
                            boxShadow: `0 0 20px ${getQualityColor(competitor.score)}40`
                          }}
                        >
                          {competitor.score}
                        </div>
                      </div>
                    </div>
                    
                    <div className="competitor-details">
                      <div className="price-tag">{competitor.price}</div>
                      <div className="quality-gap">
                        <span className={`gap ${calculateOverallScore() > competitor.score ? 'positive' : 'negative'}`}>
                          {calculateOverallScore() > competitor.score ? '+' : ''}
                          {calculateOverallScore() - competitor.score}% better
                        </span>
                      </div>
                    </div>
                    
                    <div className="competitor-analysis">
                      <div className="analysis-bar">
                        <div 
                          className="analysis-fill indian"
                          style={{ width: `${calculateOverallScore()}%` }}
                        ></div>
                        <div 
                          className="analysis-fill competitor"
                          style={{ width: `${competitor.score}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Center Panel - Main Comparison */}
          <div className="center-panel">
            {comparisonMode === 'global' ? (
              <div className="radar-comparison robotic">
                <div className="card-header">
                  <h3>QUALITY RADAR ANALYSIS</h3>
                  <div className="analysis-info">
                    <span className="info-icon">ℹ️</span>
                    <span>6-Dimensional Quality Assessment</span>
                  </div>
                </div>
                
                <div className="radar-container">
                  {renderRadarChart()}
                </div>
                
                <div className="quality-insights">
                  <h5>AI-GENERATED INSIGHTS</h5>
                  <div className="insights-list">
                    <div className="insight-item positive">
                      <div className="insight-icon">✅</div>
                      <div className="insight-content">
                        <div className="insight-title">Superior Traceability</div>
                        <div className="insight-desc">Blockchain technology provides 120% better supply chain visibility</div>
                      </div>
                    </div>
                    <div className="insight-item positive">
                      <div className="insight-icon">✅</div>
                      <div className="insight-content">
                        <div className="insight-title">Higher Purity Standards</div>
                        <div className="insight-desc">15% better chemical purity than global competitors</div>
                      </div>
                    </div>
                    <div className="insight-item positive">
                      <div className="insight-icon">✅</div>
                      <div className="insight-content">
                        <div className="insight-title">Better Certifications</div>
                        <div className="insight-desc">33% more international quality certifications</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="detailed-metrics robotic">
                <div className="card-header">
                  <h3>DETAILED QUALITY METRICS</h3>
                  <div className="metrics-nav">
                    {Object.keys(qualityMetrics).map(metric => (
                      <button
                        key={metric}
                        className={`metric-nav-btn ${activeMetric === metric ? 'active' : ''}`}
                        onClick={() => setActiveMetric(metric)}
                      >
                        {qualityMetrics[metric].icon}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="metrics-display">
                  {renderMetricBar(
                    activeMetric,
                    qualityMetrics[activeMetric].indianScore,
                    qualityMetrics[activeMetric].globalAvg,
                    true
                  )}
                </div>
                
                <div className="metric-details">
                  <h5>QUALITY BENCHMARK ANALYSIS</h5>
                  <div className="benchmark-grid">
                    <div className="benchmark-item">
                      <div className="benchmark-label">Indian Quality Score</div>
                      <div className="benchmark-value" style={{ color: getQualityColor(qualityMetrics[activeMetric].indianScore) }}>
                        {qualityMetrics[activeMetric].indianScore}%
                      </div>
                    </div>
                    <div className="benchmark-item">
                      <div className="benchmark-label">Global Average</div>
                      <div className="benchmark-value" style={{ color: getQualityColor(qualityMetrics[activeMetric].globalAvg) }}>
                        {qualityMetrics[activeMetric].globalAvg}%
                      </div>
                    </div>
                    <div className="benchmark-item">
                      <div className="benchmark-label">Quality Gap</div>
                      <div className="benchmark-value positive">
                        +{qualityMetrics[activeMetric].indianScore - qualityMetrics[activeMetric].globalAvg}%
                      </div>
                    </div>
                    <div className="benchmark-item">
                      <div className="benchmark-label">Performance</div>
                      <div className="benchmark-value excellent">
                        {getQualityLabel(qualityMetrics[activeMetric].indianScore)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Certifications & Proof */}
          <div className="right-panel">
            <div className="certifications-card robotic">
              <div className="card-header">
                <h3>QUALITY CERTIFICATIONS</h3>
                <div className="cert-count">6</div>
              </div>
              
              <div className="certifications-grid">
                <div className="certification-item">
                  <div className="cert-icon">🏆</div>
                  <div className="cert-content">
                    <div className="cert-name">ISO 22000 Certified</div>
                    <div className="cert-desc">Food Safety Management</div>
                  </div>
                  <div className="cert-status verified">✓</div>
                </div>
                <div className="certification-item">
                  <div className="cert-icon">🌱</div>
                  <div className="cert-content">
                    <div className="cert-name">USDA Organic</div>
                    <div className="cert-desc">100% Organic Certified</div>
                  </div>
                  <div className="cert-status verified">✓</div>
                </div>
                <div className="certification-item">
                  <div className="cert-icon">⚖️</div>
                  <div className="cert-content">
                    <div className="cert-name">Fair Trade Certified</div>
                    <div className="cert-desc">Ethical Farming Practices</div>
                  </div>
                  <div className="cert-status verified">✓</div>
                </div>
                <div className="certification-item">
                  <div className="cert-icon">🔬</div>
                  <div className="cert-content">
                    <div className="cert-name">APEDA Certified</div>
                    <div className="cert-desc">Indian Export Quality</div>
                  </div>
                  <div className="cert-status verified">✓</div>
                </div>
              </div>
            </div>
            
            <div className="lab-results robotic">
              <div className="card-header">
                <h3>LABORATORY ANALYSIS</h3>
                <div className="lab-status">LIVE</div>
              </div>
              
              <div className="lab-metrics">
                <div className="lab-metric">
                  <div className="metric-name">Chemical Purity</div>
                  <div className="metric-value">98.2%</div>
                  <div className="metric-trend positive">+2.1%</div>
                </div>
                <div className="lab-metric">
                  <div className="metric-name">Nutritional Value</div>
                  <div className="metric-value">95.8%</div>
                  <div className="metric-trend positive">+3.4%</div>
                </div>
                <div className="lab-metric">
                  <div className="metric-name">Shelf Life</div>
                  <div className="metric-value">28 days</div>
                  <div className="metric-trend positive">+5 days</div>
                </div>
                <div className="lab-metric">
                  <div className="metric-name">Contaminants</div>
                  <div className="metric-value">0.02%</div>
                  <div className="metric-trend positive">-0.08%</div>
                </div>
              </div>
              
              <div className="lab-actions">
                <button className="lab-btn primary">
                  <span className="btn-icon">📄</span>
                  DOWNLOAD FULL REPORT
                </button>
                <button className="lab-btn secondary">
                  <span className="btn-icon">🔍</span>
                  VIEW LAB CERTIFICATES
                </button>
              </div>
            </div>
            
            <div className="customer-proof robotic">
              <div className="card-header">
                <h3>QUALITY PROOF</h3>
                <div className="proof-rating">4.9/5.0</div>
              </div>
              
              <div className="proof-content">
                <div className="testimonial">
                  <div className="quote">"The quality consistency from Indian suppliers is unmatched. Every batch meets our strict standards."</div>
                  <div className="author">
                    <div className="author-name">Dubai Spice Importers</div>
                    <div className="author-role">Premium Import Company</div>
                  </div>
                </div>
                
                <div className="proof-stats">
                  <div className="proof-stat">
                    <div className="stat-value">99.2%</div>
                    <div className="stat-label">Quality Consistency</div>
                  </div>
                  <div className="proof-stat">
                    <div className="stat-value">0</div>
                    <div className="stat-label">Quality Complaints</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Analysis Progress Overlay */}
        {isAnalyzing && (
          <div className="analysis-overlay">
            <div className="analysis-modal">
              <div className="modal-header">
                <h3>QUALITY ANALYSIS IN PROGRESS</h3>
                <div className="analysis-percent">{analysisProgress}%</div>
              </div>
              
              <div className="analysis-progress">
                <div 
                  className="progress-bar"
                  style={{ width: `${analysisProgress}%` }}
                ></div>
              </div>
              
              <div className="analysis-steps">
                <div className="analysis-step active">
                  <div className="step-icon">🔬</div>
                  <div className="step-content">
                    <div className="step-title">Chemical Analysis</div>
                    <div className="step-desc">Testing for purity and contaminants</div>
                  </div>
                </div>
                <div className={`analysis-step ${analysisProgress > 33 ? 'active' : ''}`}>
                  <div className="step-icon">🌡️</div>
                  <div className="step-content">
                    <div className="step-title">Freshness Testing</div>
                    <div className="step-desc">Measuring shelf life and preservation</div>
                  </div>
                </div>
                <div className={`analysis-step ${analysisProgress > 66 ? 'active' : ''}`}>
                  <div className="step-icon">📊</div>
                  <div className="step-content">
                    <div className="step-title">Quality Benchmarking</div>
                    <div className="step-desc">Comparing against global standards</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QualityComparison;