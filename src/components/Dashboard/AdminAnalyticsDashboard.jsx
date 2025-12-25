// src/components/Dashboard/AdminAnalyticsDashboard.jsx
import React, { useEffect, useState } from 'react';
import { fetchAdminAnalytics } from '../../services/analyticsService';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  Legend
} from 'recharts';
import './adminAnalyticsDashboard.css';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="tooltip-label">{label}</p>
        <p className="tooltip-value">
          {payload[0].name === 'count' ? 'Users: ' : 'Revenue: '}
          {payload[0].name === 'count' 
            ? payload[0].value 
            : `₹${payload[0].value.toLocaleString('en-IN')}`
          }
        </p>
      </div>
    );
  }
  return null;
};

function AdminAnalyticsDashboard() {
  const [data, setData] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    userGrowth: [],
    orderStatus: [],
    revenueByRegion: []
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const analyticsData = await fetchAdminAnalytics();
      setData(analyticsData);
    } catch (err) {
      console.error('Error loading analytics:', err);
      setError('Failed to load analytics data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading analytics data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <p>{error}</p>
        <button onClick={loadAnalytics} className="retry-button">
          Try Again
        </button>
      </div>
    );
  }

  const {
    totalUsers,
    totalOrders,
    totalRevenue,
    userGrowth,
    orderStatus,
    revenueByRegion
  } = data;

  return (
    <div className="admin-analytics-dashboard">
      <div className="dashboard-header">
        <h2>Admin Analytics Dashboard</h2>
        <button onClick={loadAnalytics} className="refresh-button">
          Refresh Data
        </button>
      </div>

      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>Total Users</h3>
            <p>{totalUsers}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <h3>Total Orders</h3>
            <p>{totalOrders}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>Total Revenue</h3>
            <p>₹{totalRevenue.toLocaleString('en-IN')}</p>
          </div>
        </div>
      </div>

      <div className="charts-container">
        <div className="chart-row">
          <div className="chart-card">
            <h3>User Growth (Last 6 Months)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={userGrowth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill={COLORS[0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h3>Order Status Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={orderStatus}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ status, count }) => `${status}: ${count}`}
                >
                  {orderStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} orders`, 'Count']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-row">
          <div className="chart-card full-width">
            <h3>Revenue by Product Category</h3>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={revenueByRegion}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="region" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Revenue']}
                />
                <Bar dataKey="revenue" fill={COLORS[2]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminAnalyticsDashboard; 