// components/LandingPage/sections/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const footerSections = [
    {
      title: 'Trust Engine',
      links: ['Live Farm Technology', 'Blockchain Ledger', 'AI Monitoring', 'Real-time Transparency']
    },
    {
      title: 'Business Intelligence',
      links: ['Market Analytics', 'Supply Chain Optimization', 'Customer Insights', 'Partnership Ecosystem']
    },
    {
      title: 'Resources',
      links: ['Documentation', 'API Access', 'Market Reports', 'Research Papers']
    }
  ];

  return (
    <footer className="footer bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center mb-4">
              <div className="footer-logo w-10 h-10 bg-gradient-to-br from-saffron to-gold rounded-lg flex items-center justify-center mr-3 pulse-glow">
                <span className="text-white font-bold">SE</span>
              </div>
              <div className="text-2xl font-bold gradient-text">Saffron Emporial</div>
            </div>
            <p className="text-gray-400 mb-4">The Golden Standard of Natural Goodness</p>
            <p className="text-gray-400">Revolutionizing trust through transparency in agricultural supply chains.</p>
            
            {/* Social Links */}
            <div className="flex space-x-4 mt-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">LinkedIn</span>
                💼
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">Twitter</span>
                🐦
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">YouTube</span>
                📹
              </a>
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section, index) => (
            <div key={index}>
              <h4 className="font-bold mb-4 text-white">{section.title}</h4>
              <ul className="space-y-2 text-gray-400">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <button className="hover:text-saffron transition-colors text-left">
                      {link}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter Signup */}
        <div className="border-t border-gray-800 pt-8 mb-8">
          <div className="max-w-md mx-auto text-center">
            <h4 className="text-lg font-semibold mb-2">Stay Updated with the Trust Revolution</h4>
            <p className="text-gray-400 mb-4">Get the latest insights on agricultural technology and market trends</p>
            <div className="flex">
              <input 
                type="email" 
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-l-lg border border-gray-700 focus:outline-none focus:border-saffron"
              />
              <button className="bg-gradient-to-r from-saffron to-gold text-white px-6 py-2 rounded-r-lg font-semibold hover:from-gold hover:to-saffron transition-all">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-400 mb-4 md:mb-0">
            <p>&copy; 2024 Saffron Emporial Trust Engine. All rights reserved.</p>
          </div>
          <div className="flex space-x-6 text-gray-400">
            <a href="#" className="hover:text-saffron transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-saffron transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-saffron transition-colors">Cookie Policy</a>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-gray-400">
          <div className="flex items-center">
            <span className="text-green-400 mr-2">🔒</span>
            Blockchain Verified
          </div>
          <div className="flex items-center">
            <span className="text-blue-400 mr-2">🏅</span>
            ISO 27001 Certified
          </div>
          <div className="flex items-center">
            <span className="text-green-400 mr-2">🌿</span>
            Organic Certified
          </div>
          <div className="flex items-center">
            <span className="text-yellow-400 mr-2">⭐</span>
            Trusted by 47+ Global Partners
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;