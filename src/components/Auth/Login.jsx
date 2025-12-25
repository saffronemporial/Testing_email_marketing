// src/components/Auth/Login.jsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import './auth.css';

const Login = () => {
  const { 
    signInWithEmail, 
    signInWithOtp, 
    verifyOtp, 
    resetPassword 
  } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);
  const [loginMethod, setLoginMethod] = useState('email');
  const [otp, setOtp] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    password: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signInWithEmail(formData.email, formData.password);
      // Navigation will be handled by AuthContext
    } catch (error) {
      console.error('Error signing in:', error);
      
      // Check if user doesn't exist and suggest signup
      if (error.message.includes('Invalid login credentials')) {
        setError('Invalid email or password. Please try again or sign up for a new account.');
      } else {
        setError(error.message || 'An error occurred during login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signInWithOtp(formData.phone);
      setVerificationSent(true);
    } catch (error) {
      console.error('Error sending OTP:', error);
      
      // Check if user doesn't exist and redirect to signup
      if (error.message.includes('user not found')) {
        setError('Phone number not registered. Please sign up first.');
      } else {
        setError(error.message || 'Error sending verification code');
      }
    } finally {
      setLoading(false);
    }
  };

const handleVerifyOtp = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  try {
    await verifyOtp(formData.phone, otp); // if success, AuthContext's onAuthStateChange will handle redirect
  } catch (error) {
    console.error('Error verifying OTP:', error);
    // friendly user message
    if (error.message && error.message.toLowerCase().includes('not registered')) {
      setError('Your mobile number is not registered. Please sign up first.');
    } else {
      setError('Invalid verification code. Please try again.');
    }
  } finally {
    setLoading(false);
  }
};

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await resetPassword(forgotPasswordEmail);
      setForgotPasswordSuccess('Password reset instructions sent to your email');
      setShowForgotPassword(false);
    } catch (error) {
      console.error('Error resetting password:', error);
      setError(error.message || 'Error sending password reset instructions');
    } finally {
      setLoading(false);
    }
  };

  if (showForgotPassword) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h2>Reset Password</h2>
          <p className="auth-subtitle">Enter your email to receive reset instructions</p>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {forgotPasswordSuccess && (
            <div className="success-message">
              {forgotPasswordSuccess}
            </div>
          )}

          <form onSubmit={handleForgotPassword}>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                value={forgotPasswordEmail}
                onChange={(e) => setForgotPasswordEmail(e.target.value)}
                placeholder="your@email.com"
                required
              />
            </div>

            <div className="form-actions">
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? 'Sending...' : 'Send Reset Instructions'}
              </button>
              
              <button
                type="button"
                onClick={() => setShowForgotPassword(false)}
                className="btn btn-text"
              >
                Back to Login
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (verificationSent) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h2>Verify Your Phone</h2>
          <p className="auth-subtitle">We've sent a verification code to {formData.phone}</p>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <form onSubmit={handleVerifyOtp}>
            <div className="form-group">
              <label>Verification Code</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 6-digit code"
                required
                maxLength="6"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? 'Verifying...' : 'Verify & Sign In'}
            </button>
          </form>

          <button
            type="button"
            onClick={() => setVerificationSent(false)}
            className="btn btn-text"
            style={{ marginTop: '15px' }}
          >
            ← Back to login options
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Welcome Back</h2>
        <p className="auth-subtitle">Sign in to your Saffron Emporial account</p>

        {error && (
          <div className="error-message">
            {error}
            {error.includes('not registered') && (
              <div style={{ marginTop: '10px' }}>
                <Link to="/signup" className="auth-link">
                  Create a new account
                </Link>
              </div>
            )}
          </div>
        )}

        <div className="login-methods">
          <button
            className={`method-tab ${loginMethod === 'email' ? 'active' : ''}`}
            onClick={() => setLoginMethod('email')}
          >
            Email Login
          </button>
          <button
            className={`method-tab ${loginMethod === 'otp' ? 'active' : ''}`}
            onClick={() => setLoginMethod('otp')}
          >
            Phone OTP
          </button>
        </div>

        {loginMethod === 'email' ? (
          <form onSubmit={handleEmailLogin}>
            <div className="form-group">
              <label>Email Address</label>
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
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Your password"
                required
              />
            </div>

            <div className="form-actions">
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
              
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="btn btn-text"
              >
                Forgot Password?
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSendOtp}>
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+971 50 123 4567"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? 'Sending Code...' : 'Send Verification Code'}
            </button>
          </form>
        )}

        <p className="auth-footer">
          Don't have an account? <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
