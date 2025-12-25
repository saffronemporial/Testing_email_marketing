// src/components/Auth/Signup.jsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import './auth.css';
import '../../styles/Buttons.css';

const Signup = () => {
  const { signUp, checkEmailExists, checkPhoneExists } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    company_name: '',
    first_name: '',
    last_name: '',
    country: '',
    state: '',
    business_type: '',
    business_type_other: '',
    interested_products: [],
    monthly_import_volume: '',
    additional_info: ''
  });

  const businessTypes = [
    'Importer',
    'Wholesaler',
    'Retailer',
    'Distributor',
    'Restaurant Food Service',
    'Other'
  ];

  const productOptions = [
    { id: 'pomegranate', label: '🍅 Premium Pomegranate' },
    { id: 'cardamom', label: '🧆 Green Cardamom' },
    { id: 'onions', label: '🧅 Fresh Onions' },
    { id: 'chilly', label: '🌶️ Red & Green Chilly' },
    { id: 'grapes', label: '🍇 Fresh Grapes' },
    { id: 'apples', label: '🍎 Kashmiri Apples' },
    { id: 'toys', label: '🏎️ Electric Toys' },
    { id: 'other', label: '🚛 Mixed/Other' }
  ];

  const importVolumes = [
    '1-5 ton',
    '5-20 ton',
    '20-50 ton',
    '50+ ton'
  ];

  const countries = [
    'United Arab Emirates', 'Saudi Arabia', 'Qatar', 'Oman', 'Kuwait', 'Bahrain',
    'India', 'Pakistan', 'Bangladesh', 'Sri Lanka',
    'United States', 'United Kingdom', 'Canada', 'Australia'
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      const updatedProducts = checked
        ? [...formData.interested_products, name]
        : formData.interested_products.filter(product => product !== name);
      
      setFormData({
        ...formData,
        interested_products: updatedProducts
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const validateStep1 = async () => {
    if (!formData.email && !formData.phone) {
      setError('Please provide either email or phone number');
      return false;
    }
    
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    
    if (formData.phone && formData.phone.length < 10) {
      setError('Please enter a valid phone number');
      return false;
    }
    
    if (!formData.password) {
      setError('Password is required');
      return false;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    setError('');
    return true;
  };

  const validateStep2 = () => {
    if (!formData.company_name || !formData.first_name || !formData.last_name) {
      setError('Company name and personal names are required');
      return false;
    }
    
    if (!formData.country) {
      setError('Please select your country');
      return false;
    }
    
    setError('');
    return true;
  };

  const validateStep3 = () => {
    if (!formData.business_type) {
      setError('Please select your business type');
      return false;
    }
    
    if (formData.business_type === 'Other' && !formData.business_type_other) {
      setError('Please specify your business type');
      return false;
    }
    
    if (formData.interested_products.length === 0) {
      setError('Please select at least one product of interest');
      return false;
    }
    
    if (!formData.monthly_import_volume) {
      setError('Please select your monthly import volume');
      return false;
    }
    
    setError('');
    return true;
  };

  const handleNextStep = async () => {
    if (step === 1) {
      if (!(await validateStep1())) return;
      
      // Check if email or phone already exists
      if (formData.email) {
        const emailExists = await checkEmailExists(formData.email);
        if (emailExists) {
          setError('Email already registered');
          return;
        }
      }
      
      if (formData.phone) {
        const phoneExists = await checkPhoneExists(formData.phone);
        if (phoneExists) {
          setError('Phone number already registered');
          return;
        }
      }
    }
    
    if (step === 2 && !validateStep2()) return;
    setStep(step + 1);
  };

  const handlePrevStep = () => {
    setStep(step - 1);
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validateStep3()) return;

  setLoading(true);
  setError('');

  try {
    const result = await signUp(formData);

    if (!result || !result.user) {
      setError('Signup failed. Please try again.');
      return;
    }

    alert('Account created successfully! Please check your email for verification.');
    navigate('/login');
  } catch (error) {
    console.error('Error signing up:', error);

    // Handle known Supabase error codes and messages
    if (error.message?.includes('duplicate key') || error.code === '23505') {
      setError('This account already exists. Please try logging in instead.');
    } else if (error.message?.includes('already registered')) {
      setError(error.message);
    } else if (error.message?.includes('recursion') || error.message?.includes('infinite')) {
      setError('System error. Please try again in a moment.');
    } else if (error.status === 400 && error.message?.includes('Invalid login credentials')) {
      setError('Invalid credentials. Please check your email and password.');
    } else {
      setError('An error occurred during signup. Please try again.');
    }
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Create Your Account</h2>
        <p className="auth-subtitle">Join Saffron Emporial as a client</p>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <div className="form-step">
              <h3>Contact Information</h3>
              
              <div className="form-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div className="form-group">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+971 50 123 4567"
                  required
                />
              </div>

              <div className="form-group">
                <label>Password *</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Create a password"
                  required
                />
              </div>

              <div className="form-group">
                <label>Confirm Password *</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm your password"
                  required
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="form-step">
              <h3>Company Information</h3>
              
              <div className="form-group">
                <label>Company Name *</label>
                <input
                  type="text"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>First Name *</label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Last Name *</label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Country *</label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Country</option>
                    {countries.map(country => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>State/Region</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="form-step">
              <h3>Business Details</h3>
              
              <div className="form-group">
                <label>Business Type *</label>
                <select
                  name="business_type"
                  value={formData.business_type}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Business Type</option>
                  {businessTypes.map(type => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {formData.business_type === 'Other' && (
                <div className="form-group">
                  <label>Specify Business Type *</label>
                  <input
                    type="text"
                    name="business_type_other"
                    value={formData.business_type_other}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              )}

              <div className="form-group">
                <label>Interested Products *</label>
                 <span className="checkbox-instruction" style={{ fontSize: '14px' }}>Select interested products: </span>
                <div className="checkbox-group">
                  {productOptions.map(product => (
                    <label key={product.id} className="checkbox-label">
                      <input
                        type="checkbox"
                        name={product.id}
                        checked={formData.interested_products.includes(product.id)}
                        onChange={handleInputChange}
                      />
                      {product.label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Monthly Import Volume (approx.) *</label>
                <select
                  name="monthly_import_volume"
                  value={formData.monthly_import_volume}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Volume</option>
                  {importVolumes.map(volume => (
                    <option key={volume} value={volume}>
                      {volume}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Additional Information</label>
                <textarea
                  name="additional_info"
                  value={formData.additional_info}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Tell us about your import requirements, target market, etc."
                />
              </div>
            </div>
          )}

          <div className="form-navigation">
            {step > 1 && (
              <button
                type="button"
                onClick={handlePrevStep}
                className="btn btn-secondary"
              >
                Previous
              </button>
            )}
            
            {step < 3 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="btn btn-primary"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            )}
          </div>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
