// src/components/public/interactive/InstantQuotation.jsx
import React, { useState, useEffect } from 'react';
import { indianProducts, exportDestinations } from '../data/indianExportData';
import './InstantQuotation.css';

const InstantQuotation = () => {
  const [formData, setFormData] = useState({
    product: '',
    variety: '',
    quantity: '',
    grade: '',
    destination: 'Dubai, UAE',
    shipping: 'standard'
  });

  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [conversionRates, setConversionRates] = useState({ USD: 0, EUR: 0, AED: 0 });

  useEffect(() => {
    // Simulate fetching conversion rates
    setConversionRates({
      USD: 0.012, // 1 INR = 0.012 USD
      EUR: 0.011, // 1 INR = 0.011 EUR
      AED: 0.044  // 1 INR = 0.044 AED
    });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Reset quote when product changes
    if (name === 'product') {
      setQuote(null);
      setFormData(prev => ({
        ...prev,
        variety: '',
        grade: ''
      }));
    }
  };

  const getProductVarieties = () => {
    if (!formData.product) return [];
    return indianProducts[formData.product]?.varieties || [];
  };

  const getProductGrades = () => {
    if (!formData.product) return [];
    return indianProducts[formData.product]?.grades || [];
  };

  const calculateQuote = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const product = indianProducts[formData.product];
    if (product) {
      const basePrice = (product.priceRange.min + product.priceRange.max) / 2;
      const quantity = parseFloat(formData.quantity) || 0;
      
      // Price adjustments based on variety and grade
      let varietyMultiplier = 1;
      if (formData.variety.includes('Premium') || formData.variety.includes('Organic')) {
        varietyMultiplier = 1.2;
      }

      let gradeMultiplier = 1;
      if (formData.grade === 'Premium' || formData.grade === 'Export Quality') {
        gradeMultiplier = 1.15;
      } else if (formData.grade === 'Organic') {
        gradeMultiplier = 1.25;
      }

      const productCost = basePrice * quantity * varietyMultiplier * gradeMultiplier;
      
      // Shipping costs
      let shippingCost = 0;
      let insuranceCost = productCost * 0.02; // 2% insurance
      
      if (formData.shipping === 'express') {
        shippingCost = productCost * 0.15;
      } else if (formData.shipping === 'standard') {
        shippingCost = productCost * 0.08;
      } else {
        shippingCost = productCost * 0.05;
      }

      // Destination charges
      let destinationCharge = 0;
      if (formData.destination === 'USA' || formData.destination === 'UK') {
        destinationCharge = productCost * 0.1;
      } else if (formData.destination === 'Dubai, UAE') {
        destinationCharge = productCost * 0.05;
      }

      const subtotal = productCost + shippingCost + insuranceCost + destinationCharge;
      const gst = subtotal * 0.12; // 12% GST
      const totalINR = subtotal + gst;

      const quoteResult = {
        product: product.name,
        variety: formData.variety,
        grade: formData.grade,
        quantity: formData.quantity,
        unit: formData.product === 'granite' ? 'sqm' : formData.product === 'electricToys' ? 'units' : 'kg',
        destination: formData.destination,
        shipping: formData.shipping,
        breakdown: {
          productCost,
          shippingCost,
          insuranceCost,
          destinationCharge,
          gst,
          totalINR
        },
        currencyConversions: {
          USD: totalINR * conversionRates.USD,
          EUR: totalINR * conversionRates.EUR,
          AED: totalINR * conversionRates.AED
        },
        validity: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      };

      setQuote(quoteResult);
    }
    setLoading(false);
  };

  const formatCurrency = (amount, currency = 'INR') => {
    const formatter = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    return formatter.format(amount);
  };

  const formatINR = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="gold-quotation-section">
      <div className="quotation-container">
        <div className="quotation-header">
          <div className="header-gold-bar"></div>
          <h2>Instant Export Quotation</h2>
          <p>Get real-time pricing for Indian export products in 30 seconds</p>
          <div className="header-badges">
            <div className="badge">🇮🇳 Made in India</div>
            <div className="badge">🚢 Worldwide Shipping</div>
            <div className="badge">💎 Best Price Guarantee</div>
          </div>
        </div>

        <div className="quotation-content">
          <form onSubmit={calculateQuote} className="quotation-form">
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="product" className="form-label">
                  <span className="label-icon">📦</span>
                  Product Category
                </label>
                <select
                  id="product"
                  name="product"
                  value={formData.product}
                  onChange={handleChange}
                  required
                  className="form-select"
                >
                  <option value="">Select a product</option>
                  {Object.keys(indianProducts).map(key => (
                    <option key={key} value={key}>
                      {indianProducts[key].name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="variety" className="form-label">
                  <span className="label-icon">🌿</span>
                  Variety Type
                </label>
                <select
                  id="variety"
                  name="variety"
                  value={formData.variety}
                  onChange={handleChange}
                  required
                  className="form-select"
                  disabled={!formData.product}
                >
                  <option value="">Select variety</option>
                  {getProductVarieties().map(variety => (
                    <option key={variety} value={variety}>{variety}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="quantity" className="form-label">
                  <span className="label-icon">⚖️</span>
                  Quantity
                </label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  placeholder={`Enter quantity in ${formData.product && indianProducts[formData.product].name === 'Granite & Marble' ? 'square meters' : 'kilograms'}`}
                  required
                  min="1"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="grade" className="form-label">
                  <span className="label-icon">⭐</span>
                  Quality Grade
                </label>
                <select
                  id="grade"
                  name="grade"
                  value={formData.grade}
                  onChange={handleChange}
                  required
                  className="form-select"
                  disabled={!formData.product}
                >
                  <option value="">Select grade</option>
                  {getProductGrades().map(grade => (
                    <option key={grade} value={grade}>{grade}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="destination" className="form-label">
                  <span className="label-icon">🌍</span>
                  Destination
                </label>
                <select
                  id="destination"
                  name="destination"
                  value={formData.destination}
                  onChange={handleChange}
                  required
                  className="form-select"
                >
                  {exportDestinations.map(dest => (
                    <option key={dest.country} value={dest.city}>
                      {dest.city}, {dest.country} ({dest.volume} Volume)
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="shipping" className="form-label">
                  <span className="label-icon">🚚</span>
                  Shipping Method
                </label>
                <select
                  id="shipping"
                  name="shipping"
                  value={formData.shipping}
                  onChange={handleChange}
                  required
                  className="form-select"
                >
                  <option value="economy">Economy (15-20 days)</option>
                  <option value="standard">Standard (10-15 days)</option>
                  <option value="express">Express (5-7 days)</option>
                </select>
              </div>
            </div>

            <button 
              type="submit" 
              className={`calculate-btn ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner"></div>
                  Calculating Your Quote...
                </>
              ) : (
                <>
                  <span className="btn-icon">💰</span>
                  Get Instant Quote
                  <span className="btn-arrow">→</span>
                </>
              )}
            </button>
          </form>

          {quote && (
            <div className="quote-result">
              <div className="result-header">
                <h3>Your Export Quote</h3>
                <div className="validity">
                  <span className="validity-icon">⏰</span>
                  Valid until {quote.validity.toLocaleDateString()}
                </div>
              </div>

              <div className="quote-summary">
                <div className="summary-item">
                  <span className="summary-label">Product:</span>
                  <span className="summary-value">{quote.product} - {quote.variety}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Quantity:</span>
                  <span className="summary-value">{quote.quantity} {quote.unit}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Grade:</span>
                  <span className="summary-value badge-grade">{quote.grade}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Destination:</span>
                  <span className="summary-value">{quote.destination}</span>
                </div>
              </div>

              <div className="price-display">
                <div className="total-price">
                  {formatINR(quote.breakdown.totalINR)}
                </div>
                <div className="price-conversions">
                  <div className="conversion">
                    <span className="currency">USD</span>
                    <span className="amount">{formatCurrency(quote.currencyConversions.USD, 'USD')}</span>
                  </div>
                  <div className="conversion">
                    <span className="currency">EUR</span>
                    <span className="amount">{formatCurrency(quote.currencyConversions.EUR, 'EUR')}</span>
                  </div>
                  <div className="conversion">
                    <span className="currency">AED</span>
                    <span className="amount">{formatCurrency(quote.currencyConversions.AED, 'AED')}</span>
                  </div>
                </div>
              </div>

              <button 
                className="breakdown-toggle"
                onClick={() => setShowBreakdown(!showBreakdown)}
              >
                <span>{showBreakdown ? 'Hide' : 'Show'} Cost Breakdown</span>
                <span className={`toggle-arrow ${showBreakdown ? 'up' : 'down'}`}>▼</span>
              </button>

              {showBreakdown && (
                <div className="cost-breakdown">
                  <div className="breakdown-item">
                    <span>Product Cost:</span>
                    <span>{formatINR(quote.breakdown.productCost)}</span>
                  </div>
                  <div className="breakdown-item">
                    <span>Shipping & Logistics:</span>
                    <span>{formatINR(quote.breakdown.shippingCost)}</span>
                  </div>
                  <div className="breakdown-item">
                    <span>Insurance (2%):</span>
                    <span>{formatINR(quote.breakdown.insuranceCost)}</span>
                  </div>
                  <div className="breakdown-item">
                    <span>Destination Charges:</span>
                    <span>{formatINR(quote.breakdown.destinationCharge)}</span>
                  </div>
                  <div className="breakdown-item">
                    <span>GST (12%):</span>
                    <span>{formatINR(quote.breakdown.gst)}</span>
                  </div>
                  <div className="breakdown-total">
                    <span>Total Export Cost:</span>
                    <span>{formatINR(quote.breakdown.totalINR)}</span>
                  </div>
                </div>
              )}

              <div className="quote-actions">
                <button className="action-btn primary">
                  <span className="action-icon">📝</span>
                  Place Order Now
                </button>
                <button className="action-btn secondary">
                  <span className="action-icon">📄</span>
                  Download Quote PDF
                </button>
                <button className="action-btn secondary">
                  <span className="action-icon">💬</span>
                  Talk to Export Expert
                </button>
              </div>

              <div className="quote-guarantees">
                <div className="guarantee">
                  <span className="guarantee-icon">🔒</span>
                  <span>Price Lock Guarantee</span>
                </div>
                <div className="guarantee">
                  <span className="guarantee-icon">🚢</span>
                  <span>Door-to-Door Delivery</span>
                </div>
                <div className="guarantee">
                  <span className="guarantee-icon">📋</span>
                  <span>Customs Clearance Included</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="quotation-features">
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h4>Instant Quotes</h4>
            <p>Real-time pricing based on current market rates and availability</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🌍</div>
            <h4>Global Delivery</h4>
            <p>Door-to-door shipping to 50+ countries with customs clearance</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💎</div>
            <h4>Quality Assured</h4>
            <p>Government-certified products with quality guarantees</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🛡️</div>
            <h4>Full Insurance</h4>
            <p>Comprehensive cargo insurance included in all shipments</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstantQuotation;