// src/components/public/conversion/ROICalculator.jsx
import React, { useState, useEffect } from 'react';
import { indianProducts } from '../data/indianExportData';


const ROICalculator = () => {
  const [calculatorData, setCalculatorData] = useState({
    // Product Selection
    selectedProduct: 'pomegranate',
    monthlyVolume: 1000,
    productGrade: 'premium',
    
    // Cost Inputs
    currentCostPerKg: 0,
    shippingCost: 0,
    customsDuty: 0,
    handlingCost: 0,
    
    // Business Metrics
    sellingPrice: 0,
    monthlySales: 0,
    operationalCosts: 0,
    
    // Platform Benefits
    costSavings: 15,
    timeSavings: 40,
    qualityImprovement: 25,
    wasteReduction: 30
  });

  const [results, setResults] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [timeframe, setTimeframe] = useState('annual');

  const product = indianProducts[calculatorData.selectedProduct];

  useEffect(() => {
    // Set default prices based on selected product
    if (product) {
      const basePrice = (product.priceRange.min + product.priceRange.max) / 2;
      const gradeMultiplier = calculatorData.productGrade === 'premium' ? 1.2 : 
                            calculatorData.productGrade === 'organic' ? 1.3 : 1;
      
      setCalculatorData(prev => ({
        ...prev,
        currentCostPerKg: basePrice * gradeMultiplier,
        sellingPrice: basePrice * gradeMultiplier * 1.8, // 80% markup
        shippingCost: basePrice * 0.15,
        customsDuty: basePrice * 0.12,
        handlingCost: basePrice * 0.08
      }));
    }
  }, [calculatorData.selectedProduct, calculatorData.productGrade, product]);

  const calculateROI = () => {
    setIsCalculating(true);
    
    // Simulate calculation delay
    setTimeout(() => {
      const {
        monthlyVolume,
        currentCostPerKg,
        shippingCost,
        customsDuty,
        handlingCost,
        sellingPrice,
        monthlySales,
        operationalCosts,
        costSavings,
        timeSavings,
        qualityImprovement,
        wasteReduction
      } = calculatorData;

      // Current scenario calculations
      const currentCostPerUnit = currentCostPerKg + shippingCost + customsDuty + handlingCost;
      const currentMonthlyCost = monthlyVolume * currentCostPerUnit;
      const currentMonthlyRevenue = monthlySales * sellingPrice;
      const currentMonthlyProfit = currentMonthlyRevenue - currentMonthlyCost - operationalCosts;

      // Improved scenario calculations
      const costSavingsDecimal = costSavings / 100;
      const improvedCostPerUnit = currentCostPerUnit * (1 - costSavingsDecimal);
      const improvedMonthlyCost = monthlyVolume * improvedCostPerUnit;
      
      const timeSavingsDecimal = timeSavings / 100;
      const improvedOperationalCosts = operationalCosts * (1 - timeSavingsDecimal);
      
      const qualityImprovementDecimal = qualityImprovement / 100;
      const improvedSellingPrice = sellingPrice * (1 + qualityImprovementDecimal);
      const improvedMonthlyRevenue = monthlySales * improvedSellingPrice;
      
      const wasteReductionDecimal = wasteReduction / 100;
      const improvedMonthlyVolume = monthlyVolume * (1 + wasteReductionDecimal);
      const additionalRevenue = improvedMonthlyVolume * improvedSellingPrice;

      const improvedMonthlyProfit = improvedMonthlyRevenue + additionalRevenue - improvedMonthlyCost - improvedOperationalCosts;

      // ROI Calculations
      const monthlyProfitIncrease = improvedMonthlyProfit - currentMonthlyProfit;
      const annualProfitIncrease = monthlyProfitIncrease * 12;
      const roiPercentage = ((improvedMonthlyProfit - currentMonthlyProfit) / currentMonthlyProfit) * 100;

      // Payback period (assuming platform cost)
      const platformMonthlyCost = currentMonthlyCost * 0.02; // 2% platform fee
      const netMonthlyGain = monthlyProfitIncrease - platformMonthlyCost;
      const paybackMonths = 5000 / netMonthlyGain; // Assuming $5000 setup cost

      setResults({
        current: {
          monthlyCost: currentMonthlyCost,
          monthlyRevenue: currentMonthlyRevenue,
          monthlyProfit: currentMonthlyProfit,
          costPerUnit: currentCostPerUnit
        },
        improved: {
          monthlyCost: improvedMonthlyCost,
          monthlyRevenue: improvedMonthlyRevenue,
          monthlyProfit: improvedMonthlyProfit,
          costPerUnit: improvedCostPerUnit
        },
        improvements: {
          monthlyProfitIncrease,
          annualProfitIncrease,
          roiPercentage,
          paybackMonths,
          platformMonthlyCost,
          netMonthlyGain
        }
      });

      setIsCalculating(false);
    }, 1500);
  };

  const handleInputChange = (field, value) => {
    setCalculatorData(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0
    }));
  };

  const handleSelectChange = (field, value) => {
    setCalculatorData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const getROIColor = (value) => {
    if (value >= 50) return '#27ae60';
    if (value >= 20) return '#f39c12';
    return '#e74c3c';
  };

  const getImprovementColor = (value) => {
    return value > 0 ? '#27ae60' : '#e74c3c';
  };

  return (
    <div className="roi-calculator-section">
      <div className="calculator-container">
        <div className="calculator-header">
          <div className="header-gold-bar"></div>
          <h2 className="neon-text">BUSINESS ROI CALCULATOR</h2>
          <p className="subtitle">Calculate how much you can save and earn with our export platform</p>
          
          <div className="calculator-stats">
            <div className="stat-card">
              <div className="stat-icon">💰</div>
              <div className="stat-content">
                <div className="stat-value">15-40%</div>
                <div className="stat-label">Average Cost Savings</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🚀</div>
              <div className="stat-content">
                <div className="stat-value">2-6 Months</div>
                <div className="stat-label">Average ROI Period</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📈</div>
              <div className="stat-content">
                <div className="stat-value">98%</div>
                <div className="stat-label">Client Satisfaction</div>
              </div>
            </div>
          </div>
        </div>

        <div className="calculator-content">
          {/* Left Panel - Inputs */}
          <div className="input-panel">
            <div className="input-section">
              <h3>Product Configuration</h3>
              
              <div className="form-group">
                <label className="form-label">Select Product</label>
                <select
                  className="form-select"
                  value={calculatorData.selectedProduct}
                  onChange={(e) => handleSelectChange('selectedProduct', e.target.value)}
                >
                  {Object.entries(indianProducts).map(([key, product]) => (
                    <option key={key} value={key}>{product.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Product Grade</label>
                <div className="grade-buttons">
                  <button
                    className={`grade-btn ${calculatorData.productGrade === 'standard' ? 'active' : ''}`}
                    onClick={() => handleSelectChange('productGrade', 'standard')}
                  >
                    Standard
                  </button>
                  <button
                    className={`grade-btn ${calculatorData.productGrade === 'premium' ? 'active' : ''}`}
                    onClick={() => handleSelectChange('productGrade', 'premium')}
                  >
                    Premium
                  </button>
                  <button
                    className={`grade-btn ${calculatorData.productGrade === 'organic' ? 'active' : ''}`}
                    onClick={() => handleSelectChange('productGrade', 'organic')}
                  >
                    Organic
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Monthly Volume (kg)
                  <span className="input-value">{calculatorData.monthlyVolume.toLocaleString()} kg</span>
                </label>
                <input
                  type="range"
                  min="100"
                  max="10000"
                  step="100"
                  value={calculatorData.monthlyVolume}
                  onChange={(e) => handleInputChange('monthlyVolume', e.target.value)}
                  className="slider-input"
                />
                <div className="slider-labels">
                  <span>100 kg</span>
                  <span>10,000 kg</span>
                </div>
              </div>
            </div>

            <div className="input-section">
              <h3>Current Costs</h3>
              
              <div className="cost-inputs">
                <div className="cost-item">
                  <label>Product Cost (per kg)</label>
                  <input
                    type="number"
                    value={calculatorData.currentCostPerKg}
                    onChange={(e) => handleInputChange('currentCostPerKg', e.target.value)}
                    className="cost-input"
                  />
                </div>
                <div className="cost-item">
                  <label>Shipping & Logistics</label>
                  <input
                    type="number"
                    value={calculatorData.shippingCost}
                    onChange={(e) => handleInputChange('shippingCost', e.target.value)}
                    className="cost-input"
                  />
                </div>
                <div className="cost-item">
                  <label>Customs & Duties</label>
                  <input
                    type="number"
                    value={calculatorData.customsDuty}
                    onChange={(e) => handleInputChange('customsDuty', e.target.value)}
                    className="cost-input"
                  />
                </div>
                <div className="cost-item">
                  <label>Handling & Storage</label>
                  <input
                    type="number"
                    value={calculatorData.handlingCost}
                    onChange={(e) => handleInputChange('handlingCost', e.target.value)}
                    className="cost-input"
                  />
                </div>
              </div>
            </div>

            <div className="input-section">
              <h3>Business Metrics</h3>
              
              <div className="business-inputs">
                <div className="business-item">
                  <label>Selling Price (per kg)</label>
                  <input
                    type="number"
                    value={calculatorData.sellingPrice}
                    onChange={(e) => handleInputChange('sellingPrice', e.target.value)}
                    className="business-input"
                  />
                </div>
                <div className="business-item">
                  <label>Monthly Sales Volume</label>
                  <input
                    type="number"
                    value={calculatorData.monthlySales}
                    onChange={(e) => handleInputChange('monthlySales', e.target.value)}
                    className="business-input"
                  />
                </div>
                <div className="business-item">
                  <label>Operational Costs</label>
                  <input
                    type="number"
                    value={calculatorData.operationalCosts}
                    onChange={(e) => handleInputChange('operationalCosts', e.target.value)}
                    className="business-input"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Center Panel - Benefits & Results */}
          <div className="results-panel">
            <div className="benefits-section">
              <h3>Platform Benefits</h3>
              
              <div className="benefits-grid">
                <div className="benefit-item">
                  <label>Cost Savings</label>
                  <div className="benefit-control">
                    <input
                      type="range"
                      min="0"
                      max="50"
                      step="1"
                      value={calculatorData.costSavings}
                      onChange={(e) => handleInputChange('costSavings', e.target.value)}
                      className="benefit-slider"
                    />
                    <span className="benefit-value">{calculatorData.costSavings}%</span>
                  </div>
                </div>
                
                <div className="benefit-item">
                  <label>Time Savings</label>
                  <div className="benefit-control">
                    <input
                      type="range"
                      min="0"
                      max="60"
                      step="1"
                      value={calculatorData.timeSavings}
                      onChange={(e) => handleInputChange('timeSavings', e.target.value)}
                      className="benefit-slider"
                    />
                    <span className="benefit-value">{calculatorData.timeSavings}%</span>
                  </div>
                </div>
                
                <div className="benefit-item">
                  <label>Quality Improvement</label>
                  <div className="benefit-control">
                    <input
                      type="range"
                      min="0"
                      max="40"
                      step="1"
                      value={calculatorData.qualityImprovement}
                      onChange={(e) => handleInputChange('qualityImprovement', e.target.value)}
                      className="benefit-slider"
                    />
                    <span className="benefit-value">{calculatorData.qualityImprovement}%</span>
                  </div>
                </div>
                
                <div className="benefit-item">
                  <label>Waste Reduction</label>
                  <div className="benefit-control">
                    <input
                      type="range"
                      min="0"
                      max="50"
                      step="1"
                      value={calculatorData.wasteReduction}
                      onChange={(e) => handleInputChange('wasteReduction', e.target.value)}
                      className="benefit-slider"
                    />
                    <span className="benefit-value">{calculatorData.wasteReduction}%</span>
                  </div>
                </div>
              </div>

              <button 
                className={`calculate-btn ${isCalculating ? 'calculating' : ''}`}
                onClick={calculateROI}
                disabled={isCalculating}
              >
                {isCalculating ? (
                  <>
                    <div className="calculate-spinner"></div>
                    CALCULATING ROI...
                  </>
                ) : (
                  <>
                    <span className="btn-icon">📊</span>
                    CALCULATE YOUR ROI
                  </>
                )}
              </button>
            </div>

            {results && (
              <div className="results-section">
                <h3>ROI Analysis Results</h3>
                
                <div className="timeframe-selector">
                  <button
                    className={`timeframe-btn ${timeframe === 'monthly' ? 'active' : ''}`}
                    onClick={() => setTimeframe('monthly')}
                  >
                    Monthly
                  </button>
                  <button
                    className={`timeframe-btn ${timeframe === 'annual' ? 'active' : ''}`}
                    onClick={() => setTimeframe('annual')}
                  >
                    Annual
                  </button>
                </div>

                <div className="roi-metrics">
                  <div className="roi-metric primary">
                    <div className="metric-label">ROI Percentage</div>
                    <div 
                      className="metric-value"
                      style={{ color: getROIColor(results.improvements.roiPercentage) }}
                    >
                      {formatPercentage(results.improvements.roiPercentage)}
                    </div>
                    <div className="metric-desc">Return on Investment</div>
                  </div>
                  
                  <div className="roi-metric">
                    <div className="metric-label">Profit Increase</div>
                    <div className="metric-value">
                      {timeframe === 'monthly' 
                        ? formatCurrency(results.improvements.monthlyProfitIncrease)
                        : formatCurrency(results.improvements.annualProfitIncrease)
                      }
                    </div>
                    <div className="metric-desc">Additional Monthly Profit</div>
                  </div>
                  
                  <div className="roi-metric">
                    <div className="metric-label">Payback Period</div>
                    <div className="metric-value">
                      {results.improvements.paybackMonths.toFixed(1)} months
                    </div>
                    <div className="metric-desc">Time to recover investment</div>
                  </div>
                </div>

                <div className="comparison-chart">
                  <h4>Current vs Improved Scenario</h4>
                  <div className="chart-bars">
                    <div className="chart-bar-group">
                      <div className="chart-bar-label">Monthly Cost</div>
                      <div className="chart-bars-container">
                        <div 
                          className="chart-bar current"
                          style={{ width: '100%' }}
                        >
                          <span>{formatCurrency(results.current.monthlyCost)}</span>
                        </div>
                        <div 
                          className="chart-bar improved"
                          style={{ width: `${(results.improved.monthlyCost / results.current.monthlyCost) * 100}%` }}
                        >
                          <span>{formatCurrency(results.improved.monthlyCost)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="chart-bar-group">
                      <div className="chart-bar-label">Monthly Revenue</div>
                      <div className="chart-bars-container">
                        <div 
                          className="chart-bar current"
                          style={{ width: '100%' }}
                        >
                          <span>{formatCurrency(results.current.monthlyRevenue)}</span>
                        </div>
                        <div 
                          className="chart-bar improved"
                          style={{ width: `${(results.improved.monthlyRevenue / results.current.monthlyRevenue) * 100}%` }}
                        >
                          <span>{formatCurrency(results.improved.monthlyRevenue)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="chart-bar-group">
                      <div className="chart-bar-label">Monthly Profit</div>
                      <div className="chart-bars-container">
                        <div 
                          className="chart-bar current"
                          style={{ width: '100%' }}
                        >
                          <span>{formatCurrency(results.current.monthlyProfit)}</span>
                        </div>
                        <div 
                          className="chart-bar improved"
                          style={{ width: `${(results.improved.monthlyProfit / results.current.monthlyProfit) * 100}%` }}
                        >
                          <span>{formatCurrency(results.improved.monthlyProfit)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="improvement-breakdown">
                  <h4>Improvement Breakdown</h4>
                  <div className="improvement-grid">
                    <div className="improvement-item">
                      <div className="improvement-label">Cost per Unit</div>
                      <div className="improvement-value" style={{ color: getImprovementColor(results.current.costPerUnit - results.improved.costPerUnit) }}>
                        {formatCurrency(results.improved.costPerUnit - results.current.costPerUnit)}
                      </div>
                    </div>
                    <div className="improvement-item">
                      <div className="improvement-label">Operational Efficiency</div>
                      <div className="improvement-value" style={{ color: getImprovementColor(results.improvements.timeSavings) }}>
                        {formatPercentage(results.improvements.timeSavings)}
                      </div>
                    </div>
                    <div className="improvement-item">
                      <div className="improvement-label">Quality Premium</div>
                      <div className="improvement-value" style={{ color: getImprovementColor(results.improvements.qualityImprovement) }}>
                        {formatPercentage(results.improvements.qualityImprovement)}
                      </div>
                    </div>
                    <div className="improvement-item">
                      <div className="improvement-label">Waste Reduction</div>
                      <div className="improvement-value" style={{ color: getImprovementColor(results.improvements.wasteReduction) }}>
                        {formatPercentage(results.improvements.wasteReduction)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Case Studies */}
          <div className="case-studies-panel">
            <div className="case-studies-section">
              <h3>Success Stories</h3>
              
              <div className="case-study-list">
                <div className="case-study-item">
                  <div className="case-study-header">
                    <div className="company-avatar">DSI</div>
                    <div className="company-info">
                      <div className="company-name">Dubai Spice Importers</div>
                      <div className="company-industry">Spice Trading</div>
                    </div>
                  </div>
                  <div className="case-study-metrics">
                    <div className="case-metric">
                      <div className="metric-value">+42%</div>
                      <div className="metric-label">Profit Increase</div>
                    </div>
                    <div className="case-metric">
                      <div className="metric-value">3 Months</div>
                      <div className="metric-label">ROI Period</div>
                    </div>
                  </div>
                  <div className="case-study-desc">
                    "Reduced supply chain costs by 35% while improving product quality consistency."
                  </div>
                </div>

                <div className="case-study-item">
                  <div className="case-study-header">
                    <div className="company-avatar">GF</div>
                    <div className="company-info">
                      <div className="company-name">Global Foods Ltd</div>
                      <div className="company-industry">Food Manufacturing</div>
                    </div>
                  </div>
                  <div className="case-study-metrics">
                    <div className="case-metric">
                      <div className="metric-value">+28%</div>
                      <div className="metric-label">Cost Savings</div>
                    </div>
                    <div className="case-metric">
                      <div className="metric-value">4 Months</div>
                      <div className="metric-label">ROI Period</div>
                    </div>
                  </div>
                  <div className="case-study-desc">
                    "Streamlined procurement process saved 20 hours weekly in administrative work."
                  </div>
                </div>

                <div className="case-study-item">
                  <div className="case-study-header">
                    <div className="company-avatar">PM</div>
                    <div className="company-info">
                      <div className="company-name">Premium Markets</div>
                      <div className="company-industry">Retail Chain</div>
                    </div>
                  </div>
                  <div className="case-study-metrics">
                    <div className="case-metric">
                      <div className="metric-value">+65%</div>
                      <div className="metric-label">Quality Score</div>
                    </div>
                    <div className="case-metric">
                      <div className="metric-value">2 Months</div>
                      <div className="metric-label">ROI Period</div>
                    </div>
                  </div>
                  <div className="case-study-desc">
                    "Blockchain traceability increased customer trust and allowed premium pricing."
                  </div>
                </div>
              </div>
            </div>

            <div className="next-steps-section">
              <h3>Ready to Achieve Similar Results?</h3>
              <div className="next-steps-list">
                <div className="next-step">
                  <div className="step-number">1</div>
                  <div className="step-content">
                    <div className="step-title">Schedule Consultation</div>
                    <div className="step-desc">Get personalized analysis</div>
                  </div>
                </div>
                <div className="next-step">
                  <div className="step-number">2</div>
                  <div className="step-content">
                    <div className="step-title">Receive Custom Plan</div>
                    <div className="step-desc">Tailored implementation strategy</div>
                  </div>
                </div>
                <div className="next-step">
                  <div className="step-number">3</div>
                  <div className="step-content">
                    <div className="step-title">Start Saving</div>
                    <div className="step-desc">Begin your ROI journey</div>
                  </div>
                </div>
              </div>
              
              <button className="cta-button">
                <span className="btn-icon">📅</span>
                SCHEDULE FREE CONSULTATION
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ROICalculator;