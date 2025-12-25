// components/LandingPage/sections/LiveFarm.jsx
import React, { useState, useEffect } from 'react';
import './LiveFarm.css';

const LiveFarm = ({ liveMetrics = {}, handleDemoAction = () => {} }) => {
  // Default comprehensive farm metrics
  const defaultLiveMetrics = {
    soilMoisture: 78,
    phBalance: 6.8,
    cropMaturity: 82,
    temperature: 28,
    humidity: 65,
    nitrogen: 85,
    phosphorus: 72,
    potassium: 91,
    sunlight: 87,
    windSpeed: 12,
    rainfall: 45,
    cropHealth: 94
  };

  const [metrics, setMetrics] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setMetrics(Object.keys(liveMetrics).length > 0 ? liveMetrics : defaultLiveMetrics);
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [liveMetrics]);

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (isLoading) {
    return (
      <section id="live-farm" className="live-farm py-20 bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500 mx-auto"></div>
            <p className="mt-4 text-xl text-gray-600">Connecting to Farm Sensors...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="live-farm" className="live-farm py-20 bg-gradient-to-br from-green-50 via-emerald-50 to-cyan-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-blue-500 rounded-full filter blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center mb-4">
            <div className="w-4 h-4 bg-red-500 rounded-full mr-3 animate-ping"></div>
            <span className="text-red-600 font-semibold text-sm uppercase tracking-wider">LIVE FROM FARM</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
            🌱 AI-Powered Farm Intelligence
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Real-time IoT sensor monitoring, drone surveillance, and AI-powered crop analytics for precision agriculture
          </p>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {/* Live Camera Feed & Main Dashboard */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-2xl border border-green-200 hover:shadow-3xl transition-all duration-300">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8">
              <div>
                <h3 className="text-3xl font-bold text-gray-900 flex items-center mb-2">
                  <span className="text-4xl mr-4">📹</span>
                  Maharashtra Farm - Live Command Center
                </h3>
                <p className="text-gray-600">Solapur District | 500 Acres | Pomegranate Specialization</p>
              </div>
              <div className="flex items-center space-x-4 mt-4 lg:mt-0">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-semibold text-red-600">LIVE STREAMING</span>
                </div>
                <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {currentTime.toLocaleTimeString()}
                </div>
              </div>
            </div>
            
            {/* Enhanced Live Camera Feed Simulation */}
            <div 
              className="relative bg-gradient-to-br from-green-200 to-blue-200 rounded-2xl h-80 overflow-hidden live-camera-feed cursor-pointer group mb-8 border-2 border-green-300 shadow-inner"
              onClick={() => handleDemoAction('watch_farm', 'Live Camera Feed')}
            >
              {/* Sky Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-sky-300 to-blue-200 opacity-70"></div>
              
              {/* Farm Landscape */}
              <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-green-600 to-emerald-500"></div>
              
              {/* Pomegranate Trees */}
              <div className="absolute bottom-8 left-20">
                <div className="w-16 h-24 bg-green-700 rounded-t-full relative">
                  <div className="absolute -top-2 left-2 w-12 h-12 bg-red-500 rounded-full shadow-lg"></div>
                  <div className="absolute -top-4 right-4 w-10 h-10 bg-red-600 rounded-full shadow-lg"></div>
                </div>
              </div>
              
              <div className="absolute bottom-8 right-32">
                <div className="w-14 h-20 bg-green-800 rounded-t-full relative">
                  <div className="absolute -top-3 left-3 w-11 h-11 bg-red-500 rounded-full shadow-lg"></div>
                </div>
              </div>
              
              {/* Irrigation System */}
              <div className="absolute bottom-5 left-0 right-0">
                <div className="h-1 bg-blue-400 opacity-60 mx-8 rounded-full"></div>
                <div className="absolute top-0 left-1/4 w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
                <div className="absolute top-0 left-1/2 w-2 h-2 bg-blue-500 rounded-full animate-ping" style={{animationDelay: '0.5s'}}></div>
                <div className="absolute top-0 left-3/4 w-2 h-2 bg-blue-500 rounded-full animate-ping" style={{animationDelay: '1s'}}></div>
              </div>
              
              {/* AI Analysis Overlay */}
              <div className="absolute top-6 left-6 bg-black/80 backdrop-blur-sm text-white p-4 rounded-xl border border-green-400/30 transform group-hover:scale-105 transition-transform">
                <div className="text-xs font-bold mb-2 text-green-400">🤖 AI CROP ANALYSIS</div>
                <div className="text-xs space-y-1">
                  <div>🍎 Ripeness: 78%</div>
                  <div>⭐ Quality: A+ Grade</div>
                  <div>📅 Harvest Ready: 12 days</div>
                  <div>🌱 Health Score: 94/100</div>
                </div>
              </div>
              
              {/* Weather & Environmental Data */}
              <div className="absolute top-6 right-6 bg-blue-600/90 backdrop-blur-sm text-white p-4 rounded-xl border border-blue-400/30">
                <div className="text-xs font-bold mb-2">🌤️ LIVE WEATHER</div>
                <div className="text-xs space-y-1">
                  <div>🌡️ {metrics.temperature}°C</div>
                  <div>💧 {metrics.humidity}% Humidity</div>
                  <div>💨 {metrics.windSpeed} km/h Winds</div>
                  <div>☀️ {metrics.sunlight}% Sunlight</div>
                </div>
              </div>
              
              {/* Data Stream Animation */}
              <div className="absolute bottom-4 left-0 right-0">
                <div className="bg-green-500 h-1 data-stream opacity-60 rounded-full"></div>
              </div>
            </div>
            
            {/* Real-time Farm Metrics Dashboard */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="metric-card bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl text-center border border-blue-200 hover:scale-105 transition-transform duration-300">
                <div className="text-2xl mb-2">💧</div>
                <div className="text-sm font-semibold text-blue-700">Soil Moisture</div>
                <div className="text-xl font-bold text-blue-600">{metrics.soilMoisture}%</div>
                <div className="text-xs text-gray-600 mt-1">Optimal Range</div>
                <div className="w-full bg-blue-200 rounded-full h-1 mt-2">
                  <div className="bg-blue-500 h-1 rounded-full" style={{width: `${metrics.soilMoisture}%`}}></div>
                </div>
              </div>
              
              <div className="metric-card bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl text-center border border-green-200 hover:scale-105 transition-transform duration-300">
                <div className="text-2xl mb-2">🌱</div>
                <div className="text-sm font-semibold text-green-700">pH Balance</div>
                <div className="text-xl font-bold text-green-600">{metrics.phBalance}</div>
                <div className="text-xs text-gray-600 mt-1">Perfect Level</div>
                <div className="w-full bg-green-200 rounded-full h-1 mt-2">
                  <div className="bg-green-500 h-1 rounded-full" style={{width: '85%'}}></div>
                </div>
              </div>
              
              <div className="metric-card bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-xl text-center border border-purple-200 hover:scale-105 transition-transform duration-300">
                <div className="text-2xl mb-2">🍎</div>
                <div className="text-sm font-semibold text-purple-700">Crop Maturity</div>
                <div className="text-xl font-bold text-purple-600">{metrics.cropMaturity}%</div>
                <div className="text-xs text-gray-600 mt-1">12 days to harvest</div>
                <div className="w-full bg-purple-200 rounded-full h-1 mt-2">
                  <div className="bg-purple-500 h-1 rounded-full" style={{width: `${metrics.cropMaturity}%`}}></div>
                </div>
              </div>
              
              <div className="metric-card bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-xl text-center border border-orange-200 hover:scale-105 transition-transform duration-300">
                <div className="text-2xl mb-2">🌡️</div>
                <div className="text-sm font-semibold text-orange-700">Crop Health</div>
                <div className="text-xl font-bold text-orange-600">{metrics.cropHealth}/100</div>
                <div className="text-xs text-gray-600 mt-1">Excellent Condition</div>
                <div className="w-full bg-orange-200 rounded-full h-1 mt-2">
                  <div className="bg-orange-500 h-1 rounded-full" style={{width: `${metrics.cropHealth}%`}}></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Advanced Farm Analytics Sidebar */}
          <div className="space-y-6">
            {/* Soil Health & Nutrient Analysis */}
            <div className="sensor-data bg-white rounded-2xl p-6 shadow-xl border border-blue-200 hover:shadow-2xl transition-shadow duration-300">
              <h4 className="text-xl font-bold text-blue-700 mb-4 flex items-center">
                <span className="text-2xl mr-3">🔬</span>
                Soil Health Intelligence
              </h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Nitrogen (N)</span>
                  <div className="flex items-center">
                    <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                      <div className="bg-green-500 h-2 rounded-full" style={{width: `${metrics.nitrogen}%`}}></div>
                    </div>
                    <span className="text-sm font-bold text-green-600">{metrics.nitrogen}%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Phosphorus (P)</span>
                  <div className="flex items-center">
                    <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                      <div className="bg-blue-500 h-2 rounded-full" style={{width: `${metrics.phosphorus}%`}}></div>
                    </div>
                    <span className="text-sm font-bold text-blue-600">{metrics.phosphorus}%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Potassium (K)</span>
                  <div className="flex items-center">
                    <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                      <div className="bg-purple-500 h-2 rounded-full" style={{width: `${metrics.potassium}%`}}></div>
                    </div>
                    <span className="text-sm font-bold text-purple-600">{metrics.potassium}%</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="text-xs text-green-700 font-semibold flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  ✅ All nutrients in optimal range
                </div>
                <div className="text-xs text-gray-600 mt-1">IoT sensors monitoring 24/7</div>
              </div>
            </div>
            
            {/* Environmental Conditions */}
            <div className="climate-station bg-white rounded-2xl p-6 shadow-xl border border-orange-200 hover:shadow-2xl transition-shadow duration-300">
              <h4 className="text-xl font-bold text-orange-700 mb-4 flex items-center">
                <span className="text-2xl mr-3">🌍</span>
                Environmental Station
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="font-semibold text-orange-700">Temperature</div>
                  <div className="text-lg font-bold text-orange-600">{metrics.temperature}°C</div>
                  <div className="text-xs text-gray-600">Optimal</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="font-semibold text-blue-700">Humidity</div>
                  <div className="text-lg font-bold text-blue-600">{metrics.humidity}%</div>
                  <div className="text-xs text-gray-600">Ideal</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="font-semibold text-green-700">Sunlight</div>
                  <div className="text-lg font-bold text-green-600">{metrics.sunlight}%</div>
                  <div className="text-xs text-gray-600">Peak</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="font-semibold text-purple-700">Rainfall</div>
                  <div className="text-lg font-bold text-purple-600">{metrics.rainfall}mm</div>
                  <div className="text-xs text-gray-600">This month</div>
                </div>
              </div>
            </div>
            
            {/* AI Predictive Analytics */}
            <div className="ai-predictions bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <h4 className="text-xl font-bold text-purple-700 mb-4 flex items-center">
                <span className="text-2xl mr-3">🤖</span>
                AI Predictive Analytics
              </h4>
              <div className="space-y-3 text-sm">
                <div className="flex items-center p-2 bg-white rounded-lg">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  <span>Optimal harvest window: Dec 15-22, 2024</span>
                </div>
                <div className="flex items-center p-2 bg-white rounded-lg">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  <span>Expected yield: 2,340 kg/acre (+12%)</span>
                </div>
                <div className="flex items-center p-2 bg-white rounded-lg">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                  <span>Quality prediction: 94% A+ grade</span>
                </div>
                <div className="flex items-center p-2 bg-white rounded-lg">
                  <span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>
                  <span>Market price forecast: +8% premium</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Multi-Farm Network Overview */}
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-green-200 mb-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="text-3xl mr-3">🏞️</span>
            Our Farm Network Across India
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="farm-location text-center p-4 bg-green-50 rounded-xl border border-green-200 hover:scale-105 transition-transform duration-300 cursor-pointer">
              <div className="text-3xl mb-2">🌳</div>
              <div className="font-semibold text-green-700">Maharashtra</div>
              <div className="text-sm text-gray-600">Pomegranate Specialization</div>
              <div className="text-xs text-green-600 mt-2">500 Acres | 120 Workers</div>
            </div>
            <div className="farm-location text-center p-4 bg-blue-50 rounded-xl border border-blue-200 hover:scale-105 transition-transform duration-300 cursor-pointer">
              <div className="text-3xl mb-2">🏔️</div>
              <div className="font-semibold text-blue-700">Kerala</div>
              <div className="text-sm text-gray-600">Cardamom Estates</div>
              <div className="text-xs text-blue-600 mt-2">200 Acres | 80 Workers</div>
            </div>
            <div className="farm-location text-center p-4 bg-purple-50 rounded-xl border border-purple-200 hover:scale-105 transition-transform duration-300 cursor-pointer">
              <div className="text-3xl mb-2">🌶️</div>
              <div className="font-semibold text-purple-700">Andhra Pradesh</div>
              <div className="text-sm text-gray-600">Chilly Fields</div>
              <div className="text-xs text-purple-600 mt-2">300 Acres | 110 Workers</div>
            </div>
          </div>
        </div>
        
        {/* Call to Action */}
        <div className="text-center bg-white rounded-3xl p-8 shadow-xl border border-green-200">
          <p className="text-gray-600 text-lg mb-6">
            🔐 Full platform access includes live monitoring across all farm locations, advanced AI analytics, and automated reporting
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => handleDemoAction('watch_farm', 'All Farm Locations')}
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all transform hover:scale-105 shadow-lg shadow-green-500/30 flex items-center justify-center space-x-2"
            >
              <span>🔍</span>
              <span>Explore All Farm Locations</span>
            </button>
            <button 
              onClick={() => handleDemoAction('watch_farm', 'Farm Analytics')}
              className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-600 hover:to-cyan-700 transition-all transform hover:scale-105 shadow-lg shadow-blue-500/30 flex items-center justify-center space-x-2"
            >
              <span>📊</span>
              <span>Access Advanced Analytics</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LiveFarm;