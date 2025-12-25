// src/components/Landing/ContactForm.jsx
import React, { useState } from 'react';
import './ContactForm.css';

export default function ContactForm() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: '',
  });
  
  const [status, setStatus] = useState({
    loading: false,
    success: '',
    error: '',
    showSuccessDetails: false,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear any previous status messages when user starts typing
    if (status.error || status.success) {
      setStatus({ loading: false, success: '', error: '', showSuccessDetails: false });
    }
  };

  const validateForm = () => {
    const errors = [];
    
    if (!form.name.trim()) errors.push('Name is required');
    if (!form.email.trim()) errors.push('Email is required');
    if (!form.message.trim()) errors.push('Message is required');
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (form.email && !emailRegex.test(form.email)) {
      errors.push('Please enter a valid email address');
    }
    
    // Phone validation (optional but format check if provided)
    if (form.phone && !/^[\d\s\+\-\(\)]{10,20}$/.test(form.phone)) {
      errors.push('Please enter a valid phone number');
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setStatus({
        loading: false,
        success: '',
        error: validationErrors.join('. '),
        showSuccessDetails: false,
      });
      return;
    }

    setStatus({ loading: true, success: '', error: '', showSuccessDetails: false });

    try {
      const res = await fetch('/api/public-contact-email', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim() || '',
          company: form.company.trim() || '',
          message: form.message.trim(),
          source: 'Saffron Emporial Landing Page',
          subject: 'New Export Inquiry from Website',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.details || 'Unable to send message right now. Please try again later.');
      }

      // Success - show detailed success message
      setStatus({
        loading: false,
        success: `Thank you ${form.name}! Your inquiry has been submitted successfully.`,
        error: '',
        showSuccessDetails: true,
      });
      
      // Reset form
      setForm({ 
        name: '', 
        email: '', 
        phone: '', 
        company: '', 
        message: '' 
      });

      // Auto-hide success details after 10 seconds
      setTimeout(() => {
        setStatus(prev => ({ ...prev, showSuccessDetails: false }));
      }, 10000);

    } catch (err) {
  console.error('ContactForm submission error:', err);
  
  let errorMessage = err.message || 'Something went wrong while sending your message.';
  let debugInfo = '';
  
  // For debugging in development
  if (process.env.NODE_ENV === 'development') {
    debugInfo = ` | Status: ${res?.status} | URL: ${res?.url}`;
  }
  
  // User-friendly error messages
  if (errorMessage.includes('Email service not configured')) {
    errorMessage = 'Our email service is being configured. Please try again in a few minutes or contact us directly.';
  } else if (errorMessage.includes('authentication failed')) {
    errorMessage = 'Email service authentication issue. We are working on it.';
  } else if (errorMessage.includes('connect to email server')) {
    errorMessage = 'Unable to connect to email service. Please check your internet connection.';
  }
  
  setStatus({
    loading: false,
    success: '',
    error: `${errorMessage} ${debugInfo}`,
    showSuccessDetails: false,
  });
   }
  };

  // Handle phone input formatting
  const handlePhoneChange = (e) => {
    let value = e.target.value;
    // Only allow numbers, plus, parentheses, spaces, and hyphens
    value = value.replace(/[^\d\s\+\-\(\)]/g, '');
    setForm(prev => ({ ...prev, phone: value }));
  };

  // Auto-clear success message after delay
  if (status.success && !status.showSuccessDetails) {
    setTimeout(() => {
      setStatus(prev => ({ ...prev, success: '' }));
    }, 5000);
  }

  return (
    <div className="cf-wrapper">
      <div className="cf-header">
        <div className="cf-pill">
          <span className="cf-pill-dot pulse" />
          <span className="cf-pill-text">⚡ Real-time Export Inquiry</span>
        </div>
        <h3 className="cf-title">Connect with India's Leading Export Partner</h3>
        <p className="cf-subtitle">
          Share your requirement and our export desk will respond with pricing,
          product availability and logistics options within 24 business hours.
          We handle everything from farm to port.
        </p>
      </div>

      <div className="cf-body">
        {/* Left: form */}
        <form className="cf-form" onSubmit={handleSubmit} noValidate>
          <div className="cf-field-group">
            <div className="cf-field">
              <label htmlFor="name">
                <span className="cf-label-text">Full Name *</span>
                <span className="cf-label-hint">(Buyer / Importer / Trader)</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="John Smith"
                value={form.name}
                onChange={handleChange}
                disabled={status.loading}
                className={status.error && !form.name ? 'cf-input-error' : ''}
              />
            </div>

            <div className="cf-field">
              <label htmlFor="email">
                <span className="cf-label-text">Business Email *</span>
                <span className="cf-label-hint">(For official communication)</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="john@importcompany.com"
                value={form.email}
                onChange={handleChange}
                disabled={status.loading}
                className={status.error && !form.email ? 'cf-input-error' : ''}
              />
            </div>
          </div>

          <div className="cf-field-group">
            <div className="cf-field">
              <label htmlFor="phone">
                <span className="cf-label-text">Phone / WhatsApp</span>
                <span className="cf-label-hint">(For urgent queries)</span>
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+91 98765 43210"
                value={form.phone}
                onChange={handlePhoneChange}
                disabled={status.loading}
              />
            </div>

            <div className="cf-field">
              <label htmlFor="company">
                <span className="cf-label-text">Company / Organisation</span>
                <span className="cf-label-hint">(Optional)</span>
              </label>
              <input
                id="company"
                name="company"
                type="text"
                placeholder="Global Importers Ltd."
                value={form.company}
                onChange={handleChange}
                disabled={status.loading}
              />
            </div>
          </div>

          <div className="cf-field">
            <label htmlFor="message">
              <span className="cf-label-text">Your Requirement *</span>
              <span className="cf-label-hint">(Product, quantity, destination, timeline)</span>
            </label>
            <textarea
              id="message"
              name="message"
              rows={6}
              placeholder="Example: Looking for 20 MT of Bhagwa Pomegranates for Dubai market. Need Grade A, vacuum packed, shipment by Jan 2024. Please share FOB pricing and available quantities."
              value={form.message}
              onChange={handleChange}
              disabled={status.loading}
              className={status.error && !form.message ? 'cf-input-error' : ''}
            />
            <div className="cf-textarea-hint">
              Character count: {form.message.length} / 1000
            </div>
          </div>

          {/* Status Messages */}
          {status.error && (
            <div className="cf-alert cf-alert-error slide-in">
              <div className="cf-alert-icon">⚠️</div>
              <div className="cf-alert-content">
                <strong>Unable to submit:</strong> {status.error}
              </div>
            </div>
          )}
          
          {status.success && (
            <div className={`cf-alert cf-alert-success ${status.showSuccessDetails ? 'expanded' : ''} slide-in`}>
              <div className="cf-alert-icon">✅</div>
              <div className="cf-alert-content">
                <strong>Success!</strong> {status.success}
                
                {status.showSuccessDetails && (
                  <div className="cf-success-details">
                    <div className="cf-success-timeline">
                      <div className="cf-timeline-step">
                        <div className="cf-step-icon">📧</div>
                        <div className="cf-step-text">
                          <strong>Confirmation email sent</strong> to {form.email}
                        </div>
                      </div>
                      <div className="cf-timeline-step">
                        <div className="cf-step-icon">👥</div>
                        <div className="cf-step-text">
                          <strong>Export team notified</strong> and will contact you within 24h
                        </div>
                      </div>
                      <div className="cf-timeline-step">
                        <div className="cf-step-icon">📞</div>
                        <div className="cf-step-text">
                          <strong>Check your WhatsApp</strong> for immediate acknowledgment
                        </div>
                      </div>
                    </div>
                    <div className="cf-success-note">
                      Need urgent assistance? Call +91-7977133023
                    </div>
                  </div>
                )}
              </div>
              <button 
                type="button" 
                className="cf-alert-close"
                onClick={() => setStatus(prev => ({ ...prev, success: '' }))}
                aria-label="Close success message"
              >
                ✕
              </button>
            </div>
          )}

          <div className="cf-submit-section">
            <button
              type="submit"
              className="cf-submit-btn"
              disabled={status.loading}
            >
              {status.loading ? (
                <>
                  <span className="cf-loading-spinner"></span>
                  Sending Inquiry...
                </>
              ) : (
                '📤 Submit Export Inquiry'
              )}
            </button>
            
            <div className="cf-submit-info">
              <div className="cf-info-item">
                <span className="cf-info-icon">🔒</span>
                <span className="cf-info-text">Your data is secure</span>
              </div>
              <div className="cf-info-item">
                <span className="cf-info-icon">⚡</span>
                <span className="cf-info-text">24h average response time</span>
              </div>
              <div className="cf-info-item">
                <span className="cf-info-icon">📧</span>
                <span className="cf-info-text">Email confirmation sent</span>
              </div>
            </div>
          </div>

          <div className="cf-legal">
            <p>
              By submitting, you agree to our{' '}
              <a href="/privacy" className="cf-link">Privacy Policy</a> and allow Saffron Emporial's export team 
              to contact you via email/WhatsApp for legitimate business communication. 
              We do not share your information with third parties.
            </p>
            <div className="cf-trust-badges">
              <span className="cf-badge">ISO 9001 Certified</span>
              <span className="cf-badge">GDPR Compliant</span>
              <span className="cf-badge">Secure SSL</span>
            </div>
          </div>
        </form>

        {/* Right: trust info / reassurance */}
        <div className="cf-side">
          <div className="cf-side-card gold-border">
            <h4 className="cf-side-title">✨ Why Global Buyers Choose Us</h4>
            <ul className="cf-feature-list">
              <li className="cf-feature-item">
                <span className="cf-feature-icon">🌍</span>
                <div className="cf-feature-content">
                  <strong>End-to-End Export Handling</strong>
                  <p>From farm gate to destination port with complete documentation</p>
                </div>
              </li>
              <li className="cf-feature-item">
                <span className="cf-feature-icon">📊</span>
                <div className="cf-feature-content">
                  <strong>Multi-Product Portfolio</strong>
                  <p>Fruits, vegetables, spices, coconuts, granite & processed foods</p>
                </div>
              </li>
              <li className="cf-feature-item">
                <span className="cf-feature-icon">🏷️</span>
                <div className="cf-feature-content">
                  <strong>Grade & Quality Assurance</strong>
                  <p>Customized packing aligned to your market standards</p>
                </div>
              </li>
              <li className="cf-feature-item">
                <span className="cf-feature-icon">🚢</span>
                <div className="cf-feature-content">
                  <strong>Transparent Shipment Tracking</strong>
                  <p>Real-time logistics visibility and milestone-based payments</p>
                </div>
              </li>
            </ul>
          </div>

          <div className="cf-metrics">
            <div className="cf-metric gold-gradient">
              <div className="cf-metric-value">24–48h</div>
              <div className="cf-metric-label">Initial Response Time</div>
              <div className="cf-metric-sub">(Business Hours)</div>
            </div>
            <div className="cf-metric gold-gradient">
              <div className="cf-metric-value">25+</div>
              <div className="cf-metric-label">Countries Served</div>
              <div className="cf-metric-sub">(By Group Companies)</div>
            </div>
            <div className="cf-metric gold-gradient">
              <div className="cf-metric-value">A+</div>
              <div className="cf-metric-label">Trust Score</div>
              <div className="cf-metric-sub">(Internal Rating)</div>
            </div>
          </div>

          <div className="cf-assurance">
            <div className="cf-assurance-icon">👨‍💼</div>
            <div className="cf-assurance-content">
              <h5>Dedicated Export Coordinator</h5>
              <p>All serious RFQs are assigned to a personal export coordinator who manages your entire shipment journey.</p>
            </div>
          </div>

          <div className="cf-contact-alternatives">
            <h5>📞 Prefer Direct Contact?</h5>
            <div className="cf-contact-options">
              <a href="tel:+91-7977133023" className="cf-contact-option">
                <span className="cf-option-icon">📱</span>
                <span className="cf-option-text">Call: +91-7977133023</span>
              </a>
              <a href="https://wa.me/919372383903" className="cf-contact-option" target="_blank" rel="noopener noreferrer">
                <span className="cf-option-icon">💬</span>
                <span className="cf-option-text">WhatsApp</span>
              </a>
              <a href="mailto:trust@saffronemporial.com" className="cf-contact-option">
                <span className="cf-option-icon">📧</span>
                <span className="cf-option-text">Email Directly</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
