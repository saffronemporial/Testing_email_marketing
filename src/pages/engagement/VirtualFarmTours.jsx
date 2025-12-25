// VirtualFarmTours.jsx
import React, { useState, useEffect } from 'react';
import './VirtualFarmTours.css';

const VirtualFarmTours = () => {
  const [activeFarm, setActiveFarm] = useState('saffron');
  const [activeView, setActiveView] = useState('360');
  const [selectedSeason, setSelectedSeason] = useState('harvest');
  const [currentHotspot, setCurrentHotspot] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const farmsData = {
    saffron: {
      id: 'saffron',
      name: 'Kashmir Saffron Fields',
      location: 'Pampore, Jammu & Kashmir',
      elevation: '1,600 meters',
      size: '250 acres',
      farmers: 120,
      established: 1998,
      description: 'World-renowned saffron cultivation in the pristine valleys of Kashmir',
      heroImage: '🌄',
      seasons: {
        planting: { name: 'Planting Season', months: 'Apr-May', activity: 'Bulb planting in well-drained soil' },
        growth: { name: 'Growth Phase', months: 'Jun-Sep', activity: 'Natural irrigation from snowmelt' },
        harvest: { name: 'Harvest Season', months: 'Oct-Nov', activity: 'Manual flower picking at dawn' },
        processing: { name: 'Processing', months: 'Nov-Dec', activity: 'Traditional stigma separation and drying' }
      },
      hotspots: [
        { id: 1, x: 30, y: 40, title: 'Saffron Flower Beds', info: 'Pure Crocus Sativus cultivation' },
        { id: 2, x: 60, y: 25, title: 'Drying Facility', info: 'Temperature-controlled drying rooms' },
        { id: 3, x: 45, y: 65, title: 'Quality Lab', info: 'ISO-certified testing laboratory' },
        { id: 4, x: 75, y: 50, title: 'Packaging Unit', info: 'Hygienic packaging for export' }
      ],
      products: ['Premium Saffron Strands', 'Saffron Powder', 'Saffron Oil'],
      certifications: ['ISO 22000', 'Geographical Indication', 'Organic Certified']
    },
    pomegranate: {
      id: 'pomegranate',
      name: 'Maharashtra Pomegranate Orchards',
      location: 'Solapur, Maharashtra',
      elevation: '500 meters',
      size: '800 acres',
      farmers: 85,
      established: 2005,
      description: 'Lush orchards producing premium Bhagwa and Ganesh varieties',
      heroImage: '🌳',
      seasons: {
        flowering: { name: 'Flowering', months: 'Jan-Feb', activity: 'Natural pollination and flower care' },
        fruiting: { name: 'Fruit Development', months: 'Mar-Jun', activity: 'Organic nutrient management' },
        harvest: { name: 'Harvest Season', months: 'Jul-Sep', activity: 'Selective hand-picking' },
        pruning: { name: 'Pruning', months: 'Oct-Dec', activity: 'Tree maintenance and preparation' }
      },
      hotspots: [
        { id: 1, x: 25, y: 35, title: 'Bhagwa Variety Section', info: 'Deep red, sweet variety' },
        { id: 2, x: 65, y: 45, title: 'Ganesh Variety Section', info: 'Light pink, slightly tart' },
        { id: 3, x: 50, y: 70, title: 'Packing House', info: 'Grade sorting and packaging' },
        { id: 4, x: 80, y: 25, title: 'Cold Storage', info: 'Temperature-controlled preservation' }
      ],
      products: ['Bhagwa Pomegranate', 'Ganesh Pomegranate', 'Pomegranate Arils'],
      certifications: ['APEDA Certified', 'GlobalG.A.P.', 'ISO 9001']
    },
    granite: {
      id: 'granite',
      name: 'Rajasthan Granite Quarries',
      location: 'Udaipur, Rajasthan',
      elevation: '300 meters',
      size: '1,200 acres',
      workers: 200,
      established: 1995,
      description: 'Massive granite deposits with premium stone varieties',
      heroImage: '⛰️',
      seasons: {
        extraction: { name: 'Quarrying', months: 'Year-round', activity: 'Modern block extraction techniques' },
        processing: { name: 'Processing', months: 'Year-round', activity: 'Cutting and polishing' },
        quality: { name: 'Quality Control', months: 'Year-round', activity: 'Grade classification' },
        shipping: { name: 'Export Preparation', months: 'Year-round', activity: 'Packaging for international shipping' }
      },
      hotspots: [
        { id: 1, x: 35, y: 30, title: 'Absolute Black Quarry', info: 'Premium black granite extraction' },
        { id: 2, x: 60, y: 55, title: 'Processing Plant', info: 'Advanced cutting and polishing' },
        { id: 3, x: 75, y: 40, title: 'Quality Lab', info: 'Strength and quality testing' },
        { id: 4, x: 45, y: 70, title: 'Export Yard', info: 'Ready-to-ship blocks and slabs' }
      ],
      products: ['Absolute Black', 'Kashmir White', 'Steel Grey', 'Imperial Red'],
      certifications: ['ISO 14001', 'Bureau of Indian Standards', 'CE Certified']
    }
  };

  const farmerStories = [
    {
      id: 1,
      name: 'Abdul Rahman',
      farm: 'Saffron Fields',
      experience: '25 years',
      story: 'Third-generation saffron farmer preserving traditional methods while adopting modern quality standards',
      image: '👨‍🌾',
      achievement: 'National Award for Organic Farming 2020'
    },
    {
      id: 2,
      name: 'Priya Patil',
      farm: 'Pomegranate Orchards',
      experience: '12 years',
      story: 'Transformed family orchard into export-quality production with sustainable practices',
      image: '👩‍🌾',
      achievement: 'Women Entrepreneur of the Year 2021'
    },
    {
      id: 3,
      name: 'Rajesh Kumar',
      farm: 'Granite Quarries',
      experience: '18 years',
      story: 'Pioneered ethical mining practices and worker welfare programs',
      image: '👨‍💼',
      achievement: 'Sustainable Business Leadership Award 2019'
    }
  ];

  const cropTimeline = [
    { month: 'Jan', saffron: 'dormant', pomegranate: 'flowering', granite: 'active' },
    { month: 'Feb', saffron: 'dormant', pomegranate: 'flowering', granite: 'active' },
    { month: 'Mar', saffron: 'preparation', pomegranate: 'fruiting', granite: 'active' },
    { month: 'Apr', saffron: 'planting', pomegranate: 'fruiting', granite: 'active' },
    { month: 'May', saffron: 'planting', pomegranate: 'fruiting', granite: 'active' },
    { month: 'Jun', saffron: 'growth', pomegranate: 'fruiting', granite: 'active' },
    { month: 'Jul', saffron: 'growth', pomegranate: 'harvest', granite: 'active' },
    { month: 'Aug', saffron: 'growth', pomegranate: 'harvest', granite: 'active' },
    { month: 'Sep', saffron: 'growth', pomegranate: 'harvest', granite: 'active' },
    { month: 'Oct', saffron: 'harvest', pomegranate: 'pruning', granite: 'active' },
    { month: 'Nov', saffron: 'harvest', pomegranate: 'pruning', granite: 'active' },
    { month: 'Dec', saffron: 'processing', pomegranate: 'pruning', granite: 'active' }
  ];

  const handleHotspotClick = (hotspot) => {
    setCurrentHotspot(hotspot);
    setTimeout(() => {
      setCurrentHotspot(null);
    }, 4000);
  };

  const playTimelapse = () => {
    setIsPlaying(true);
    setTimeout(() => setIsPlaying(false), 5000);
  };

  return (
    <section id="virtual-farm-tours" className="virtual-farm-section">
      <div className="farm-container">
        {/* Header */}
        <div className="farm-header">
          <h2 className="farm-title">
            <span className="title-glitch">Immersive Virtual Farm Tours</span>
          </h2>
          <p className="farm-subtitle">
            Explore Our Global Operations in 360° Interactive Experiences
          </p>
        </div>

        {/* Farm Selection */}
        <div className="farm-selection">
          {Object.values(farmsData).map(farm => (
            <button
              key={farm.id}
              className={`farm-tab ${activeFarm === farm.id ? 'active' : ''}`}
              onClick={() => setActiveFarm(farm.id)}
            >
              <span className="farm-icon">{farm.heroImage}</span>
              <span className="farm-name">{farm.name}</span>
            </button>
          ))}
        </div>

        {/* Main Tour Container */}
        <div className="tour-container">
          {/* Left Panel - Farm Information */}
          <div className="farm-info-panel">
            <div className="farm-basic-info">
              <h3 className="farm-location">{farmsData[activeFarm].location}</h3>
              <div className="farm-stats">
                <div className="stat">
                  <span className="stat-value">{farmsData[activeFarm].size}</span>
                  <span className="stat-label">Total Area</span>
                </div>
                <div className="stat">
                  <span className="stat-value">{farmsData[activeFarm].farmers || farmsData[activeFarm].workers}</span>
                  <span className="stat-label">{farmsData[activeFarm].workers ? 'Workers' : 'Farmers'}</span>
                </div>
                <div className="stat">
                  <span className="stat-value">{farmsData[activeFarm].established}</span>
                  <span className="stat-label">Established</span>
                </div>
              </div>
            </div>

            {/* Seasonal Timeline */}
            <div className="seasonal-timeline">
              <h4>Seasonal Activities</h4>
              <div className="season-buttons">
                {Object.entries(farmsData[activeFarm].seasons).map(([key, season]) => (
                  <button
                    key={key}
                    className={`season-btn ${selectedSeason === key ? 'active' : ''}`}
                    onClick={() => setSelectedSeason(key)}
                  >
                    <span className="season-name">{season.name}</span>
                    <span className="season-months">{season.months}</span>
                  </button>
                ))}
              </div>
              <div className="season-detail">
                <h5>{farmsData[activeFarm].seasons[selectedSeason].name}</h5>
                <p>{farmsData[activeFarm].seasons[selectedSeason].activity}</p>
              </div>
            </div>

            {/* Products & Certifications */}
            <div className="farm-details">
              <div className="products-list">
                <h4>Main Products</h4>
                <div className="product-tags">
                  {farmsData[activeFarm].products.map((product, index) => (
                    <span key={index} className="product-tag">{product}</span>
                  ))}
                </div>
              </div>
              <div className="certifications">
                <h4>Certifications</h4>
                <div className="cert-badges">
                  {farmsData[activeFarm].certifications.map((cert, index) => (
                    <span key={index} className="cert-badge">{cert}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Center Panel - Interactive Tour */}
          <div className="interactive-tour">
            {/* View Mode Selector */}
            <div className="view-selector">
              <button 
                className={`view-btn ${activeView === '360' ? 'active' : ''}`}
                onClick={() => setActiveView('360')}
              >
                360° Explorer
              </button>
              <button 
                className={`view-btn ${activeView === 'drone' ? 'active' : ''}`}
                onClick={() => setActiveView('drone')}
              >
                Drone View
              </button>
              <button 
                className={`view-btn ${activeView === 'timelapse' ? 'active' : ''}`}
                onClick={playTimelapse}
              >
                Growth Timelapse
              </button>
            </div>

            {/* Interactive Farm Display */}
            <div className="farm-display">
              {activeView === '360' && (
                <div className="farm-360-view">
                  <div className="farm-scene">
                    {farmsData[activeFarm].hotspots.map(hotspot => (
                      <button
                        key={hotspot.id}
                        className="hotspot"
                        style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
                        onClick={() => handleHotspotClick(hotspot)}
                      >
                        <div className="hotspot-pulse"></div>
                        <div className="hotspot-center"></div>
                      </button>
                    ))}
                  </div>
                  <div className="scene-description">
                    Interactive {farmsData[activeFarm].name} - Click on glowing points to explore
                  </div>
                </div>
              )}

              {activeView === 'drone' && (
                <div className="drone-view">
                  <div className="drone-feed">
                    <div className="drone-hud">
                      <div className="hud-stats">
                        <span>ALT: 150m</span>
                        <span>SPD: 25km/h</span>
                        <span>LIVE</span>
                      </div>
                    </div>
                    <div className="drone-overlay">
                      <div className="grid-overlay"></div>
                      <div className="scan-line"></div>
                    </div>
                  </div>
                </div>
              )}

              {activeView === 'timelapse' && (
                <div className="timelapse-view">
                  <div className={`timelapse-container ${isPlaying ? 'playing' : ''}`}>
                    <div className="growth-stages">
                      <div className="stage stage-1">Planting</div>
                      <div className="stage stage-2">Growth</div>
                      <div className="stage stage-3">Flowering</div>
                      <div className="stage stage-4">Harvest</div>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Hotspot Info Popup */}
            {currentHotspot && (
              <div className="hotspot-info-popup">
                <h4>{currentHotspot.title}</h4>
                <p>{currentHotspot.info}</p>
                <button className="close-popup" onClick={() => setCurrentHotspot(null)}>×</button>
              </div>
            )}
          </div>

          {/* Right Panel - Farmer Stories */}
          <div className="farmer-stories-panel">
            <h3 className="stories-title">Farmer Stories</h3>
            <div className="stories-list">
              {farmerStories.map(farmer => (
                <div key={farmer.id} className="farmer-card">
                  <div className="farmer-avatar">{farmer.image}</div>
                  <div className="farmer-info">
                    <h4>{farmer.name}</h4>
                    <p className="farmer-farm">{farmer.farm}</p>
                    <p className="farmer-experience">{farmer.experience} experience</p>
                    <p className="farmer-story">{farmer.story}</p>
                    <div className="farmer-achievement">
                      <span>🏆 {farmer.achievement}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Annual Timeline */}
            <div className="annual-timeline">
              <h4>Annual Crop Calendar</h4>
              <div className="timeline-visual">
                {cropTimeline.map(month => (
                  <div key={month.month} className="timeline-month">
                    <div className="month-name">{month.month}</div>
                    <div className="crop-status">
                      <div className={`status ${month.saffron}`} title="Saffron"></div>
                      <div className={`status ${month.pomegranate}`} title="Pomegranate"></div>
                      <div className={`status ${month.granite}`} title="Granite"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Export Quality Metrics */}
        <div className="quality-metrics">
          <h3 className="metrics-title">Export Quality Standards</h3>
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-value">99.7%</div>
              <div className="metric-label">Purity Rate</div>
              <div className="metric-bar">
                <div className="metric-fill" style={{width: '99.7%'}}></div>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-value">48H</div>
              <div className="metric-label">Harvest to Processing</div>
              <div className="metric-bar">
                <div className="metric-fill" style={{width: '100%'}}></div>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-value">0°C</div>
              <div className="metric-label">Cold Chain Maintenance</div>
              <div className="metric-bar">
                <div className="metric-fill" style={{width: '98.5%'}}></div>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-value">100%</div>
              <div className="metric-label">Traceability</div>
              <div className="metric-bar">
                <div className="metric-fill" style={{width: '100%'}}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VirtualFarmTours;