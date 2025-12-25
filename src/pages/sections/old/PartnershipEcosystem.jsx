// components/LandingPage/sections/PartnershipEcosystem.jsx
import React from 'react';
import './PartnershipEcosystem.css';

const PartnershipEcosystem = ({ handleDemoAction }) => {
  return (
    <section id="partnership-ecosystem" className="partnership-ecosystem py-16 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-4">🤝 Partnership Ecosystem</h2>
          <p className="text-xl text-gray-600">Collaborative innovation platform for agricultural excellence</p>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* API Integration Hub */}
          <div className="api-hub bg-white rounded-3xl p-8 shadow-2xl border border-emerald-200">
            <div className="text-center mb-6">
              <div className="api-icon w-20 h-20 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full mx-auto mb-4 flex items-center justify-center api-pulse">
                <span className="text-white text-3xl">🔌</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">API Integration Hub</h3>
              <p className="text-gray-600">Seamless B2B partner connectivity</p>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="api-endpoint bg-gradient-to-r from-emerald-50 to-teal-50 p-4 rounded-lg border border-emerald-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-emerald-700 font-semibold text-sm">Real-time Inventory API</span>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">ACTIVE</span>
                </div>
                <div className="font-mono text-xs text-gray-600 mb-2">GET /api/v2/inventory/live</div>
                <div className="text-emerald-600 text-xs">
                  <div>• Live stock levels across all products</div>
                  <div>• Quality grades and certifications</div>
                  <div>• Estimated harvest dates</div>
                </div>
              </div>
              
              <div className="api-endpoint bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-blue-700 font-semibold text-sm">Order Management API</span>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">ACTIVE</span>
                </div>
                <div className="font-mono text-xs text-gray-600 mb-2">POST /api/v2/orders/create</div>
                <div className="text-blue-600 text-xs">
                  <div>• Automated order placement</div>
                  <div>• Real-time status tracking</div>
                  <div>• Delivery scheduling</div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-emerald-50 rounded-lg">
                <div className="text-2xl font-bold text-emerald-600">47</div>
                <div className="text-xs text-gray-600">Active Partners</div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">99.8%</div>
                <div className="text-xs text-gray-600">API Uptime</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">2.3M</div>
                <div className="text-xs text-gray-600">API Calls/Month</div>
              </div>
            </div>
          </div>
          
          {/* White-label Solutions */}
          <div className="white-label bg-white rounded-3xl p-8 shadow-2xl border border-teal-200">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-white text-3xl">🏷️</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">White-label Solutions</h3>
              <p className="text-gray-600">Complete agricultural tech platform</p>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="solution-card bg-gradient-to-r from-teal-50 to-cyan-50 p-4 rounded-lg border border-teal-200">
                <div className="flex items-center mb-2">
                  <span className="text-2xl mr-3">🌾</span>
                  <div>
                    <div className="text-teal-700 font-semibold text-sm">Farm Management System</div>
                    <div className="text-teal-600 text-xs">Complete IoT monitoring solution</div>
                  </div>
                </div>
              </div>
              
              <div className="solution-card bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center mb-2">
                  <span className="text-2xl mr-3">🔗</span>
                  <div>
                    <div className="text-blue-700 font-semibold text-sm">Blockchain Traceability</div>
                    <div className="text-blue-600 text-xs">End-to-end transparency platform</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-gray-700 font-semibold text-sm mb-2">Success Story</div>
              <div className="text-gray-600 text-xs">
                "AgriTech Solutions implemented our white-label platform across 200+ farms in Karnataka, 
                resulting in 34% yield improvement and 100% traceability compliance."
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-center">
          <p className="text-gray-600 mb-6">
            Join 47+ global partners in revolutionizing agricultural technology
          </p>
          <div className="space-x-4">
            <button 
              onClick={() => handleDemoAction('contact_sales', 'Partnership')}
              className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 text-white px-8 py-4 rounded-lg font-semibold hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-700 transition-all transform hover:scale-105"
            >
              🤝 Request Partnership Info
            </button>
            <button 
              onClick={() => handleDemoAction('enroll_course', 'API Documentation')}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105"
            >
              📚 View API Documentation
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PartnershipEcosystem;