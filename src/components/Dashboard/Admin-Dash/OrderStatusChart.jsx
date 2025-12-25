// src/components/Charts/OrderStatusChart.jsx
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, LineChart, Line, Area,
  ComposedChart, Scatter, RadialBarChart, RadialBar, Treemap, Sankey
} from 'recharts';
import {
  FaBox, FaShoppingCart, FaCheckCircle, FaClock, FaTimesCircle,
  FaChartBar, FaRupeeSign, FaShippingFast, FaUser, FaGlobeAmericas,
  FaDownload, FaSync, FaExclamationTriangle, FaArrowUp, FaArrowDown,
  FaFilter, FaCog, FaBell, FaRocket, FaDatabase, FaChartLine,
  FaMapMarkerAlt, FaCalendarAlt, FaIndustry, FaMoneyBillWave,
  FaTachometerAlt, FaCubes, FaPallet, FaWeightHanging
} from 'react-icons/fa';
import { format, subDays, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, parseISO, differenceInDays } from 'date-fns';
import supabase from '../../../supabaseClient';
import { toast } from 'react-hot-toast';

const OrderStatusChart = ({ data, timeRange = 'monthly', onDataLoaded }) => {
  const [orders, setOrders] = useState([]);
  const [exportOrders, setExportOrders] = useState([]);
  const [packageItems, setPackageItems] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [timelineData, setTimelineData] = useState([]);
  const [clientData, setClientData] = useState([]);
  const [productData, setProductData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [realTimeEnabled, setRealTimeEnabled] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [advancedFilters, setAdvancedFilters] = useState({
    clientType: 'all',
    productCategory: 'all',
    minValue: 0,
    maxValue: 1000000,
    status: 'all',
    geographicRegion: 'all'
  });

  // Enhanced color schemes
  const statusColors = {
    // Domestic order statuses
    pending: '#F59E0B',
    confirmed: '#3B82F6',
    processing: '#8B5CF6',
    packaging: '#EC4899',
    customs_clearance: '#8B5CF6',
    shipping: '#6366F1',
    arrived_dubai: '#06B6D4',
    out_for_delivery: '#F59E0B',
    delivered: '#10B981',
    archived: '#6B7280',
    
    // Export order statuses
    draft: '#9CA3AF',
    procurement: '#F59E0B',
    quality_check: '#8B5CF6',
    ready_for_shipment: '#06B6D4',
    in_transit: '#6366F1',
    at_port: '#EC4899',
    destination_customs: '#8B5CF6',
    completed: '#10B981',
    cancelled: '#EF4444'
  };

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

  // Real-time subscription setup
  useEffect(() => {
    if (realTimeEnabled) {
      setupRealtimeSubscription();
    } else {
      if (subscription) {
        subscription.unsubscribe();
      }
    }

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [realTimeEnabled]);

  const setupRealtimeSubscription = () => {
    const ordersSubscription = supabase
      .channel('order-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          console.log('Order change received:', payload);
          handleRealtimeUpdate(payload);
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'export_orders' },
        (payload) => {
          console.log('Export order change received:', payload);
          handleRealtimeUpdate(payload);
        }
      )
      .subscribe();

    setSubscription(ordersSubscription);
  };

  const handleRealtimeUpdate = (payload) => {
    toast.success('Real-time update received', { duration: 2000 });
    // Refresh data after a short delay to allow multiple updates to batch
    setTimeout(() => {
      fetchOrderData();
    }, 1000);
  };

  useEffect(() => {
    fetchOrderData();
  }, [timeRange, advancedFilters]);

  const fetchOrderData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch domestic orders with correct field mappings
      const { data: domesticOrders, error: domesticError } = await supabase
        .from('orders')
        .select(`
          id,
          order_number: invoice_number,
          status,
          total_amount,
          created_at,
          updated_at,
          client_id,
          shipping_country: delivery_port,
          shipping_city: delivery_port,
          product_id,
          quantity,
          unit_price,
          payment_method,
          shipping_cost,
          tax_amount,
          products (
            id,
            name,
            category,
            sku,
            base_price,
            unit
          ),
          profiles (
            id,
            full_name,
            company: company_name,
            email,
            country,
            business_type
          )
        `)
        .gte('created_at', dateRanges[timeRange].start.toISOString())
        .lte('created_at', dateRanges[timeRange].end.toISOString())
        .order('created_at', { ascending: false });

      if (domesticError) throw domesticError;

      // Fetch export orders with correct field mappings
      const { data: exportOrdersData, error: exportError } = await supabase
        .from('export_orders')
        .select(`
          id,
          order_number: export_reference,
          status,
          total_value: total_order_value,
          created_at,
          updated_at,
          destination_country: port_of_discharge,
          destination_city: port_of_discharge,
          incoterms: incoterm,
          transport_mode,
          port_of_loading,
          port_of_discharge,
          current_phase,
          priority,
          payment_terms,
          orders (
            id,
            product_id,
            quantity,
            unit_price,
            total_amount,
            products (
              id,
              name,
              category,
              sku
            ),
            profiles (
              id,
              full_name,
              company: company_name,
              email
            )
          )
        `)
        .gte('created_at', dateRanges[timeRange].start.toISOString())
        .lte('created_at', dateRanges[timeRange].end.toISOString())
        .order('created_at', { ascending: false });

      if (exportError) throw exportError;

      // Fetch package items for export orders
      const { data: packageItemsData, error: packageError } = await supabase
        .from('package_items')
        .select(`
          id,
          export_order_id,
          package_code,
          gross_weight,
          net_weight,
          dimensions,
          cbm,
          status,
          created_at
        `)
        .in('export_order_id', exportOrdersData?.map(eo => eo.id) || []);

      if (packageError) throw packageError;

      setOrders(domesticOrders || []);
      setExportOrders(exportOrdersData || []);
      setPackageItems(packageItemsData || []);

      // Process all data with advanced filtering
      const allOrders = [...(domesticOrders || []), ...(exportOrdersData || [])];
      const filteredOrders = applyAdvancedFilters(allOrders);
      
      const statusDistribution = processStatusData(filteredOrders);
      setStatusData(statusDistribution);

      const timeline = processTimelineData(filteredOrders, timeRange);
      setTimelineData(timeline);

      const clientStats = processClientData(filteredOrders);
      setClientData(clientStats);

      const productStats = processProductData(filteredOrders);
      setProductData(productStats);

      // Calculate advanced analytics
      const analytics = calculateAdvancedAnalytics(filteredOrders, timeline, packageItemsData || []);
      if (onDataLoaded) onDataLoaded(analytics);

      await logSystemActivity('info', 'Advanced order analytics data fetched successfully', 'OrderStatusChart', {
        timeRange,
        domesticOrders: domesticOrders?.length || 0,
        exportOrders: exportOrdersData?.length || 0,
        packageItems: packageItemsData?.length || 0,
        totalOrders: filteredOrders.length,
        filters: advancedFilters
      });

    } catch (err) {
      console.error('Error fetching order data:', err);
      setError(`Failed to load order data: ${err.message}`);
      
      await logSystemActivity('error', `Order data fetch failed: ${err.message}`, 'OrderStatusChart', {
        timeRange,
        error: err.message
      });

      toast.error('Failed to load order data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const applyAdvancedFilters = (orders) => {
    return orders.filter(order => {
      // Client type filter
      if (advancedFilters.clientType !== 'all') {
        const isExport = order.destination_country || order.port_of_discharge;
        if (advancedFilters.clientType === 'export' && !isExport) return false;
        if (advancedFilters.clientType === 'domestic' && isExport) return false;
      }

      // Product category filter
      if (advancedFilters.productCategory !== 'all') {
        const product = order.products || order.orders?.products;
        if (product?.category !== advancedFilters.productCategory) return false;
      }

      // Value range filter
      const amount = order.total_amount || order.total_value || 0;
      if (amount < advancedFilters.minValue || amount > advancedFilters.maxValue) return false;

      // Status filter
      if (advancedFilters.status !== 'all' && order.status !== advancedFilters.status) return false;

      return true;
    });
  };

  const processStatusData = (orders) => {
    const statusCount = {};
    let totalValue = 0;

    orders.forEach(order => {
      const status = order.status || 'draft';
      const amount = order.total_amount || order.total_value || 0;
      
      statusCount[status] = {
        count: (statusCount[status]?.count || 0) + 1,
        value: (statusCount[status]?.value || 0) + amount,
        orders: [...(statusCount[status]?.orders || []), order]
      };
      totalValue += amount;
    });

    return Object.entries(statusCount).map(([status, data]) => ({
      status: status.charAt(0).toUpperCase() + status.slice(1),
      count: data.count,
      value: data.value,
      percentage: (data.count / orders.length) * 100,
      valuePercentage: (data.value / totalValue) * 100,
      fill: statusColors[status] || '#6B7280',
      orders: data.orders
    })).sort((a, b) => b.count - a.count);
  };

  const processTimelineData = (orders, range) => {
    const timeline = {};
    const dates = eachDayOfInterval({
      start: dateRanges[range].start,
      end: dateRanges[range].end
    });

    // Initialize timeline with enhanced metrics
    dates.forEach(date => {
      const key = format(date, dateRanges[range].format);
      timeline[key] = {
        period: key,
        orders: 0,
        revenue: 0,
        domestic: 0,
        export: 0,
        avgOrderValue: 0,
        highValueOrders: 0,
        date: date
      };
    });

    // Process each order with enhanced tracking
    orders.forEach(order => {
      const orderDate = new Date(order.created_at);
      const periodKey = format(orderDate, dateRanges[range].format);
      const amount = order.total_amount || order.total_value || 0;
      const isExport = order.destination_country || order.port_of_discharge;

      if (timeline[periodKey]) {
        timeline[periodKey].orders += 1;
        timeline[periodKey].revenue += amount;
        
        if (isExport) {
          timeline[periodKey].export += amount;
        } else {
          timeline[periodKey].domestic += amount;
        }

        // Track high-value orders (above 50,000)
        if (amount > 50000) {
          timeline[periodKey].highValueOrders += 1;
        }
      }
    });

    // Calculate average order value per period
    Object.keys(timeline).forEach(period => {
      if (timeline[period].orders > 0) {
        timeline[period].avgOrderValue = timeline[period].revenue / timeline[period].orders;
      }
    });

    return Object.values(timeline).sort((a, b) => a.date - b.date);
  };

  const processClientData = (orders) => {
    const clientMap = {};
    
    orders.forEach(order => {
      const client = order.profiles || order.orders?.profiles;
      const clientName = client?.company || client?.full_name || 'Unknown Client';
      const amount = order.total_amount || order.total_value || 0;
      const country = client?.country || 'Unknown';
      const businessType = client?.business_type || 'Unknown';
      
      if (!clientMap[clientName]) {
        clientMap[clientName] = {
          client: clientName,
          orders: 0,
          revenue: 0,
          contact: client?.full_name || 'N/A',
          country: country,
          businessType: businessType,
          orderIds: []
        };
      }
      
      clientMap[clientName].orders += 1;
      clientMap[clientName].revenue += amount;
      clientMap[clientName].orderIds.push(order.id);
    });

    return Object.values(clientMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 15);
  };

  const processProductData = (orders) => {
    const productMap = {};
    
    orders.forEach(order => {
      const product = order.products || order.orders?.products;
      const productName = product?.name || 'Unknown Product';
      const quantity = order.quantity || 1;
      const revenue = order.total_amount || order.total_value || 0;
      const category = product?.category || 'Uncategorized';
      const unit = product?.unit || 'kg';
      
      if (!productMap[productName]) {
        productMap[productName] = {
          product: productName,
          quantity: 0,
          revenue: 0,
          orders: 0,
          category: category,
          unit: unit,
          avgPrice: 0
        };
      }
      
      productMap[productName].quantity += quantity;
      productMap[productName].revenue += revenue;
      productMap[productName].orders += 1;
      productMap[productName].avgPrice = productMap[productName].revenue / productMap[productName].quantity;
    });

    return Object.values(productMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 20);
  };

  const calculateAdvancedAnalytics = (orders, timeline, packageItems) => {
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total_amount || order.total_value || 0), 0);
    
    // Enhanced status categorization
    const completedOrders = orders.filter(order => 
      ['delivered', 'completed', 'archived'].includes(order.status)
    ).length;
    
    const inProgressOrders = orders.filter(order => 
      ['confirmed', 'processing', 'packaging', 'customs_clearance', 'shipping', 'arrived_dubai', 'out_for_delivery', 'procurement', 'quality_check', 'ready_for_shipment', 'in_transit', 'at_port', 'destination_customs'].includes(order.status)
    ).length;
    
    const pendingOrders = orders.filter(order => 
      ['pending', 'draft'].includes(order.status)
    ).length;

    const exportOrders = orders.filter(order => order.destination_country || order.port_of_discharge).length;
    const domesticOrders = totalOrders - exportOrders;

    // Package analytics
    const totalPackages = packageItems.length;
    const totalWeight = packageItems.reduce((sum, pkg) => sum + (pkg.net_weight || 0), 0);
    const totalVolume = packageItems.reduce((sum, pkg) => sum + (pkg.cbm || 0), 0);

    // Advanced metrics
    const conversionRate = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const exportRevenueRatio = totalRevenue > 0 ? 
      (orders.filter(o => o.destination_country).reduce((sum, o) => sum + (o.total_amount || o.total_value || 0), 0) / totalRevenue) * 100 : 0;

    // Growth calculations
    const currentPeriodRevenue = timeline.length > 0 ? timeline[timeline.length - 1].revenue : 0;
    const previousPeriodRevenue = timeline.length > 1 ? timeline[timeline.length - 2].revenue : 0;
    const revenueGrowth = previousPeriodRevenue > 0 ? 
      ((currentPeriodRevenue - previousPeriodRevenue) / previousPeriodRevenue) * 100 : 0;

    // Predictive metrics (simplified)
    const projectedRevenue = totalRevenue * (1 + (revenueGrowth / 100));
    const completionForecast = inProgressOrders * 0.85; // Assuming 85% completion rate

    return {
      totalOrders,
      totalRevenue,
      completedOrders,
      inProgressOrders,
      pendingOrders,
      exportOrders,
      domesticOrders,
      conversionRate,
      averageOrderValue,
      exportRevenueRatio,
      revenueGrowth,
      totalPackages,
      totalWeight,
      totalVolume,
      projectedRevenue,
      completionForecast,
      timeline
    };
  };

  const logSystemActivity = async (level, message, component, metadata = {}) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase
        .from('system_logs')
        .insert([{
          level,
          message,
          component,
          user_id: user?.id || null,
          metadata,
          created_at: new Date().toISOString()
        }]);
    } catch (error) {
      console.error('Logging error:', error);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await fetchOrderData();
    toast.success('Order data refreshed');
  };

  const toggleRealTime = () => {
    setRealTimeEnabled(!realTimeEnabled);
    toast.success(`Real-time updates ${!realTimeEnabled ? 'enabled' : 'disabled'}`);
  };

  // Enhanced export functionality
  const exportOrderData = async (format = 'csv') => {
    try {
      const analytics = calculateAdvancedAnalytics([...orders, ...exportOrders], timelineData, packageItems);
      
      const exportData = {
        analytics,
        statusBreakdown: statusData,
        timeline: timelineData,
        topClients: clientData,
        topProducts: productData,
        packageAnalytics: {
          totalPackages: packageItems.length,
          totalWeight: packageItems.reduce((sum, pkg) => sum + (pkg.net_weight || 0), 0),
          totalVolume: packageItems.reduce((sum, pkg) => sum + (pkg.cbm || 0), 0),
          avgWeightPerPackage: packageItems.length > 0 ? packageItems.reduce((sum, pkg) => sum + (pkg.net_weight || 0), 0) / packageItems.length : 0
        },
        generatedAt: new Date().toISOString(),
        timeRange: timeRange,
        filters: advancedFilters
      };

      if (format === 'csv') {
        const csvContent = convertToCSV(exportData);
        downloadFile(csvContent, `advanced-order-analytics-${format(new Date(), 'yyyy-MM-dd-HH-mm')}.csv`, 'text/csv');
      } else if (format === 'json') {
        const jsonContent = JSON.stringify(exportData, null, 2);
        downloadFile(jsonContent, `advanced-order-analytics-${format(new Date(), 'yyyy-MM-dd-HH-mm')}.json`, 'application/json');
      }

      await logSystemActivity('info', 'Advanced order analytics exported', 'OrderStatusChart', {
        format,
        dataPoints: timelineData.length,
        totalRecords: orders.length + exportOrders.length
      });

      toast.success(`Order data exported as ${format.toUpperCase()}`);
    } catch (err) {
      console.error('Export error:', err);
      toast.error('Failed to export order data');
    }
  };

  const convertToCSV = (data) => {
    const headers = ['Period', 'Orders', 'Revenue', 'Domestic Revenue', 'Export Revenue', 'Avg Order Value', 'High Value Orders'];
    const rows = data.timeline.map(item => [
      item.period,
      item.orders,
      item.revenue,
      item.domestic,
      item.export,
      item.avgOrderValue,
      item.highValueOrders
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

  // Advanced filtering component
  const AdvancedFilters = () => (
    <div className="advanced-filters glass-card">
      <div className="filters-header">
        <h4><FaFilter /> Advanced Filters</h4>
        <button 
          onClick={() => setAdvancedFilters({
            clientType: 'all',
            productCategory: 'all',
            minValue: 0,
            maxValue: 1000000,
            status: 'all',
            geographicRegion: 'all'
          })}
          className="clear-filters-btn"
        >
          Clear All
        </button>
      </div>
      
      <div className="filters-grid">
        <div className="filter-group">
          <label>Client Type</label>
          <select 
            value={advancedFilters.clientType}
            onChange={(e) => setAdvancedFilters({...advancedFilters, clientType: e.target.value})}
          >
            <option value="all">All Clients</option>
            <option value="domestic">Domestic Only</option>
            <option value="export">Export Only</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Order Status</label>
          <select 
            value={advancedFilters.status}
            onChange={(e) => setAdvancedFilters({...advancedFilters, status: e.target.value})}
          >
            <option value="all">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="in_progress">In Progress</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Min Order Value (₹)</label>
          <input
            type="number"
            value={advancedFilters.minValue}
            onChange={(e) => setAdvancedFilters({...advancedFilters, minValue: parseInt(e.target.value) || 0})}
            placeholder="0"
          />
        </div>

        <div className="filter-group">
          <label>Max Order Value (₹)</label>
          <input
            type="number"
            value={advancedFilters.maxValue}
            onChange={(e) => setAdvancedFilters({...advancedFilters, maxValue: parseInt(e.target.value) || 1000000})}
            placeholder="1000000"
          />
        </div>
      </div>
    </div>
  );

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip glass-card">
          <p className="tooltip-label font-semibold text-gold-primary">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="tooltip-value" style={{ color: entry.color }}>
              {entry.name}: {entry.dataKey === 'revenue' || entry.dataKey === 'value' ? 
                <><FaRupeeSign className="inline" /> {entry.value.toLocaleString('en-IN')}</> : 
                entry.value
              }
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderAdvancedMetrics = (analytics) => (
    <div className="metrics-grid enhanced">
      <div className="metric-card primary">
        <div className="metric-icon">
          <FaTachometerAlt />
          {realTimeEnabled && <span className="real-time-indicator"></span>}
        </div>
        <div className="metric-content">
          <h3>Total Revenue</h3>
          <p className="metric-value">₹{analytics.totalRevenue.toLocaleString('en-IN')}</p>
          <span className={`metric-trend ${analytics.revenueGrowth >= 0 ? 'positive' : 'negative'}`}>
            {analytics.revenueGrowth >= 0 ? <FaArrowUp /> : <FaArrowDown />}
            {Math.abs(analytics.revenueGrowth).toFixed(1)}%
          </span>
          <div className="metric-projection">
            Projected: ₹{analytics.projectedRevenue.toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      <div className="metric-card success">
        <div className="metric-icon">
          <FaCheckCircle />
        </div>
        <div className="metric-content">
          <h3>Order Completion</h3>
          <p className="metric-value">{analytics.completedOrders}/{analytics.totalOrders}</p>
          <span className="metric-label">
            {analytics.conversionRate.toFixed(1)}% Success Rate
          </span>
          <div className="metric-projection">
            Forecast: {analytics.completionForecast.toFixed(0)} orders
          </div>
        </div>
      </div>

      <div className="metric-card warning">
        <div className="metric-icon">
          <FaGlobeAmericas />
        </div>
        <div className="metric-content">
          <h3>Export Business</h3>
          <p className="metric-value">{analytics.exportOrders} orders</p>
          <span className="metric-label">
            {analytics.exportRevenueRatio.toFixed(1)}% of Revenue
          </span>
          <div className="metric-detail">
            {analytics.domesticOrders} domestic
          </div>
        </div>
      </div>

      <div className="metric-card info">
        <div className="metric-icon">
          <FaCubes />
        </div>
        <div className="metric-content">
          <h3>Package Analytics</h3>
          <p className="metric-value">{analytics.totalPackages} pkgs</p>
          <span className="metric-label">
            {analytics.totalWeight.toFixed(0)} kg • {analytics.totalVolume.toFixed(2)} m³
          </span>
          <div className="metric-detail">
            Avg: {(analytics.totalWeight/analytics.totalPackages).toFixed(1)} kg/pkg
          </div>
        </div>
      </div>
    </div>
  );

  const renderStatusDistribution = () => (
    <div className="chart-section">
      <div className="chart-header">
        <h4 className="chart-title">Order Status Distribution</h4>
        <div className="chart-actions">
          <button className="btn-drilldown" onClick={() => toast.info('Drill-down feature activated')}>
            <FaChartLine /> Drill Down
          </button>
        </div>
      </div>
      <div className="chart-row">
        <div className="chart-half">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ status, percentage }) => `${status} (${percentage.toFixed(1)}%)`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="count"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-half">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={statusData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="status" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="value" fill="#FFD700" radius={[4, 4, 0, 0]} name="Revenue (₹)" />
              <Bar dataKey="count" fill="#B8860B" radius={[4, 4, 0, 0]} name="Order Count" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  const renderOrderTimeline = () => (
    <div className="chart-section">
      <div className="chart-header">
        <h4 className="chart-title">Order Timeline Analysis</h4>
        <div className="chart-actions">
          <button className="btn-alert" onClick={() => toast.warning('Performance alert configured')}>
            <FaBell /> Set Alert
          </button>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={timelineData}>
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
            yAxisId="left"
          />
          <YAxis 
            stroke="#9CA3AF"
            orientation="right"
            yAxisId="right"
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar 
            dataKey="orders" 
            fill="#B8860B" 
            radius={[4, 4, 0, 0]}
            name="Number of Orders"
            yAxisId="right"
          />
          <Line 
            type="monotone" 
            dataKey="revenue" 
            stroke="#FFD700" 
            strokeWidth={3}
            dot={{ fill: '#FFD700', strokeWidth: 2, r: 4 }}
            name="Total Revenue"
            yAxisId="left"
          />
          <Area 
            type="monotone" 
            dataKey="export" 
            fill="url(#exportGradient)" 
            stroke="#10B981"
            strokeWidth={2}
            fillOpacity={0.3}
            name="Export Revenue"
            yAxisId="left"
          />
          <Area 
            type="monotone" 
            dataKey="domestic" 
            fill="url(#domesticGradient)" 
            stroke="#3B82F6"
            strokeWidth={2}
            fillOpacity={0.3}
            name="Domestic Revenue"
            yAxisId="left"
          />
          <defs>
            <linearGradient id="exportGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="domesticGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );

  const renderClientPerformance = () => (
    <div className="chart-section">
      <h4 className="chart-title">Top Clients by Revenue</h4>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={clientData.slice(0, 8)} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            type="number"
            stroke="#9CA3AF"
            tickFormatter={(value) => `₹${value / 1000}k`}
          />
          <YAxis 
            type="category" 
            dataKey="client"
            stroke="#9CA3AF"
            width={150}
          />
          <Tooltip 
            formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Revenue']}
          />
          <Bar 
            dataKey="revenue" 
            fill="#FFA500" 
            radius={[0, 4, 4, 0]}
            name="Revenue"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  const renderProductPerformance = () => (
    <div className="chart-section">
      <h4 className="chart-title">Product Performance Matrix</h4>
      <ResponsiveContainer width="100%" height={350}>
        <ComposedChart data={productData.slice(0, 10)}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="product" 
            stroke="#9CA3AF"
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis 
            stroke="#9CA3AF"
            tickFormatter={(value) => `₹${value / 1000}k`}
            yAxisId="left"
          />
          <YAxis 
            stroke="#9CA3AF"
            orientation="right"
            yAxisId="right"
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar 
            dataKey="revenue" 
            fill="#FFD700" 
            radius={[4, 4, 0, 0]}
            name="Revenue (₹)"
            yAxisId="left"
          />
          <Line 
            type="monotone" 
            dataKey="quantity" 
            stroke="#10B981" 
            strokeWidth={2}
            name="Quantity Sold"
            yAxisId="right"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );

  const renderGeographicDistribution = () => (
    <div className="chart-section">
      <h4 className="chart-title">Geographic Distribution</h4>
      <div className="geo-grid">
        {clientData.slice(0, 6).map((client, index) => (
          <div key={index} className="geo-card">
            <FaMapMarkerAlt className="geo-icon" />
            <div className="geo-content">
              <h5>{client.country || 'Unknown'}</h5>
              <p>{client.orders} orders</p>
              <span className="geo-revenue">₹{client.revenue.toLocaleString('en-IN')}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="chart-container glass-card">
        <div className="chart-header">
          <h3><FaChartBar /> Advanced Order Analytics</h3>
          <div className="chart-loading">
            <div className="loading-spinner"></div>
            <span>Loading real-time order data from database...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="chart-container glass-card">
        <div className="chart-header">
          <h3><FaChartBar /> Advanced Order Analytics</h3>
          <div className="chart-error">
            <FaExclamationTriangle className="error-icon" />
            <p>{error}</p>
            <button onClick={fetchOrderData} className="retry-button">
              <FaSync /> Retry Loading
            </button>
          </div>
        </div>
      </div>
    );
  }

  const analytics = calculateAdvancedAnalytics([...orders, ...exportOrders], timelineData, packageItems);

  return (
    <div className="chart-container glass-card">
      <div className="chart-header enhanced">
        <div className="header-content">
          <div className="header-main">
            <h3><FaChartBar /> Advanced Order Analytics</h3>
            <div className="header-badges">
              {realTimeEnabled && <span className="badge real-time">LIVE</span>}
              <span className="badge data-points">{orders.length + exportOrders.length} Orders</span>
              <span className="badge time-range">{timeRange}</span>
            </div>
          </div>
          <div className="header-actions enhanced">
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
              onClick={toggleRealTime}
              className={`realtime-button ${realTimeEnabled ? 'active' : ''}`}
            >
              <FaRocket /> {realTimeEnabled ? 'Live' : 'Enable Live'}
            </button>
            
            <button 
              onClick={refreshData} 
              disabled={refreshing}
              className="refresh-button"
            >
              <FaSync className={refreshing ? 'spinning' : ''} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            
            <div className="export-dropdown">
              <button className="export-button">
                <FaDownload /> Export
              </button>
              <div className="export-menu">
                <button onClick={() => exportOrderData('csv')}>CSV Format</button>
                <button onClick={() => exportOrderData('json')}>JSON Format</button>
              </div>
            </div>
          </div>
        </div>
        
        {renderAdvancedMetrics(analytics)}
      </div>

      <AdvancedFilters />

      <div className="charts-content enhanced">
        {renderStatusDistribution()}
        {renderOrderTimeline()}
        
        <div className="charts-grid">
          {renderClientPerformance()}
          {renderProductPerformance()}
        </div>

        {renderGeographicDistribution()}

        {/* Enhanced Insights Section */}
        <div className="insights-section enhanced">
          <h4>Advanced Business Intelligence</h4>
          <div className="insights-grid">
            <div className="insight-card predictive">
              <h5>Revenue Forecast</h5>
              <p>Next 30 Days</p>
              <span className="insight-value">
                ₹{analytics.projectedRevenue.toLocaleString('en-IN')}
              </span>
              <div className="insight-trend">
                <FaArrowUp className="positive" />
                {analytics.revenueGrowth.toFixed(1)}% growth
              </div>
            </div>
            
            <div className="insight-card performance">
              <h5>Order Completion Rate</h5>
              <p>Current Performance</p>
              <span className="insight-value">
                {analytics.conversionRate.toFixed(1)}%
              </span>
              <div className="performance-bar">
                <div 
                  className="performance-fill" 
                  style={{width: `${analytics.conversionRate}%`}}
                ></div>
              </div>
            </div>
            
            <div className="insight-card efficiency">
              <h5>Package Efficiency</h5>
              <p>Weight Distribution</p>
              <span className="insight-value">
                {(analytics.totalWeight/analytics.totalPackages).toFixed(1)} kg/pkg
              </span>
              <div className="efficiency-metric">
                {analytics.totalPackages} packages
              </div>
            </div>

            <div className="insight-card international">
              <h5>International Business</h5>
              <p>Export Contribution</p>
              <span className="insight-value">
                {analytics.exportRevenueRatio.toFixed(1)}%
              </span>
              <div className="international-breakdown">
                {analytics.exportOrders} export • {analytics.domesticOrders} domestic
              </div>
            </div>
          </div>
        </div>

        {/* Real-time Activity Feed */}
        <div className="activity-feed">
          <h4>Recent Order Activity</h4>
          <div className="activity-list">
            {[...orders, ...exportOrders]
              .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
              .slice(0, 5)
              .map((order, index) => (
                <div key={index} className="activity-item">
                  <div className="activity-icon">
                    {order.destination_country ? <FaGlobeAmericas /> : <FaShoppingCart />}
                  </div>
                  <div className="activity-content">
                    <p>
                      <strong>{order.order_number}</strong> - {order.status}
                    </p>
                    <span className="activity-meta">
                      {format(new Date(order.updated_at), 'MMM dd, HH:mm')} • 
                      ₹{(order.total_amount || order.total_value || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderStatusChart;