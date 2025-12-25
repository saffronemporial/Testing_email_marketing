// components/LandingPage/sections/Academy.jsx
import React, { useState } from 'react';
import './Academy.css';

const Academy = ({ handleDemoAction }) => {
  const [selectedVariety, setSelectedVariety] = useState(null);
  const [sensoryValues, setSensoryValues] = useState({
    sweetness: 16.2,
    acidity: 0.3,
    tannins: 2
  });

  const courses = [
    {
      id: 1,
      title: 'Pomegranate Quality Expert',
      description: 'Master the art of pomegranate grading and quality assessment',
      duration: '4 weeks',
      icon: '🏆',
      color: 'blue',
      features: ['Advanced grading techniques', 'Quality control protocols', 'International standards']
    },
    {
      id: 2,
      title: 'Import Logistics Specialist',
      description: 'Master efficient importing of perishable goods to UAE',
      duration: '3 weeks', 
      icon: '🚚',
      color: 'green',
      features: ['Cold chain management', 'Documentation & compliance', 'Cost optimization strategies']
    },
    {
      id: 3,
      title: 'Culinary Innovation Expert',
      description: 'Create innovative products using natural ingredients',
      duration: '6 weeks',
      icon: '👨‍🍳',
      color: 'purple',
      features: ['Flavor profile development', 'Product formulation', 'Market trend analysis']
    }
  ];

  const pomegranateVarieties = [
    {
      id: 'bhagwa',
      name: 'Bhagwa Pomegranate',
      description: 'Premium Sweet Variety',
      sweetness: 5,
      acidity: 2,
      size: 'Large',
      color: 'red',
      bestFor: ['Fresh consumption', 'Dessert garnishing', 'Premium juices']
    },
    {
      id: 'ganesh',
      name: 'Ganesh Pomegranate',
      description: 'Balanced Profile',
      sweetness: 4,
      acidity: 3, 
      size: 'Medium',
      color: 'purple',
      bestFor: ['Salad toppings', 'Smoothie blends', 'Sauce making']
    },
    {
      id: 'arakta',
      name: 'Arakta Pomegranate', 
      description: 'Tart & Tangy',
      sweetness: 3,
      acidity: 4,
      size: 'Medium',
      color: 'orange',
      bestFor: ['Marinades', 'Cocktail mixers', 'Savory sauces']
    },
    {
      id: 'ruby',
      name: 'Ruby Pomegranate',
      description: 'Intense Flavor',
      sweetness: 4,
      acidity: 5,
      size: 'Small',
      color: 'green', 
      bestFor: ['Concentrated extracts', 'Health supplements', 'Gourmet reductions']
    }
  ];

  const updateSensoryValue = (type, value) => {
    setSensoryValues(prev => ({
      ...prev,
      [type]: parseFloat(value)
    }));
  };

  const playTextureAnimation = () => {
    handleDemoAction('enroll_course', 'Sensory Lab Experience');
  };

  const getColorClasses = (color) => {
    const colors = {
      red: 'from-red-50 to-pink-50 border-red-200 text-red-700',
      purple: 'from-purple-50 to-blue-50 border-purple-200 text-purple-700',
      orange: 'from-orange-50 to-yellow-50 border-orange-200 text-orange-700',
      green: 'from-green-50 to-teal-50 border-green-200 text-green-700',
      blue: 'from-blue-50 to-cyan-50 border-blue-200 text-blue-700'
    };
    return colors[color] || colors.blue;
  };

  return (
    <section id="academy" className="academy py-16 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold gradient-text mb-4">🎓 Saffron Academy</h2>
          <p className="text-xl text-gray-600">Industry-leading education and thought leadership in natural produce</p>
        </div>
        
        {/* Micro-Credentials Section */}
        <div className="mb-16">
          <h3 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-8">Professional Micro-Credentials</h3>
          <div className="grid md:grid-cols-3 gap-8">
            {courses.map(course => (
              <div 
                key={course.id}
                className="course-card academy-card rounded-2xl p-8 cursor-pointer"
                onClick={() => handleDemoAction('enroll_course', course.title)}
              >
                <div className="text-center mb-6">
                  <div className={`course-icon w-16 h-16 bg-gradient-to-r from-${course.color}-500 to-${course.color === 'blue' ? 'purple' : course.color === 'green' ? 'blue' : 'pink'}-600 rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <span className="text-white text-2xl">{course.icon}</span>
                  </div>
                  <h4 className="text-xl font-bold text-gray-900">{course.title}</h4>
                  <p className="text-gray-600 mt-2">{course.description}</p>
                </div>
                
                <div className="space-y-3 mb-6">
                  {course.features.map((feature, index) => (
                    <div key={index} className="flex items-center text-sm">
                      <span className={`w-2 h-2 bg-${course.color}-500 rounded-full mr-3`}></span>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm text-gray-600">Duration: {course.duration}</span>
                    <span className="text-sm font-bold text-blue-600">Certificate Included</span>
                  </div>
                  <button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all">
                    Enroll Now - Free for Partners
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sensory Lab */}
        <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-red-50 rounded-3xl p-8 shadow-2xl border border-purple-200 mb-16">
          <div className="text-center mb-8">
            <h3 className="text-2xl md:text-3xl font-bold gradient-text mb-4">🧪 The Sensory Lab</h3>
            <p className="text-xl text-gray-600">Immersive multi-sensory exploration of our premium pomegranates</p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8 mb-8">
            {/* Flavor Profile */}
            <div className="bg-white rounded-2xl p-6 shadow-xl">
              <h4 className="text-xl font-bold text-purple-700 mb-4 flex items-center">
                <span className="text-2xl mr-3">👅</span>
                Flavor Profile
              </h4>
              
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-gray-700">Sweetness</span>
                    <span className="text-sm font-bold text-red-600">{sensoryValues.sweetness}° Brix</span>
                  </div>
                  <input 
                    type="range" 
                    min="10" 
                    max="20" 
                    value={sensoryValues.sweetness} 
                    step="0.1"
                    className="w-full h-2 bg-gradient-to-r from-yellow-200 to-red-500 rounded-lg appearance-none cursor-pointer"
                    onChange={(e) => updateSensoryValue('sweetness', e.target.value)}
                  />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-gray-700">Acidity</span>
                    <span className="text-sm font-bold text-green-600">{sensoryValues.acidity}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0.2" 
                    max="1.0" 
                    value={sensoryValues.acidity} 
                    step="0.1"
                    className="w-full h-2 bg-gradient-to-r from-green-200 to-lime-500 rounded-lg appearance-none cursor-pointer"
                    onChange={(e) => updateSensoryValue('acidity', e.target.value)}
                  />
                </div>
              </div>
            </div>
            
            {/* Texture Experience */}
            <div className="bg-white rounded-2xl p-6 shadow-xl">
              <h4 className="text-xl font-bold text-blue-700 mb-4 flex items-center">
                <span className="text-2xl mr-3">🤏</span>
                Texture Experience
              </h4>
              
              <div className="text-center mb-4">
                <div 
                  className="w-32 h-32 mx-auto mb-4 relative cursor-pointer"
                  onClick={playTextureAnimation}
                >
                  <div className="pomegranate-aril w-full h-full bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center text-white text-4xl shadow-lg hover:scale-110 transition-transform">
                    💎
                  </div>
                </div>
                <p className="text-sm text-gray-600">Click to experience the crunch!</p>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-gray-700">Crunch Factor</span>
                  <span className="text-sm font-bold text-blue-600">9.2/10</span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{width: '92%'}}></div>
                </div>
              </div>
            </div>
            
            {/* Variety Comparison */}
            <div className="bg-white rounded-2xl p-6 shadow-xl">
              <h4 className="text-xl font-bold text-green-700 mb-4 flex items-center">
                <span className="text-2xl mr-3">🍎</span>
                Variety Explorer
              </h4>
              
              <div className="space-y-4">
                {pomegranateVarieties.slice(0, 2).map(variety => (
                  <div 
                    key={variety.id}
                    className={`p-4 rounded-lg border cursor-pointer hover:scale-105 transition-transform ${getColorClasses(variety.color)}`}
                    onClick={() => setSelectedVariety(selectedVariety === variety.id ? null : variety.id)}
                  >
                    <div className="font-semibold">{variety.name}</div>
                    <div className="text-sm opacity-75">{variety.description}</div>
                    {selectedVariety === variety.id && (
                      <div className="mt-2 text-sm">
                        <div>Best for: {variety.bestFor[0]}</div>
                        <div>Sweetness: {'★'.repeat(variety.sweetness)}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              🔐 Login to access full sensory lab features and advanced variety comparisons
            </p>
            <button 
              onClick={() => handleDemoAction('enroll_course', 'Full Sensory Lab')}
              className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-8 py-4 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-700 transition-all"
            >
              🧪 Explore Full Sensory Lab
            </button>
          </div>
        </div>

        {/* Market Research */}
        <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-200">
          <div className="text-center mb-8">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">📚 Exclusive Market Intelligence</h3>
            <p className="text-xl text-gray-600">Access industry reports and research papers</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="research-card bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-200">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-white text-xl">📊</span>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-900">Middle East Dried Fruit Market 2024</h4>
                  <p className="text-gray-600">Comprehensive analysis of consumption trends</p>
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-sm">Market Size Growth</span>
                  <span className="font-bold text-green-600">+23.4%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Premium Segment</span>
                  <span className="font-bold text-blue-600">+31.2%</span>
                </div>
              </div>
              
              <button 
                onClick={() => handleDemoAction('enroll_course', 'Market Research Report')}
                className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-red-700 transition-all"
              >
                Download Report Preview
              </button>
            </div>
            
            <div className="research-card bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl p-6 border border-green-200">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-white text-xl">🔮</span>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-900">Pomegranate Innovation Forecast</h4>
                  <p className="text-gray-600">Future product opportunities and trends</p>
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-sm">Functional Foods</span>
                  <span className="font-bold text-green-600">+45%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Beverage Applications</span>
                  <span className="font-bold text-blue-600">+38%</span>
                </div>
              </div>
              
              <button 
                onClick={() => handleDemoAction('enroll_course', 'Innovation Forecast')}
                className="w-full bg-gradient-to-r from-green-500 to-teal-600 text-white py-3 rounded-lg font-semibold hover:from-green-600 hover:to-teal-700 transition-all"
              >
                Download Report Preview
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Academy;