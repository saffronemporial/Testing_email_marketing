// src/components/Dashboard/AdminDashboard.jsx
import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useSettings } from '../../../context/SettingsContext';
import supabase from '../../../supabaseClient';
import { toast } from 'react-hot-toast';
import { useSearch } from '../../../context/SearchContext';

// Dashboard components
import ExportManager from './ExportManager';
import CustomsManager from './CustomsManager';
import InventoryAlerts from './InventoryAlerts';
import SupplierPerformance from './SupplierPerformance';
import ComplianceTracker from './ComplianceTracker';
import SystemHealth from './SystemHealth';
import UserManagement from './UserManagement';
import BulkOperations from './BulkOperations';
import SettingsPanel from './SettingsPanel';
import DataExporter from './DataExporter';
import ShipmentMaps from './ShipmentMaps';
import FinanceDashboard from "../../ExportFinance/Reports/FinanceDashboard";
import SearchBar from '../../Search/SearchBar';
import SearchResults from '../../Search/SearchResults';

// Icons
import {
  FaLeaf, FaSync, FaDownload, FaSpinner, FaExclamationTriangle,
  FaMoneyBillWave, FaShoppingCart, FaGlobeAmericas, FaUserTie, FaCubes,
  FaIndustry, FaChartBar, FaChartLine, FaShippingFast, FaTruck,
  FaEye, FaThermometerHalf, FaClock, FaBell, FaPlus, FaFileExport,
  FaRocket, FaUsers, FaBoxOpen, FaFileInvoice, FaChartPie,
  FaCog, FaDatabase, FaShieldAlt, FaTasks, FaGem, FaCrown,
  FaArrowUp, FaArrowDown, FaStar, FaSyncAlt, FaSearch,
  FaFilter, FaDollarSign, FaWarehouse, FaClipboardCheck,
  FaTachometerAlt, FaListAlt, FaMapMarkerAlt, FaCogs,
  FaUserFriends, FaHistory, FaBell as FaBellSolid,
  FaCalendarAlt, FaChartArea, FaExchangeAlt, FaPercent,
  FaExclamationCircle, FaCheckCircle, FaTimesCircle,  
  FaBolt,
  FaLayerGroup,
  FaTasks as FaTasksSolid,
  FaMap,
  FaLayerGroup as FaLayerGroupIcon,
  FaBolt as FaBoltIcon,
  FaCogs as FaCogsIcon,
  FaMapMarkedAlt
} from 'react-icons/fa';

import './AdminDashboard.css';

// Initialize user settings
const initializeUserSettings = async (userId) => {
  if (!userId) return null;
  
  try {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') throw error;
    
    if (!data) {
      const { data: newSettings, error: createError } = await supabase
        .from('user_settings')
        .insert([{
          user_id: userId,
          settings: {
            theme: 'gold-premium',
            currency: 'INR',
            language: 'en',
            timezone: 'Asia/Kolkata',
            animations: true,
            autoRefresh: true,
            glassEffect: true,
            businessName: 'Saffron Emporial',
            dataRetention: 365,
            defaultCarrier: 'dhl',
            lowStockAlerts: true,
            backupFrequency: 'daily',
            refreshInterval: 30000,
            shipmentUpdates: true,
            customsClearance: true,
            pushNotifications: true,
            emailNotifications: true,
            exportDocumentation: true,
            dashboardLayout: 'modern',
            sidebarCollapsed: false,
            darkMode: false,
            compactMode: false
          }
        }])
        .select()
        .single();

      if (createError) throw createError;
      return newSettings;
    }
    
    return data;
  } catch (error) {
    console.error('User settings initialization failed:', error);
    return null;
  }
};

const AdminDashboard = () => {
  const { user, userProfile } = useAuth();
  const { settings, updateSettings } = useSettings();
  const { searchTerm, setSearchTerm, runSearch, results, loading: searchLoading } = useSearch();
  const navigate = useNavigate();
  const isMounted = useRef(true);
  
  // Dashboard state
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [timeFilter, setTimeFilter] = useState('today');
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [notificationsCount, setNotificationsCount] = useState(0);
  
  // Additional state for new components
  const [bulkOperations, setBulkOperations] = useState({
    selectedItems: [],
    operationType: 'none',
    progress: 0,
    isRunning: false
  });
  
  const [mapSettings, setMapSettings] = useState({
    zoom: 3,
    center: [20.5937, 78.9629], // India coordinates
    showRoutes: true,
    showMarkers: true,
    showHeatmap: false
  });
  
  const [userPreferences, setUserPreferences] = useState({
    notifications: true,
    emailAlerts: true,
    autoSave: true,
    theme: 'gold-premium',
    language: 'en',
    timezone: 'Asia/Kolkata',
    dateFormat: 'DD/MM/YYYY',
    currency: 'INR'
  });

  // Dashboard data
  const [dashboardStats, setDashboardStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    activeShipments: 0,
    totalClients: 0,
    totalRevenue: 0,
    complianceDocuments: 0,
    delayedShipments: 0,
    lowStockItems: 0,
    pendingInvoices: 0,
    activeSuppliers: 0,
    systemHealth: 'healthy',
    exportOrders: 0,
    customsDeclarations: 0,
    revenueGrowth: 0,
    avgOrderValue: 0,
    topProduct: 'N/A',
    successRate: 0,
    profitMargin: 0,
    orderGrowth: 0,
    customerSatisfaction: 0,
    inventoryValue: 0
  });
  
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentShipments, setRecentShipments] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [systemHealth, setSystemHealth] = useState({ 
    status: 'healthy', 
    errorCount: 0,
    uptime: '99.9%',
    responseTime: '120ms',
    databaseHealth: 'optimal',
    apiHealth: 'stable'
  });
  const [userSettings, setUserSettings] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [performanceMetrics, setPerformanceMetrics] = useState({
    fulfillmentRate: 0,
    onTimeDelivery: 0,
    customerSatisfaction: 0,
    complianceRate: 0,
    shipmentAccuracy: 0,
    documentCompletion: 0
  });
  const [quickStats, setQuickStats] = useState({
    todayRevenue: 0,
    todayOrders: 0,
    todayShipments: 0,
    weekGrowth: 0,
    monthGrowth: 0
  });

const tabs = [
  { id: 'overview', label: 'Dashboard', icon: <FaTachometerAlt />, color: 'var(--gold-primary)' },
  { id: 'exports', label: 'Exports', icon: <FaShippingFast />, color: 'var(--info)' },
  { id: 'customs', label: 'Customs', icon: <FaShieldAlt />, color: 'var(--success)' },
  { id: 'inventory', label: 'Inventory', icon: <FaCubes />, color: 'var(--warning)' },
  { id: 'analytics', label: 'Analytics', icon: <FaChartLine />, color: 'var(--gold-secondary)' },
  { id: 'compliance', label: 'Compliance', icon: <FaClipboardCheck />, color: 'var(--danger)' },
  { id: 'finance', label: 'FinanceDashboard', icon: <FaMoneyBillWave />, color: 'var(--purple)' },
  { id: 'maps', label: 'Shipment Maps', icon: <FaMapMarkedAlt />, color: 'var(--teal)' }, // NEW
  { id: 'bulk', label: 'Bulk Operations', icon: <FaLayerGroupIcon />, color: 'var(--orange)' }, // NEW
  { id: 'settings', label: 'Settings', icon: <FaCogsIcon />, color: 'var(--dark)' }, // NEW
  { id: 'system', label: 'System', icon: <FaCog />, color: 'var(--gray)' },
  { id: 'users', label: 'Users', icon: <FaUserFriends />, color: 'var(--blue)' },
  { id: 'reports', label: 'Reports', icon: <FaChartArea />, color: 'var(--pink)' }
];

  // Initialize user settings
  useEffect(() => {
    const initSettings = async () => {
      if (user?.id) {
        const settingsData = await initializeUserSettings(user.id);
        setUserSettings(settingsData);
        if (settingsData?.settings?.theme) {
          document.documentElement.setAttribute('data-theme', settingsData.settings.theme);
        }
      }
    };
    initSettings();
  }, [user]);

  // Date filter helper
  const getDateFilter = useCallback((filter) => {
    const now = new Date();
    switch (filter) {
      case 'today':
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
        const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        return { start: todayStart.toISOString(), end: todayEnd.toISOString() };
      case 'week':
        const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
        return { start: weekStart.toISOString(), end: now.toISOString() };
      case 'month':
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        return { start: monthStart.toISOString(), end: now.toISOString() };
      case 'quarter':
        const quarterStart = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        return { start: quarterStart.toISOString(), end: now.toISOString() };
      default:
        const yearStart = new Date(now.getFullYear(), 0, 1);
        return { start: yearStart.toISOString(), end: now.toISOString() };
    }
  }, []);

    // Bulk Operations Handlers
  const handleBulkOperation = async (operation, items) => {
    try {
      setBulkOperations(prev => ({ ...prev, isRunning: true, progress: 0 }));
      
      switch (operation) {
        case 'export_status_update':
          // Update multiple export statuses
          await supabase
            .from('export_orders')
            .update({ status: 'processing' })
            .in('id', items);
          break;
          
        case 'inventory_update':
          // Update inventory quantities
          await supabase
            .from('products')
            .update({ last_updated: new Date().toISOString() })
            .in('id', items);
          break;
          
        case 'shipment_tracking':
          // Refresh tracking for multiple shipments
          await supabase
            .from('shipments')
            .update({ tracking_updated: new Date().toISOString() })
            .in('id', items);
          break;
          
        case 'document_generation':
          // Generate documents for multiple orders
          await supabase
            .from('export_documents')
            .insert(
              items.map(id => ({
                export_order_id: id,
                document_type: 'invoice',
                status: 'generated',
                created_at: new Date().toISOString()
              }))
            );
          break;
      }
      
      toast.success(`Bulk operation completed successfully`);
    } catch (error) {
      console.error('Bulk operation failed:', error);
      toast.error('Bulk operation failed');
    } finally {
      setBulkOperations(prev => ({ ...prev, isRunning: false, progress: 100 }));
    }
  };

  // Map Handlers
  const handleMapViewChange = (settings) => {
    setMapSettings(prev => ({ ...prev, ...settings }));
  };

  const handleShipmentSelection = (shipmentId) => {
    navigate(`/admin/shipments/${shipmentId}`);
  };

  // Settings Handlers
  const handleSettingsUpdate = async (updates) => {
    try {
      if (user?.id) {
        await supabase
          .from('user_settings')
          .update({ 
            settings: { ...userSettings?.settings, ...updates },
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);
        
        setUserSettings(prev => ({
          ...prev,
          settings: { ...prev?.settings, ...updates }
        }));
        
        setUserPreferences(prev => ({ ...prev, ...updates }));
        
        // Update global theme if theme changed
        if (updates.theme) {
          document.documentElement.setAttribute('data-theme', updates.theme);
        }
        
        toast.success('Settings updated successfully');
      }
    } catch (error) {
      console.error('Settings update failed:', error);
      toast.error('Failed to update settings');
    }
  };

  // Enhanced data fetch with real-time updates
  const fetchDashboardData = useCallback(async ({ silent = false } = {}) => {
    if (!silent) {
      setRefreshing(true);
      setError('');
    }

    try {
      const dateRange = getDateFilter(timeFilter);
      
      // Fetch all data with proper error handling
      const [
        { data: orders, error: ordersError },
        { data: exportOrders, error: exportOrdersError },
        { data: shipments, error: shipmentsError },
        { data: clients, error: clientsError },
        { data: products, error: productsError },
        { data: suppliers, error: suppliersError },
        { data: customs, error: customsError },
        { data: documents, error: documentsError },
        { data: invoices, error: invoicesError },
        { data: logs, error: logsError }
      ] = await Promise.all([
        supabase.from('orders').select('id, total_amount, status, created_at, customer_name').gte('created_at', dateRange.start).lte('created_at', dateRange.end),
        supabase.from('export_orders').select('id, total_order_value, status, created_at, export_reference, destination_country').order('created_at', { ascending: false }),
        supabase.from('shipments').select('id, status, tracking_number, estimated_delivery, created_at, carrier, current_location').order('created_at', { ascending: false }),
        supabase.from('profiles').select('id, full_name, email, role, company_name').eq('role', 'client'),
        supabase.from('products').select('id, name, available_quantity, minimum_stock, category, unit_price, sku').order('available_quantity', { ascending: true }),
        supabase.from('suppliers').select('id, company_name, status, performance_rating, contact_person').eq('status', 'active'),
        supabase.from('customs_declarations').select('id, status, total_value, declaration_number, created_at').order('created_at', { ascending: false }),
        supabase.from('export_documents').select('id, document_type, status, created_at'),
        supabase.from('invoices').select('id, status, total_amount, due_date').eq('status', 'pending'),
        supabase.from('system_logs').select('level, created_at, message').gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()).order('created_at', { ascending: false })
      ]);

      // Handle errors
      const errors = [ordersError, exportOrdersError, shipmentsError, clientsError, 
                     productsError, suppliersError, customsError, documentsError, 
                     invoicesError, logsError].filter(Boolean);
      
      if (errors.length > 0) {
        console.error('Dashboard fetch errors:', errors);
      }

      // Calculate statistics
      const allOrders = [...(orders || []), ...(exportOrders || [])];
      const totalRevenue = allOrders.reduce((sum, item) => 
        sum + (Number(item.total_amount || item.total_order_value || 0)), 0
      );

      const pendingOrders = allOrders.filter(o => 
        ['pending', 'processing', 'confirmed', 'awaiting_payment'].includes(String(o.status))
      ).length;

      const activeShipments = (shipments || []).filter(s => 
        ['in_transit', 'out_for_delivery', 'processing', 'awaiting_departure'].includes(String(s.status))
      ).length;

      const delayedShipments = (shipments || []).filter(s => 
        String(s.status) === 'delayed' || 
        (s.estimated_delivery && new Date(s.estimated_delivery) < new Date())
      ).length;

      const lowStockItems = (products || []).filter(p => 
        Number(p.available_quantity) <= Number(p.minimum_stock || 10)
      ).length;

      const errorCount = (logs || []).filter(l => String(l.level) === 'error').length;
      const systemStatus = errorCount > 10 ? 'critical' : errorCount > 3 ? 'warning' : 'healthy';

      const inventoryValue = (products || []).reduce((sum, p) => 
        sum + (Number(p.available_quantity) * Number(p.unit_price || 0)), 0
      );

      // Find top product
      const productSales = {};
      allOrders.forEach(order => {
        // This would need order_items data - simplified for now
      });
      const topProduct = Object.keys(productSales).length > 0 
        ? Object.keys(productSales).reduce((a, b) => productSales[a] > productSales[b] ? a : b)
        : 'Saffron Premium';

      // Calculate growth rates
      const previousDateRange = getDateFilter('week'); // Compare with previous period
      const { data: previousOrders } = await supabase
        .from('orders')
        .select('total_amount')
        .gte('created_at', previousDateRange.start)
        .lte('created_at', previousDateRange.end);

      const previousRevenue = (previousOrders || []).reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
      const revenueGrowth = previousRevenue > 0 
        ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 
        : 100;

      // Update stats
      if (isMounted.current) {
        setDashboardStats(prev => ({
          ...prev,
          totalOrders: allOrders.length,
          pendingOrders,
          activeShipments,
          totalClients: (clients || []).length,
          totalRevenue,
          complianceDocuments: (documents || []).length,
          delayedShipments,
          lowStockItems,
          pendingInvoices: (invoices || []).length,
          activeSuppliers: (suppliers || []).filter(s => s.status === 'active').length,
          systemHealth: systemStatus,
          exportOrders: (exportOrders || []).length,
          customsDeclarations: (customs || []).length,
          revenueGrowth: parseFloat(revenueGrowth.toFixed(1)),
          avgOrderValue: allOrders.length > 0 ? totalRevenue / allOrders.length : 0,
          topProduct,
          successRate: parseFloat(((allOrders.filter(o => o.status === 'completed').length / allOrders.length) * 100).toFixed(1)) || 0,
          profitMargin: parseFloat(((totalRevenue * 0.35) / totalRevenue * 100).toFixed(1)) || 35,
          orderGrowth: parseFloat(((allOrders.length - (previousOrders?.length || 0)) / (previousOrders?.length || 1) * 100).toFixed(1)),
          inventoryValue: parseFloat(inventoryValue.toFixed(2)),
          customerSatisfaction: 96.5 // Would come from feedback system
        }));

        // Set recent data with proper formatting
        setRecentOrders((orders || []).slice(0, 5).map(order => ({
          id: order.id,
          reference: `ORD-${order.id.slice(-6)}`,
          customer: order.customer_name || 'Unknown',
          amount: order.total_amount,
          status: order.status,
          date: new Date(order.created_at).toLocaleDateString()
        })));

        setRecentShipments((shipments || []).slice(0, 5).map(shipment => ({
          id: shipment.id,
          tracking: shipment.tracking_number || 'N/A',
          carrier: shipment.carrier || 'Unknown',
          status: shipment.status,
          location: shipment.current_location || 'In transit',
          estimated: shipment.estimated_delivery ? new Date(shipment.estimated_delivery).toLocaleDateString() : 'N/A'
        })));

        // System health details
        setSystemHealth({
          status: systemStatus,
          errorCount,
          uptime: '99.9%',
          responseTime: '120ms',
          databaseHealth: 'optimal',
          apiHealth: 'stable'
        });

        // Build alerts
        const newAlerts = [];
        if (lowStockItems > 0) {
          newAlerts.push({
            type: 'warning',
            icon: <FaExclamationTriangle />,
            message: `${lowStockItems} product${lowStockItems > 1 ? 's' : ''} below minimum stock level`,
            link: '/admin/inventory',
            timestamp: new Date().toISOString()
          });
        }
        if (delayedShipments > 0) {
          newAlerts.push({
            type: 'danger',
            icon: <FaTruck />,
            message: `${delayedShipments} shipment${delayedShipments > 1 ? 's' : ''} delayed or overdue`,
            link: '/admin/shipments',
            timestamp: new Date().toISOString()
          });
        }
        if (pendingOrders > 10) {
          newAlerts.push({
            type: 'info',
            icon: <FaShoppingCart />,
            message: `${pendingOrders} orders pending processing`,
            link: '/admin/orders',
            timestamp: new Date().toISOString()
          });
        }
        if (systemStatus === 'critical') {
          newAlerts.push({
            type: 'danger',
            icon: <FaCog />,
            message: 'System health critical - immediate attention required',
            link: '/admin/system',
            timestamp: new Date().toISOString()
          });
        }
        if (invoices?.length > 5) {
          newAlerts.push({
            type: 'warning',
            icon: <FaFileInvoice />,
            message: `${invoices.length} invoices pending payment`,
            link: '/admin/FinanceDashboardPage',
            timestamp: new Date().toISOString()
          });
        }
        setAlerts(newAlerts);

        // Fetch notifications
        const { data: recentNotifications } = await supabase
          .from('notifications')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10)
          .eq('read', false);

        setNotifications(recentNotifications || []);
        setNotificationsCount(recentNotifications?.length || 0);

        // Performance metrics
        setPerformanceMetrics({
          fulfillmentRate: 92.5,
          onTimeDelivery: 94.2,
          customerSatisfaction: 96.5,
          complianceRate: 98.1,
          shipmentAccuracy: 99.3,
          documentCompletion: 97.8
        });

        // Quick stats for today
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        const { data: todayOrders } = await supabase
          .from('orders')
          .select('total_amount')
          .gte('created_at', todayStart.toISOString())
          .lte('created_at', todayEnd.toISOString());

        const todayRevenue = (todayOrders || []).reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
        const todayOrderCount = todayOrders?.length || 0;

        const { data: todayShipments } = await supabase
          .from('shipments')
          .select('id')
          .gte('created_at', todayStart.toISOString())
          .lte('created_at', todayEnd.toISOString());

        setQuickStats({
          todayRevenue,
          todayOrders: todayOrderCount,
          todayShipments: todayShipments?.length || 0,
          weekGrowth: 12.5,
          monthGrowth: 28.3
        });
      }

    } catch (err) {
      console.error('Dashboard data fetch error:', err);
      if (isMounted.current) {
        setError(`Failed to load dashboard data: ${err.message}`);
        toast.error('Failed to load dashboard data');
      }
    } finally {
      if (isMounted.current && !silent) {
        setRefreshing(false);
        setLoading(false);
      }
    }
  }, [getDateFilter, timeFilter]);

  // Initial data fetch
  useEffect(() => {
    isMounted.current = true;
    fetchDashboardData({ silent: false });

    // Set up auto-refresh based on user settings
    const refreshInterval = userSettings?.settings?.refreshInterval || 30000;
    const autoRefresh = userSettings?.settings?.autoRefresh !== false;

    let interval;
    if (autoRefresh) {
      interval = setInterval(() => {
        if (isMounted.current) {
          fetchDashboardData({ silent: true });
        }
      }, refreshInterval);
    }

    // Real-time subscription for notifications
    const notificationsChannel = supabase
      .channel('notifications-channel')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        () => {
          fetchDashboardData({ silent: true });
        }
      )
      .subscribe();

    return () => {
      isMounted.current = false;
      if (interval) clearInterval(interval);
      supabase.removeChannel(notificationsChannel);
    };
  }, [fetchDashboardData, userSettings]);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  // Format number with commas
  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-IN').format(num || 0);
  };

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchDashboardData({ silent: true });
      toast.success('Dashboard refreshed successfully');
    } catch (err) {
      toast.error('Refresh failed');
    } finally {
      setRefreshing(false);
    }
  };

  // Quick action handlers
  const handleQuickAction = (action) => {
    switch (action) {
      case 'new_export':
        navigate('/admin/exports/new');
        toast.success('Opening new export form...');
        break;
      case 'generate_report':
        toast.success('Generating business intelligence report...');
        // Trigger report generation
        break;
      case 'customs_check':
        setActiveTab('customs');
        toast.info('Navigating to Customs Management');
        break;
      case 'inventory_alert':
        setActiveTab('inventory');
        toast.info('Navigating to Inventory Alerts');
        break;
      case 'add_product':
        navigate('/admin/products/new');
        break;
      case 'view_reports':
        navigate('/admin/reports');
        break;
      case 'system_settings':
        setActiveTab('system');
        break;
      default:
        break;
    }
  };

  // Handle search
  const handleSearch = (term) => {
    if (term.trim().length >= 2) {
      setSearchTerm(term);
      runSearch(term);
      setShowSearchResults(true);
    }
  };

  // Stat Card Component
  const StatCard = ({ title, value, icon, badge, trend, color = 'gold', onClick, className = '' }) => (
    <div 
      className={`stat-card glass-card floating ${className}`}
      onClick={onClick}
      style={{ 
        '--stat-color': color,
        cursor: onClick ? 'pointer' : 'default'
      }}
    >
      <div className="stat-header">
        <div className="stat-icon" style={{ background: `linear-gradient(135deg, ${color}, ${color}80)` }}>
          {icon}
        </div>
        <div className="stat-meta">
          {trend && (
            <div className={`trend-indicator ${trend > 0 ? 'positive' : 'negative'}`}>
              {trend > 0 ? <FaArrowUp /> : <FaArrowDown />} {Math.abs(trend)}%
            </div>
          )}
          {badge && <div className="stat-badge">{badge}</div>}
        </div>
      </div>
      <div className="stat-body">
        <div className="stat-value animate-count">{value}</div>
        <div className="stat-title">{title}</div>
      </div>
      {onClick && <div className="stat-hover">Click to view details →</div>}
    </div>
  );

  // Quick Actions Component
  const QuickActions = ({ onAction }) => (
    <div className="quick-actions glass-card floating">
      <div className="section-header">
        <FaRocket className="section-icon" />
        <h4>Quick Actions</h4>
      </div>
      <div className="actions-grid">
        <button 
          onClick={() => onAction('new_export')} 
          className="action-btn primary animate-hover"
        >
          <FaFileExport /> New Export
        </button>
        <button 
          onClick={() => onAction('generate_report')} 
          className="action-btn secondary animate-hover"
        >
          <FaChartPie /> Generate Report
        </button>
        <button 
          onClick={() => onAction('customs_check')} 
          className="action-btn success animate-hover"
        >
          <FaShieldAlt /> Customs Check
        </button>
        <button 
          onClick={() => onAction('inventory_alert')} 
          className="action-btn warning animate-hover"
        >
          <FaBoxOpen /> Inventory Alert
        </button>
        <button 
          onClick={() => onAction('add_product')} 
          className="action-btn info animate-hover"
        >
          <FaPlus /> Add Product
        </button>
        <button 
          onClick={() => onAction('view_reports')} 
          className="action-btn purple animate-hover"
        >
          <FaChartArea /> View Reports
        </button>
        <button 
          onClick={() => onAction('system_settings')} 
          className="action-btn dark animate-hover"
        >
          <FaCogs /> System Settings
        </button>
        <button 
          onClick={handleRefresh} 
          className={`action-btn ${refreshing ? 'refreshing' : 'gold'} animate-hover`}
          disabled={refreshing}
        >
          {refreshing ? <FaSpinner className="spinning" /> : <FaSyncAlt />}
          {refreshing ? 'Refreshing...' : 'Refresh Data'}
        </button>
        // Add these buttons to the actions-grid in QuickActions component:
      <button 
       onClick={() => setActiveTab('maps')} 
       className="action-btn teal animate-hover"
       >
      <FaMapMarkedAlt /> View Maps
      </button>
       <button 
      onClick={() => setActiveTab('bulk')} 
      className="action-btn orange animate-hover"
      >
     <FaLayerGroupIcon /> Bulk Ops
     </button>
      <button 
      onClick={() => setActiveTab('settings')} 
      className="action-btn dark animate-hover"
       >
      <FaCogsIcon /> Settings
       </button>
      </div>
    </div>
  );

  // Performance Metrics Component
  const PerformanceMetricsStrip = ({ metrics }) => (
    <div className="performance-strip glass-card floating">
      <div className="strip-header">
        <FaChartLine /> Performance Metrics
      </div>
      <div className="strip-metrics">
        {Object.entries(metrics).map(([key, value]) => (
          <div key={key} className="strip-metric animate-slide">
            <div className="metric-info">
              <span className="metric-label">
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </span>
              <span className="metric-value">{value}%</span>
            </div>
            <div className="metric-progress">
              <div 
                className="progress-bar" 
                style={{ 
                  width: `${value}%`,
                  background: value > 90 ? 'var(--success)' : value > 80 ? 'var(--warning)' : 'var(--danger)'
                }}
              >
                <div className="progress-glow"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Loading state
  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="dashboard-loading glass-card floating">
          <div className="loading-wave">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
          <div className="loading-content">
            <FaLeaf className="brand-icon spin" />
            <h3>Saffron Emporial</h3>
            <p>Loading premium export dashboard...</p>
            <div className="loading-progress">
              <div className="progress-bar"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="admin-dashboard">
        <div className="dashboard-error glass-card floating">
          <FaExclamationTriangle className="error-icon bounce" />
          <h3>Dashboard Load Error</h3>
          <p>{error}</p>
          <div className="error-actions">
            <button onClick={handleRefresh} className="btn gold animate-hover">
              <FaSync /> Retry Loading
            </button>
            <Link to="/support" className="btn secondary animate-hover">
              Get Support
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard" data-theme={userSettings?.settings?.theme || 'gold-premium'}>
      {/* Dashboard Header */}
      <header className="dashboard-header glass-card">
        <div className="header-top">
          <div className="brand-section">
            <div className="brand-icon-wrapper">
              <FaLeaf className="brand-icon spin-slow" />
              <div className="icon-glow"></div>
            </div>
            <div className="brand-text">
              <h1 className="gradient-text">Saffron Emporial</h1>
              <p className="brand-subtitle">Premium Export Management System</p>
            </div>
          </div>
          
          <div className="user-section">
            <div className="welcome-message animate-fade-in">
              Welcome back, <strong>{userProfile?.full_name || user?.email?.split('@')[0] || 'Admin'}</strong>
              {userProfile?.role && <span className="user-role">{userProfile.role}</span>}
            </div>
            {userProfile?.avatar_url && (
              <div className="profile-avatar">
                <img 
                  src={userProfile.avatar_url} 
                  alt={userProfile?.full_name || user?.email}
                  className="avatar-image"
                />
                <div className="avatar-status online"></div>
              </div>
            )}
          </div>
        </div>

        <div className="header-bottom">
          {/* Search Bar */}
          <div className="search-container">
            <SearchBar variant="dashboard" />
          </div>
          
          {/* Header Controls */}
          <div className="header-controls">
            <div className="controls-group">
              <div className="filter-group">
                <FaFilter className="filter-icon" />
                <select 
                  className="time-filter" 
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value)}
                >
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="quarter">This Quarter</option>
                  <option value="year">This Year</option>
                </select>
              </div>

              <div className="view-toggle">
                <button 
                  className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                >
                  <FaListAlt /> Grid
                </button>
                <button 
                  className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                >
                  <FaListAlt /> List
                </button>
              </div>

              <button 
                className={`btn refresh-btn ${refreshing ? 'loading' : ''}`}
                onClick={handleRefresh}
                disabled={refreshing}
              >
                {refreshing ? <FaSpinner className="spinning" /> : <FaSyncAlt />}
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>

              <button className="btn export-btn gold animate-hover">
                <FaDownload /> Export
              </button>

              <div className="notifications-badge">
                <button className="notifications-btn">
                  <FaBellSolid />
                  {notificationsCount > 0 && (
                    <span className="badge-count">{notificationsCount}</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Alerts Panel */}
      {alerts.length > 0 && (
        <section className="alerts-panel glass-card floating">
          <div className="alerts-header">
            <FaExclamationCircle className="alerts-icon" />
            <h4>System Alerts</h4>
            <span className="alerts-count">{alerts.length}</span>
          </div>
          <div className="alerts-list">
            {alerts.map((alert, index) => (
              <div key={index} className={`alert alert-${alert.type} animate-slide`}>
                <div className="alert-icon">{alert.icon}</div>
                <div className="alert-content">
                  <span className="alert-message">{alert.message}</span>
                  <Link to={alert.link} className="alert-action">
                    View Details →
                  </Link>
                </div>
                <div className="alert-time">
                  {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Main Content Area */}
      <main className="dashboard-main">
        {/* Left Sidebar - Navigation */}
        <aside className={`dashboard-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
          <div className="sidebar-header">
            <button 
              className="sidebar-toggle"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              {sidebarCollapsed ? <FaArrowDown /> : <FaArrowUp />}
            </button>
            <h4>Navigation</h4>
          </div>
          <nav className="sidebar-nav">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`sidebar-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
                style={{ '--tab-color': tab.color }}
              >
                <span className="tab-icon">{tab.icon}</span>
                {!sidebarCollapsed && <span className="tab-label">{tab.label}</span>}
                {activeTab === tab.id && <div className="active-indicator"></div>}
              </button>
            ))}
          </nav>
        </aside>

        {/* Center Content - Tab Content */}
        <section className="dashboard-content">
          {/* Navigation Tabs */}
          <div className="content-tabs glass-card">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`content-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {activeTab === tab.id && <div className="tab-underline"></div>}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="tab-content">
            {activeTab === 'overview' && (
              <div className="overview-tab">
                {/* Quick Stats */}
                <div className="quick-stats glass-card floating">
                  <div className="stats-header">
                    <FaTachometerAlt /> Today's Overview
                  </div>
                  <div className="stats-grid">
                    <div className="quick-stat">
                      <FaMoneyBillWave />
                      <div>
                        <div className="stat-label">Today's Revenue</div>
                        <div className="stat-value gold">{formatCurrency(quickStats.todayRevenue)}</div>
                      </div>
                    </div>
                    <div className="quick-stat">
                      <FaShoppingCart />
                      <div>
                        <div className="stat-label">Today's Orders</div>
                        <div className="stat-value">{quickStats.todayOrders}</div>
                      </div>
                    </div>
                    <div className="quick-stat">
                      <FaTruck />
                      <div>
                        <div className="stat-label">Today's Shipments</div>
                        <div className="stat-value">{quickStats.todayShipments}</div>
                      </div>
                    </div>
                    <div className="quick-stat">
                      <FaChartLine />
                      <div>
                        <div className="stat-label">Week Growth</div>
                        <div className="stat-value positive">+{quickStats.weekGrowth}%</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main Stats */}
                <section className="stats-overview">
                  <StatCard 
                    title="Total Revenue" 
                    value={formatCurrency(dashboardStats.totalRevenue)} 
                    icon={<FaMoneyBillWave />}
                    trend={dashboardStats.revenueGrowth}
                    color="var(--gold-primary)"
                    onClick={() => navigate('/admin/finance')}
                  />
                  <StatCard 
                    title="Active Orders" 
                    value={formatNumber(dashboardStats.totalOrders)} 
                    icon={<FaShoppingCart />}
                    badge={`${dashboardStats.pendingOrders} pending`}
                    color="var(--info)"
                    onClick={() => navigate('/admin/orders')}
                  />
                  <StatCard 
                    title="Export Shipments" 
                    value={dashboardStats.activeShipments} 
                    icon={<FaGlobeAmericas />}
                    badge={`${dashboardStats.delayedShipments} delayed`}
                    color="var(--warning)"
                    onClick={() => navigate('/admin/shipments')}
                  />
                  <StatCard 
                    title="Customs Declarations" 
                    value={dashboardStats.customsDeclarations} 
                    icon={<FaShieldAlt />}
                    color="var(--success)"
                    onClick={() => navigate('/admin/customs')}
                  />
                  <StatCard 
                    title="Client Portfolio" 
                    value={dashboardStats.totalClients} 
                    icon={<FaUserTie />}
                    color="var(--gold-secondary)"
                    onClick={() => navigate('/admin/clients')}
                  />
                  <StatCard 
                    title="Inventory Health" 
                    value={dashboardStats.lowStockItems} 
                    icon={<FaCubes />}
                    badge={dashboardStats.lowStockItems > 0 ? 'Attention Needed' : 'Optimal'}
                    color="var(--danger)"
                    onClick={() => navigate('/admin/inventory')}
                  />
                  <StatCard 
                    title="Inventory Value" 
                    value={formatCurrency(dashboardStats.inventoryValue)} 
                    icon={<FaWarehouse />}
                    color="var(--purple)"
                    onClick={() => navigate('/admin/inventory/value')}
                  />
                  <StatCard 
                    title="Success Rate" 
                    value={`${dashboardStats.successRate}%`} 
                    icon={<FaPercent />}
                    trend={2.5}
                    color="var(--teal)"
                  />
                </section>

                {/* Quick Actions & Recent Activities Grid */}
                <div className="overview-grid">
                  <QuickActions onAction={handleQuickAction} />
                  
                  {/* Recent Activities */}
                  <div className="recent-activities glass-card floating">
                    <div className="section-header">
                      <FaClock className="section-icon" />
                      <h4>Recent Activities</h4>
                      <Link to="/admin/activities" className="view-all">View All</Link>
                    </div>
                    <div className="activities-list">
                      {recentOrders.map((order) => (
                        <div key={order.id} className="activity-item animate-fade-in">
                          <div className="activity-icon">
                            <FaShoppingCart />
                          </div>
                          <div className="activity-content">
                            <div className="activity-title">
                              <strong>Order {order.reference}</strong>
                              <span className="activity-amount">{formatCurrency(order.amount)}</span>
                            </div>
                            <div className="activity-details">
                              <span className="activity-customer">{order.customer}</span>
                              <span className={`status status-${order.status}`}>
                                {order.status}
                              </span>
                            </div>
                            <div className="activity-time">{order.date}</div>
                          </div>
                        </div>
                      ))}
                      {recentOrders.length === 0 && (
                        <div className="empty-state">
                          <FaClock className="empty-state-icon" />
                          <p>No recent activities</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* System Health */}
                  <div className="system-health glass-card floating">
                    <div className="section-header">
                      <FaThermometerHalf className="section-icon" />
                      <h4>System Health</h4>
                    </div>
                    <div className={`health-status ${systemHealth.status}`}>
                      <div className="status-text">
                        <span className="status-indicator"></span>
                        {systemHealth.status.toUpperCase()}
                      </div>
                      <div className="status-details">
                        <div className="health-metric">
                          <span>Errors (24h)</span>
                          <span>{systemHealth.errorCount}</span>
                        </div>
                        <div className="health-metric">
                          <span>Uptime</span>
                          <span className="positive">{systemHealth.uptime}</span>
                        </div>
                        <div className="health-metric">
                          <span>Response Time</span>
                          <span>{systemHealth.responseTime}</span>
                        </div>
                      </div>
                    </div>
                    <button className="health-details-btn" onClick={() => setActiveTab('system')}>
                      View Details →
                    </button>
                  </div>

                  {/* Performance Metrics */}
                  <PerformanceMetricsStrip metrics={performanceMetrics} />

                  {/* Recent Shipments */}
                  <div className="recent-shipments glass-card floating">
                    <div className="section-header">
                      <FaTruck className="section-icon" />
                      <h4>Recent Shipments</h4>
                      <Link to="/admin/shipments" className="view-all">View All</Link>
                    </div>
                    <div className="shipments-list">
                      {recentShipments.map((shipment) => (
                        <div key={shipment.id} className="shipment-item animate-fade-in">
                          <div className="shipment-header">
                            <span className="shipment-tracking">{shipment.tracking}</span>
                            <span className={`status status-${shipment.status}`}>
                              {shipment.status}
                            </span>
                          </div>
                          <div className="shipment-details">
                            <span className="shipment-carrier">{shipment.carrier}</span>
                            <span className="shipment-location">{shipment.location}</span>
                          </div>
                          <div className="shipment-footer">
                            <span className="shipment-estimated">Est: {shipment.estimated}</span>
                            <button className="track-btn">Track</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Export Tab */}
            {activeTab === 'exports' && <ExportManager />}

            {/* Customs Tab */}
            {activeTab === 'customs' && <CustomsManager />}

            {/* Inventory Tab */}
            {activeTab === 'inventory' && <InventoryAlerts />}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && <SupplierPerformance />}

            {/* Compliance Tab */}
            {activeTab === 'compliance' && <ComplianceTracker />}

            {/* Finance Tab */}
            {activeTab === 'finance' && <FinanceDashboard />}

            {/* NEW: Shipment Maps Tab */}
            {activeTab === 'maps' && (
              <ShipmentMaps 
                settings={mapSettings}
                onViewChange={handleMapViewChange}
                onShipmentSelect={handleShipmentSelection}
                recentShipments={recentShipments}
              />
            )}

            {/* NEW: Bulk Operations Tab */}
            {activeTab === 'bulk' && (
              <BulkOperations 
                onOperation={handleBulkOperation}
                operationState={bulkOperations}
                setOperationState={setBulkOperations}
                stats={dashboardStats}
              />
            )}

            {/* NEW: Settings Tab */}
            {activeTab === 'settings' && (
              <SettingsPanel 
                userSettings={userSettings}
                preferences={userPreferences}
                onUpdate={handleSettingsUpdate}
                onRefresh={handleRefresh}
                systemHealth={systemHealth}
              />
            )}

            {/* System Tab */}
            {activeTab === 'system' && <SystemHealth health={systemHealth} />}

            {/* Users Tab */}
            {activeTab === 'users' && <UserManagement />}

            {/* Reports Tab */}
            {activeTab === 'reports' && <DataExporter />}
          </div>
        </section>

        {/* Right Sidebar - Performance */}
        <aside className="performance-sidebar">
          <div className="performance-widget glass-card floating">
            <div className="widget-header">
              <FaChartLine /> Key Metrics
            </div>
            <div className="widget-metrics">
              <div className="widget-metric">
                <div className="metric-label">Profit Margin</div>
                <div className="metric-value positive">{dashboardStats.profitMargin}%</div>
              </div>
              <div className="widget-metric">
                <div className="metric-label">Order Growth</div>
                <div className="metric-value positive">{dashboardStats.orderGrowth}%</div>
              </div>
              <div className="widget-metric">
                <div className="metric-label">Customer Satisfaction</div>
                <div className="metric-value">{dashboardStats.customerSatisfaction}%</div>
              </div>
              <div className="widget-metric">
                <div className="metric-label">Top Product</div>
                <div className="metric-value">{dashboardStats.topProduct}</div>
              </div>
            </div>
          </div>

          <div className="upcoming-tasks glass-card floating">
            <div className="tasks-header">
              <FaTasks /> Upcoming Tasks
            </div>
            <div className="tasks-list">
              <div className="task-item">
                <div className="task-check"></div>
                <div className="task-content">
                  <div className="task-title">Review pending invoices</div>
                  <div className="task-due">Due today</div>
                </div>
              </div>
              <div className="task-item">
                <div className="task-check"></div>
                <div className="task-content">
                  <div className="task-title">Update shipment tracking</div>
                  <div className="task-due">Due tomorrow</div>
                </div>
              </div>
              <div className="task-item">
                <div className="task-check"></div>
                <div className="task-content">
                  <div className="task-title">Generate monthly report</div>
                  <div className="task-due">Due in 3 days</div>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </main>

      {/* Search Results Modal */}
      {showSearchResults && Object.keys(results).length > 0 && (
        <div className="search-results-modal">
          <div className="modal-backdrop" onClick={() => setShowSearchResults(false)}></div>
          <div className="modal-content glass-card floating">
            <div className="modal-header">
              <h4>Search Results</h4>
              <button 
                className="modal-close"
                onClick={() => setShowSearchResults(false)}
              >
                <FaTimesCircle />
              </button>
            </div>
            <div className="modal-body">
              <SearchResults />
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="dashboard-footer glass-card">
        <div className="footer-content">
          <div className="footer-left">
            <span className="footer-copyright">
              © {new Date().getFullYear()} Saffron Emporial • Premium Export Management
            </span>
            <span className="footer-version">v2.1.0 • Production</span>
          </div>
          <div className="footer-right">
            <div className="system-info">
              <span className="health-status">
                <FaThermometerHalf /> 
                System: <strong className={systemHealth.status}>{systemHealth.status}</strong>
              </span>
              <span>Last updated: {new Date().toLocaleTimeString()}</span>
              <span>Data refresh: {userSettings?.settings?.refreshInterval ? `${userSettings.settings.refreshInterval / 1000}s` : '30s'}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AdminDashboard;