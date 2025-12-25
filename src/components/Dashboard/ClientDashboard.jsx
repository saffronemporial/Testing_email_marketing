// src/components/Dashboard/ClientDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../supabaseClient';
import { Link, useNavigate } from 'react-router-dom';
import './ClientDashboard.css';

const ClientDashboard = () => {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    activeShipments: 0,
    totalSpent: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentShipments, setRecentShipments] = useState([]);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, [user.id]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch client's orders
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('client_id', user.id)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Fetch client's shipments (via orders)
      const orderIds = orders.map(order => order.id);
      let shipments = [];
      if (orderIds.length > 0) {
        const { data: shipmentsData, error: shipmentsError } = await supabase
          .from('shipments')
          .select('*')
          .in('order_id', orderIds)
          .order('created_at', { ascending: false });
        
        if (shipmentsError) throw shipmentsError;
        shipments = shipmentsData || [];
      }

      // Fetch recent notifications
      const { data: notifications, error: notifError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (notifError) console.warn('Notifications error:', notifError);

      // Calculate statistics
      const totalOrders = orders.length;
      const pendingOrders = orders.filter(order => order.status === 'pending').length;
      const activeShipments = shipments.filter(shipment => 
        shipment.status === 'in_transit'
      ).length;
      
      // Calculate total spent from completed/delivered orders
      const completedOrders = orders.filter(order => 
        order.status === 'completed' || order.status === 'delivered'
      );
      const totalSpent = completedOrders.reduce((sum, order) => 
        sum + (parseFloat(order.total_amount) || 0), 0
      );

      // Get recent orders (last 5)
      const recentOrdersData = orders.slice(0, 5);
      
      // Get recent shipments (last 5)
      const recentShipmentsData = shipments.slice(0, 5);

      // Update state
      setStats({
        totalOrders,
        pendingOrders,
        activeShipments,
        totalSpent
      });
      
      setRecentOrders(recentOrdersData);
      setRecentShipments(recentShipmentsData);
      setRecentNotifications(notifications || []);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '₹0';
    
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': '#F39C12',
      'confirmed': '#3498DB',
      'processing': '#9B59B6',
      'packaging': '#1ABC9C',
      'in_transit': '#E74C3C',
      'delivered': '#27AE60',
      'completed': '#27AE60',
      'cancelled': '#95A5A6'
    };
    return colors[status] || '#95A5A6';
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="client-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1>
            <span className="gold-gradient">Export Dashboard</span>
          </h1>
          <p className="welcome-message">
            Welcome back, <strong>{userProfile?.company_name || user?.email}</strong>
          </p>
          {error && (
            <div className="error-alert">
              <span>⚠️</span> {error}
              <button onClick={fetchDashboardData} className="retry-btn">
                Retry
              </button>
            </div>
          )}
        </div>
        <div className="header-actions">
          <button 
            onClick={() => navigate('/client/order-placement')}
            className="btn-gold"
          >
            + New Export Order
          </button>
          <button 
            onClick={fetchDashboardData}
            className="btn-outline-gold"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card glass-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(52, 152, 219, 0.1)' }}>
            <span>📦</span>
          </div>
          <div className="stat-content">
            <h3>{stats.totalOrders}</h3>
            <p>Total Orders</p>
          </div>
          <div className="stat-badge" style={{ backgroundColor: 'rgba(243, 156, 18, 0.1)', color: '#F39C12' }}>
            {stats.pendingOrders} Pending
          </div>
        </div>

        <div className="stat-card glass-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(231, 76, 60, 0.1)' }}>
            <span>🚚</span>
          </div>
          <div className="stat-content">
            <h3>{stats.activeShipments}</h3>
            <p>Active Shipments</p>
          </div>
          <Link to="/client/shipments" className="stat-link">
            Track All →
          </Link>
        </div>

        <div className="stat-card glass-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(46, 204, 113, 0.1)' }}>
            <span>💰</span>
          </div>
          <div className="stat-content">
            <h3>{formatCurrency(stats.totalSpent)}</h3>
            <p>Total Spent</p>
          </div>
        </div>

        <div className="stat-card glass-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(155, 89, 182, 0.1)' }}>
            <span>⭐</span>
          </div>
          <div className="stat-content">
            <h3>Gold</h3>
            <p>Membership Tier</p>
          </div>
          <div className="stat-badge" style={{ backgroundColor: 'rgba(212, 175, 55, 0.1)', color: '#D4AF37' }}>
            VIP
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="dashboard-section glass-card">
        <div className="section-header">
          <h2>Recent Activity</h2>
          <div className="section-actions">
            <Link to="/client/orders" className="btn-outline-gold">
              View All Orders
            </Link>
            <Link to="/client/shipments" className="btn-outline-gold">
              Track Shipments
            </Link>
          </div>
        </div>

        <div className="activity-grid">
          {/* Recent Orders */}
          <div className="activity-column">
            <h3>
              <span className="icon">📦</span>
              Recent Orders
            </h3>
            <div className="activity-list">
              {recentOrders.length > 0 ? (
                recentOrders.map(order => (
                  <div 
                    key={order.id} 
                    className="activity-item"
                    onClick={() => navigate(`/client/orders/${order.id}`)}
                  >
                    <div className="activity-info">
                      <h4>{order.product_name || 'Order'}</h4>
                      <p>
                        <span className="quantity">{order.quantity} {order.unit}</span>
                        <span className="separator">•</span>
                        <span className="amount">{formatCurrency(order.total_amount)}</span>
                      </p>
                      <small>{formatDate(order.created_at)}</small>
                    </div>
                    <div 
                      className="status-badge"
                      style={{ 
                        backgroundColor: `${getStatusColor(order.status)}20`,
                        color: getStatusColor(order.status),
                        borderColor: `${getStatusColor(order.status)}40`
                      }}
                    >
                      {order.status}
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <p>No orders yet</p>
                  <button 
                    onClick={() => navigate('/client/order-placement')}
                    className="btn-gold"
                  >
                    Place Your First Order
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Recent Shipments */}
          <div className="activity-column">
            <h3>
              <span className="icon">🚚</span>
              Recent Shipments
            </h3>
            <div className="activity-list">
              {recentShipments.length > 0 ? (
                recentShipments.map(shipment => (
                  <div 
                    key={shipment.id} 
                    className="activity-item"
                    onClick={() => navigate(`/client/shipments/${shipment.id}`)}
                  >
                    <div className="activity-info">
                      <h4>
                        {shipment.tracking_number ? 
                          `Tracking: ${shipment.tracking_number}` : 
                          'Shipment'
                        }
                      </h4>
                      <p>
                        <span className="carrier">{shipment.carrier || 'Carrier'}</span>
                        {shipment.current_location && (
                          <>
                            <span className="separator">•</span>
                            <span className="location">{shipment.current_location}</span>
                          </>
                        )}
                      </p>
                      {shipment.estimated_delivery && (
                        <small>ETA: {formatDate(shipment.estimated_delivery)}</small>
                      )}
                    </div>
                    <div 
                      className="status-badge"
                      style={{ 
                        backgroundColor: `${getStatusColor(shipment.status)}20`,
                        color: getStatusColor(shipment.status),
                        borderColor: `${getStatusColor(shipment.status)}40`
                      }}
                    >
                      {shipment.status}
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <p>No shipments yet</p>
                  <p className="hint">Shipments will appear here when your orders are confirmed</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="dashboard-section glass-card">
        <h2>Quick Actions</h2>
        <div className="quick-actions-grid">
          <button 
            onClick={() => navigate('/client/order-placement')}
            className="action-card"
          >
            <div className="action-icon">➕</div>
            <h3>Place New Order</h3>
            <p>Export pomegranates or products</p>
          </button>

          <Link to="/client/invoices" className="action-card">
            <div className="action-icon">🧾</div>
            <h3>View Invoices</h3>
            <p>Access your invoices</p>
          </Link>

          <Link to="/client/shipments" className="action-card">
            <div className="action-icon">📊</div>
            <h3>Track Shipments</h3>
            <p>Live shipment tracking</p>
          </Link>

          <Link to="/client/settings" className="action-card">
            <div className="action-icon">⚙️</div>
            <h3>Account Settings</h3>
            <p>Update your information</p>
          </Link>
        </div>
      </div>

      {/* Notifications */}
      {recentNotifications.length > 0 && (
        <div className="dashboard-section glass-card">
          <div className="section-header">
            <h2>Notifications</h2>
            <Link to="/client/notifications" className="btn-outline-gold">
              View All
            </Link>
          </div>
          <div className="notifications-list">
            {recentNotifications.map(notification => (
              <div 
                key={notification.id} 
                className={`notification-item ${!notification.read ? 'unread' : ''}`}
              >
                <div className="notification-content">
                  <h4>{notification.title || 'Notification'}</h4>
                  <p>{notification.message}</p>
                  <small>{formatDate(notification.created_at)}</small>
                </div>
                {!notification.read && (
                  <div className="unread-dot"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="dashboard-footer">
        <p>Need help? Contact support: support@saffronemporium.com | +91 98765 43210</p>
        <p className="footer-note">
          Last updated: {new Date().toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
};

export default ClientDashboard;