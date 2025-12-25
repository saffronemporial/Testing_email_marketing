// src/components/Suppliers/SupplierPerformance.jsx
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  FaIndustry, FaChartLine, FaStar, FaClock, FaCheckCircle,
  FaTimesCircle, FaRupeeSign, FaSearch, FaFilter, FaDownload,
  FaEye, FaEdit, FaPhone, FaEnvelope, FaMapMarkerAlt,
  FaTruck, FaBox, FaPercentage, FaCalendarAlt, FaExclamationTriangle
} from 'react-icons/fa';
import { format, parseISO, differenceInDays, subMonths } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import supabase from '../../../supabaseClient';
import { toast } from 'react-hot-toast';

const SupplierPerformance = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [showAnalytics, setShowAnalytics] = useState(false);

  // Color schemes
  const performanceColors = {
    excellent: '#10B981',
    good: '#3B82F6',
    average: '#F59E0B',
    poor: '#EF4444',
    critical: '#DC2626'
  };

  useEffect(() => {
    fetchSupplierData();
  }, []);

  const fetchSupplierData = async () => {
    try {
      setLoading(true);

      // Fetch suppliers with their orders and performance data
      const { data: suppliersData, error: suppliersError } = await supabase
        .from('suppliers')
        .select(`
          id,
          name,
          contact_person,
          email,
          phone,
          address,
          city,
          country,
          category,
          status,
          performance_rating,
          total_orders,
          completed_orders,
          on_time_deliveries,
          quality_rating,
          response_time_hours,
          created_at,
          updated_at,
          purchase_orders (
            id,
            order_number,
            total_amount,
            status,
            order_date,
            delivery_date,
            actual_delivery_date,
            items (
              product_name,
              quantity,
              unit_price
            )
          )
        `)
        .eq('status', 'active')
        .order('performance_rating', { ascending: false });

      if (suppliersError) throw suppliersError;

      // Calculate real performance metrics
      const enhancedSuppliers = suppliersData.map(supplier => {
        const performance = calculateSupplierPerformance(supplier);
        return {
          ...supplier,
          ...performance
        };
      });

      setSuppliers(enhancedSuppliers);
      setPerformanceData(calculatePerformanceAnalytics(enhancedSuppliers));

      await logSystemActivity('info', 'Supplier performance data loaded', 'SupplierPerformance', {
        suppliersCount: enhancedSuppliers.length
      });

    } catch (err) {
      console.error('Error fetching supplier data:', err);
      toast.error('Failed to load supplier data');
      await logSystemActivity('error', `Supplier data fetch failed: ${err.message}`, 'SupplierPerformance');
    } finally {
      setLoading(false);
    }
  };

  const calculateSupplierPerformance = (supplier) => {
    const orders = supplier.purchase_orders || [];
    const completedOrders = orders.filter(order => order.status === 'completed');
    const totalOrderValue = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
    
    // Calculate on-time delivery rate
    const onTimeDeliveries = completedOrders.filter(order => {
      if (!order.actual_delivery_date || !order.delivery_date) return false;
      return new Date(order.actual_delivery_date) <= new Date(order.delivery_date);
    }).length;

    const onTimeRate = completedOrders.length > 0 ? (onTimeDeliveries / completedOrders.length) * 100 : 0;

    // Calculate quality rating (would come from real quality checks)
    const qualityRating = supplier.quality_rating || calculateQualityRating(orders);

    // Calculate response time score
    const responseScore = calculateResponseScore(supplier.response_time_hours);

    // Overall performance score (weighted average)
    const performanceScore = (
      (onTimeRate * 0.4) +
      (qualityRating * 0.4) +
      (responseScore * 0.2)
    );

    // Performance tier
    let performanceTier = 'critical';
    if (performanceScore >= 90) performanceTier = 'excellent';
    else if (performanceScore >= 80) performanceTier = 'good';
    else if (performanceScore >= 70) performanceTier = 'average';
    else if (performanceScore >= 60) performanceTier = 'poor';

    return {
      performanceScore: Math.round(performanceScore),
      performanceTier,
      onTimeRate: Math.round(onTimeRate),
      qualityRating: Math.round(qualityRating),
      responseScore: Math.round(responseScore),
      totalOrderValue,
      completedOrders: completedOrders.length,
      totalOrders: orders.length,
      fulfillmentRate: orders.length > 0 ? Math.round((completedOrders.length / orders.length) * 100) : 0
    };
  };

  const calculateQualityRating = (orders) => {
    // Real quality rating calculation based on order history
    if (orders.length === 0) return 85; // Default for new suppliers
    
    const qualityIssues = orders.filter(order => 
      order.status === 'rejected' || order.status === 'quality_issue'
    ).length;
    
    const qualityScore = 100 - (qualityIssues / orders.length) * 100;
    return Math.max(60, Math.min(100, qualityScore)); // Ensure between 60-100
  };

  const calculateResponseScore = (responseHours) => {
    if (!responseHours) return 80; // Default
    
    if (responseHours <= 4) return 100;
    if (responseHours <= 8) return 90;
    if (responseHours <= 24) return 80;
    if (responseHours <= 48) return 70;
    return 60;
  };

  const calculatePerformanceAnalytics = (suppliers) => {
    const categoryData = {};
    const performanceDistribution = {
      excellent: 0,
      good: 0,
      average: 0,
      poor: 0,
      critical: 0
    };

    suppliers.forEach(supplier => {
      // Category breakdown
      const category = supplier.category || 'Other';
      if (!categoryData[category]) {
        categoryData[category] = {
          category,
          count: 0,
          avgPerformance: 0,
          totalValue: 0
        };
      }
      categoryData[category].count += 1;
      categoryData[category].avgPerformance += supplier.performanceScore;
      categoryData[category].totalValue += supplier.totalOrderValue;

      // Performance distribution
      performanceDistribution[supplier.performanceTier] += 1;
    });

    // Calculate averages
    Object.keys(categoryData).forEach(category => {
      categoryData[category].avgPerformance = Math.round(
        categoryData[category].avgPerformance / categoryData[category].count
      );
    });

    return {
      categories: Object.values(categoryData),
      performanceDistribution: Object.entries(performanceDistribution).map(([tier, count]) => ({
        tier: tier.charAt(0).toUpperCase() + tier.slice(1),
        count,
        fill: performanceColors[tier]
      })),
      overallStats: {
        totalSuppliers: suppliers.length,
        avgPerformance: Math.round(suppliers.reduce((sum, s) => sum + s.performanceScore, 0) / suppliers.length),
        topPerformer: suppliers[0]?.name || 'N/A',
        totalOrderValue: suppliers.reduce((sum, s) => sum + s.totalOrderValue, 0)
      }
    };
  };

  const logSystemActivity = async (level, message, component, metadata = {}) => {
    try {
      await supabase
        .from('system_logs')
        .insert([{
          level,
          message,
          component,
          metadata,
          created_at: new Date().toISOString()
        }]);
    } catch (error) {
      console.error('Logging error:', error);
    }
  };

  const generateSupplierReport = async (supplier) => {
    try {
      const doc = new jsPDF();

      // Header
      doc.setFontSize(20);
      doc.setTextColor(40, 40, 40);
      doc.text('SUPPLIER PERFORMANCE REPORT', 105, 20, { align: 'center' });

      // Supplier Info
      doc.setFontSize(12);
      doc.text(`Supplier: ${supplier.name}`, 20, 40);
      doc.text(`Contact: ${supplier.contact_person}`, 20, 48);
      doc.text(`Email: ${supplier.email}`, 20, 56);
      doc.text(`Phone: ${supplier.phone}`, 20, 64);
      doc.text(`Category: ${supplier.category}`, 20, 72);

      // Performance Score
      doc.setFontSize(16);
      doc.setTextColor(performanceColors[supplier.performanceTier]);
      doc.text(`Performance Score: ${supplier.performanceScore}%`, 20, 90);
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(`Tier: ${supplier.performanceTier.toUpperCase()}`, 20, 98);

      // Performance Metrics Table
      const metricsData = [
        ['Metric', 'Score', 'Rating'],
        ['On-Time Delivery', `${supplier.onTimeRate}%`, getPerformanceRating(supplier.onTimeRate)],
        ['Quality Rating', `${supplier.qualityRating}%`, getPerformanceRating(supplier.qualityRating)],
        ['Response Time', `${supplier.responseScore}%`, getPerformanceRating(supplier.responseScore)],
        ['Order Fulfillment', `${supplier.fulfillmentRate}%`, getPerformanceRating(supplier.fulfillmentRate)]
      ];

      doc.autoTable({
        startY: 110,
        head: [metricsData[0]],
        body: metricsData.slice(1),
        theme: 'grid',
        headStyles: { fillColor: [255, 215, 0] }
      });

      // Order History
      const orderData = (supplier.purchase_orders || []).slice(0, 10).map(order => [
        order.order_number,
        format(new Date(order.order_date), 'dd/MM/yyyy'),
        `₹${order.total_amount?.toLocaleString('en-IN')}`,
        order.status
      ]);

      if (orderData.length > 0) {
        doc.text('Recent Orders', 20, doc.lastAutoTable.finalY + 15);
        doc.autoTable({
          startY: doc.lastAutoTable.finalY + 20,
          head: [['Order #', 'Order Date', 'Amount', 'Status']],
          body: orderData,
          theme: 'grid',
          headStyles: { fillColor: [184, 134, 11] }
        });
      }

      // Save PDF
      doc.save(`supplier-report-${supplier.name}-${format(new Date(), 'yyyy-MM-dd')}.pdf`);

      toast.success('Supplier report generated successfully');
      await logSystemActivity('info', 'Supplier report generated', 'SupplierPerformance', {
        supplierId: supplier.id,
        supplierName: supplier.name
      });

    } catch (err) {
      console.error('Error generating report:', err);
      toast.error('Failed to generate supplier report');
    }
  };

  const getPerformanceRating = (score) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Good';
    if (score >= 70) return 'Average';
    if (score >= 60) return 'Poor';
    return 'Critical';
  };

  const updateSupplierRating = async (supplierId, newRating) => {
    try {
      const { error } = await supabase
        .from('suppliers')
        .update({ 
          performance_rating: newRating,
          updated_at: new Date().toISOString()
        })
        .eq('id', supplierId);

      if (error) throw error;

      toast.success('Supplier rating updated');
      fetchSupplierData();

      await logSystemActivity('info', 'Supplier rating updated', 'SupplierPerformance', {
        supplierId,
        newRating
      });

    } catch (err) {
      console.error('Error updating rating:', err);
      toast.error('Failed to update supplier rating');
    }
  };

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(supplier => {
      const matchesSearch = 
        supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.contact_person.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.category.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || supplier.performanceTier === filterStatus;
      
      return matchesSearch && matchesStatus;
    });
  }, [suppliers, searchTerm, filterStatus]);

  if (loading) {
    return (
      <div className="supplier-performance glass-card">
        <div className="manager-header">
          <h3><FaIndustry /> Supplier Performance Analytics</h3>
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <span>Loading supplier performance data...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="supplier-performance glass-card">
      <div className="manager-header">
        <div className="header-main">
          <h3><FaIndustry /> Supplier Performance Analytics</h3>
          <p className="header-subtitle">Monitor and analyze supplier performance metrics</p>
        </div>
        <div className="header-actions">
          <button 
            onClick={() => setShowAnalytics(!showAnalytics)}
            className="primary-button"
          >
            <FaChartLine /> {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
          </button>
        </div>
      </div>

      {/* Overall Performance Stats */}
      <div className="performance-stats">
        <div className="stat-card">
          <div className="stat-icon">
            <FaIndustry />
          </div>
          <div className="stat-content">
            <h4>{performanceData.overallStats?.totalSuppliers || 0}</h4>
            <p>Total Suppliers</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <FaStar />
          </div>
          <div className="stat-content">
            <h4>{performanceData.overallStats?.avgPerformance || 0}%</h4>
            <p>Avg Performance</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <FaRupeeSign />
          </div>
          <div className="stat-content">
            <h4>₹{(performanceData.overallStats?.totalOrderValue || 0).toLocaleString('en-IN')}</h4>
            <p>Total Order Value</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <FaCheckCircle />
          </div>
          <div className="stat-content">
            <h4>{performanceData.overallStats?.topPerformer}</h4>
            <p>Top Performer</p>
          </div>
        </div>
      </div>

      {/* Analytics Charts */}
      {showAnalytics && (
        <div className="analytics-section">
          <div className="charts-grid">
            {/* Performance Distribution */}
            <div className="chart-container">
              <h4>Performance Distribution</h4>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={performanceData.performanceDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ tier, percent }) => `${tier} (${(percent * 100).toFixed(1)}%)`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {performanceData.performanceDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Performance by Category */}
            <div className="chart-container">
              <h4>Performance by Category</h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={performanceData.categories}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="avgPerformance" fill="#FFD700" name="Avg Performance Score" />
                  <Bar dataKey="count" fill="#B8860B" name="Supplier Count" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="filters-section">
        <div className="search-box">
          <FaSearch />
          <input
            type="text"
            placeholder="Search suppliers by name, contact, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Performance</option>
            <option value="excellent">Excellent (90%+)</option>
            <option value="good">Good (80-89%)</option>
            <option value="average">Average (70-79%)</option>
            <option value="poor">Poor (60-69%)</option>
            <option value="critical">Critical (&lt;60%)</option>
          </select>
        </div>
      </div>

      {/* Suppliers Table */}
      <div className="suppliers-table-container">
        <table className="suppliers-table">
          <thead>
            <tr>
              <th>Supplier</th>
              <th>Contact</th>
              <th>Category</th>
              <th>Performance Score</th>
              <th>On-Time Delivery</th>
              <th>Quality Rating</th>
              <th>Total Orders</th>
              <th>Total Value</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSuppliers.map(supplier => (
              <tr key={supplier.id}>
                <td>
                  <div className="supplier-info">
                    <strong>{supplier.name}</strong>
                    <div className="contact-details">
                      <FaPhone className="icon" /> {supplier.phone}
                    </div>
                  </div>
                </td>
                <td>
                  <div className="contact-person">
                    {supplier.contact_person}
                    <div className="email">
                      <FaEnvelope className="icon" /> {supplier.email}
                    </div>
                  </div>
                </td>
                <td>
                  <span className="category-tag">{supplier.category}</span>
                </td>
                <td>
                  <div className="performance-score">
                    <div className="score-value">{supplier.performanceScore}%</div>
                    <div className="score-bar">
                      <div 
                        className="score-fill"
                        style={{ 
                          width: `${supplier.performanceScore}%`,
                          backgroundColor: performanceColors[supplier.performanceTier]
                        }}
                      ></div>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="metric-value">
                    {supplier.onTimeRate}%
                  </div>
                </td>
                <td>
                  <div className="metric-value">
                    {supplier.qualityRating}%
                  </div>
                </td>
                <td>
                  <div className="order-stats">
                    <span className="completed">{supplier.completedOrders}</span>
                    <span className="total">/ {supplier.totalOrders}</span>
                  </div>
                </td>
                <td>
                  <div className="value">
                    <FaRupeeSign className="icon" />
                    {supplier.totalOrderValue.toLocaleString('en-IN')}
                  </div>
                </td>
                <td>
                  <span className={`status-badge ${supplier.performanceTier}`}>
                    {supplier.performanceTier.toUpperCase()}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="btn-view"
                      onClick={() => setSelectedSupplier(supplier)}
                    >
                      <FaEye />
                    </button>
                    <button 
                      className="btn-report"
                      onClick={() => generateSupplierReport(supplier)}
                    >
                      <FaDownload />
                    </button>
                    {supplier.performanceTier === 'critical' && (
                      <button 
                        className="btn-alert"
                        onClick={() => updateSupplierRating(supplier.id, 75)}
                      >
                        <FaExclamationTriangle />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Supplier Details Modal */}
      {selectedSupplier && (
        <div className="modal-overlay">
          <div className="modal-content large">
            <div className="modal-header">
              <h3>Supplier Details - {selectedSupplier.name}</h3>
              <button 
                className="close-button"
                onClick={() => setSelectedSupplier(null)}
              >
                ×
              </button>
            </div>
            <div className="supplier-details">
              <div className="detail-section">
                <h4>Contact Information</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="label">Contact Person:</span>
                    <span className="value">{selectedSupplier.contact_person}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Email:</span>
                    <span className="value">{selectedSupplier.email}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Phone:</span>
                    <span className="value">{selectedSupplier.phone}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Address:</span>
                    <span className="value">{selectedSupplier.address}, {selectedSupplier.city}, {selectedSupplier.country}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h4>Performance Metrics</h4>
                <div className="metrics-grid">
                  <div className="metric-card">
                    <div className="metric-value">{selectedSupplier.performanceScore}%</div>
                    <div className="metric-label">Overall Performance</div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-value">{selectedSupplier.onTimeRate}%</div>
                    <div className="metric-label">On-Time Delivery</div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-value">{selectedSupplier.qualityRating}%</div>
                    <div className="metric-label">Quality Rating</div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-value">{selectedSupplier.fulfillmentRate}%</div>
                    <div className="metric-label">Order Fulfillment</div>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h4>Recent Orders</h4>
                <div className="orders-list">
                  {(selectedSupplier.purchase_orders || []).slice(0, 5).map(order => (
                    <div key={order.id} className="order-item">
                      <div className="order-number">{order.order_number}</div>
                      <div className="order-date">
                        {format(new Date(order.order_date), 'dd MMM yyyy')}
                      </div>
                      <div className="order-amount">
                        ₹{order.total_amount?.toLocaleString('en-IN')}
                      </div>
                      <span className={`status-badge ${order.status}`}>
                        {order.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="modal-actions">
                <button 
                  className="secondary-button"
                  onClick={() => generateSupplierReport(selectedSupplier)}
                >
                  <FaDownload /> Generate Report
                </button>
                <button 
                  className="primary-button"
                  onClick={() => setSelectedSupplier(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierPerformance;