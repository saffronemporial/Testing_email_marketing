// src/components/public/interactive/LiveOrderTicker.jsx
import React, { useState, useEffect } from 'react';
import { indianOrders, indianProducts } from '../data/indianExportData';
import './LiveOrderTicker.css';

const LiveOrderTicker = () => {
  const [currentOrders, setCurrentOrders] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [stats, setStats] = useState({ totalOrders: 0, totalValue: 0, activeShipments: 0 });

  useEffect(() => {
    // Filter recent orders (last 7 days) and take top 15
    const oneWeekAgo = new Date(Date.now() - 7 * 86400000);
    const recentOrders = indianOrders
      .filter(order => new Date(order.timestamp) > oneWeekAgo)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 15);
    
    setCurrentOrders(recentOrders);

    // Calculate stats
    const totalValue = recentOrders.reduce((sum, order) => sum + order.valueNumber, 0);
    const activeShipments = recentOrders.filter(order => order.status === 'processing').length;
    
    setStats({
      totalOrders: recentOrders.length,
      totalValue,
      activeShipments
    });
  }, []);

  useEffect(() => {
    if (currentOrders.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % currentOrders.length);
    }, 3500);

    return () => clearInterval(interval);
  }, [currentOrders.length]);

  if (currentOrders.length === 0) return null;

  const currentOrder = currentOrders[currentIndex];

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit',
      timeZone: 'Asia/Kolkata'
    });
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      timeZone: 'Asia/Kolkata'
    });
  };

  const getProductIcon = (productCategory) => {
    const icons = {
      pomegranate: '🍎',
      cardamom: '🌿',
      granite: '🏔️',
      medicines: '💊',
      agroProducts: '🌾',
      electricToys: '🤖',
      onions: '🧅',
      redChilly: '🌶️',
      grapes: '🍇'
    };
    return icons[productCategory] || '📦';
  };

  return (
    <div className="gold-order-ticker">
      <div className="ticker-header">
        <div className="header-left">
          <div className="live-indicator">
            <span className="pulse-dot"></span>
            <span className="live-text">LIVE EXPORT ORDERS</span>
            <span className="india-flag">🇮🇳 → 🇦🇪</span>
          </div>
          <div className="ticker-stats">
            <div className="stat">
              <span className="stat-value">{stats.totalOrders}</span>
              <span className="stat-label">Orders This Week</span>
            </div>
            <div className="stat">
              <span className="stat-value">${(stats.totalValue / 1000).toFixed(0)}K</span>
              <span className="stat-label">Export Value</span>
            </div>
            <div className="stat">
              <span className="stat-value">{stats.activeShipments}</span>
              <span className="stat-label">Active Shipments</span>
            </div>
          </div>
        </div>
        
        <div className="header-right">
          <div className="real-time-indicator">
            <div className="clock-icon">🕒</div>
            <span>Indian Standard Time</span>
            <div className="current-time">
              {new Date().toLocaleTimeString('en-IN', { 
                timeZone: 'Asia/Kolkata',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              })}
            </div>
          </div>
        </div>
      </div>
      
      <div className="ticker-content">
        <div className="order-card-gold">
          <div className="order-badge">
            {getProductIcon(currentOrder.productCategory)}
          </div>
          
          <div className="order-main">
            <div className="order-client">{currentOrder.client}</div>
            <div className="order-product">{currentOrder.product}</div>
          </div>
          
          <div className="order-details">
            <div className="detail-group">
              <span className="detail-label">Quantity</span>
              <span className="detail-value">{currentOrder.quantity}</span>
            </div>
            <div className="detail-group">
              <span className="detail-label">Value</span>
              <span className="detail-value gold-text">{currentOrder.value}</span>
            </div>
          </div>
          
          <div className="order-route">
            <div className="route-path">
              <span className="origin">{currentOrder.origin}</span>
              <div className="route-line">
                <div className="plane-icon">✈️</div>
              </div>
              <span className="destination">{currentOrder.destination}</span>
            </div>
          </div>
          
          <div className="order-meta">
            <div className="meta-item">
              <span className="meta-icon">📅</span>
              <span>{formatDate(currentOrder.timestamp)}</span>
            </div>
            <div className="meta-item">
              <span className="meta-icon">🕒</span>
              <span>{formatTime(currentOrder.timestamp)} IST</span>
            </div>
            <div className={`status-badge ${currentOrder.status}`}>
              {currentOrder.status === 'completed' ? '✅ Delivered' : '🚛 In Transit'}
            </div>
          </div>
        </div>
      </div>

      <div className="ticker-progress">
        {currentOrders.slice(0, 8).map((_, index) => (
          <div
            key={index}
            className={`progress-dot ${index === currentIndex ? 'active' : ''}`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
        {currentOrders.length > 8 && (
          <div className="more-indicator">+{currentOrders.length - 8} more</div>
        )}
      </div>

      <div className="ticker-footer">
        <div className="export-highlight">
          <span className="highlight-text">🇮🇳 Made in India • 🌍 Exported Worldwide • 💎 Quality Guaranteed</span>
        </div>
      </div>
    </div>
  );
};

export default LiveOrderTicker;