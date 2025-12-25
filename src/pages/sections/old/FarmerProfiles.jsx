// components/LandingPage/sections/FarmerProfiles.jsx
import React from 'react';
import './FarmerProfiles.css';

const FarmerProfiles = ({ handleDemoAction }) => {
  const farmers = [
    {
      id: 1,
      name: 'Rajesh Patil',
      role: 'Lead Pomegranate Specialist',
      location: 'Maharashtra, India',
      experience: '25 years',
      harvest: '2,340 kg',
      avatar: '👨‍🌾',
      specialties: ['Bhagwa variety', 'Drip irrigation', 'Quality consistency'],
      story: "I have been growing pomegranates for 25 years, and working with Saffron Emporial has transformed my farming. The technology and fair prices have given my family financial stability."
    },
    {
      id: 2,
      name: 'Sunita Sharma',
      role: 'Almond & Dry Fruit Expert', 
      location: 'Karnataka, India',
      experience: '18 years',
      harvest: '1,890 kg',
      avatar: '👩‍🌾',
      specialties: ['Women farmer leadership', 'Sustainable practices', 'Community training'],
      story: "As a woman farmer, I faced many challenges. Saffron Emporial not only gave me fair prices but also helped me become a leader in my community."
    },
    {
      id: 3,
      name: 'Mohammed Ali',
      role: 'Spice & Cardamom Master',
      location: 'Kerala, India',
      experience: '30 years',
      harvest: '680 kg',
      avatar: '👨‍🌾',
      specialties: ['Traditional methods', 'Quality grading', 'Export standards'],
      story: "My grandfather taught me cardamom farming, but Saffron Emporial taught me cardamom excellence. Their quality standards pushed me to perfect my craft."
    }
  ];

  const stats = [
    { number: '127', label: 'Partner Farmers', sublabel: 'Across 3 states' },
    { number: '₹2.47Cr', label: 'Paid This Year', sublabel: 'Direct payments' },
    { number: '485', label: 'Families Impacted', sublabel: 'Including dependents' },
    { number: '89%', label: 'Organic Certified', sublabel: 'Sustainable farming' }
  ];

  return (
    <section id="farmers" className="farmer-profiles py-16 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold gradient-text mb-4">👨‍🌾 Know Your Farmer</h2>
          <p className="text-xl text-gray-600">Meet the passionate farmers behind your premium produce</p>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {farmers.map(farmer => (
            <div 
              key={farmer.id}
              className="farmer-card bg-white rounded-3xl p-8 shadow-2xl border border-green-200 hover:scale-105 transition-transform cursor-pointer"
              onClick={() => handleDemoAction('view_ledger', `${farmer.name}'s Profile`)}
            >
              <div className="text-center mb-6">
                <div className="farmer-avatar w-32 h-32 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-6xl">
                  {farmer.avatar}
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{farmer.name}</h3>
                <p className="text-green-600 font-semibold">{farmer.role}</p>
                <p className="text-gray-600">{farmer.location}</p>
              </div>
              
              <div className="space-y-4 mb-6">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-700 mb-2">Farm Details</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>• {farmer.experience} of farming experience</div>
                    <div>• Specializes in {farmer.specialties[0]}</div>
                    <div>• {farmer.specialties.slice(1).join(', ')}</div>
                  </div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-700 mb-2">This Season</h4>
                  <div className="text-sm text-gray-600">
                    <div>• Harvest: {farmer.harvest}</div>
                    <div>• Quality: A+ Grade Certified</div>
                    <div>• Sustainable farming practices</div>
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-gray-600">This Season's Harvest</span>
                  <span className="text-lg font-bold text-green-600">{farmer.harvest}</span>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDemoAction('view_ledger', `${farmer.name}'s Story`);
                  }}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-700 transition-all"
                >
                  🎥 Watch {farmer.name.split(' ')[0]}'s Story
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {/* Farmer Impact Statistics */}
        <div className="bg-white rounded-3xl p-8 shadow-2xl">
          <h3 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-8">Our Farmer Partnership Impact</h3>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="text-center p-4">
                <div className="text-3xl md:text-4xl font-bold text-green-600 mb-2">{stat.number}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
                <div className="text-sm text-gray-500">{stat.sublabel}</div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-4">
              🤝 Building sustainable livelihoods through fair trade and technology adoption
            </p>
            <button 
              onClick={() => handleDemoAction('view_ledger', 'Farmer Impact Report')}
              className="bg-gradient-to-r from-green-500 to-teal-600 text-white px-8 py-4 rounded-lg font-semibold hover:from-green-600 hover:to-teal-700 transition-all transform hover:scale-105"
            >
              📊 View Complete Impact Report
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FarmerProfiles;