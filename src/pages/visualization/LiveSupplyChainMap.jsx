// src/components/public/visualization/LiveSupplyChainMap.jsx
import React, { useState, useEffect } from 'react';
import { indianFarmsAndFactories, exportDestinations, supplyChainData } from '../data/indianExportData';
import './LiveSupplyChainMap.css';

const LiveSupplyChainMap = () => {
  const [activeShipment, setActiveShipment] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState('all');
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const getProductColor = (productType) => {
    const colors = {
      pomegranate: '#e74c3c',
      cardamom: '#27ae60',
      granite: '#34495e',
      medicines: '#3498db',
      agroProducts: '#f39c12',
      electricToys: '#9b59b6',
      onions: '#e67e22',
      redChilly: '#c0392b',
      grapes: '#8e44ad'
    };
    return colors[productType] || '#95a5a6';
  };

  const getActiveShipments = () => {
    return supplyChainData.activeShipments.map(shipment => ({
      ...shipment,
      product: ['pomegranate', 'cardamom', 'granite', 'medicines'][Math.floor(Math.random() * 4)],
      progress: isPlaying ? (shipment.progress + 1) % 100 : shipment.progress
    }));
  };

  const calculatePosition = (coordinates, viewport) => {
    // Simplified calculation for demo purposes
    const [lat, lng] = coordinates;
    const x = ((lng + 180) / 360) * viewport.width;
    const y = ((90 - lat) / 180) * viewport.height;
    return { x, y };
  };

  const getShipmentRoute = (from, to) => {
    const fromCoords = indianFarmsAndFactories.find(f => f.name === from)?.coordinates || [20, 77];
    const toCoords = exportDestinations.find(d => d.city === to.split(', ')[0])?.coordinates || [25, 55];
    
    return {
      from: fromCoords,
      to: toCoords,
      points: [
        fromCoords,
        [fromCoords[0] + (toCoords[0] - fromCoords[0]) * 0.3, fromCoords[1] + (toCoords[1] - fromCoords[1]) * 0.3],
        [fromCoords[0] + (toCoords[0] - fromCoords[0]) * 0.7, fromCoords[1] + (toCoords[1] - fromCoords[1]) * 0.7],
        toCoords
      ]
    };
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'Asia/Kolkata'
    });
  };

  const activeShipments = getActiveShipments();

  return (
    <div className="supply-chain-map-section">
      <div className="map-container">
        <div className="map-header">
          <div className="header-gold-bar"></div>
          <h2>Live Global Supply Chain Network</h2>
          <p>Real-time tracking of Indian export shipments across the world</p>
          <div className="map-controls">
            <div className="time-display">
              <span className="time-icon">🕒</span>
              <span className="time-label">IST: {formatTime(currentTime)}</span>
            </div>
            <div className="control-buttons">
              <button 
                className={`control-btn ${isPlaying ? 'active' : ''}`}
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? '⏸️ Pause' : '▶️ Play'}
              </button>
              <select 
                className="product-filter"
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
              >
                <option value="all">All Products</option>
                <option value="pomegranate">Pomegranate</option>
                <option value="cardamom">Cardamom</option>
                <option value="granite">Granite</option>
                <option value="medicines">Medicines</option>
                <option value="agroProducts">Agro Products</option>
                <option value="electricToys">Electric Toys</option>
                <option value="onions">Onions</option>
                <option value="redChilly">Red Chilly</option>
                <option value="grapes">Grapes</option>
              </select>
            </div>
          </div>
        </div>

        <div className="map-content">
          <div className="world-map">
            <div className="map-visual">
              {/* India Highlight */}
              <div className="india-region">
                <div className="india-label">🇮🇳 India</div>
                <div className="india-glow"></div>
              </div>

              {/* Farm Locations */}
              {indianFarmsAndFactories.map((farm, index) => (
                <div 
                  key={farm.id}
                  className="farm-marker"
                  style={{
                    left: `${20 + index * 8}%`,
                    top: `${30 + (index % 3) * 15}%`
                  }}
                  data-product={farm.product}
                >
                  <div 
                    className="marker-dot"
                    style={{ backgroundColor: getProductColor(farm.product) }}
                  ></div>
                  <div className="marker-pulse"></div>
                  <div className="farm-tooltip">
                    <div className="tooltip-header">
                      <span className="farm-name">{farm.name}</span>
                      <span className="farm-status active">● Active</span>
                    </div>
                    <div className="tooltip-body">
                      <div className="tooltip-item">
                        <span>Product:</span>
                        <span className="product-tag">{farm.product}</span>
                      </div>
                      <div className="tooltip-item">
                        <span>Location:</span>
                        <span>{farm.city}, {farm.state}</span>
                      </div>
                      <div className="tooltip-item">
                        <span>Capacity:</span>
                        <span>{farm.capacity}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Destination Hubs */}
              {exportDestinations.map((destination, index) => (
                <div 
                  key={destination.country}
                  className="destination-marker"
                  style={{
                    left: `${70 + (index % 3) * 8}%`,
                    top: `${20 + Math.floor(index / 3) * 25}%`
                  }}
                >
                  <div className="destination-dot">
                    <div className="hub-icon">🏢</div>
                  </div>
                  <div className="destination-tooltip">
                    <div className="tooltip-header">
                      <span className="destination-name">{destination.city}</span>
                      <span className="destination-country">{destination.country}</span>
                    </div>
                    <div className="tooltip-body">
                      <div className="tooltip-item">
                        <span>Volume:</span>
                        <span className={`volume ${destination.volume.toLowerCase()}`}>
                          {destination.volume}
                        </span>
                      </div>
                      <div className="tooltip-item">
                        <span>Products:</span>
                        <span>{destination.products.join(', ')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Active Shipments */}
              {activeShipments.map((shipment, index) => {
                const route = getShipmentRoute(shipment.from, shipment.to);
                return (
                  <div key={shipment.id} className="shipment-track">
                    <div 
                      className="shipment-marker"
                      style={{
                        left: `${30 + (shipment.progress / 100) * 40}%`,
                        top: `${25 + (index % 4) * 15}%`
                      }}
                      onClick={() => setActiveShipment(shipment)}
                    >
                      <div 
                        className="shipment-dot"
                        style={{ backgroundColor: getProductColor(shipment.product) }}
                      >
                        <div className="plane-icon">✈️</div>
                      </div>
                      <div className="shipment-trail"></div>
                    </div>
                    
                    {/* Route Line */}
                    <div className="route-line">
                      <div 
                        className="route-progress"
                        style={{ width: `${shipment.progress}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}

              {/* Ocean Routes */}
              <div className="ocean-routes">
                <div className="route india-dubai"></div>
                <div className="route india-usa"></div>
                <div className="route india-uk"></div>
                <div className="route india-singapore"></div>
              </div>
            </div>
          </div>

          <div className="map-sidebar">
            <div className="sidebar-section active-shipments">
              <h3>Active Shipments</h3>
              <div className="shipments-list">
                {activeShipments.map(shipment => (
                  <div 
                    key={shipment.id}
                    className={`shipment-card ${activeShipment?.id === shipment.id ? 'active' : ''}`}
                    onClick={() => setActiveShipment(shipment)}
                  >
                    <div className="shipment-header">
                      <div className="shipment-id">{shipment.id}</div>
                      <div 
                        className="product-indicator"
                        style={{ backgroundColor: getProductColor(shipment.product) }}
                      ></div>
                    </div>
                    <div className="shipment-route">
                      <span className="origin">{shipment.from}</span>
                      <span className="arrow">→</span>
                      <span className="destination">{shipment.to}</span>
                    </div>
                    <div className="shipment-progress">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ width: `${shipment.progress}%` }}
                        ></div>
                      </div>
                      <span className="progress-text">{shipment.progress}%</span>
                    </div>
                    <div className="shipment-status">
                      <span className={`status ${shipment.status}`}>
                        {shipment.status === 'in_transit' ? '🚛 In Transit' : 
                         shipment.status === 'customs' ? '🏛️ Customs' : '✈️ Departed'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="sidebar-section stats-overview">
              <h3>Supply Chain Stats</h3>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">🚢</div>
                  <div className="stat-content">
                    <div className="stat-value">{activeShipments.length}</div>
                    <div className="stat-label">Active Shipments</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">🌍</div>
                  <div className="stat-content">
                    <div className="stat-value">{exportDestinations.length}</div>
                    <div className="stat-label">Destinations</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">🏭</div>
                  <div className="stat-content">
                    <div className="stat-value">{indianFarmsAndFactories.length}</div>
                    <div className="stat-label">Indian Sources</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">⏱️</div>
                  <div className="stat-content">
                    <div className="stat-value">99.2%</div>
                    <div className="stat-label">On-time Delivery</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {activeShipment && (
          <div className="shipment-detail-modal">
            <div className="modal-backdrop" onClick={() => setActiveShipment(null)}></div>
            <div className="modal-content">
              <div className="modal-header">
                <h3>Shipment Details</h3>
                <button className="close-btn" onClick={() => setActiveShipment(null)}>×</button>
              </div>
              <div className="modal-body">
                <div className="detail-section">
                  <div className="detail-row">
                    <span className="label">Shipment ID:</span>
                    <span className="value">{activeShipment.id}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Route:</span>
                    <span className="value">{activeShipment.from} → {activeShipment.to}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Current Status:</span>
                    <span className="value status-badge">{activeShipment.status}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Progress:</span>
                    <span className="value">{activeShipment.progress}% Complete</span>
                  </div>
                </div>
                
                <div className="timeline-section">
                  <h4>Shipment Timeline</h4>
                  <div className="timeline">
                    <div className="timeline-item completed">
                      <div className="timeline-marker"></div>
                      <div className="timeline-content">
                        <div className="timeline-title">Departure from Origin</div>
                        <div className="timeline-time">2 hours ago</div>
                      </div>
                    </div>
                    <div className="timeline-item active">
                      <div className="timeline-marker"></div>
                      <div className="timeline-content">
                        <div className="timeline-title">In Transit</div>
                        <div className="timeline-time">Current</div>
                      </div>
                    </div>
                    <div className="timeline-item upcoming">
                      <div className="timeline-marker"></div>
                      <div className="timeline-content">
                        <div className="timeline-title">Customs Clearance</div>
                        <div className="timeline-time">Estimated: 12 hours</div>
                      </div>
                    </div>
                    <div className="timeline-item upcoming">
                      <div className="timeline-marker"></div>
                      <div className="timeline-content">
                        <div className="timeline-title">Delivery at Destination</div>
                        <div className="timeline-time">Estimated: 24 hours</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="action-buttons">
                  <button className="action-btn primary">
                    <span className="btn-icon">📱</span>
                    Track on Mobile
                  </button>
                  <button className="action-btn secondary">
                    <span className="btn-icon">📧</span>
                    Get Updates
                  </button>
                  <button className="action-btn secondary">
                    <span className="btn-icon">📄</span>
                    Export Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveSupplyChainMap;