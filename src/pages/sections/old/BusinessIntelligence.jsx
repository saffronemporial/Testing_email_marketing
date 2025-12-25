// components/LandingPage/sections/BusinessIntelligence.jsx
import React, { useState, useEffect } from 'react';
import './BusinessIntelligence.css';

const BusinessIntelligence = ({ marketData = {}, handleDemoAction = () => {} }) => {
  // Default comprehensive market data
  const defaultMarketData = {
    dubai: {
      price: "$4,850/ton",
      change: "+2.3%",
      volume: "1,240 tons",
      trend: "up",
      demand: "High",
      forecast: "Bullish"
    },
    london: {
      price: "$5,120/ton", 
      change: "+1.8%",
      volume: "890 tons",
      trend: "up",
      demand: "Medium",
      forecast: "Stable"
    },
    newyork: {
      price: "$5,350/ton",
      change: "+3.1%",
      volume: "1,560 tons",
      trend: "up", 
      demand: "High",
      forecast: "Bullish"
    },
    singapore: {
      price: "$4,950/ton",
      change: "-0.5%",
      volume: "720 tons",
      trend: "down",
      demand: "Medium",
      forecast: "Neutral"
    },
    sydney: {
      price: "$5,280/ton",
      change: "+2.7%",
      volume: "680 tons", 
      trend: "up",
      demand: "Low",
      forecast: "Bullish"
    },
    tokyo: {
      price: "$5,420/ton",
      change: "+1.2%",
      volume: "540 tons",
      trend: "up",
      demand: "Medium",
      forecast: "Stable"
    }
  };

  const [realTimeData, setRealTimeData] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate real-time data updates
    const timer = setTimeout(() => {
      setRealTimeData(marketData && Object.keys(marketData).length > 0 ? marketData : defaultMarketData);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [marketData]);

  const getTrendColor = (trend) => {
    return trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-yellow-400';
  };

  const getTrendIcon = (trend) => {
    return trend === 'up' ? '📈' : trend === 'down' ? '📉' : '➡️';
  };

  const getDemandColor = (demand) => {
    return demand === 'High' ? 'text-red-400' : demand === 'Medium' ? 'text-yellow-400' : 'text-green-400';
  };

  if (isLoading) {
    return (
      <section id="business-intelligence" className="business-intelligence py-20 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto"></div>
            <p className="mt-4 text-xl">Loading Market Intelligence...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="business-intelligence" className="business-intelligence py-20 bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 text-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-blue-500 rounded-full filter blur-3xl animate-pulse delay-700"></div>
        <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-cyan-500 rounded-full filter blur-3xl animate-pulse delay-300"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center mb-4">
            <div className="w-4 h-4 bg-green-400 rounded-full mr-3 animate-ping"></div>
            <span className="text-green-400 font-semibold text-sm uppercase tracking-wider">LIVE MARKET DATA</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
            📊 AI Business Intelligence Platform
          </h2>
          <p className="text-xl text-blue-200 max-w-4xl mx-auto leading-relaxed">
            Real-time predictive analytics, machine learning insights, and automated supply chain optimization for global export markets
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Global Market Intelligence Dashboard */}
          <div className="pricing-dashboard bg-black/60 rounded-3xl p-8 backdrop-blur-xl border border-blue-400/30 shadow-2xl shadow-blue-500/10">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8">
              <div>
                <h3 className="text-3xl font-bold text-blue-400 flex items-center mb-2">
                  <span className="text-4xl mr-4">💹</span>
                  Live Global Market Dashboard
                </h3>
                <p className="text-blue-200 text-lg">Real-time commodity pricing and demand intelligence</p>
              </div>
              <div className="flex items-center space-x-3 mt-4 lg:mt-0">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold text-green-400">DEMO DATA</span>
              </div>
            </div>

            {/* Market Grid with Enhanced Data */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {Object.entries(realTimeData).map(([market, data]) => (
                <div 
                  key={market}
                  onClick={() => handleDemoAction('view_market', market)}
                  className="market-card bg-gradient-to-br from-slate-800/80 to-slate-900/80 p-6 rounded-2xl border border-blue-500/30 cursor-pointer hover:scale-105 transition-all duration-300 backdrop-blur-sm hover:border-blue-400/60 group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-blue-400 font-semibold text-lg capitalize group-hover:text-blue-300 transition-colors">
                      {market} Exchange
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm font-semibold ${getTrendColor(data.trend)}`}>
                        {data.change}
                      </span>
                      <span className="text-lg">{getTrendIcon(data.trend)}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="text-white font-mono text-2xl font-bold">{data.price}</div>
                    <div className="text-blue-300 text-sm">Premium Pomegranate Grade A</div>
                    
                    <div className="grid grid-cols-2 gap-4 pt-3 border-t border-blue-500/20">
                      <div className="text-center">
                        <div className="text-xs text-blue-200 mb-1">Volume</div>
                        <div className="text-white font-semibold text-sm">{data.volume}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-blue-200 mb-1">Demand</div>
                        <div className={`font-semibold text-sm ${getDemandColor(data.demand)}`}>
                          {data.demand}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-center pt-2 border-t border-blue-500/20">
                      <div className="text-xs text-blue-200">Forecast: <span className="text-white font-semibold">{data.forecast}</span></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center">
              <button 
                onClick={() => handleDemoAction('view_market', 'full dashboard')}
                className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-600 hover:to-cyan-700 transition-all transform hover:scale-105 shadow-lg shadow-blue-500/30"
              >
                Access Complete Market Intelligence Suite
              </button>
            </div>
          </div>

          {/* Supply Chain Analytics & AI Predictions */}
          <div className="supply-chain bg-black/60 rounded-3xl p-8 backdrop-blur-xl border border-cyan-400/30 shadow-2xl shadow-cyan-500/10">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-3xl font-bold text-cyan-400 flex items-center mb-2">
                  <span className="text-4xl mr-4">🚛</span>
                  Supply Chain AI Analytics
                </h3>
                <p className="text-cyan-200 text-lg">Predictive logistics and automated optimization</p>
              </div>
            </div>

            {/* AI Performance Metrics */}
            <div className="space-y-6 mb-8">
              <div className="alert-card bg-gradient-to-r from-green-900/50 to-emerald-900/50 p-6 rounded-2xl border border-green-400/30 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-green-400 font-semibold text-lg">✅ AI Performance Excellence</span>
                  <span className="text-green-300 text-sm bg-green-900/50 px-3 py-1 rounded-full">Optimal</span>
                </div>
                <div className="space-y-2">
                  <div className="text-white text-sm">Farm to Port Transit Efficiency</div>
                  <div className="text-green-200 text-xs">Average: 14 hours (2 hrs ahead of schedule)</div>
                  <div className="text-green-200 text-xs">Quality retention: 99.2% | Cost efficiency: +18%</div>
                </div>
              </div>

              <div className="alert-card bg-gradient-to-r from-blue-900/50 to-cyan-900/50 p-6 rounded-2xl border border-blue-400/30 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-blue-400 font-semibold text-lg">🤖 Predictive Analytics</span>
                  <span className="text-blue-300 text-sm bg-blue-900/50 px-3 py-1 rounded-full">Active</span>
                </div>
                <div className="space-y-2">
                  <div className="text-white text-sm">Market Demand Forecasting</div>
                  <div className="text-blue-200 text-xs">Next 30 days: +12% demand expected</div>
                  <div className="text-blue-200 text-xs">Price optimization: 94% accuracy rate</div>
                </div>
              </div>
            </div>

            {/* Supply Chain Health Metrics */}
            <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-600/30 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="text-cyan-200 text-lg font-semibold">Supply Chain Health Index</div>
                <div className="text-2xl font-bold text-green-400 bg-green-900/30 px-3 py-1 rounded-full">87/100</div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-cyan-200">Logistics Efficiency</span>
                    <span className="text-green-400">92%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-3">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-400 h-3 rounded-full" style={{width: '92%'}}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-cyan-200">Cost Optimization</span>
                    <span className="text-blue-400">85%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-3">
                    <div className="bg-gradient-to-r from-blue-500 to-cyan-400 h-3 rounded-full" style={{width: '85%'}}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-cyan-200">Quality Assurance</span>
                    <span className="text-purple-400">94%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-3">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-400 h-3 rounded-full" style={{width: '94%'}}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Analytics Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="feature-card bg-black/40 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/30 text-center hover:scale-105 transition-transform duration-300">
            <div className="text-4xl mb-4">🤖</div>
            <h4 className="text-xl font-bold text-purple-400 mb-2">AI Predictive Models</h4>
            <p className="text-purple-200 text-sm">Machine learning algorithms forecasting market trends with 94% accuracy</p>
          </div>
          
          <div className="feature-card bg-black/40 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/30 text-center hover:scale-105 transition-transform duration-300">
            <div className="text-4xl mb-4">📈</div>
            <h4 className="text-xl font-bold text-blue-400 mb-2">Real-time Analytics</h4>
            <p className="text-blue-200 text-sm">Live data streams from global markets and supply chain partners</p>
          </div>
          
          <div className="feature-card bg-black/40 backdrop-blur-sm rounded-2xl p-6 border border-green-500/30 text-center hover:scale-105 transition-transform duration-300">
            <div className="text-4xl mb-4">⚡</div>
            <h4 className="text-xl font-bold text-green-400 mb-2">Automated Optimization</h4>
            <p className="text-green-200 text-sm">AI-driven recommendations for cost reduction and efficiency improvement</p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-black/40 backdrop-blur-sm rounded-3xl p-8 border border-blue-500/20">
          <p className="text-blue-300 text-lg mb-6">
            🔐 Full platform access includes advanced AI predictions, automated reporting, and real-time market intelligence
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => handleDemoAction('view_market', 'BI Dashboard')}
              className="bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-600 hover:via-cyan-600 hover:to-teal-700 transition-all transform hover:scale-105 shadow-lg shadow-cyan-500/30 flex items-center justify-center space-x-2"
            >
              <span>📊</span>
              <span>Access AI Business Intelligence</span>
            </button>
            <button 
              onClick={() => handleDemoAction('view_market', 'Market Reports')}
              className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-700 transition-all transform hover:scale-105 shadow-lg shadow-purple-500/30 flex items-center justify-center space-x-2"
            >
              <span>📋</span>
              <span>Generate Market Reports</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BusinessIntelligence;