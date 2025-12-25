// src/components/Farm/LiveFarmAi.jsx
import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { ENHANCED_FARMS, MAJOR_PORTS, getRandomFarmVariations } from './hooks/farmData';
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Tooltip,
  Polyline,
  Marker,
  Popup
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./LiveFarmAI.css" ;
import { motion, AnimatePresence } from "framer-motion";

// Weather API - using WeatherAPI (free tier, 1M calls/month)
const WEATHER_API_KEY = "YOUR_WEATHERAPI_KEY"; // Get free key from weatherapi.com
const WEATHER_API_URL = "https://api.weatherapi.com/v1/forecast.json";



// Export shipping routes simulation
const SHIPPING_ROUTES = [
  { from: "rajasthan", to: "mundra", duration: "2-3 days" },
  { from: "maharashtra", to: "mumbai", duration: "1-2 days" },
  { from: "karnataka", to: "chennai", duration: "3-4 days" },
  { from: "kerala", to: "kochi", duration: "1-2 days" },
  { from: "mumbai", to: "dubai", duration: "5-7 days" },
  { from: "mundra", to: "singapore", duration: "7-10 days" },
  { from: "chennai", to: "rotterdam", duration: "18-22 days" }
];

// Custom gold marker icons
const createCustomIcon = (status, isSelected = false, premiumLevel = "Gold") => {
  const size = isSelected ? 26 : premiumLevel === "Diamond" ? 20 : premiumLevel === "Platinum" ? 18 : 16;
  
  const colors = {
    healthy: { gradient: "#10b981 #059669 #047857", border: "#ffd700", shadow: "#10b981" },
    warning: { gradient: "#f59e0b #d97706 #b45309", border: "#fbbf24", shadow: "#f59e0b" },
    critical: { gradient: "#ef4444 #dc2626 #b91c1c", border: "#f87171", shadow: "#ef4444" }
  };
  
  const premiumBorders = {
    Diamond: { outer: "#b9f2ff", middle: "#00e5ff", inner: "#ffd700" },
    Platinum: { outer: "#e5e4e2", middle: "#d3d3d3", inner: "#ffd700" },
    Gold: { outer: "#ffd700", middle: "#daa520", inner: "#b8860b" },
    Silver: { outer: "#c0c0c0", middle: "#a9a9a9", inner: "#808080" }
  };
  
  const border = premiumBorders[premiumLevel] || premiumBorders.Gold;
  
  const iconHtml = `
    <div class="gold-marker ${status} ${premiumLevel.toLowerCase()}" 
         style="width: ${size}px; height: ${size}px; animation: markerPulse 2s infinite;">
      <div class="marker-glow" style="animation-delay: ${Math.random() * 2}s;"></div>
      <div class="premium-ring" style="border-color: ${border.outer}"></div>
      <div class="premium-ring middle" style="border-color: ${border.middle}"></div>
      <div class="marker-core" style="background: radial-gradient(circle at 30% 30%, ${colors[status].gradient})"></div>
      <div class="gold-dot" style="background: ${border.inner}"></div>
      ${premiumLevel === "Diamond" ? '<div class="diamond-sparkle"></div>' : ''}
    </div>
  `;
  
  return L.divIcon({
    html: iconHtml,
    className: 'custom-marker',
    iconSize: [size, size],
    iconAnchor: [size/2, size/2]
  });
};

// Weather emojis
const weatherEmoji = {
  sunny: "☀️",
  "partly-cloudy": "⛅",
  cloudy: "☁️",
  rainy: "🌧️",
  misty: "🌫️",
  clear: "✨",
  "patchy rain possible": "🌦️"
};

// Simulated weather data (would be replaced with real API)
const fetchWeatherForecast = async (lat, lng) => {
  try {
    // This is a simulation - in production, use:
    // const response = await fetch(`${WEATHER_API_URL}?key=${WEATHER_API_KEY}&q=${lat},${lng}&days=7`);
    // return response.json();
    
    // Simulated response
    return {
      forecast: {
        forecastday: Array(7).fill(null).map((_, i) => ({
          date: new Date(Date.now() + i * 86400000).toISOString().split('T')[0],
          day: {
            maxtemp_c: 28 + Math.random() * 5,
            mintemp_c: 18 + Math.random() * 4,
            condition: { text: ['Sunny', 'Partly Cloudy', 'Clear'][Math.floor(Math.random() * 3)] },
            daily_chance_of_rain: Math.floor(Math.random() * 30),
            uv: 5 + Math.random() * 5
          }
        }))
      }
    };
  } catch (error) {
    console.error("Weather API Error:", error);
    return null;
  }
};

// Profitability calculator
const calculateProfitability = (farm) => {
  const baseCost = farm.roiData.investmentRequired.replace(/[^0-9]/g, '');
  const baseReturn = farm.roiData.expectedReturn.replace(/[^0-9]/g, '');
  const profit = (parseInt(baseReturn) - parseInt(baseCost)).toLocaleString();
  
  return {
    profitPerKg: "$" + (Math.random() * 5 + 2).toFixed(2),
    totalProfit: `$${profit}`,
    marginPerContainer: "$" + (Math.random() * 10000 + 5000).toLocaleString(),
    annualGrowth: (Math.random() * 15 + 10).toFixed(1) + "%"
  };
};

// Loading messages
const LOADING_MESSAGES = [
  "🛰️ Connecting to satellite network...",
  "🔍 Analyzing soil composition across premium farms...",
  "🤖 Calibrating AI quality sensors...",
  "⚡ Establishing quantum communication links...",
  "🌐 Initializing holographic farm displays...",
  "📊 Loading export quality metrics...",
  "🏆 Verifying international certifications...",
  "🚢 Calculating optimal shipping routes...",
  "💹 Analyzing global market prices...",
  "🌤️ Fetching real-time weather forecasts...",
  "📈 Calculating profitability metrics...",
  "✅ Saffron Emporial AI Network Ready."
];

function LiveFarmAi() {
  const [loading, setLoading] = useState(true);
  const [loadingIndex, setLoadingIndex] = useState(0);
  const [farms, setFarms] = useState([]);
  const [selectedFarmId, setSelectedFarmId] = useState(1);
  const [weatherData, setWeatherData] = useState({});
  const [activeTab, setActiveTab] = useState("overview");
  const [showExportRoutes, setShowExportRoutes] = useState(true);
  const [profitabilityData, setProfitabilityData] = useState({});
  const [farmerControls, setFarmerControls] = useState({});
  const [mapView, setMapView] = useState("satellite");
  
  const mapRef = useRef(null);

     // Initialize farms with simulated data
     useEffect(() => {
     const visitId = localStorage.getItem('saffron_farm_visit') || 0;
     localStorage.setItem('saffron_farm_visit', parseInt(visitId) + 1);
    
      // Use the imported farms with variations
     const variedFarms = getRandomFarmVariations(visitId);
     setFarms(variedFarms);

    // Calculate profitability
    const profitData = {};
    variedFarms.forEach(farm => {
      profitData[farm.id] = calculateProfitability(farm);
    });
    setProfitabilityData(profitData);
    
    // Fetch weather data
    variedFarms.forEach(async farm => {
      const weather = await fetchWeatherForecast(farm.lat, farm.lng);
      setWeatherData(prev => ({
        ...prev,
        [farm.id]: weather?.forecast?.forecastday || []
      }));
    });

    // Simulate loading
    const messageInterval = setInterval(() => {
      setLoadingIndex(prev => (prev < LOADING_MESSAGES.length - 1 ? prev + 1 : prev));
    }, 400);

    setTimeout(() => {
      setLoading(false);
      clearInterval(messageInterval);
    }, 4500);

    return () => clearInterval(messageInterval);
  }, []);

  const selectedFarm = farms.find(f => f.id === selectedFarmId) || farms[0];
  const selectedWeather = weatherData[selectedFarmId] || [];

  // Simulate real-time updates
  useEffect(() => {
    if (loading) return;
    
    const interval = setInterval(() => {
      setFarms(prev => prev.map(farm => ({
        ...farm,
        temperature: farm.temperature + (Math.random() - 0.5) * 0.3,
        humidity: Math.max(30, Math.min(95, farm.humidity + (Math.random() - 0.5) * 1)),
        cropHealth: Math.max(70, Math.min(100, farm.cropHealth + (Math.random() - 0.5) * 0.5))
      })));
    }, 10000);
    
    return () => clearInterval(interval);
  }, [loading]);

  const handleFarmSelect = (farmId) => {
    setSelectedFarmId(farmId);
    // Smooth scroll to details
    document.querySelector('.farm-details-container')?.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleFarmerControl = (control, action) => {
    setFarmerControls(prev => ({
      ...prev,
      [selectedFarmId]: {
        ...prev[selectedFarmId],
        [control]: action === 'toggle' 
          ? (prev[selectedFarmId]?.[control] === 'Active' ? 'Paused' : 'Active')
          : action
      }
    }));
  };

  const renderWeatherForecast = () => (
    <div className="weather-forecast-container">
      <h4 className="forecast-title">🌤️ 7-Day Weather Forecast</h4>
      <div className="forecast-grid">
        {selectedWeather.slice(0, 7).map((day, index) => (
          <div key={index} className="forecast-day">
            <div className="forecast-date">
              {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
            </div>
            <div className="forecast-emoji">
              {weatherEmoji[day.day.condition.text.toLowerCase()] || '☀️'}
            </div>
            <div className="forecast-temp">
              <span className="temp-high">{Math.round(day.day.maxtemp_c)}°</span>
              <span className="temp-low">/{Math.round(day.day.mintemp_c)}°</span>
            </div>
            <div className="forecast-rain">
              💧 {day.day.daily_chance_of_rain}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderFarmerControls = () => (
    <div className="farmer-controls-container">
      <h4 className="controls-title">📱 Mobile Farm Control Center</h4>
      <div className="controls-grid">
        <div className={`control-card ${selectedFarm?.farmerControls?.irrigation?.status === 'Active' ? 'active' : ''}`}>
          <div className="control-icon">💧</div>
          <h5>Smart Irrigation</h5>
          <div className="control-status">{selectedFarm?.farmerControls?.irrigation?.status}</div>
          <div className="control-info">Schedule: {selectedFarm?.farmerControls?.irrigation?.schedule}</div>
          <div className="control-info">Automation: {selectedFarm?.farmerControls?.irrigation?.automation}</div>
          <button 
            className="control-btn"
            onClick={() => toggleFarmerControl('irrigation', 'toggle')}
          >
            {farmerControls[selectedFarmId]?.irrigation === 'Paused' ? 'Activate' : 'Pause'} System
          </button>
        </div>
        
        <div className={`control-card ${selectedFarm?.farmerControls?.pestControl?.status === 'Active' ? 'active' : ''}`}>
          <div className="control-icon">🐛</div>
          <h5>Pest Management</h5>
          <div className="control-status">{selectedFarm?.farmerControls?.pestControl?.status}</div>
          <div className="control-info">Last Spray: {selectedFarm?.farmerControls?.pestControl?.lastSpray}</div>
          <div className="control-info">Method: {selectedFarm?.farmerControls?.pestControl?.method}</div>
          <button className="control-btn">Schedule Spray</button>
        </div>
        
        <div className={`control-card ${selectedFarm?.farmerControls?.harvesting?.status === 'Ready' ? 'active' : ''}`}>
          <div className="control-icon">🌾</div>
          <h5>Harvest Planning</h5>
          <div className="control-status">{selectedFarm?.farmerControls?.harvesting?.status}</div>
          <div className="control-info">In: {selectedFarm?.farmerControls?.harvesting?.date}</div>
          <div className="control-info">Equipment: {selectedFarm?.farmerControls?.harvesting?.equipment}</div>
          <button className="control-btn">Optimize Schedule</button>
        </div>
        
        <div className="control-card">
          <div className="control-icon">📊</div>
          <h5>Quality Dashboard</h5>
          <div className="control-status">Live Monitoring</div>
          <div className="control-info">Last Score: {selectedFarm?.farmerControls?.qualityCheck?.lastScore}</div>
          <div className="control-info">Next Check: {selectedFarm?.farmerControls?.qualityCheck?.nextCheck}</div>
          <button className="control-btn">View Full Report</button>
        </div>
      </div>
    </div>
  );

  const renderExportRoutes = () => (
    <div className="export-routes-container">
      <h4 className="routes-title">🌍 Global Export Network</h4>
      <div className="routes-info">
        <div className="route-card">
          <div className="route-icon">🚢</div>
          <h5>Primary Shipping Route</h5>
          <div className="route-detail">
            <span className="route-from">{selectedFarm?.nearestPort}</span>
            <span className="route-arrow">→</span>
            <span className="route-to">Dubai (UAE)</span>
          </div>
          <div className="route-meta">
            <span>⏱️ {selectedFarm?.shippingDuration}</span>
            <span>📦 20-40 FT Containers</span>
            <span>💰 $2,500 - $4,500</span>
          </div>
        </div>
        
        <div className="ports-grid">
          {Object.values(MAJOR_PORTS).map(port => (
            <div key={port.name} className="port-badge">
              <div className="port-name">{port.name}</div>
              <div className="port-distance">
                {Math.round(getDistance(selectedFarm?.lat, selectedFarm?.lng, port.lat, port.lng))} km
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderProfitabilityDashboard = () => (
    <div className="profitability-container">
      <h4 className="profitability-title">📈 Profitability Analysis</h4>
      <div className="profitability-grid">
        <div className="profit-card gold">
          <div className="profit-icon">💰</div>
          <div className="profit-value">{profitabilityData[selectedFarmId]?.totalProfit || "$0"}</div>
          <div className="profit-label">Total Profit Potential</div>
          <div className="profit-sub">Per Annual Contract</div>
        </div>
        
        <div className="profit-card green">
          <div className="profit-icon">📊</div>
          <div className="profit-value">{selectedFarm?.roiData?.profitMargin || "150%"}</div>
          <div className="profit-label">Profit Margin</div>
          <div className="profit-sub">After All Costs</div>
        </div>
        
        <div className="profit-card blue">
          <div className="profit-icon">📅</div>
          <div className="profit-value">{selectedFarm?.roiData?.paybackPeriod || "6 months"}</div>
          <div className="profit-label">Payback Period</div>
          <div className="profit-sub">Return on Investment</div>
        </div>
        
        <div className="profit-card purple">
          <div className="profit-icon">🚀</div>
          <div className="profit-value">{selectedFarm?.roiData?.annualROI || "250%"}</div>
          <div className="profit-label">Annual ROI</div>
          <div className="profit-sub">Compound Growth</div>
        </div>
      </div>
      
      <div className="profit-breakdown">
        <h5>📋 Investment Breakdown</h5>
        <div className="breakdown-grid">
          <div className="breakdown-item">
            <span>Product Cost</span>
            <span className="breakdown-value">{selectedFarm?.roiData?.investmentRequired || "$150,000"}</span>
          </div>
          <div className="breakdown-item">
            <span>Shipping & Logistics</span>
            <span className="breakdown-value">$15,000 - $25,000</span>
          </div>
          <div className="breakdown-item">
            <span>Certifications & Compliance</span>
            <span className="breakdown-value">$5,000 - $8,000</span>
          </div>
          <div className="breakdown-item">
            <span>Market Distribution</span>
            <span className="breakdown-value">$10,000 - $15,000</span>
          </div>
          <div className="breakdown-item total">
            <span>Net Profit</span>
            <span className="breakdown-value profit">{profitabilityData[selectedFarmId]?.totalProfit || "$275,000"}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="loading-content">
          <div className="quantum-loader">
            <div className="quantum-orb"></div>
            <div className="quantum-rings">
              <div className="ring-1"></div>
              <div className="ring-2"></div>
              <div className="ring-3"></div>
            </div>
          </div>
          <h2 className="loading-title">Saffron Emporial AI Network</h2>
          <p className="loading-message">{LOADING_MESSAGES[loadingIndex]}</p>
          <div className="loading-progress">
            <div 
              className="loading-bar" 
              style={{ width: `${(loadingIndex + 1) * 100 / LOADING_MESSAGES.length}%` }}
            ></div>
          </div>
          <div className="loading-stats">
            <span>🛰️ Connecting to 9 satellites...</span>
            <span>🤖 Initializing 12 AI models...</span>
            <span>🌐 Linking 18 global farms...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="live-farm-ai">
      {/* Cosmic Background */}
      <div className="cosmic-background">
        <div className="stars"></div>
        <div className="twinkling"></div>
        <div className="clouds"></div>
      </div>
      
      {/* Animated Particles */}
      <div className="particles-container"></div>
      
      {/* Header */}
      <header className="gold-header">
        <div className="header-glow"></div>
        <div className="container">
          <div className="header-content">
            <button className="back-btn" onClick={() => window.history.back()}>
              <span className="back-icon">←</span>
              <span>Back to Dashboard</span>
            </button>
            
            <div className="header-main">
              <div className="header-logo">
                <div className="logo-orb">
                  <div className="logo-inner">🌐</div>
                  <div className="logo-ring"></div>
                  <div className="logo-pulse"></div>
                </div>
                <div>
                  <h1 className="header-title">
                    <span className="title-glow">Saffron Emporial</span>
                    <span className="title-sub">AI Farm Intelligence</span>
                  </h1>
                  <div className="header-tags">
                    <span className="tag gold">🏆 World Class</span>
                    <span className="tag blue">🛰️ Live Satellite</span>
                    <span className="tag green">🤖 AI Powered</span>
                  </div>
                </div>
              </div>
              
              <div className="header-stats">
                <div className="stat-card">
                  <div className="stat-icon">🌾</div>
                  <div className="stat-value">{farms.length}</div>
                  <div className="stat-label">Premium Farms</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">📈</div>
                  <div className="stat-value">99.2%</div>
                  <div className="stat-label">AI Accuracy</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">🚀</div>
                  <div className="stat-value">24/7</div>
                  <div className="stat-label">Live Monitoring</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="container main-content">
        <div className="grid-layout">
          {/* Left: Interactive Map */}
          <div className="map-section">
            <div className="glass-card map-container">
              <div className="card-header">
                <h2 className="card-title">
                  <span className="title-icon">🛰️</span>
                  Global Farm Network
                </h2>
                <div className="card-controls">
                  <button 
                    className={`view-btn ${mapView === 'satellite' ? 'active' : ''}`}
                    onClick={() => setMapView('satellite')}
                  >
                    Satellite
                  </button>
                  <button 
                    className={`view-btn ${mapView === 'routes' ? 'active' : ''}`}
                    onClick={() => setMapView('routes')}
                  >
                    Export Routes
                  </button>
                  <button 
                    className="toggle-btn"
                    onClick={() => setShowExportRoutes(!showExportRoutes)}
                  >
                    {showExportRoutes ? 'Hide Routes' : 'Show Routes'}
                  </button>
                </div>
              </div>
              
              <div className="map-wrapper">
                <MapContainer
                  center={[22.5, 78.9]}
                  zoom={5}
                  className="leaflet-map-gold"
                  ref={mapRef}
                >
                  <TileLayer
                    url={mapView === 'satellite' 
                      ? 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                      : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png'
                    }
                  />
                  
                  {farms.map(farm => (
                    <CircleMarker
                      key={farm.id}
                      center={[farm.lat, farm.lng]}
                      radius={selectedFarmId === farm.id ? 12 : 8}
                      pathOptions={{
                        className: `farm-marker ${farm.status} ${selectedFarmId === farm.id ? 'selected' : ''}`,
                        fillColor: farm.status === 'healthy' ? '#10b981' : 
                                  farm.status === 'warning' ? '#f59e0b' : '#ef4444',
                        color: '#ffd700',
                        weight: selectedFarmId === farm.id ? 3 : 2,
                        opacity: 1,
                        fillOpacity: 0.7
                      }}
                      eventHandlers={{
                        click: () => handleFarmSelect(farm.id)
                      }}
                    >
                      <Tooltip direction="top" opacity={1} className="gold-tooltip">
                        <div className="tooltip-content">
                          <strong>{farm.name}</strong>
                          <div>{farm.location}</div>
                          <div>Grade: {farm.exportGrade}</div>
                          <div>Status: <span className={`status-${farm.status}`}>{farm.status}</span></div>
                        </div>
                      </Tooltip>
                    </CircleMarker>
                  ))}
                  
                  {/* Export Routes */}
                  {showExportRoutes && farms.map(farm => (
                    <Polyline
                      key={`route-${farm.id}`}
                      positions={farm.shippingRoute}
                      pathOptions={{
                        color: '#ffd700',
                        weight: 2,
                        opacity: 0.7,
                        dashArray: '10, 10'
                      }}
                    />
                  ))}
                  
                  {/* Major Ports */}
                  {Object.values(MAJOR_PORTS).map(port => (
                    <CircleMarker
                      key={port.name}
                      center={[port.lat, port.lng]}
                      radius={6}
                      pathOptions={{
                        className: 'port-marker',
                        fillColor: '#3b82f6',
                        color: '#1d4ed8',
                        weight: 2,
                        fillOpacity: 0.8
                      }}
                    >
                      <Tooltip>{port.name}</Tooltip>
                    </CircleMarker>
                  ))}
                </MapContainer>
                
                <div className="map-overlay">
                  <div className="map-legend">
                    <h4>Network Status</h4>
                    <div className="legend-items">
                      <div className="legend-item">
                        <div className="legend-dot healthy"></div>
                        <span>Export Ready</span>
                      </div>
                      <div className="legend-item">
                        <div className="legend-dot warning"></div>
                        <span>Monitoring</span>
                      </div>
                      <div className="legend-item">
                        <div className="legend-dot critical"></div>
                        <span>Attention Required</span>
                      </div>
                      <div className="legend-item">
                        <div className="legend-dot port"></div>
                        <span>Major Ports</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right: Farm Details */}
          <div className="details-section">
            <div className="glass-card farm-details-container">
              <div className="farm-tabs">
                <button 
                  className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                  onClick={() => setActiveTab('overview')}
                >
                  📋 Overview
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'controls' ? 'active' : ''}`}
                  onClick={() => setActiveTab('controls')}
                >
                  📱 Controls
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'profit' ? 'active' : ''}`}
                  onClick={() => setActiveTab('profit')}
                >
                  💰 Profitability
                </button>
              </div>
              
              <div className="farm-details-content">
                <AnimatePresence mode="wait">
                  {activeTab === 'overview' && (
                    <motion.div
                      key="overview"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="tab-content"
                    >
                      {/* Farm Header */}
                      <div className="farm-header">
                        <div className="farm-badge">
                          <span className={`premium-badge ${selectedFarm?.premiumLevel?.toLowerCase()}`}>
                            {selectedFarm?.premiumLevel}
                          </span>
                          <span className={`status-badge ${selectedFarm?.status}`}>
                            {selectedFarm?.status.toUpperCase()}
                          </span>
                        </div>
                        <h2 className="farm-name">{selectedFarm?.name}</h2>
                        <p className="farm-location">{selectedFarm?.location}</p>
                        
                        <div className="farm-metrics">
                          <div className="metric">
                            <div className="metric-value">{selectedFarm?.temperature?.toFixed(1)}°C</div>
                            <div className="metric-label">Temperature</div>
                          </div>
                          <div className="metric">
                            <div className="metric-value">{selectedFarm?.humidity}%</div>
                            <div className="metric-label">Humidity</div>
                          </div>
                          <div className="metric">
                            <div className="metric-value">{selectedFarm?.cropHealth}%</div>
                            <div className="metric-label">Crop Health</div>
                          </div>
                          <div className="metric">
                            <div className="metric-value">{selectedFarm?.qualityScore}%</div>
                            <div className="metric-label">Quality</div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Crops & Prices */}
                      <div className="crops-section">
                        <h4>🌾 Premium Crops & Market Prices</h4>
                        <div className="crops-grid">
                          {selectedFarm?.crops?.map((crop, idx) => (
                            <div key={idx} className="crop-card">
                              <div className="crop-name">{crop.name}</div>
                              <div className="crop-grade">{crop.grade}</div>
                              <div className="crop-price">{crop.price}</div>
                              <div className="crop-trend">↗️ +{(Math.random() * 15).toFixed(1)}%</div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Weather Forecast */}
                      {renderWeatherForecast()}
                      
                      {/* Export Routes */}
                      {renderExportRoutes()}
                      
                      {/* AI Insights */}
                      <div className="ai-insights-card">
                        <h4>🤖 AI Insights</h4>
                        <p className="insight-text">{selectedFarm?.aiInsights}</p>
                        <div className="insight-metrics">
                          <span>🛰️ Satellite Data: 98% Accuracy</span>
                          <span>📊 Prediction Confidence: 96%</span>
                          <span>⏰ Updated: Just now</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                  {activeTab === 'controls' && (
                    <motion.div
                      key="controls"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="tab-content"
                    >
                      {renderFarmerControls()}
                    </motion.div>
                  )}
                  
                  {activeTab === 'profit' && (
                    <motion.div
                      key="profit"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="tab-content"
                    >
                      {renderProfitabilityDashboard()}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              {/* Farm Selection */}
              <div className="farm-selection">
                <h4>Select Farm</h4>
                <div className="farm-list">
                  {farms.map(farm => (
                    <button
                      key={farm.id}
                      className={`farm-select-btn ${selectedFarmId === farm.id ? 'selected' : ''} ${farm.premiumLevel?.toLowerCase()}`}
                      onClick={() => handleFarmSelect(farm.id)}
                    >
                      <div className="farm-select-info">
                        <span className="farm-select-name">{farm.name}</span>
                        <span className="farm-select-grade">{farm.exportGrade}</span>
                      </div>
                      <div className="farm-select-stats">
                        <span className={`status-dot ${farm.status}`}></span>
                        <span>{farm.temperature?.toFixed(1)}°C</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom Dashboard */}
        <div className="dashboard-section">
          <div className="glass-card dashboard-card">
            <div className="dashboard-header">
              <h3>📊 Live Farm Metrics</h3>
              <div className="dashboard-refresh">🔄 Auto-updating every 10s</div>
            </div>
            
            <div className="dashboard-grid">
              {farms.map(farm => (
                <div key={`metric-${farm.id}`} className="dashboard-metric">
                  <div className="metric-header">
                    <span className="metric-farm">{farm.name}</span>
                    <span className={`metric-status ${farm.status}`}>{farm.status}</span>
                  </div>
                  <div className="metric-values">
                    <div className="value">
                      <span className="value-label">Temp:</span>
                      <span className="value-number">{farm.temperature?.toFixed(1)}°C</span>
                    </div>
                    <div className="value">
                      <span className="value-label">Health:</span>
                      <span className="value-number">{farm.cropHealth}%</span>
                    </div>
                    <div className="value">
                      <span className="value-label">Quality:</span>
                      <span className="value-number">{farm.qualityScore}%</span>
                    </div>
                  </div>
                  <div className="metric-progress">
                    <div 
                      className="progress-bar" 
                      style={{ width: `${farm.qualityScore}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="gold-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-info">
              <h5>Saffron Emporial AI Network</h5>
              <p>World's Most Advanced Agricultural Intelligence Platform</p>
            </div>
            <div className="footer-stats">
              <span>🛰️ 9 Satellites Active</span>
              <span>🌾 {farms.length} Farms Monitoring</span>
              <span>🤖 12 AI Models Running</span>
              <span>📈 99.2% Prediction Accuracy</span>
            </div>
            <div className="footer-time">
              Last Updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      </footer>
      
      {/* Floating Gold Particle Effect */}
      <div className="gold-particles"></div>
      
      {/* Export Simulation Animation */}
      {showExportRoutes && (
        <div className="export-animation">
          <div className="ship-animation">🚢</div>
          <div className="route-line"></div>
        </div>
      )}
    </div>
  );
}

export default LiveFarmAi;