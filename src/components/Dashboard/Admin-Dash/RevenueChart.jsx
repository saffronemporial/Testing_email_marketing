// src/components/Charts/RevenueChart.jsx
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell,
  AreaChart, Area, ComposedChart, Scatter
} from 'recharts';
import { 
  FaRupeeSign, FaChartLine, FaDownload, FaFilter, FaCalendarAlt,
  FaArrowUp, FaArrowDown, FaPercentage, FaBox, FaShippingFast
} from 'react-icons/fa';
import { format, subDays, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, eachMonthOfInterval } from 'date-fns';
import supabase from '../../../supabaseClient';
import { toast } from 'react-hot-toast';

const RevenueChart = ({ data, timeRange = 'monthly', onDataLoaded }) => {
  const [revenueData, setRevenueData] = useState([]);
  const [productRevenue, setProductRevenue] = useState([]);
  const [geographicRevenue, setGeographicRevenue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);

  const COLORS = ['#FFD700', '#FFA500', '#B8860B', '#FFEC8B', '#DAA520', '#F4A460'];

  // Memoized date ranges for performance
  const dateRanges = useMemo(() => ({
    weekly: {
      start: subDays(new Date(), 7),
      end: new Date(),
      format: 'EEE'
    },
    monthly: {
      start: subDays(new Date(), 30),
      end: new Date(),
      format: 'MMM dd'
    },
    quarterly: {
      start: subMonths(new Date(), 3),
      end: new Date(),
      format: 'MMM yyyy'
    },
    yearly: {
      start: subMonths(new Date(), 12),
      end: new Date(),
      format: 'MMM yyyy'
    }
  }), []);

  useEffect(() => {
    fetchRevenueData();
  }, [timeRange]);

  const fetchRevenueData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch completed orders with client and product details
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select(`
          id,
          total_amount,
          status,
          created_at,
          client_id,
          shipping_country,
          order_items (
            product_id,
            quantity,
            unit_price,
            products (
              name,
              category
            )
          )
        `)
        .eq('status', 'completed')
        .gte('created_at', dateRanges[timeRange].start.toISOString())
        .lte('created_at', dateRanges[timeRange].end.toISOString())
        .order('created_at', { ascending: true });

      if (ordersError) throw ordersError;

      // Fetch additional export orders data
      const { data: exportOrders, error: exportError } = await supabase
        .from('export_orders')
        .select(`
          id,
          total_value,
          status,
          created_at,
          destination_country,
          export_items (
            product_name,
            quantity,
            unit_price
          )
        `)
        .eq('status', 'completed')
        .gte('created_at', dateRanges[timeRange].start.toISOString())
        .lte('created_at', dateRanges[timeRange].end.toISOString());

      if (exportError) throw exportError;

      // Process and combine all revenue data
      const processedData = processRevenueData([...(orders || []), ...(exportOrders || [])], timeRange);
      setRevenueData(processedData.timeline);

      const productData = processProductRevenue([...(orders || []), ...(exportOrders || [])]);
      setProductRevenue(productData);

      const geographicData = processGeographicRevenue([...(orders || []), ...(exportOrders || [])]);
      setGeographicRevenue(geographicData);

      // Calculate and send analytics to parent
      const analytics = calculateRevenueAnalytics(processedData.timeline);
      if (onDataLoaded) onDataLoaded(analytics);

      // Log successful data fetch
      await logSystemActivity('info', 'Revenue data fetched successfully', 'RevenueChart', {
        timeRange,
        ordersCount: orders?.length || 0,
        exportOrdersCount: exportOrders?.length || 0,
        totalRevenue: analytics.totalRevenue
      });

    } catch (err) {
      console.error('Error fetching revenue data:', err);
      setError(`Failed to load revenue data: ${err.message}`);
      
      // Log error
      await logSystemActivity('error', `Revenue data fetch failed: ${err.message}`, 'RevenueChart', {
        timeRange,
        error: err.message
      });

      toast.error('Failed to load revenue data');
    } finally {
      setLoading(false);
    }
  };

  const processRevenueData = (orders, range) => {
    const timelineData = {};
    const dailyData = {};
    
    // Generate all dates in the range for complete timeline
    const dates = eachDayOfInterval({
      start: dateRanges[range].start,
      end: dateRanges[range].end
    });

    // Initialize all dates with zero values
    dates.forEach(date => {
      const key = format(date, dateRanges[range].format);
      timelineData[key] = {
        period: key,
        revenue: 0,
        orders: 0,
        exportRevenue: 0,
        domesticRevenue: 0,
        date: date
      };
    });

    // Process each order
    orders.forEach(order => {
      const orderDate = new Date(order.created_at);
      const periodKey = format(orderDate, dateRanges[range].format);
      const amount = order.total_amount || order.total_value || 0;
      const isExport = order.destination_country && order.destination_country !== 'India';

      if (!timelineData[periodKey]) {
        timelineData[periodKey] = {
          period: periodKey,
          revenue: 0,
          orders: 0,
          exportRevenue: 0,
          domesticRevenue: 0,
          date: orderDate
        };
      }

      timelineData[periodKey].revenue += amount;
      timelineData[periodKey].orders += 1;
      
      if (isExport) {
        timelineData[periodKey].exportRevenue += amount;
      } else {
        timelineData[periodKey].domesticRevenue += amount;
      }

      // Daily data for more detailed analysis
      const dayKey = format(orderDate, 'yyyy-MM-dd');
      if (!dailyData[dayKey]) {
        dailyData[dayKey] = {
          date: dayKey,
          revenue: 0,
          orders: 0
        };
      }
      dailyData[dayKey].revenue += amount;
      dailyData[dayKey].orders += 1;
    });

    return {
      timeline: Object.values(timelineData).sort((a, b) => a.date - b.date),
      daily: Object.values(dailyData).sort((a, b) => a.date.localeCompare(b.date))
    };
  };

  const processProductRevenue = (orders) => {
    const productRevenueMap = {};
    
    orders.forEach(order => {
      const items = order.order_items || order.export_items || [];
      items.forEach(item => {
        const productName = item.products?.name || item.product_name || 'Unknown Product';
        const revenue = (item.quantity || 0) * (item.unit_price || 0);
        
        productRevenueMap[productName] = {
          name: productName,
          revenue: (productRevenueMap[productName]?.revenue || 0) + revenue,
          quantity: (productRevenueMap[productName]?.quantity || 0) + (item.quantity || 0),
          category: item.products?.category || 'General'
        };
      });
    });

    return Object.values(productRevenueMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  };

  const processGeographicRevenue = (orders) => {
    const geographicMap = {};
    
    orders.forEach(order => {
      const country = order.shipping_country || order.destination_country || 'Domestic';
      const amount = order.total_amount || order.total_value || 0;
      
      geographicMap[country] = {
        country,
        revenue: (geographicMap[country]?.revenue || 0) + amount,
        orders: (geographicMap[country]?.orders || 0) + 1
      };
    });

    return Object.values(geographicMap)
      .sort((a, b) => b.revenue - a.revenue);
  };

  const calculateRevenueAnalytics = (data) => {
    const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
    const totalOrders = data.reduce((sum, item) => sum + item.orders, 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    // Calculate growth rate
    const firstPeriod = data[0]?.revenue || 0;
    const lastPeriod = data[data.length - 1]?.revenue || 0;
    const growthRate = firstPeriod > 0 ? ((lastPeriod - firstPeriod) / firstPeriod) * 100 : 0;

    return {
      totalRevenue,
      totalOrders,
      averageOrderValue,
      growthRate,
      timeline: data
    };
  };

  const logSystemActivity = async (level, message, component, metadata = {}) => {
    try {
      const { error } = await supabase
        .from('system_logs')
        .insert([
          {
            level,
            message,
            component,
            metadata,
            created_at: new Date().toISOString()
          }
        ]);

      if (error) console.error('Failed to log system activity:', error);
    } catch (logError) {
      console.error('Logging error:', logError);
    }
  };

  const exportRevenueData = async () => {
    try {
      setExporting(true);
      
      const exportData = {
        timeline: revenueData,
        products: productRevenue,
        geographic: geographicRevenue,
        generatedAt: new Date().toISOString(),
        timeRange
      };

      // Convert to CSV
      const csvContent = convertToCSV(exportData);
      downloadFile(csvContent, `revenue-export-${format(new Date(), 'yyyy-MM-dd')}.csv`, 'text/csv');

      // Log export activity
      await logSystemActivity('info', 'Revenue data exported', 'RevenueChart', {
        timeRange,
        dataPoints: revenueData.length
      });

      toast.success('Revenue data exported successfully');
    } catch (err) {
      console.error('Export error:', err);
      toast.error('Failed to export revenue data');
    } finally {
      setExporting(false);
    }
  };

  const convertToCSV = (data) => {
    const headers = ['Period', 'Revenue', 'Orders', 'Export Revenue', 'Domestic Revenue'];
    const rows = data.timeline.map(item => [
      item.period,
      item.revenue,
      item.orders,
      item.exportRevenue,
      item.domesticRevenue
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const downloadFile = (content, filename, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip glass-card">
          <p className="tooltip-label font-semibold text-gold-primary">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="tooltip-value" style={{ color: entry.color }}>
              {entry.name}: <FaRupeeSign className="inline" /> {entry.value.toLocaleString('en-IN')}
              {entry.dataKey === 'revenue' && (
                <span className="text-xs ml-2 opacity-75">
                  ({Math.round((entry.value / revenueData.reduce((sum, item) => sum + item.revenue, 0)) * 100)}%)
                </span>
              )}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderRevenueTrendChart = () => (
    <div className="chart-section">
      <h4 className="chart-title">Revenue Trend Analysis</h4>
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={revenueData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="period" 
            stroke="#9CA3AF"
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis 
            stroke="#9CA3AF"
            tickFormatter={(value) => `₹${value / 1000}k`}
            width={80}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Area 
            type="monotone" 
            dataKey="revenue" 
            fill="url(#revenueGradient)" 
            stroke="#FFD700"
            strokeWidth={3}
            fillOpacity={0.3}
            name="Total Revenue"
          />
          <Bar 
            dataKey="orders" 
            fill="#B8860B" 
            radius={[4, 4, 0, 0]}
            name="Number of Orders"
            yAxisId="right"
          />
          <Line 
            type="monotone" 
            dataKey="exportRevenue" 
            stroke="#10B981" 
            strokeWidth={2}
            strokeDasharray="5 5"
            name="Export Revenue"
          />
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#FFD700" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#FFD700" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );

  const renderProductRevenueChart = () => (
    <div className="chart-section">
      <h4 className="chart-title">Product Revenue Distribution</h4>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={productRevenue}
            cx="50%"
            cy="50%"
            labelLine={true}
            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="revenue"
          >
            {productRevenue.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value, name) => [
              <span key={name}><FaRupeeSign className="inline" /> {value.toLocaleString('en-IN')}</span>,
              'Revenue'
            ]}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );

  const renderGeographicRevenueChart = () => (
    <div className="chart-section">
      <h4 className="chart-title">Revenue by Geography</h4>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={geographicRevenue.slice(0, 8)}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="country" 
            stroke="#9CA3AF"
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis 
            stroke="#9CA3AF"
            tickFormatter={(value) => `₹${value / 1000}k`}
          />
          <Tooltip 
            formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Revenue']}
          />
          <Bar 
            dataKey="revenue" 
            fill="#FFA500" 
            radius={[4, 4, 0, 0]}
            name="Revenue"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  const renderRevenueMetrics = () => {
    const analytics = calculateRevenueAnalytics(revenueData);
    
    return (
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon">
            <FaRupeeSign />
          </div>
          <div className="metric-content">
            <h3>Total Revenue</h3>
            <p className="metric-value">
              ₹{analytics.totalRevenue.toLocaleString('en-IN')}
            </p>
            <span className={`metric-trend ${analytics.growthRate >= 0 ? 'positive' : 'negative'}`}>
              {analytics.growthRate >= 0 ? <FaArrowUp /> : <FaArrowDown />}
              {Math.abs(analytics.growthRate).toFixed(1)}%
            </span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">
            <FaBox />
          </div>
          <div className="metric-content">
            <h3>Total Orders</h3>
            <p className="metric-value">{analytics.totalOrders}</p>
            <span className="metric-label">Completed</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">
            <FaRupeeSign />
          </div>
          <div className="metric-content">
            <h3>Average Order Value</h3>
            <p className="metric-value">₹{Math.round(analytics.averageOrderValue).toLocaleString('en-IN')}</p>
            <span className="metric-label">Per order</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">
            <FaShippingFast />
          </div>
          <div className="metric-content">
            <h3>Export Ratio</h3>
            <p className="metric-value">
              {revenueData.length > 0 ? Math.round(
                (revenueData.reduce((sum, item) => sum + item.exportRevenue, 0) / analytics.totalRevenue) * 100
              ) : 0}%
            </p>
            <span className="metric-label">Of total revenue</span>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="chart-container glass-card">
        <div className="chart-header">
          <h3><FaChartLine /> Advanced Revenue Analytics</h3>
          <div className="chart-loading">
            <div className="loading-spinner"></div>
            <span>Loading real revenue data from database...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="chart-container glass-card">
        <div className="chart-header">
          <h3><FaChartLine /> Advanced Revenue Analytics</h3>
          <div className="chart-error">
            <p>{error}</p>
            <button onClick={fetchRevenueData} className="retry-button">
              Retry Loading
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="chart-container glass-card">
      <div className="chart-header">
        <div className="header-content">
          <h3><FaChartLine /> Advanced Revenue Analytics</h3>
          <div className="header-actions">
            <select 
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value)}
              className="time-filter"
            >
              <option value="weekly">Last 7 Days</option>
              <option value="monthly">Last 30 Days</option>
              <option value="quarterly">Last 3 Months</option>
              <option value="yearly">Last 12 Months</option>
            </select>
            
            <button 
              onClick={exportRevenueData} 
              disabled={exporting}
              className="export-button"
            >
              <FaDownload />
              {exporting ? 'Exporting...' : 'Export Data'}
            </button>
          </div>
        </div>
        
        {renderRevenueMetrics()}
      </div>

      <div className="charts-content">
        {renderRevenueTrendChart()}
        
        <div className="charts-grid">
          {renderProductRevenueChart()}
          {renderGeographicRevenueChart()}
        </div>

        {/* Additional Insights */}
        <div className="insights-section">
          <h4>Revenue Insights</h4>
          <div className="insights-grid">
            <div className="insight-card">
              <h5>Top Performing Product</h5>
              <p>{productRevenue[0]?.name || 'N/A'}</p>
              <span className="insight-value">
                ₹{productRevenue[0]?.revenue.toLocaleString('en-IN') || '0'}
              </span>
            </div>
            
            <div className="insight-card">
              <h5>Best Market</h5>
              <p>{geographicRevenue[0]?.country || 'N/A'}</p>
              <span className="insight-value">
                ₹{geographicRevenue[0]?.revenue.toLocaleString('en-IN') || '0'}
              </span>
            </div>
            
            <div className="insight-card">
              <h5>Revenue Concentration</h5>
              <p>Top 3 Products</p>
              <span className="insight-value">
                {productRevenue.length >= 3 
                  ? Math.round((productRevenue.slice(0, 3).reduce((sum, item) => sum + item.revenue, 0) / 
                    productRevenue.reduce((sum, item) => sum + item.revenue, 0)) * 100)
                  : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueChart;