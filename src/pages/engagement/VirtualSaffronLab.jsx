// VirtualSaffronLab.jsx
import React, { useState, useEffect, useRef } from 'react';
import './VirtualSaffronLab.css';

const VirtualSaffronLab = () => {
  const [activeTab, setActiveTab] = useState('chemical');
  const [selectedSample, setSelectedSample] = useState('premium');
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [comparisonData, setComparisonData] = useState(null);
  const [aromaProfile, setAromaProfile] = useState(null);

  const labSamples = {
    premium: {
      name: "Premium Kashmiri Saffron",
      grade: "ISO Grade I",
      origin: "Pampore, Kashmir",
      harvest: "2023 Autumn Harvest",
      price: "$28.50/g",
      image: "🧪",
      characteristics: {
        color: "Deep crimson red",
        aroma: "Intense hay-like with honey notes",
        texture: "Brittle, thread-like stigmas"
      }
    },
    commercial: {
      name: "Commercial Grade Saffron",
      grade: "ISO Grade II",
      origin: "Khorasan, Iran",
      harvest: "2023 Mass Harvest",
      price: "$12.75/g",
      image: "🔬",
      characteristics: {
        color: "Lighter red with some yellow",
        aroma: "Mild, less complex",
        texture: "Softer, mixed lengths"
      }
    },
    counterfeit: {
      name: "Suspected Counterfeit",
      grade: "Below Grade III",
      origin: "Unknown",
      harvest: "Unknown",
      price: "$4.20/g",
      image: "⚠️",
      characteristics: {
        color: "Artificial bright red",
        aroma: "Chemical, artificial",
        texture: "Uniform, machine-cut appearance"
      }
    }
  };

  const chemicalCompounds = [
    {
      name: "Crocin",
      formula: "C44H64O24",
      role: "Color Pigment",
      idealRange: "200-250",
      unit: "ASTA units",
      description: "Water-soluble carotenoid responsible for saffron's golden-yellow color",
      premium: 228,
      commercial: 175,
      counterfeit: 85
    },
    {
      name: "Safranal",
      formula: "C10H14O",
      role: "Aroma Compound",
      idealRange: "30-50",
      unit: "μg/g",
      description: "Volatile oil providing distinctive hay-like aroma with sweet notes",
      premium: 42,
      commercial: 28,
      counterfeit: 8
    },
    {
      name: "Picrocrocin",
      formula: "C16H26O7",
      role: "Flavor Compound",
      idealRange: "70-100",
      unit: "Spectrophotometric",
      description: "Glycoside responsible for saffron's characteristic bitter taste",
      premium: 88,
      commercial: 65,
      counterfeit: 22
    },
    {
      name: "Kaempferol",
      formula: "C15H10O6",
      role: "Antioxidant",
      idealRange: "15-25",
      unit: "mg/100g",
      description: "Flavonoid with strong antioxidant and anti-inflammatory properties",
      premium: 21,
      commercial: 14,
      counterfeit: 3
    }
  ];

  const aromaProfiles = {
    premium: [
      { note: "Hay-like", intensity: 95, description: "Characteristic dried grass aroma" },
      { note: "Honey", intensity: 80, description: "Sweet floral honey undertones" },
      { note: "Tobacco", intensity: 60, description: "Earthy tobacco leaf notes" },
      { note: "Woody", intensity: 45, description: "Subtle woody, bark-like scents" },
      { note: "Spice", intensity: 70, description: "Warm spicy undertones" }
    ],
    commercial: [
      { note: "Hay-like", intensity: 65, description: "Moderate dried grass aroma" },
      { note: "Honey", intensity: 45, description: "Faint sweet notes" },
      { note: "Tobacco", intensity: 35, description: "Light earthy tones" },
      { note: "Woody", intensity: 25, description: "Minimal woody character" },
      { note: "Spice", intensity: 40, description: "Mild spicy notes" }
    ],
    counterfeit: [
      { note: "Chemical", intensity: 85, description: "Artificial chemical scent" },
      { note: "Sweet", intensity: 70, description: "Artificial sweetener smell" },
      { note: "Plastic", intensity: 45, description: "Plastic-like undertones" },
      { note: "Metallic", intensity: 30, description: "Slight metallic notes" },
      { note: "Musty", intensity: 55, description: "Damp, musty odor" }
    ]
  };

  const labEquipment = [
    {
      name: "Spectrophotometer",
      purpose: "Color Strength Analysis",
      status: "Calibrated",
      icon: "📊",
      animation: "pulse"
    },
    {
      name: "HPLC System",
      purpose: "Chemical Compound Separation",
      status: "Running",
      icon: "⚗️",
      animation: "rotate"
    },
    {
      name: "Gas Chromatograph",
      purpose: "Aroma Compound Analysis",
      status: "Standby",
      icon: "🌬️",
      animation: "float"
    },
    {
      name: "Microscope",
      purpose: "Physical Structure Examination",
      status: "Active",
      icon: "🔬",
      animation: "glow"
    }
  ];

  const qualityTests = [
    {
      id: 1,
      name: "Color Release Test",
      description: "Measures speed and intensity of color release in water",
      duration: 30,
      premium: { time: "12s", intensity: "98%" },
      commercial: { time: "18s", intensity: "82%" },
      counterfeit: { time: "3s", intensity: "45%" }
    },
    {
      id: 2,
      name: "Aroma Persistence",
      description: "Tests how long the aroma lasts after exposure",
      duration: 45,
      premium: { time: "72h", intensity: "95%" },
      commercial: { time: "48h", intensity: "78%" },
      counterfeit: { time: "12h", intensity: "35%" }
    },
    {
      id: 3,
      name: "Thread Float Test",
      description: "Authentic saffron threads should float then slowly sink",
      duration: 60,
      premium: { result: "Genuine", score: "10/10" },
      commercial: { result: "Moderate", score: "7/10" },
      counterfeit: { result: "Fake", score: "2/10" }
    }
  ];

  const canvasRef = useRef(null);

  useEffect(() => {
    if (activeTab === 'chemical' && canvasRef.current) {
      drawChemicalChart();
    }
  }, [activeTab, selectedSample]);

  useEffect(() => {
    if (isAnalyzing) {
      const interval = setInterval(() => {
        setAnalysisProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsAnalyzing(false);
            generateTestResults();
            return 100;
          }
          return prev + 2;
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isAnalyzing]);

  const drawChemicalChart = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw background
    ctx.fillStyle = 'rgba(255, 215, 0, 0.05)';
    ctx.fillRect(0, 0, width, height);

    // Draw grid
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.2)';
    ctx.lineWidth = 1;
    
    // Vertical grid
    for (let i = 0; i <= width; i += width / 10) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, height);
      ctx.stroke();
    }

    // Horizontal grid
    for (let i = 0; i <= height; i += height / 8) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(width, i);
      ctx.stroke();
    }

    // Draw compound bars
    const compounds = chemicalCompounds;
    const barWidth = (width - 100) / compounds.length;
    const maxValue = 250;

    compounds.forEach((compound, index) => {
      const value = compound[selectedSample];
      const barHeight = (value / maxValue) * (height - 100);
      const x = 50 + index * barWidth;
      const y = height - 50 - barHeight;

      // Draw bar
      ctx.fillStyle = getBarColor(value, compound.idealRange);
      ctx.fillRect(x, y, barWidth - 20, barHeight);

      // Draw value label
      ctx.fillStyle = '#FFD700';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(value.toString(), x + (barWidth - 20) / 2, y - 10);

      // Draw compound name
      ctx.fillStyle = '#ccc';
      ctx.font = '10px Arial';
      ctx.fillText(compound.name, x + (barWidth - 20) / 2, height - 30);
    });

    // Draw ideal range indicators
    compounds.forEach((compound, index) => {
      const [min, max] = compound.idealRange.split('-').map(Number);
      const x = 50 + index * barWidth;
      
      const minY = height - 50 - (min / maxValue) * (height - 100);
      const maxY = height - 50 - (max / maxValue) * (height - 100);

      ctx.strokeStyle = '#4CAF50';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 3]);
      ctx.beginPath();
      ctx.moveTo(x, minY);
      ctx.lineTo(x + barWidth - 20, minY);
      ctx.moveTo(x, maxY);
      ctx.lineTo(x + barWidth - 20, maxY);
      ctx.stroke();
      ctx.setLineDash([]);
    });
  };

  const getBarColor = (value, idealRange) => {
    const [min, max] = idealRange.split('-').map(Number);
    if (value >= min && value <= max) return 'rgba(76, 175, 80, 0.7)';
    if (value >= min * 0.8 && value <= max * 1.2) return 'rgba(255, 152, 0, 0.7)';
    return 'rgba(244, 67, 54, 0.7)';
  };

  const startAnalysis = () => {
    setAnalysisProgress(0);
    setIsAnalyzing(true);
    setTestResults(null);
  };

  const generateTestResults = () => {
    const sample = labSamples[selectedSample];
    const results = {
      sample: sample.name,
      grade: sample.grade,
      authenticity: calculateAuthenticity(),
      overallScore: calculateOverallScore(),
      tests: qualityTests.map(test => ({
        ...test,
        result: test[selectedSample],
        passed: calculateTestPass(test.name, test[selectedSample])
      }))
    };
    setTestResults(results);
  };

  const calculateAuthenticity = () => {
    const scores = {
      premium: 98,
      commercial: 76,
      counterfeit: 23
    };
    return scores[selectedSample];
  };

  const calculateOverallScore = () => {
    const scores = {
      premium: 96,
      commercial: 72,
      counterfeit: 28
    };
    return scores[selectedSample];
  };

  const calculateTestPass = (testName, result) => {
    // Simplified pass/fail logic
    if (selectedSample === 'premium') return true;
    if (selectedSample === 'commercial' && testName !== "Thread Float Test") return true;
    return false;
  };

  const compareSamples = () => {
    const comparison = {
      samples: ['premium', 'commercial', 'counterfeit'],
      metrics: ['Purity', 'Aroma', 'Color', 'Texture', 'Value'],
      data: {
        Purity: [95, 75, 25],
        Aroma: [92, 68, 30],
        Color: [96, 72, 35],
        Texture: [94, 70, 20],
        Value: [88, 65, 15]
      }
    };
    setComparisonData(comparison);
  };

  const analyzeAromaProfile = () => {
    setAromaProfile(aromaProfiles[selectedSample]);
  };

  return (
    <section id="virtual-lab" className="virtual-lab-section">
      <div className="lab-container">
        {/* Lab Header */}
        <div className="lab-header">
          <h2 className="lab-title">
            <span className="title-glitch">Virtual Saffron Laboratory</span>
          </h2>
          <p className="lab-subtitle">
            Advanced Scientific Analysis & Quality Verification
          </p>
        </div>

        {/* Main Lab Interface */}
        <div className="lab-interface">
          {/* Left Panel - Sample Selection & Controls */}
          <div className="lab-controls">
            <div className="sample-selection">
              <h3 className="controls-title">Test Samples</h3>
              <div className="samples-grid">
                {Object.entries(labSamples).map(([key, sample]) => (
                  <div
                    key={key}
                    className={`sample-card ${selectedSample === key ? 'active' : ''}`}
                    onClick={() => setSelectedSample(key)}
                  >
                    <div className="sample-image">{sample.image}</div>
                    <div className="sample-info">
                      <h4>{sample.name}</h4>
                      <p className="sample-grade">{sample.grade}</p>
                      <p className="sample-price">{sample.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Lab Equipment Status */}
            <div className="equipment-status">
              <h3 className="controls-title">Lab Equipment</h3>
              <div className="equipment-grid">
                {labEquipment.map((equipment, index) => (
                  <div key={index} className="equipment-card">
                    <div className={`equipment-icon ${equipment.animation}`}>
                      {equipment.icon}
                    </div>
                    <div className="equipment-info">
                      <h5>{equipment.name}</h5>
                      <p>{equipment.purpose}</p>
                      <span className={`status ${equipment.status.toLowerCase()}`}>
                        {equipment.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Analysis Controls */}
            <div className="analysis-controls">
              <button 
                className={`analyze-btn ${isAnalyzing ? 'analyzing' : ''}`}
                onClick={startAnalysis}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? 'Analyzing...' : 'Start Full Analysis'}
              </button>
              
              <div className="quick-tests">
                <button className="quick-test-btn" onClick={compareSamples}>
                  Compare Samples
                </button>
                <button className="quick-test-btn" onClick={analyzeAromaProfile}>
                  Aroma Analysis
                </button>
              </div>
            </div>

            {/* Analysis Progress */}
            {isAnalyzing && (
              <div className="analysis-progress">
                <h4>Analysis in Progress</h4>
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `${analysisProgress}%` }}
                  ></div>
                </div>
                <div className="progress-steps">
                  <span className={analysisProgress >= 25 ? 'completed' : ''}>
                    Sample Preparation
                  </span>
                  <span className={analysisProgress >= 50 ? 'completed' : ''}>
                    Chemical Analysis
                  </span>
                  <span className={analysisProgress >= 75 ? 'completed' : ''}>
                    Quality Assessment
                  </span>
                  <span className={analysisProgress >= 100 ? 'completed' : ''}>
                    Report Generation
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Analysis Results */}
          <div className="lab-results">
            {/* Tab Navigation */}
            <div className="lab-tabs">
              <button 
                className={`lab-tab ${activeTab === 'chemical' ? 'active' : ''}`}
                onClick={() => setActiveTab('chemical')}
              >
                Chemical Analysis
              </button>
              <button 
                className={`lab-tab ${activeTab === 'quality' ? 'active' : ''}`}
                onClick={() => setActiveTab('quality')}
              >
                Quality Tests
              </button>
              <button 
                className={`lab-tab ${activeTab === 'comparison' ? 'active' : ''}`}
                onClick={() => setActiveTab('comparison')}
              >
                Sample Comparison
              </button>
              <button 
                className={`lab-tab ${activeTab === 'aroma' ? 'active' : ''}`}
                onClick={() => setActiveTab('aroma')}
              >
                Aroma Profile
              </button>
            </div>

            {/* Tab Content */}
            <div className="tab-content">
              {/* Chemical Analysis Tab */}
              {activeTab === 'chemical' && (
                <div className="chemical-analysis">
                  <h3 className="analysis-title">Chemical Compound Analysis</h3>
                  <div className="chemical-chart">
                    <canvas 
                      ref={canvasRef}
                      width={600}
                      height={400}
                      className="chemical-canvas"
                    />
                  </div>
                  <div className="compound-details">
                    {chemicalCompounds.map((compound, index) => (
                      <div key={index} className="compound-card">
                        <div className="compound-header">
                          <h4>{compound.name}</h4>
                          <span className="compound-formula">{compound.formula}</span>
                        </div>
                        <p className="compound-role">{compound.role}</p>
                        <p className="compound-description">{compound.description}</p>
                        <div className="compound-values">
                          <div className="value-item">
                            <span>Ideal Range:</span>
                            <span>{compound.idealRange} {compound.unit}</span>
                          </div>
                          <div className="value-item">
                            <span>Current Sample:</span>
                            <span className={`value ${getValueClass(compound[selectedSample], compound.idealRange)}`}>
                              {compound[selectedSample]} {compound.unit}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quality Tests Tab */}
              {activeTab === 'quality' && testResults && (
                <div className="quality-tests">
                  <h3 className="analysis-title">Quality Test Results</h3>
                  <div className="results-summary">
                    <div className="summary-card">
                      <h4>Authenticity Score</h4>
                      <div className="score-circle">
                        <span className="score-value">{testResults.authenticity}%</span>
                      </div>
                    </div>
                    <div className="summary-card">
                      <h4>Overall Grade</h4>
                      <div className="grade-display">
                        <span className="grade">{testResults.grade}</span>
                        <span className="score">{testResults.overallScore}/100</span>
                      </div>
                    </div>
                    <div className="summary-card">
                      <h4>Sample Verification</h4>
                      <div className="verification-status">
                        <span className={`status ${testResults.authenticity > 80 ? 'authentic' : 'suspicious'}`}>
                          {testResults.authenticity > 80 ? 'AUTHENTIC' : 'SUSPICIOUS'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="test-results">
                    <h4>Detailed Test Results</h4>
                    {testResults.tests.map((test, index) => (
                      <div key={index} className="test-result-card">
                        <div className="test-header">
                          <h5>{test.name}</h5>
                          <span className={`test-status ${test.passed ? 'passed' : 'failed'}`}>
                            {test.passed ? 'PASS' : 'FAIL'}
                          </span>
                        </div>
                        <p className="test-description">{test.description}</p>
                        <div className="test-data">
                          {Object.entries(test.result).map(([key, value]) => (
                            <div key={key} className="data-item">
                              <span className="data-label">{key}:</span>
                              <span className="data-value">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sample Comparison Tab */}
              {activeTab === 'comparison' && comparisonData && (
                <div className="sample-comparison">
                  <h3 className="analysis-title">Multi-Sample Comparison</h3>
                  <div className="comparison-matrix">
                    {comparisonData.metrics.map(metric => (
                      <div key={metric} className="metric-row">
                        <div className="metric-name">{metric}</div>
                        <div className="metric-bars">
                          {comparisonData.data[metric].map((value, index) => (
                            <div key={index} className="comparison-bar-container">
                              <div 
                                className="comparison-bar"
                                style={{ height: `${value}%` }}
                              >
                                <span className="bar-value">{value}%</span>
                              </div>
                              <span className="sample-label">
                                {comparisonData.samples[index]}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Aroma Profile Tab */}
              {activeTab === 'aroma' && aromaProfile && (
                <div className="aroma-analysis">
                  <h3 className="analysis-title">Aroma Profile Analysis</h3>
                  <div className="aroma-radar">
                    <div className="radar-chart">
                      {aromaProfile.map((note, index) => (
                        <div 
                          key={index}
                          className="aroma-note"
                          style={{
                            '--intensity': `${note.intensity}%`,
                            '--angle': `${index * (360 / aromaProfile.length)}deg`
                          }}
                        >
                          <div className="note-intensity"></div>
                          <div className="note-label">
                            <span>{note.note}</span>
                            <span className="note-percentage">{note.intensity}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="aroma-notes">
                    <h4>Aroma Characteristics</h4>
                    {aromaProfile.map((note, index) => (
                      <div key={index} className="aroma-note-card">
                        <div className="note-header">
                          <h5>{note.note}</h5>
                          <div className="intensity-bar">
                            <div 
                              className="intensity-fill"
                              style={{ width: `${note.intensity}%` }}
                            ></div>
                          </div>
                        </div>
                        <p>{note.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Default State */}
              {!testResults && activeTab !== 'chemical' && activeTab !== 'comparison' && activeTab !== 'aroma' && (
                <div className="no-results">
                  <div className="no-results-icon">🔬</div>
                  <h3>No Analysis Results</h3>
                  <p>Start an analysis to see detailed test results and quality assessments.</p>
                  <button className="start-analysis-btn" onClick={startAnalysis}>
                    Start First Analysis
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Scientific Certification */}
        <div className="lab-certification">
          <div className="certification-card">
            <h3>ISO 3632 Certified Laboratory</h3>
            <p>This virtual laboratory simulation follows international standards for saffron quality testing and certification.</p>
            <div className="certification-badges">
              <span className="cert-badge">ISO 3632:2011</span>
              <span className="cert-badge">HACCP Certified</span>
              <span className="cert-badge">GMP Compliant</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Helper function to determine value class
const getValueClass = (value, idealRange) => {
  const [min, max] = idealRange.split('-').map(Number);
  if (value >= min && value <= max) return 'optimal';
  if (value >= min * 0.8 && value <= max * 1.2) return 'acceptable';
  return 'poor';
};

export default VirtualSaffronLab;