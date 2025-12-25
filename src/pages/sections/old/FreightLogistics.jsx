// components/LandingPage/sections/FreightLogistics.jsx
import React from 'react';
import './FreightLogistics.css';

const FreightLogistics = ({ shipments = [], handleDemoAction = () => {} }) => {
  // Default shipments data
  const defaultShipments = [
    {
      id: "SHIP001",
      name: "MV Saffron Express",
      cargo: "Premium Pomegranates",
      client: "Al Maya Supermarket Dubai",
      temperature: "2°C Controlled",
      progress: 65,
      route: "Mumbai → Dubai",
      estimatedArrival: "2024-03-25",
      currentLocation: "Arabian Sea",
      containers: "Refrigerated x 12"
    },
    {
      id: "SHIP002", 
      name: "MV Cardamom Voyager",
      cargo: "Organic Cardamom",
      client: "Lulu Group International",
      temperature: "15°C Dry Storage",
      progress: 85,
      route: "Cochin → London",
      estimatedArrival: "2024-03-20",
      currentLocation: "London Port",
      containers: "Dry Storage x 8"
    },
    {
      id: "SHIP003",
      name: "MV Granite Carrier",
      cargo: "Premium Granite Slabs",
      client: "Emirates Building Materials",
      temperature: "Ambient",
      progress: 45,
      route: "Mundra → Riyadh", 
      estimatedArrival: "2024-03-28",
      currentLocation: "Arabian Sea",
      containers: "Flat Rack x 20"
    },
    {
      id: "SHIP004",
      name: "MV Pharma Express",
      cargo: "Pharmaceutical Products",
      client: "Dubai Medical Distributors",
      temperature: "5°C Controlled",
      progress: 20,
      route: "Delhi → New York",
      estimatedArrival: "2024-03-30",
      currentLocation: "Atlantic Ocean",
      containers: "Temperature Controlled x 6"
    }
  ];

  const displayShipments = shipments.length > 0 ? shipments : defaultShipments;

  return (
    <section id="freight-logistics" className="freight-logistics py-20 bg-gradient-to-br from-gray-900 via-slate-900 to-black text-white relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-cyan-500 rounded-full filter blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-1/4 w-48 h-48 bg-green-500 rounded-full filter blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center mb-4">
            <div className="w-4 h-4 bg-cyan-400 rounded-full mr-3 animate-ping"></div>
            <span className="text-cyan-400 font-semibold text-sm uppercase tracking-wider">LIVE TRACKING</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            🚢 Global Logistics Command Center
          </h2>
          <p className="text-xl text-blue-200 max-w-3xl mx-auto leading-relaxed">
            Real-time shipment intelligence with AI-powered predictive analytics and blockchain-verified supply chain transparency
          </p>
        </div>
        
        {/* Global Operations Dashboard */}
        <div className="bg-black bg-opacity-60 rounded-3xl p-8 backdrop-blur-xl border border-cyan-400/30 mb-16 shadow-2xl shadow-cyan-500/10">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8">
            <div>
              <h3 className="text-3xl font-bold text-cyan-400 flex items-center mb-2">
                <span className="text-4xl mr-4">🌍</span>
                Live Global Operations Map
              </h3>
              <p className="text-cyan-200 text-lg">Real-time vessel tracking across international waters</p>
            </div>
            <div className="flex items-center space-x-6 mt-4 lg:mt-0">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold text-green-400">{displayShipments.length} ACTIVE SHIPMENTS</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold text-blue-400">24/7 MONITORING</span>
              </div>
            </div>
          </div>
          
          {/* Interactive Map Simulation */}
          <div className="relative bg-gradient-to-br from-blue-900/80 via-indigo-900/80 to-purple-900/80 rounded-2xl h-96 overflow-hidden border border-cyan-500/30 mb-8">
            {/* Ocean Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-800 to-blue-900 opacity-80"></div>
            
            {/* Continent Outlines */}
            <div className="absolute top-1/4 left-1/4 w-32 h-32 border border-white/10 rounded-full"></div>
            <div className="absolute bottom-1/3 right-1/3 w-48 h-48 border border-white/10 rounded-full"></div>
            
            {/* Live Ship Markers with Animation */}
            {displayShipments.map((ship, index) => (
              <div 
                key={ship.id}
                className={`absolute floating-ship cursor-pointer transform hover:scale-125 transition-transform duration-300 ${
                  index === 0 ? 'top-32 left-80' : 
                  index === 1 ? 'top-24 left-96' :
                  index === 2 ? 'top-40 left-64' : 'top-28 left-72'
                }`}
                style={{animationDelay: `${index * 0.5}s`}}
                onClick={() => handleDemoAction('view_shipment', ship.name)}
              >
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-lg shadow-green-500/30">
                    🚢
                  </div>
                  {/* Pulsing Effect */}
                  <div className="absolute inset-0 w-12 h-12 bg-green-500 rounded-full animate-ping opacity-20"></div>
                </div>
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-cyan-300 whitespace-nowrap bg-black/50 px-2 py-1 rounded border border-cyan-500/30">
                  {ship.name}
                </div>
              </div>
            ))}
            
            {/* Live Data Overlay */}
            <div className="absolute top-6 left-6 bg-black/70 backdrop-blur-sm text-white p-4 rounded-xl border border-cyan-500/30">
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-bold text-red-400">LIVE SATELLITE VIEW</span>
              </div>
              <div className="text-xs space-y-1">
                <div>📍 MV Saffron Express</div>
                <div>📡 AIS Tracking Active</div>
                <div>🌊 Arabian Sea</div>
              </div>
            </div>

            {/* Weather & Ocean Conditions */}
            <div className="absolute top-6 right-6 bg-blue-600/80 backdrop-blur-sm text-white p-4 rounded-xl border border-blue-400/30">
              <div className="text-xs font-bold mb-2">OCEAN CONDITIONS</div>
              <div className="text-xs space-y-1">
                <div>🌊 Wave Height: 2.1m</div>
                <div>💨 Wind: 12 knots</div>
                <div>🌡️ Water Temp: 28°C</div>
              </div>
            </div>
          </div>
          
          {/* Advanced Shipment Analytics */}
          <div className="grid lg:grid-cols-2 gap-8 mt-12">
            {displayShipments.map(shipment => (
              <div 
                key={shipment.id}
                className="shipment-card bg-gradient-to-br from-slate-800/80 to-slate-900/80 p-6 rounded-2xl border border-cyan-500/30 cursor-pointer hover:scale-105 transition-all duration-300 backdrop-blur-sm hover:border-cyan-400/60 group"
                onClick={() => handleDemoAction('view_shipment', shipment.name)}
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h4 className="text-xl font-bold text-cyan-400 group-hover:text-cyan-300 transition-colors">{shipment.name}</h4>
                    <p className="text-cyan-200 text-sm">{shipment.route}</p>
                  </div>
                  <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg shadow-green-500/30">
                    IN TRANSIT
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-cyan-200 text-sm">Cargo Type:</span>
                      <span className="text-white font-semibold text-sm">{shipment.cargo}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-cyan-200 text-sm">Client:</span>
                      <span className="text-white font-semibold text-sm">{shipment.client}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-cyan-200 text-sm">Containers:</span>
                      <span className="text-white font-semibold text-sm">{shipment.containers}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-cyan-200 text-sm">Temperature:</span>
                      <span className="text-white font-semibold text-sm">{shipment.temperature}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-cyan-200 text-sm">ETA:</span>
                      <span className="text-white font-semibold text-sm">{shipment.estimatedArrival}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-cyan-200 text-sm">Location:</span>
                      <span className="text-white font-semibold text-sm">{shipment.currentLocation}</span>
                    </div>
                  </div>
                </div>
                
                {/* Progress Bar with Animation */}
                <div className="mb-2">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-cyan-200">Journey Progress</span>
                    <span className="text-green-400 font-semibold">{shipment.progress}% Complete</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-emerald-400 h-3 rounded-full transition-all duration-1000 ease-out"
                      style={{width: `${shipment.progress}%`}}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-black/40 backdrop-blur-sm rounded-3xl p-8 border border-cyan-500/20">
          <div className="flex flex-col items-center justify-center space-y-4">
            <p className="text-cyan-300 text-lg mb-2">
              🔐 Full platform access includes real-time AIS tracking, predictive ETAs, and automated documentation
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => handleDemoAction('view_shipment', 'Full Logistics Dashboard')}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-cyan-600 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg shadow-cyan-500/30 flex items-center space-x-2"
              >
                <span>🚀</span>
                <span>Access Full Logistics Dashboard</span>
              </button>
              <button 
                onClick={() => handleDemoAction('view_shipment', 'Documentation Portal')}
                className="bg-gradient-to-r from-slate-700 to-slate-800 text-white px-8 py-4 rounded-xl font-semibold hover:from-slate-800 hover:to-slate-900 transition-all transform hover:scale-105 border border-cyan-500/30 flex items-center space-x-2"
              >
                <span>📋</span>
                <span>View Documentation Portal</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FreightLogistics;