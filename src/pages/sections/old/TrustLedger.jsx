// components/LandingPage/sections/TrustLedger.jsx
import React, { useState, useEffect } from 'react';
import './TrustLedger.css';

const TrustLedger = ({ farmMetrics = {}, handleDemoAction = () => {} }) => {
  // Default comprehensive farm metrics
  const defaultFarmMetrics = {
    waterSaved: "4.2M",
    carbonOffset: "1,850",
    familiesImpacted: "2,340",
    treesPlanted: "45,600",
    educationSupport: "125",
    healthcareAccess: "8,750",
    renewableEnergy: "85",
    wasteRecycled: "320"
  };

  const [metrics, setMetrics] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setMetrics(Object.keys(farmMetrics).length > 0 ? farmMetrics : defaultFarmMetrics);
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [farmMetrics]);

  // Blockchain-style payment transactions
  const payments = [
    {
      id: 1,
      farmer: 'Rajesh Patil',
      product: '1,200 kg Bhagwa Pomegranates',
      amount: '₹84,000 ($1,008)',
      time: '2 hours ago',
      hash: '0x7f9a2b8c1d3e5f7a9b2d4f6a8c0e2g4i6k8m0',
      status: 'verified',
      block: '#124,567'
    },
    {
      id: 2,
      farmer: 'Sunita Sharma',
      product: '800 kg Premium Cardamom',
      amount: '₹96,000 ($1,152)',
      time: '5 hours ago',
      hash: '0x3c8d1e5f7a9b2d4f6a8c0e2g4i6k8m0o2q4s6',
      status: 'verified',
      block: '#124,566'
    },
    {
      id: 3,
      farmer: 'Vikram Singh',
      product: '2,500 sqm Granite Slabs',
      amount: '₹1,25,000 ($1,500)',
      time: '8 hours ago',
      hash: '0x5a7c9e1f3b5d7f9a1c3e5g7i9k1m3o5q7s9u1',
      status: 'verified',
      block: '#124,565'
    },
    {
      id: 4,
      farmer: 'Priya Reddy',
      product: '15,000 kg Fresh Onions',
      amount: '₹67,500 ($810)',
      time: '12 hours ago',
      hash: '0x8b2d4f6a8c0e2g4i6k8m0o2q4s6u8w0y2a4c6',
      status: 'verified',
      block: '#124,564'
    }
  ];

  if (isLoading) {
    return (
      <section id="trust-ledger" className="trust-ledger py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500 mx-auto"></div>
            <p className="mt-4 text-xl text-gray-600">Loading Blockchain Ledger...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="trust-ledger" className="trust-ledger py-20 bg-gradient-to-br from-gray-50 via-white to-blue-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-blue-500 rounded-full filter blur-3xl"></div>
        <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-purple-500 rounded-full filter blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center mb-4">
            <div className="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
            <span className="text-green-600 font-semibold text-sm uppercase tracking-wider">BLOCKCHAIN VERIFIED</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
            🔗 Social Impact Transparency Ledger
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Every transaction, every impact, every farmer payment - immutably recorded on blockchain for complete transparency
          </p>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {/* Farmer Payment Transparency Ledger */}
          <div 
            className="payment-ledger bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-8 shadow-2xl border border-green-200 cursor-pointer hover:scale-105 transition-all duration-300 group"
            onClick={() => handleDemoAction('view_ledger', 'Farmer Payments')}
          >
            <div className="flex items-center mb-8">
              <div className="icon-container w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mr-6 shadow-lg shadow-green-500/30">
                <span className="text-white text-3xl">💰</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Farmer Payment Ledger</h3>
                <p className="text-gray-600">Blockchain-verified real-time payments</p>
              </div>
            </div>
            
            <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
              {payments.map(payment => (
                <div key={payment.id} className="blockchain-block p-4 rounded-xl bg-white border border-green-200 hover:border-green-400 transition-colors duration-300 group-hover:shadow-lg">
                  <div className="flex justify-between items-start mb-3">
                    <div className="text-sm font-semibold text-green-700 bg-green-100 px-2 py-1 rounded">Payment #{payment.id}</div>
                    <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{payment.time}</div>
                  </div>
                  <div className="text-sm text-gray-700 mb-2">
                    <span className="font-semibold">Farmer:</span> {payment.farmer}
                  </div>
                  <div className="text-sm text-gray-700 mb-2">
                    <span className="font-semibold">Product:</span> {payment.product}
                  </div>
                  <div className="text-lg font-bold text-green-600 mb-3">{payment.amount}</div>
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>Block: {payment.block}</span>
                    <span className="text-green-500 font-semibold">✓ Verified</span>
                  </div>
                  <div className="text-xs text-gray-400 mt-2 font-mono truncate">
                    Hash: {payment.hash}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 p-4 bg-white rounded-xl border border-green-200 shadow-lg">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">₹2,47,83,000</div>
                <div className="text-sm text-gray-600 mt-1">Total paid to farmers this year</div>
                <div className="text-xs text-green-500 mt-2">Blockchain Verified & Immutable</div>
              </div>
            </div>
          </div>
          
          {/* Environmental Sustainability Impact */}
          <div 
            className="sustainability bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl p-8 shadow-2xl border border-blue-200 cursor-pointer hover:scale-105 transition-all duration-300 group"
            onClick={() => handleDemoAction('view_ledger', 'Sustainability')}
          >
            <div className="flex items-center mb-8">
              <div className="icon-container w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center mr-6 shadow-lg shadow-blue-500/30">
                <span className="text-white text-3xl">🌍</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Environmental Impact</h3>
                <p className="text-gray-600">Sustainable farming commitments</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="metric-item bg-white p-5 rounded-xl border border-blue-200 hover:border-blue-400 transition-colors duration-300">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-blue-700">Water Conservation</span>
                  <span className="text-2xl">💧</span>
                </div>
                <div className="text-3xl font-bold text-blue-600">{metrics.waterSaved} Liters</div>
                <div className="text-xs text-gray-600 mt-1">Saved through smart irrigation</div>
                <div className="w-full bg-blue-200 rounded-full h-2 mt-3">
                  <div className="bg-blue-600 h-2 rounded-full" style={{width: '78%'}}></div>
                </div>
              </div>
              
              <div className="metric-item bg-white p-5 rounded-xl border border-green-200 hover:border-green-400 transition-colors duration-300">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-green-700">Carbon Offset</span>
                  <span className="text-2xl">🌱</span>
                </div>
                <div className="text-3xl font-bold text-green-600">{metrics.carbonOffset} Tons</div>
                <div className="text-xs text-gray-600 mt-1">CO2 reduced this quarter</div>
                <div className="w-full bg-green-200 rounded-full h-2 mt-3">
                  <div className="bg-green-600 h-2 rounded-full" style={{width: '65%'}}></div>
                </div>
              </div>

              <div className="metric-item bg-white p-5 rounded-xl border border-purple-200 hover:border-purple-400 transition-colors duration-300">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-purple-700">Renewable Energy</span>
                  <span className="text-2xl">☀️</span>
                </div>
                <div className="text-3xl font-bold text-purple-600">{metrics.renewableEnergy}%</div>
                <div className="text-xs text-gray-600 mt-1">Farm operations powered by solar</div>
                <div className="w-full bg-purple-200 rounded-full h-2 mt-3">
                  <div className="bg-purple-600 h-2 rounded-full" style={{width: `${metrics.renewableEnergy}%`}}></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Community & Social Impact */}
          <div 
            className="community bg-gradient-to-br from-orange-50 to-red-50 rounded-3xl p-8 shadow-2xl border border-orange-200 cursor-pointer hover:scale-105 transition-all duration-300 group"
            onClick={() => handleDemoAction('view_ledger', 'Community Impact')}
          >
            <div className="flex items-center mb-8">
              <div className="icon-container w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mr-6 shadow-lg shadow-orange-500/30">
                <span className="text-white text-3xl">👥</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Community Impact</h3>
                <p className="text-gray-600">Social responsibility initiatives</p>
              </div>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="blockchain-block p-4 rounded-xl bg-white border border-orange-200 hover:border-orange-400 transition-colors duration-300">
                <div className="text-sm font-semibold text-orange-700 mb-2 flex items-center">
                  <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                  Education Initiative
                </div>
                <div className="text-sm text-gray-700 mb-2">Scholarship fund for farmers' children</div>
                <div className="text-lg font-bold text-orange-600">₹2,50,000 donated</div>
                <div className="text-xs text-gray-500 mt-1">Beneficiaries: 25 students</div>
              </div>
              
              <div className="blockchain-block p-4 rounded-xl bg-white border border-red-200 hover:border-red-400 transition-colors duration-300">
                <div className="text-sm font-semibold text-red-700 mb-2 flex items-center">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                  Healthcare Support
                </div>
                <div className="text-sm text-gray-700 mb-2">Mobile health clinic for rural areas</div>
                <div className="text-lg font-bold text-red-600">₹1,80,000 funded</div>
                <div className="text-xs text-gray-500 mt-1">Families served: 340</div>
              </div>

              <div className="blockchain-block p-4 rounded-xl bg-white border border-yellow-200 hover:border-yellow-400 transition-colors duration-300">
                <div className="text-sm font-semibold text-yellow-700 mb-2 flex items-center">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                  Women Empowerment
                </div>
                <div className="text-sm text-gray-700 mb-2">Skill development programs</div>
                <div className="text-lg font-bold text-yellow-600">85 women trained</div>
                <div className="text-xs text-gray-500 mt-1">Employment generated: 45</div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-white rounded-xl border border-orange-200 shadow-lg">
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">{metrics.familiesImpacted}</div>
                <div className="text-sm text-gray-600 mt-1">Families directly impacted</div>
                <div className="text-xs text-orange-500 mt-2">Across 12 villages in India</div>
              </div>
            </div>
          </div>
        </div>

        {/* Blockchain Verification Section */}
        <div className="bg-white rounded-3xl p-8 shadow-2xl border border-purple-200 mb-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center justify-center">
            <span className="text-3xl mr-3">⛓️</span>
            Blockchain Verification System
          </h3>
          <div className="grid md:grid-cols-4 gap-6 text-center">
            <div className="verification-item p-4">
              <div className="text-3xl mb-2">🔒</div>
              <div className="font-semibold text-purple-700">Immutable Records</div>
              <div className="text-sm text-gray-600 mt-1">Cannot be altered</div>
            </div>
            <div className="verification-item p-4">
              <div className="text-3xl mb-2">🌐</div>
              <div className="font-semibold text-purple-700">Public Ledger</div>
              <div className="text-sm text-gray-600 mt-1">Transparent to all</div>
            </div>
            <div className="verification-item p-4">
              <div className="text-3xl mb-2">⚡</div>
              <div className="font-semibold text-purple-700">Instant Verification</div>
              <div className="text-sm text-gray-600 mt-1">Real-time updates</div>
            </div>
            <div className="verification-item p-4">
              <div className="text-3xl mb-2">📊</div>
              <div className="font-semibold text-purple-700">Smart Contracts</div>
              <div className="text-sm text-gray-600 mt-1">Automated execution</div>
            </div>
          </div>
        </div>
        
        {/* Call to Action */}
        <div className="text-center bg-white rounded-3xl p-8 shadow-2xl border border-green-200">
          <p className="text-gray-600 text-lg mb-6">
            🔐 Full platform access includes complete blockchain transparency, real-time impact tracking, and verified social responsibility reporting
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => handleDemoAction('view_ledger', 'Full Blockchain Ledger')}
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all transform hover:scale-105 shadow-lg shadow-green-500/30 flex items-center justify-center space-x-2"
            >
              <span>🔗</span>
              <span>View Complete Blockchain Ledger</span>
            </button>
            <button 
              onClick={() => handleDemoAction('view_ledger', 'Impact Reports')}
              className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-700 transition-all transform hover:scale-105 shadow-lg shadow-purple-500/30 flex items-center justify-center space-x-2"
            >
              <span>📋</span>
              <span>Generate Impact Reports</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustLedger;