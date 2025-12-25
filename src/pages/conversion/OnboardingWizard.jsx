// src/components/public/conversion/OnboardingWizard.jsx
import React, { useState } from 'react';
import { indianProducts, exportDestinations } from '../data/indianExportData';
import './OnboardingWizard.css';

const OnboardingWizard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Business Info
    businessType: '',
    companyName: '',
    annualRevenue: '',
    employeeCount: '',
    
    // Step 2: Product Interests
    interestedProducts: [],
    currentSuppliers: [],
    monthlyVolume: '',
    
    // Step 3: Logistics
    preferredDestinations: [],
    shippingFrequency: '',
    specialRequirements: '',
    
    // Step 4: Contact Info
    fullName: '',
    email: '',
    phone: '',
    country: '',
    timezone: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const businessTypes = [
    { value: 'importer', label: 'Import/Export Company', icon: '🚢' },
    { value: 'manufacturer', label: 'Manufacturer', icon: '🏭' },
    { value: 'distributor', label: 'Distributor', icon: '📦' },
    { value: 'retailer', label: 'Retailer', icon: '🏪' },
    { value: 'restaurant', label: 'Restaurant/Hotel', icon: '🍽️' },
    { value: 'wholesaler', label: 'Wholesaler', icon: '📊' }
  ];

  const revenueRanges = [
    { value: 'under-1m', label: 'Under $1M' },
    { value: '1m-5m', label: '$1M - $5M' },
    { value: '5m-20m', label: '$5M - $20M' },
    { value: '20m-100m', label: '$20M - $100M' },
    { value: 'over-100m', label: 'Over $100M' }
  ];

  const employeeRanges = [
    { value: '1-10', label: '1-10 Employees' },
    { value: '11-50', label: '11-50 Employees' },
    { value: '51-200', label: '51-200 Employees' },
    { value: '201-1000', label: '201-1000 Employees' },
    { value: 'over-1000', label: '1000+ Employees' }
  ];

  const volumeRanges = [
    { value: 'under-1ton', label: 'Under 1 ton/month' },
    { value: '1-5tons', label: '1-5 tons/month' },
    { value: '5-20tons', label: '5-20 tons/month' },
    { value: '20-100tons', label: '20-100 tons/month' },
    { value: 'over-100tons', label: '100+ tons/month' }
  ];

  const shippingFrequencies = [
    { value: 'weekly', label: 'Weekly', icon: '📅' },
    { value: 'bi-weekly', label: 'Bi-Weekly', icon: '🗓️' },
    { value: 'monthly', label: 'Monthly', icon: '📆' },
    { value: 'quarterly', label: 'Quarterly', icon: '📊' },
    { value: 'custom', label: 'Custom Schedule', icon: '⚡' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleProductToggle = (product) => {
    setFormData(prev => ({
      ...prev,
      interestedProducts: prev.interestedProducts.includes(product)
        ? prev.interestedProducts.filter(p => p !== product)
        : [...prev.interestedProducts, product]
    }));
  };

  const handleDestinationToggle = (destination) => {
    setFormData(prev => ({
      ...prev,
      preferredDestinations: prev.preferredDestinations.includes(destination)
        ? prev.preferredDestinations.filter(d => d !== destination)
        : [...prev.preferredDestinations, destination]
    }));
  };

  const nextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setShowSuccess(true);
  };

  const getStepProgress = () => {
    return (currentStep / 5) * 100;
  };

  const renderStep1 = () => (
    <div className="wizard-step">
      <div className="step-header">
        <div className="step-icon">🏢</div>
        <div className="step-info">
          <h3>Tell us about your business</h3>
          <p>Help us understand your needs better</p>
        </div>
      </div>

      <div className="step-content">
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Business Type *</label>
            <div className="business-type-grid">
              {businessTypes.map(type => (
                <div
                  key={type.value}
                  className={`business-type-card ${formData.businessType === type.value ? 'selected' : ''}`}
                  onClick={() => handleInputChange('businessType', type.value)}
                >
                  <div className="type-icon">{type.icon}</div>
                  <div className="type-label">{type.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Company Name *</label>
            <input
              type="text"
              className="form-input"
              placeholder="Enter your company name"
              value={formData.companyName}
              onChange={(e) => handleInputChange('companyName', e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Annual Revenue</label>
            <select
              className="form-select"
              value={formData.annualRevenue}
              onChange={(e) => handleInputChange('annualRevenue', e.target.value)}
            >
              <option value="">Select revenue range</option>
              {revenueRanges.map(range => (
                <option key={range.value} value={range.value}>{range.label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Number of Employees</label>
            <select
              className="form-select"
              value={formData.employeeCount}
              onChange={(e) => handleInputChange('employeeCount', e.target.value)}
            >
              <option value="">Select employee count</option>
              {employeeRanges.map(range => (
                <option key={range.value} value={range.value}>{range.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="wizard-step">
      <div className="step-header">
        <div className="step-icon">📦</div>
        <div className="step-info">
          <h3>What products interest you?</h3>
          <p>Select products you want to import from India</p>
        </div>
      </div>

      <div className="step-content">
        <div className="products-grid">
          {Object.entries(indianProducts).map(([key, product]) => (
            <div
              key={key}
              className={`product-select-card ${formData.interestedProducts.includes(key) ? 'selected' : ''}`}
              onClick={() => handleProductToggle(key)}
            >
              <div className="product-visual">
                <div className="product-icon">
                  {key === 'pomegranate' ? '🍎' :
                   key === 'cardamom' ? '🌿' :
                   key === 'granite' ? '🏔️' :
                   key === 'medicines' ? '💊' :
                   key === 'agroProducts' ? '🌾' :
                   key === 'electricToys' ? '🤖' :
                   key === 'onions' ? '🧅' :
                   key === 'redChilly' ? '🌶️' :
                   key === 'grapes' ? '🍇' : '📦'}
                </div>
                <div className="product-glow"></div>
              </div>
              <div className="product-info">
                <h4>{product.name}</h4>
                <p className="product-varieties">{product.varieties.slice(0, 2).join(', ')}</p>
                <div className="product-price">
                  ${product.priceRange.min} - ${product.priceRange.max}/kg
                </div>
              </div>
              <div className="selection-indicator">
                {formData.interestedProducts.includes(key) ? '✓' : '+'}
              </div>
            </div>
          ))}
        </div>

        <div className="form-group">
          <label className="form-label">Current Monthly Volume</label>
          <select
            className="form-select"
            value={formData.monthlyVolume}
            onChange={(e) => handleInputChange('monthlyVolume', e.target.value)}
          >
            <option value="">Select monthly volume</option>
            {volumeRanges.map(range => (
              <option key={range.value} value={range.value}>{range.label}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Current Suppliers (Optional)</label>
          <input
            type="text"
            className="form-input"
            placeholder="List your current suppliers"
            value={formData.currentSuppliers.join(', ')}
            onChange={(e) => handleInputChange('currentSuppliers', e.target.value.split(',').map(s => s.trim()))}
          />
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="wizard-step">
      <div className="step-header">
        <div className="step-icon">🚚</div>
        <div className="step-info">
          <h3>Logistics & Shipping</h3>
          <p>Tell us about your shipping needs</p>
        </div>
      </div>

      <div className="step-content">
        <div className="form-group">
          <label className="form-label">Preferred Destinations *</label>
          <div className="destinations-grid">
            {exportDestinations.map(destination => (
              <div
                key={destination.country}
                className={`destination-card ${formData.preferredDestinations.includes(destination.country) ? 'selected' : ''}`}
                onClick={() => handleDestinationToggle(destination.country)}
              >
                <div className="destination-flag">
                  {destination.country === 'UAE' ? '🇦🇪' :
                   destination.country === 'USA' ? '🇺🇸' :
                   destination.country === 'UK' ? '🇬🇧' :
                   destination.country === 'Germany' ? '🇩🇪' :
                   destination.country === 'Japan' ? '🇯🇵' :
                   destination.country === 'Australia' ? '🇦🇺' :
                   destination.country === 'Singapore' ? '🇸🇬' :
                   destination.country === 'Saudi Arabia' ? '🇸🇦' : '🌍'}
                </div>
                <div className="destination-info">
                  <div className="destination-city">{destination.city}</div>
                  <div className="destination-country">{destination.country}</div>
                </div>
                <div className="destination-volume">{destination.volume}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Shipping Frequency *</label>
          <div className="frequency-grid">
            {shippingFrequencies.map(freq => (
              <div
                key={freq.value}
                className={`frequency-card ${formData.shippingFrequency === freq.value ? 'selected' : ''}`}
                onClick={() => handleInputChange('shippingFrequency', freq.value)}
              >
                <div className="frequency-icon">{freq.icon}</div>
                <div className="frequency-label">{freq.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Special Requirements</label>
          <textarea
            className="form-textarea"
            placeholder="Any special packaging, documentation, or handling requirements?"
            value={formData.specialRequirements}
            onChange={(e) => handleInputChange('specialRequirements', e.target.value)}
            rows="4"
          />
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="wizard-step">
      <div className="step-header">
        <div className="step-icon">👤</div>
        <div className="step-info">
          <h3>Contact Information</h3>
          <p>How can we reach you?</p>
        </div>
      </div>

      <div className="step-content">
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              type="text"
              className="form-input"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <input
              type="email"
              className="form-input"
              placeholder="your.email@company.com"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number *</label>
            <input
              type="tel"
              className="form-input"
              placeholder="+1 (555) 123-4567"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Country *</label>
            <input
              type="text"
              className="form-input"
              placeholder="Your country"
              value={formData.country}
              onChange={(e) => handleInputChange('country', e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Timezone</label>
            <select
              className="form-select"
              value={formData.timezone}
              onChange={(e) => handleInputChange('timezone', e.target.value)}
            >
              <option value="">Select your timezone</option>
              <option value="EST">Eastern Time (EST)</option>
              <option value="PST">Pacific Time (PST)</option>
              <option value="CST">Central Time (CST)</option>
              <option value="GMT">Greenwich Mean Time (GMT)</option>
              <option value="CET">Central European Time (CET)</option>
              <option value="GST">Gulf Standard Time (GST)</option>
              <option value="SGT">Singapore Time (SGT)</option>
              <option value="JST">Japan Standard Time (JST)</option>
              <option value="AEST">Australian Eastern Time (AEST)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="wizard-step">
      <div className="step-header">
        <div className="step-icon">🎯</div>
        <div className="step-info">
          <h3>Ready to Get Started!</h3>
          <p>Review your information and complete registration</p>
        </div>
      </div>

      <div className="step-content">
        <div className="review-summary">
          <div className="summary-section">
            <h4>Business Information</h4>
            <div className="summary-grid">
              <div className="summary-item">
                <span className="summary-label">Business Type:</span>
                <span className="summary-value">
                  {businessTypes.find(t => t.value === formData.businessType)?.label}
                </span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Company:</span>
                <span className="summary-value">{formData.companyName}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Revenue:</span>
                <span className="summary-value">
                  {revenueRanges.find(r => r.value === formData.annualRevenue)?.label}
                </span>
              </div>
            </div>
          </div>

          <div className="summary-section">
            <h4>Product Interests</h4>
            <div className="products-summary">
              {formData.interestedProducts.map(productKey => (
                <div key={productKey} className="product-tag">
                  {indianProducts[productKey]?.name}
                </div>
              ))}
            </div>
            <div className="summary-item">
              <span className="summary-label">Monthly Volume:</span>
              <span className="summary-value">
                {volumeRanges.find(v => v.value === formData.monthlyVolume)?.label}
              </span>
            </div>
          </div>

          <div className="summary-section">
            <h4>Shipping Details</h4>
            <div className="destinations-summary">
              {formData.preferredDestinations.map(dest => (
                <div key={dest} className="destination-tag">
                  {dest}
                </div>
              ))}
            </div>
            <div className="summary-item">
              <span className="summary-label">Frequency:</span>
              <span className="summary-value">
                {shippingFrequencies.find(f => f.value === formData.shippingFrequency)?.label}
              </span>
            </div>
          </div>

          <div className="summary-section">
            <h4>Contact Information</h4>
            <div className="summary-grid">
              <div className="summary-item">
                <span className="summary-label">Name:</span>
                <span className="summary-value">{formData.fullName}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Email:</span>
                <span className="summary-value">{formData.email}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Phone:</span>
                <span className="summary-value">{formData.phone}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="benefits-preview">
          <h4>What happens next?</h4>
          <div className="benefits-list">
            <div className="benefit-item">
              <div className="benefit-icon">🚀</div>
              <div className="benefit-content">
                <div className="benefit-title">Instant Account Setup</div>
                <div className="benefit-desc">Get immediate access to our platform</div>
              </div>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon">💰</div>
              <div className="benefit-content">
                <div className="benefit-title">Personalized Pricing</div>
                <div className="benefit-desc">Receive custom quotes based on your needs</div>
              </div>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon">👨‍💼</div>
              <div className="benefit-content">
                <div className="benefit-title">Dedicated Account Manager</div>
                <div className="benefit-desc">Get assigned a personal export specialist</div>
              </div>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon">📊</div>
              <div className="benefit-content">
                <div className="benefit-title">Market Insights</div>
                <div className="benefit-desc">Access exclusive market data and trends</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSuccess = () => (
    <div className="success-screen">
      <div className="success-animation">
        <div className="success-icon">🎉</div>
        <div className="success-checkmark">✓</div>
      </div>
      
      <div className="success-content">
        <h2>Welcome to India Export Platform!</h2>
        <p>Your account is being set up with personalized features</p>
        
        <div className="next-steps">
          <h4>What's happening now:</h4>
          <div className="steps-timeline">
            <div className="step active">
              <div className="step-marker">1</div>
              <div className="step-content">
                <div className="step-title">Account Creation</div>
                <div className="step-desc">Setting up your dashboard</div>
              </div>
            </div>
            <div className="step">
              <div className="step-marker">2</div>
              <div className="step-content">
                <div className="step-title">Personalized Pricing</div>
                <div className="step-desc">Calculating your exclusive rates</div>
              </div>
            </div>
            <div className="step">
              <div className="step-marker">3</div>
              <div className="step-content">
                <div className="step-title">Manager Assignment</div>
                <div className="step-desc">Connecting you with an expert</div>
              </div>
            </div>
            <div className="step">
              <div className="step-marker">4</div>
              <div className="step-content">
                <div className="step-title">Welcome Kit</div>
                <div className="step-desc">Preparing your resources</div>
              </div>
            </div>
          </div>
        </div>

        <div className="success-actions">
          <button className="action-btn primary" onClick={() => window.location.reload()}>
            Go to Dashboard
          </button>
          <button className="action-btn secondary">
            Schedule Orientation Call
          </button>
        </div>

        <div className="welcome-bonus">
          <div className="bonus-card">
            <div className="bonus-icon">🎁</div>
            <div className="bonus-content">
              <div className="bonus-title">Welcome Bonus!</div>
              <div className="bonus-desc">Get 5% off your first order + priority shipping</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (showSuccess) {
    return renderSuccess();
  }

  return (
    <div className="onboarding-wizard-section">
      <div className="wizard-container">
        <div className="wizard-header">
          <div className="header-gold-bar"></div>
          <h2 className="neon-text">GET STARTED IN 2 MINUTES</h2>
          <p className="subtitle">Join 500+ successful importers using our platform</p>
        </div>

        <div className="wizard-content">
          <div className="wizard-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${getStepProgress()}%` }}
              ></div>
            </div>
            <div className="progress-steps">
              {[1, 2, 3, 4, 5].map(step => (
                <div 
                  key={step} 
                  className={`progress-step ${step === currentStep ? 'active' : step < currentStep ? 'completed' : ''}`}
                >
                  <div className="step-number">{step}</div>
                  <div className="step-label">
                    {step === 1 && 'Business'}
                    {step === 2 && 'Products'}
                    {step === 3 && 'Shipping'}
                    {step === 4 && 'Contact'}
                    {step === 5 && 'Review'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="wizard-form">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
            {currentStep === 5 && renderStep5()}

            <div className="wizard-actions">
              {currentStep > 1 && (
                <button type="button" className="action-btn secondary" onClick={prevStep}>
                  ← Back
                </button>
              )}
              
              <div className="actions-right">
                {currentStep < 5 ? (
                  <button type="button" className="action-btn primary" onClick={nextStep}>
                    Continue →
                  </button>
                ) : (
                  <button 
                    type="submit" 
                    className={`action-btn primary ${isSubmitting ? 'submitting' : ''}`}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="submit-spinner"></div>
                        Creating Your Account...
                      </>
                    ) : (
                      'Complete Registration ✓'
                    )}
                  </button>
                )}
              </div>
            </div>
          </form>

          <div className="wizard-sidebar">
            <div className="sidebar-card">
              <h4>Why Join Our Platform?</h4>
              <div className="benefits-list">
                <div className="benefit">
                  <div className="benefit-icon">💰</div>
                  <div className="benefit-text">Competitive Pricing</div>
                </div>
                <div className="benefit">
                  <div className="benefit-icon">🚢</div>
                  <div className="benefit-text">Door-to-Door Shipping</div>
                </div>
                <div className="benefit">
                  <div className="benefit-icon">🔒</div>
                  <div className="benefit-text">Quality Guarantee</div>
                </div>
                <div className="benefit">
                  <div className="benefit-icon">📊</div>
                  <div className="benefit-text">Real-time Tracking</div>
                </div>
              </div>
            </div>

            <div className="stats-card">
              <h4>Platform Stats</h4>
              <div className="stats-grid">
                <div className="stat">
                  <div className="stat-value">500+</div>
                  <div className="stat-label">Active Clients</div>
                </div>
                <div className="stat">
                  <div className="stat-value">$25M+</div>
                  <div className="stat-label">Monthly Volume</div>
                </div>
                <div className="stat">
                  <div className="stat-value">99.2%</div>
                  <div className="stat-label">On-time Delivery</div>
                </div>
                <div className="stat">
                  <div className="stat-value">24/7</div>
                  <div className="stat-label">Support</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingWizard;