// components/LandingPage/sections/SaffronStandard.jsx
import React from 'react';
import './SaffronStandard.css';

const SaffronStandard = ({ handleDemoAction }) => {
  const commitments = [
    {
      icon: '🌱',
      title: 'Sustainable Agriculture',
      description: 'We commit to regenerative farming practices that improve soil health, conserve water, and protect biodiversity for future generations.'
    },
    {
      icon: '🤝',
      title: 'Fair Labor Practices', 
      description: 'Every farmer and worker in our supply chain receives fair compensation, safe working conditions, and opportunities for growth and education.'
    },
    {
      icon: '🔍',
      title: 'Radical Transparency',
      description: 'Complete visibility into our supply chain, from seed to shelf, with real-time data and blockchain verification of every claim we make.'
    },
    {
      icon: '⭐',
      title: 'Quality Excellence',
      description: 'Uncompromising quality standards backed by scientific testing, international certifications, and continuous improvement processes.'
    }
  ];

  const impactMetrics = [
    { label: 'Water Conservation', value: '2.34M Liters Saved', percentage: 78 },
    { label: 'Carbon Footprint Reduction', value: '45.7 Tons CO2', percentage: 65 },
    { label: 'Farmer Income Increase', value: '+34% Average', percentage: 85 },
    { label: 'Quality Consistency', value: '99.2% Grade A+', percentage: 99 }
  ];

  return (
    <section id="saffron-standard" className="saffron-standard py-16 bg-gradient-to-br from-gold via-saffron to-orange-400 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">🏆 The Saffron Standard Pledge</h2>
          <p className="text-xl md:text-2xl">Our living constitution of excellence and integrity</p>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-12">
          <div>
            <h3 className="text-2xl md:text-3xl font-bold mb-8">Our Core Commitments</h3>
            
            <div className="space-y-6">
              {commitments.map((commitment, index) => (
                <div 
                  key={index}
                  className="commitment-card bg-white bg-opacity-20 rounded-2xl p-6 backdrop-blur-sm cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => handleDemoAction('view_ledger', commitment.title)}
                >
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-white bg-opacity-30 rounded-lg flex items-center justify-center text-2xl mr-4">
                      {commitment.icon}
                    </div>
                    <h4 className="text-xl font-bold">{commitment.title}</h4>
                  </div>
                  <p className="text-white text-opacity-90">{commitment.description}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-2xl md:text-3xl font-bold mb-8">Our Measurable Impact</h3>
            
            <div 
              className="impact-dashboard bg-white bg-opacity-20 rounded-2xl p-8 backdrop-blur-sm cursor-pointer hover:scale-105 transition-transform"
              onClick={() => handleDemoAction('view_ledger', 'Impact Metrics')}
            >
              <div className="space-y-6">
                {impactMetrics.map((metric, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-lg">{metric.label}</span>
                      <span className="text-xl font-bold">{metric.value}</span>
                    </div>
                    <div className="w-full bg-white bg-opacity-30 rounded-full h-3">
                      <div 
                        className="bg-white h-3 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${metric.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-8 text-center">
              <button 
                onClick={() => handleDemoAction('enroll_course', 'Saffron Standard Document')}
                className="download-btn bg-white text-saffron px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
              >
                📄 Download Full Saffron Standard Document
              </button>
            </div>
          </div>
        </div>

        {/* Certification Badges */}
        <div className="mt-16 text-center">
          <h4 className="text-xl font-bold mb-6">Certifications & Recognitions</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="bg-white bg-opacity-20 p-4 rounded-lg backdrop-blur-sm">
              <div className="text-2xl mb-2">🌿</div>
              <div className="font-semibold">Organic Certified</div>
              <div className="text-sm opacity-80">USDA, EU Organic</div>
            </div>
            <div className="bg-white bg-opacity-20 p-4 rounded-lg backdrop-blur-sm">
              <div className="text-2xl mb-2">🔒</div>
              <div className="font-semibold">ISO 27001</div>
              <div className="text-sm opacity-80">Data Security</div>
            </div>
            <div className="bg-white bg-opacity-20 p-4 rounded-lg backdrop-blur-sm">
              <div className="text-2xl mb-2">🏅</div>
              <div className="font-semibold">HACCP</div>
              <div className="text-sm opacity-80">Food Safety</div>
            </div>
            <div className="bg-white bg-opacity-20 p-4 rounded-lg backdrop-blur-sm">
              <div className="text-2xl mb-2">🌍</div>
              <div className="font-semibold">Fair Trade</div>
              <div className="text-sm opacity-80">Ethical Sourcing</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SaffronStandard;