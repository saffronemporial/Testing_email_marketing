// src/components/public/visualization/LiveInventory.jsx
import React, { useState, useEffect } from 'react';
import { inventoryData, indianProducts, indianFarmsAndFactories } from '../data/indianExportData';
import './LiveInventory.css';

const LiveInventory = () => {
  const [inventory, setInventory] = useState(inventoryData);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [timeFilter, setTimeFilter] = useState('realtime');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRotating, setIsRotating] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      if (isRotating) {
        // Simulate real-time inventory updates
        setInventory(prev => ({
          ...prev,
          currentStock: Object.keys(prev.currentStock).reduce((acc, product) => {
            const current = prev.currentStock[product];
            const randomChange = Math.random() > 0.7 ? -Math.floor(Math.random() * 5) : Math.floor(Math.random() * 3);
            const newQuantity = Math.max(0, parseInt(current.quantity) + randomChange);
            
            acc[product] = {
              ...current,
              quantity: `${newQuantity}kg`,
              status: newQuantity < 50 ? 'low' : newQuantity < 100 ? 'limited' : 'available'
            };
            return acc;
          }, {})
        }));
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isRotating]);

  const getStockLevelColor = (status) => {
    switch (status) {
      case 'available': return '#27ae60';
      case 'limited': return '#f39c12';
      case 'low': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  const getStockLevelIcon = (status) => {
    switch (status) {
      case 'available': return '🟢';
      case 'limited': return '🟡';
      case 'low': return '🔴';
      default: return '⚪';
    }
  };

  const calculateStockValue = () => {
    return Object.entries(inventory.currentStock).reduce((total, [product, data]) => {
      const productInfo = Object.values(indianProducts).find(p => p.name === product);
      const price = productInfo ? (productInfo.priceRange.min + productInfo.priceRange.max) / 2 : 1000;
      const quantity = parseInt(data.quantity);
      return total + (quantity * price);
    }, 0);
  };

  const getNextHarvestDate = () => {
    const nextHarvest = inventory.harvestSchedule.find(batch => batch.status === 'upcoming');
    return nextHarvest ? new Date(nextHarvest.harvestDate) : null;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const filteredProducts = Object.entries(inventory.currentStock).filter(([productName]) =>
    productName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="live-inventory-section">
      <div className="inventory-container">
        {/* Futuristic Header */}
        <div className="inventory-header">
          <div className="header-hologram"></div>
          <h2 className="neon-text">LIVE INVENTORY CONTROL SYSTEM</h2>
          <p className="subtitle">Real-time Stock Management & Predictive Analytics</p>
          
          <div className="control-panel">
            <div className="system-status">
              <div className="status-indicator online">
                <div className="pulse-dot"></div>
                SYSTEM ONLINE
              </div>
              <div className="last-update">
                Last Update: {new Date().toLocaleTimeString('en-IN')} IST
              </div>
            </div>
            
            <div className="control-buttons">
              <button 
                className={`control-btn ${isRotating ? 'active' : ''}`}
                onClick={() => setIsRotating(!isRotating)}
              >
                <span className="btn-icon">{isRotating ? '⏸️' : '▶️'}</span>
                {isRotating ? 'PAUSE FEED' : 'LIVE FEED'}
              </button>
              
              <select 
                className="time-filter"
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
              >
                <option value="realtime">REAL-TIME</option>
                <option value="today">TODAY</option>
                <option value="week">THIS WEEK</option>
                <option value="month">THIS MONTH</option>
              </select>
            </div>
          </div>
        </div>

        <div className="inventory-content">
          {/* Left Panel - Overview & Analytics */}
          <div className="left-panel">
            {/* Inventory Summary */}
            <div className="summary-card robotic">
              <div className="card-header">
                <h3>INVENTORY OVERVIEW</h3>
                <div className="scan-animation"></div>
              </div>
              <div className="summary-grid">
                <div className="summary-item">
                  <div className="summary-icon">📊</div>
                  <div className="summary-content">
                    <div className="summary-value">{Object.keys(inventory.currentStock).length}</div>
                    <div className="summary-label">ACTIVE PRODUCTS</div>
                  </div>
                </div>
                <div className="summary-item">
                  <div className="summary-icon">💰</div>
                  <div className="summary-content">
                    <div className="summary-value">{formatCurrency(calculateStockValue())}</div>
                    <div className="summary-label">TOTAL VALUE</div>
                  </div>
                </div>
                <div className="summary-item">
                  <div className="summary-icon">📦</div>
                  <div className="summary-content">
                    <div className="summary-value">
                      {Object.values(inventory.currentStock).reduce((sum, item) => sum + parseInt(item.quantity), 0)}kg
                    </div>
                    <div className="summary-label">TOTAL STOCK</div>
                  </div>
                </div>
                <div className="summary-item">
                  <div className="summary-icon">🚨</div>
                  <div className="summary-content">
                    <div className="summary-value">
                      {Object.values(inventory.currentStock).filter(item => item.status === 'low').length}
                    </div>
                    <div className="summary-label">LOW STOCK ALERTS</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Harvest Schedule */}
            <div className="schedule-card robotic">
              <div className="card-header">
                <h3>HARVEST SCHEDULE</h3>
                <div className="calendar-icon">📅</div>
              </div>
              <div className="schedule-timeline">
                {inventory.harvestSchedule.map((batch, index) => (
                  <div key={index} className="schedule-item">
                    <div className="timeline-marker">
                      <div className="marker-dot"></div>
                      {index < inventory.harvestSchedule.length - 1 && <div className="timeline-line"></div>}
                    </div>
                    <div className="schedule-content">
                      <div className="batch-info">
                        <div className="batch-name">{batch.batch}</div>
                        <div className="batch-date">{batch.harvestDate}</div>
                      </div>
                      <div className="batch-details">
                        <span className="quantity">{batch.quantity}</span>
                        <span className={`status ${batch.status}`}>{batch.status}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Predictive Analytics */}
            <div className="analytics-card robotic">
              <div className="card-header">
                <h3>PREDICTIVE ANALYTICS</h3>
                <div className="ai-icon">🤖</div>
              </div>
              <div className="analytics-content">
                <div className="prediction-item">
                  <div className="prediction-label">Next Restock</div>
                  <div className="prediction-value">48 hours</div>
                  <div className="confidence">92% accuracy</div>
                </div>
                <div className="prediction-item">
                  <div className="prediction-label">Demand Spike</div>
                  <div className="prediction-value">+35% expected</div>
                  <div className="confidence">88% accuracy</div>
                </div>
                <div className="prediction-item">
                  <div className="prediction-label">Price Trend</div>
                  <div className="prediction-value positive">+12%</div>
                  <div className="confidence">85% accuracy</div>
                </div>
              </div>
            </div>
          </div>

          {/* Center Panel - 3D Inventory Visualization */}
          <div className="center-panel">
            <div className="inventory-visualization">
              <div className="visualization-header">
                <h3>3D INVENTORY MAP</h3>
                <div className="search-box">
                  <input
                    type="text"
                    placeholder="SEARCH PRODUCTS..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                  />
                  <div className="search-icon">🔍</div>
                </div>
              </div>

              <div className="warehouse-visual">
                {/* Animated Warehouse Structure */}
                <div className="warehouse-grid">
                  {filteredProducts.map(([productName, data], index) => {
                    const product = Object.values(indianProducts).find(p => p.name === productName);
                    const stockPercent = (parseInt(data.quantity) / 200) * 100;
                    
                    return (
                      <div 
                        key={productName}
                        className={`inventory-item ${selectedProduct?.name === productName ? 'selected' : ''}`}
                        style={{ '--stock-level': `${Math.min(stockPercent, 100)}%` }}
                        onClick={() => setSelectedProduct({ ...product, stockData: data })}
                      >
                        <div className="item-visual">
                          <div className="stock-level-indicator">
                            <div 
                              className="stock-fill"
                              style={{ 
                                height: `${Math.min(stockPercent, 100)}%`,
                                backgroundColor: getStockLevelColor(data.status)
                              }}
                            ></div>
                          </div>
                          <div className="product-icon">
                            {productName.includes('Pomegranate') ? '🍎' :
                             productName.includes('Cardamom') ? '🌿' :
                             productName.includes('Granite') ? '🏔️' :
                             productName.includes('Medicine') ? '💊' :
                             productName.includes('Agro') ? '🌾' :
                             productName.includes('Toy') ? '🤖' :
                             productName.includes('Onion') ? '🧅' :
                             productName.includes('Chilly') ? '🌶️' :
                             productName.includes('Grape') ? '🍇' : '📦'}
                          </div>
                        </div>
                        
                        <div className="item-info">
                          <div className="product-name">{productName}</div>
                          <div className="stock-info">
                            <span className="quantity">{data.quantity}</span>
                            <span className={`status ${data.status}`}>
                              {getStockLevelIcon(data.status)} {data.status.toUpperCase()}
                            </span>
                          </div>
                          <div className="next-harvest">
                            Next: {data.nextHarvest}
                          </div>
                        </div>

                        <div className="item-glow"></div>
                      </div>
                    );
                  })}
                </div>

                {/* Warehouse Environment */}
                <div className="warehouse-floor"></div>
                <div className="conveyor-belt">
                  <div className="belt-moving"></div>
                </div>
                <div className="robotic-arm">
                  <div className="arm-base"></div>
                  <div className="arm-segment"></div>
                  <div className="arm-claw"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Product Details & Actions */}
          <div className="right-panel">
            {selectedProduct ? (
              <div className="product-detail-card robotic">
                <div className="card-header">
                  <h3>PRODUCT DETAILS</h3>
                  <div className="product-badge">
                    <span className="badge-icon">🏷️</span>
                    LIVE
                  </div>
                </div>

                <div className="product-header">
                  <div className="product-icon-large">
                    {selectedProduct.name.includes('Pomegranate') ? '🍎' :
                     selectedProduct.name.includes('Cardamom') ? '🌿' :
                     selectedProduct.name.includes('Granite') ? '🏔️' :
                     selectedProduct.name.includes('Medicine') ? '💊' :
                     selectedProduct.name.includes('Agro') ? '🌾' :
                     selectedProduct.name.includes('Toy') ? '🤖' :
                     selectedProduct.name.includes('Onion') ? '🧅' :
                     selectedProduct.name.includes('Chilly') ? '🌶️' :
                     selectedProduct.name.includes('Grape') ? '🍇' : '📦'}
                  </div>
                  <div className="product-title">
                    <h4>{selectedProduct.name}</h4>
                    <div className="product-category">{selectedProduct.varieties?.[0]}</div>
                  </div>
                </div>

                <div className="stock-metrics">
                  <div className="metric">
                    <div className="metric-label">CURRENT STOCK</div>
                    <div className="metric-value">{selectedProduct.stockData.quantity}</div>
                    <div className="metric-status">
                      <span className={`status ${selectedProduct.stockData.status}`}>
                        {selectedProduct.stockData.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="metric">
                    <div className="metric-label">NEXT HARVEST</div>
                    <div className="metric-value">{selectedProduct.stockData.nextHarvest}</div>
                    <div className="metric-status">
                      <span className="status upcoming">UPCOMING</span>
                    </div>
                  </div>
                </div>

                <div className="product-specs">
                  <h5>PRODUCT SPECIFICATIONS</h5>
                  <div className="specs-grid">
                    <div className="spec-item">
                      <span className="spec-label">Grade:</span>
                      <span className="spec-value">{selectedProduct.grades?.[0]}</span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-label">Season:</span>
                      <span className="spec-value">{selectedProduct.seasons?.peak}</span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-label">Origin:</span>
                      <span className="spec-value">{selectedProduct.states?.[0]}, India</span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-label">Price Range:</span>
                      <span className="spec-value">
                        {formatCurrency(selectedProduct.priceRange?.min)} - {formatCurrency(selectedProduct.priceRange?.max)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="action-panel">
                  <h5>QUICK ACTIONS</h5>
                  <div className="action-buttons">
                    <button className="action-btn primary">
                      <span className="btn-icon">📦</span>
                      RESERVE STOCK
                    </button>
                    <button className="action-btn secondary">
                      <span className="btn-icon">📊</span>
                      VIEW ANALYTICS
                    </button>
                    <button className="action-btn secondary">
                      <span className="btn-icon">🔄</span>
                      SET ALERT
                    </button>
                  </div>
                </div>

                <div className="supplier-info">
                  <h5>ACTIVE SUPPLIERS</h5>
                  <div className="suppliers-list">
                    {indianFarmsAndFactories
                      .filter(farm => farm.product === selectedProduct.name.toLowerCase().split(' ')[0])
                      .slice(0, 2)
                      .map(farm => (
                        <div key={farm.id} className="supplier-item">
                          <div className="supplier-avatar">
                            {farm.name.split(' ').map(word => word[0]).join('')}
                          </div>
                          <div className="supplier-details">
                            <div className="supplier-name">{farm.name}</div>
                            <div className="supplier-location">{farm.city}, {farm.state}</div>
                          </div>
                          <div className="supplier-status online">●</div>
                        </div>
                      ))
                    }
                  </div>
                </div>
              </div>
            ) : (
              <div className="placeholder-card robotic">
                <div className="placeholder-icon">👆</div>
                <h4>SELECT A PRODUCT</h4>
                <p>Click on any product in the inventory visualization to view detailed information and perform actions.</p>
                <div className="placeholder-animation">
                  <div className="scan-line"></div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Panel - Alerts & Notifications */}
        <div className="bottom-panel">
          <div className="alerts-card robotic">
            <div className="card-header">
              <h3>SYSTEM ALERTS</h3>
              <div className="alert-indicator">
                <span className="alert-count">3</span>
                ACTIVE ALERTS
              </div>
            </div>
            <div className="alerts-list">
              <div className="alert-item critical">
                <div className="alert-icon">🚨</div>
                <div className="alert-content">
                  <div className="alert-title">LOW STOCK: Premium Pomegranate</div>
                  <div className="alert-message">Stock level critical. Reorder immediately.</div>
                </div>
                <div className="alert-time">2 min ago</div>
              </div>
              <div className="alert-item warning">
                <div className="alert-icon">⚠️</div>
                <div className="alert-content">
                  <div className="alert-title">HARVEST DELAY: Kashmir Spring Batch</div>
                  <div className="alert-message">Weather conditions affecting schedule.</div>
                </div>
                <div className="alert-time">1 hour ago</div>
              </div>
              <div className="alert-item info">
                <div className="alert-icon">ℹ️</div>
                <div className="alert-content">
                  <div className="alert-title">QUALITY CHECK: Organic Spanish Complete</div>
                  <div className="alert-message">Batch passed all quality standards.</div>
                </div>
                <div className="alert-time">3 hours ago</div>
              </div>
            </div>
          </div>

          <div className="export-readiness robotic">
            <div className="readiness-header">
              <h3>EXPORT READINESS</h3>
              <div className="readiness-score">98%</div>
            </div>
            <div className="readiness-metrics">
              <div className="readiness-item">
                <div className="metric-name">Stock Availability</div>
                <div className="metric-bar">
                  <div className="metric-fill" style={{width: '95%'}}></div>
                </div>
                <div className="metric-value">95%</div>
              </div>
              <div className="readiness-item">
                <div className="metric-name">Quality Compliance</div>
                <div className="metric-bar">
                  <div className="metric-fill" style={{width: '98%'}}></div>
                </div>
                <div className="metric-value">98%</div>
              </div>
              <div className="readiness-item">
                <div className="metric-name">Documentation</div>
                <div className="metric-bar">
                  <div className="metric-fill" style={{width: '92%'}}></div>
                </div>
                <div className="metric-value">92%</div>
              </div>
              <div className="readiness-item">
                <div className="metric-name">Logistics Ready</div>
                <div className="metric-bar">
                  <div className="metric-fill" style={{width: '96%'}}></div>
                </div>
                <div className="metric-value">96%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveInventory;