// components/LandingPage/sections/Contact.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Contact.css';

const Contact = ({ handleDemoAction }) => {
  const [contactForm, setContactForm] = useState({
    companyName: '',
    contactPerson: '',
    email: '',
    interest: '',
    message: ''
  });

  const contactMethods = [
    {
      icon: '📧',
      title: 'Email',
      details: 'trust@saffronEmporial.com',
      description: 'General inquiries'
    },
    {
      icon: '📱',
      title: 'WhatsApp Business',
      details: '+91-9372383903',
      description: 'Quick responses'
    },
    {
      icon: '🏢',
      title: 'Trust Engine HQ',
      details: 'Mumbai, Maharashtra, India',
      description: 'Visit our office'
    },
    {
      icon: '🎓',
      title: 'Academy Enrollment',
      details: 'academy@saffronEmporial.com',
      description: 'Education programs'
    }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    handleDemoAction('contact_sales', 'Contact Form');
    setContactForm({
      companyName: '',
      contactPerson: '',
      email: '',
      interest: '',
      message: ''
    });
  };

  const handleChange = (field, value) => {
    setContactForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <section id="contact" className="contact trust-gradient text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Join the Trust Revolution</h2>
          <p className="text-xl">Experience radical transparency and natural excellence</p>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-12">
          <div>
            <h3 className="text-2xl font-bold mb-6">Contact Our Trust Engine Team</h3>
            <div className="space-y-6">
              {contactMethods.map((method, index) => (
                <div key={index} className="contact-method flex items-center">
                  <div className="contact-icon w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center text-white text-xl mr-4">
                    {method.icon}
                  </div>
                  <div>
                    <div className="font-semibold">{method.title}</div>
                    <div className="opacity-90">{method.details}</div>
                    <div className="text-sm opacity-70">{method.description}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Trust Indicators */}
            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="bg-white bg-opacity-10 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold">47+</div>
                <div className="text-sm">Global Partners</div>
              </div>
              <div className="bg-white bg-opacity-10 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold">99.8%</div>
                <div className="text-sm">Client Satisfaction</div>
              </div>
              <div className="bg-white bg-opacity-10 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold">24/7</div>
                <div className="text-sm">Support</div>
              </div>
              <div className="bg-white bg-opacity-10 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold">100%</div>
                <div className="text-sm">Transparency</div>
              </div>
            </div>
          </div>
          
          <div className="contact-form-container bg-white bg-opacity-10 rounded-2xl p-8 backdrop-blur-sm">
            <h3 className="text-2xl font-bold mb-6">Start Your Trust Journey</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Company Name</label>
                <input 
                  type="text" 
                  required 
                  value={contactForm.companyName}
                  onChange={(e) => handleChange('companyName', e.target.value)}
                  className="contact-input"
                  placeholder="Your company name"
                />
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Contact Person</label>
                  <input 
                    type="text" 
                    required 
                    value={contactForm.contactPerson}
                    onChange={(e) => handleChange('contactPerson', e.target.value)}
                    className="contact-input"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input 
                    type="email" 
                    required 
                    value={contactForm.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="contact-input"
                    placeholder="your@email.com"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Interest Area</label>
                <select 
                  value={contactForm.interest}
                  onChange={(e) => handleChange('interest', e.target.value)}
                  className="contact-input"
                >
                  <option value="">Select Your Interest</option>
                  <option value="live-farm">Live Farm Technology</option>
                  <option value="business-intelligence">Business Intelligence Platform</option>
                  <option value="partnership-ecosystem">Partnership Ecosystem</option>
                  <option value="trust-ledger">Trust Ledger Access</option>
                  <option value="academy">Saffron Academy Enrollment</option>
                  <option value="partnership">B2B Partnership</option>
                  <option value="innovation">Product Innovation</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Message</label>
                <textarea 
                  rows="4" 
                  value={contactForm.message}
                  onChange={(e) => handleChange('message', e.target.value)}
                  className="contact-input" 
                  placeholder="Tell us about your vision for transparency and natural excellence..."
                ></textarea>
              </div>
              
              <button type="submit" className="contact-submit-btn w-full">
                Join the Trust Revolution
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm opacity-80">
                Already have an account?{' '}
                <Link to="/login" className="text-white font-semibold hover:underline">
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <div className="bg-white bg-opacity-10 rounded-2xl p-8 backdrop-blur-sm max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">Ready to Transform Your Business?</h3>
            <p className="text-xl mb-6 opacity-90">
              Join 47+ global partners who trust Saffron Emporial for radical transparency and premium natural produce.
            </p>
            <div className="space-x-4">
              <Link 
                to="/signup"
                className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 inline-block"
              >
                🚀 Get Started Today
              </Link>
              <button 
                onClick={() => handleDemoAction('contact_sales', 'Schedule Demo')}
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-all transform hover:scale-105"
              >
                📅 Schedule a Demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;