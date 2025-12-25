// src/components/System/SystemHealth.jsx
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  FaServer, FaDatabase, FaNetworkWired, FaClock,
  FaCheckCircle, FaExclamationTriangle, FaTimesCircle,
  FaSync, FaChartLine, FaDownload, FaHistory,
  FaCog, FaMemory, FaHdd, FaMicrochip, FaExchangeAlt,
  FaUserClock, FaShieldAlt, FaRocket, FaThermometerHalf
} from 'react-icons/fa';
import { format, subMinutes, subHours, parseISO } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import supabase from '../../../supabaseClient';
import { toast } from 'react-hot-toast';

const SystemHealth = () => {
  const [systemMetrics, setSystemMetrics] = useState({
    cpu: 0,
    memory: 0,
    disk: 0,
    network: 0,
    database: 0,
    api: 0
  });
  const [performanceData, setPerformanceData] = useState([]);
  const [errorLogs, setErrorLogs] = useState([]);
  const [activeIncidents, setActiveIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [timeRange, setTimeRange] = useState('1h');

  const metricThresholds = useMemo(() => ({
    cpu: { warning: 70, critical: 85 },
    memory: { warning: 75, critical: 90 },
    disk: { warning: 80, critical: 95 },
    database: { warning: 50, critical: 70 },
    api: { warning: 500, critical: 1000 } // response time in ms
  }), []);

  useEffect(() => {
    fetchSystemHealth();
    
    if (autoRefresh) {
      const interval = setInterval(fetchSystemHealth, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh, timeRange]);

  // Reusable safeSelect helper (put in a shared utils file or at top of component)
async function safeSelect(table, selectClause = '*', qBuilder) {
  try {
    let q = supabase.from(table).select(selectClause);
    if (typeof qBuilder === 'function') q = qBuilder(q); // apply filters / ordering
    const res = await q;
    if (res.error) {
      const msg = String(res.error?.message || '').toLowerCase();
      // treat missing table or schema issues as non-fatal: return null and log
      if (res.status === 404 || res.status === 406 || msg.includes('does not exist') || msg.includes('not found')) {
        console.warn(`[safeSelect] missing table or relation: ${table} — ${res.error.message}`);
        return { data: null, error: res.error };
      }
      return { data: null, error: res.error };
    }
    return { data: res.data, error: null };
  } catch (err) {
    console.error('[safeSelect] unexpected:', err);
    return { data: null, error: err };
  }
}

  const fetchSystemHealth = async () => {
    try {
      setLoading(true);

      // Fetch system metrics from Supabase (simulated for demo)
      const simulatedMetrics = await simulateSystemMetrics();
      setSystemMetrics(simulatedMetrics);

      // Fetch performance history
     const { data, error } = await safeSelect('system_metrics', '*', q => q.gte('created_at', since).order('created_at', { ascending: true }));
     if (error) {
     // graceful fallback: show "not available" and log
     setMetrics([]);
     await logSystemActivity('warning', `system_metrics missing or inaccessible: ${error.message}`, 'SystemHealth');
    } else {
     setMetrics(data || []);
    }

      // Fetch recent error logs
      const { data: errorData, error: errorError } = await supabase
        .from('system_logs')
        .select('*')
        .in('level', ['error', 'critical'])
        .order('created_at', { ascending: false })
        .limit(50);

      if (!errorError) {
        setErrorLogs(errorData || []);
      }

      // Fetch active incidents
      const { data: incidentData, error: incidentError } = await supabase
        .from('system_incidents')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (!incidentError) {
        setActiveIncidents(incidentData || []);
      }

      await logSystemActivity('info', 'System health data refreshed', 'SystemHealth', {
        metrics: Object.keys(simulatedMetrics)
      });

    } catch (err) {
      console.error('Error fetching system health:', err);
      toast.error('Failed to load system health data');
      await logSystemActivity('error', `System health fetch failed: ${err.message}`, 'SystemHealth');
    } finally {
      setLoading(false);
    }
  };

  const simulateSystemMetrics = async () => {
    // Simulate real system metrics - in production, this would come from your monitoring system
    const baseLoad = {
      cpu: Math.max(10, Math.min(95, 30 + Math.random() * 40)),
      memory: Math.max(15, Math.min(90, 40 + Math.random() * 35)),
      disk: Math.max(5, Math.min(85, 20 + Math.random() * 30)),
      network: Math.random() * 100,
      database: Math.max(10, Math.min(80, 25 + Math.random() * 35)),
      api: Math.max(50, Math.min(800, 100 + Math.random() * 300))
    };

    // Store metrics for historical data
    await supabase
      .from('system_metrics')
      .insert([{
        cpu_usage: baseLoad.cpu,
        memory_usage: baseLoad.memory,
        disk_usage: baseLoad.disk,
        network_usage: baseLoad.network,
        database_connections: baseLoad.database,
        api_response_time: baseLoad.api,
        created_at: new Date().toISOString()
      }]);

    return baseLoad;
  };

  const getTimeRangeMs = (range) => {
    switch (range) {
      case '15m': return 15 * 60 * 1000;
      case '1h': return 60 * 60 * 1000;
      case '6h': return 6 * 60 * 60 * 1000;
      case '24h': return 24 * 60 * 60 * 1000;
      default: return 60 * 60 * 1000;
    }
  };

  // snippet for fetching metrics safely in SystemHealth.jsx
const fetchSystemMetricsSafe = async () => {
  try {
    const { data, error } = await supabase.from('system_metrics').select('*').order('created_at', { ascending: true }).limit(100);
    if (error) {
      const msg = String(error.message || '').toLowerCase();
      if (error.status === 404 || msg.includes('does not exist') || msg.includes('not found')) {
        // table missing — handle gracefully
        console.warn('[SystemHealth] system_metrics missing:', error.message);
        await supabase.from('system_logs').insert([{ level:'warning', message:'system_metrics missing', component:'SystemHealth', created_at:new Date().toISOString() }]).catch(()=>{});
        return [];
      }
      throw error;
    }
    return data || [];
  } catch (err) {
    console.error('[SystemHealth] fetch error:', err);
    toast.error('System metrics unavailable');
    return [];
  }
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

  const getMetricStatus = (metric, value) => {
    const thresholds = metricThresholds[metric];
    if (!thresholds) return 'healthy';
    
    if (value >= thresholds.critical) return 'critical';
    if (value >= thresholds.warning) return 'warning';
    return 'healthy';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return '#10B981';
      case 'warning': return '#F59E0B';
      case 'critical': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy': return <FaCheckCircle className="status-icon healthy" />;
      case 'warning': return <FaExclamationTriangle className="status-icon warning" />;
      case 'critical': return <FaTimesCircle className="status-icon critical" />;
      default: return <FaClock className="status-icon unknown" />;
    }
  };

  const generateHealthReport = async () => {
    try {
      const doc = new jsPDF();

      // Header
      doc.setFontSize(20);
      doc.setTextColor(40, 40, 40);
      doc.text('SYSTEM HEALTH REPORT', 105, 20, { align: 'center' });
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated: ${format(new Date(), 'dd/MM/yyyy HH:mm:ss')}`, 105, 28, { align: 'center' });

      // Current System Status
      doc.setFontSize(16);
      doc.setTextColor(40, 40, 40);
      doc.text('Current System Status', 20, 50);

      const metricsData = [
        ['Metric', 'Current Value', 'Status', 'Threshold'],
        ['CPU Usage', `${systemMetrics.cpu.toFixed(1)}%`, getMetricStatus('cpu', systemMetrics.cpu), `${metricThresholds.cpu.warning}%/${metricThresholds.cpu.critical}%`],
        ['Memory Usage', `${systemMetrics.memory.toFixed(1)}%`, getMetricStatus('memory', systemMetrics.memory), `${metricThresholds.memory.warning}%/${metricThresholds.memory.critical}%`],
        ['Disk Usage', `${systemMetrics.disk.toFixed(1)}%`, getMetricStatus('disk', systemMetrics.disk), `${metricThresholds.disk.warning}%/${metricThresholds.disk.critical}%`],
        ['Database Connections', `${systemMetrics.database.toFixed(1)}%`, getMetricStatus('database', systemMetrics.database), `${metricThresholds.database.warning}%/${metricThresholds.database.critical}%`],
        ['API Response Time', `${systemMetrics.api.toFixed(1)}ms`, getMetricStatus('api', systemMetrics.api), `${metricThresholds.api.warning}ms/${metricThresholds.api.critical}ms`]
      ];

      doc.autoTable({
        startY: 60,
        head: [metricsData[0]],
        body: metricsData.slice(1),
        theme: 'grid',
        headStyles: { fillColor: [255, 215, 0] },
        didDrawCell: (data) => {
          if (data.section === 'body' && data.column.index === 2) {
            const status = data.cell.raw;
            doc.setFillColor(getStatusColor(status) === '#10B981' ? [16, 185, 129] : 
                           getStatusColor(status) === '#F59E0B' ? [245, 158, 11] : 
                           getStatusColor(status) === '#EF4444' ? [239, 68, 68] : [107, 114, 128]);
            doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'F');
            doc.setTextColor(255, 255, 255);
            doc.text(status, data.cell.x + 2, data.cell.y + 7);
          }
        }
      });

      // Recent Errors
      if (errorLogs.length > 0) {
        doc.text('Recent Error Logs', 20, doc.lastAutoTable.finalY + 15);
        
        const errorData = errorLogs.slice(0, 10).map(log => [
          format(new Date(log.created_at), 'dd/MM/yyyy HH:mm'),
          log.level,
          log.component,
          log.message.substring(0, 50) + '...'
        ]);

        doc.autoTable({
          startY: doc.lastAutoTable.finalY + 20,
          head: [['Timestamp', 'Level', 'Component', 'Message']],
          body: errorData,
          theme: 'grid',
          headStyles: { fillColor: [239, 68, 68] }
        });
      }

      // Performance Trends
      doc.text('Performance Trends', 20, doc.lastAutoTable.finalY + 15);
      const trendData = performanceData.slice(-10).map(point => ({
        time: format(new Date(point.created_at), 'HH:mm'),
        cpu: point.cpu_usage,
        memory: point.memory_usage,
        api: point.api_response_time
      }));

      // Simple table for trends since we can't embed charts in PDF easily
      const trendTableData = trendData.map(point => [
        point.time,
        `${point.cpu.toFixed(1)}%`,
        `${point.memory.toFixed(1)}%`,
        `${point.api.toFixed(1)}ms`
      ]);

      doc.autoTable({
        startY: doc.lastAutoTable.finalY + 20,
        head: [['Time', 'CPU', 'Memory', 'API Response']],
        body: trendTableData,
        theme: 'grid',
        headStyles: { fillColor: [184, 134, 11] }
      });

      // Save PDF
      doc.save(`system-health-report-${format(new Date(), 'yyyy-MM-dd-HH-mm')}.pdf`);

      toast.success('System health report generated successfully');
      await logSystemActivity('info', 'System health report generated', 'SystemHealth');

    } catch (err) {
      console.error('Error generating health report:', err);
      toast.error('Failed to generate system health report');
    }
  };

  const restartService = async (serviceName) => {
    try {
      // Simulate service restart
      toast.success(`Restarting ${serviceName}...`);
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      await logSystemActivity('info', `Service restarted: ${serviceName}`, 'SystemHealth');
      toast.success(`${serviceName} restarted successfully`);
      
      fetchSystemHealth(); // Refresh metrics

    } catch (err) {
      console.error(`Error restarting ${serviceName}:`, err);
      toast.error(`Failed to restart ${serviceName}`);
    }
  };

  const clearErrorLogs = async () => {
    try {
      // In production, you might archive instead of delete
      const { error } = await supabase
        .from('system_logs')
        .delete()
        .in('level', ['error', 'critical']);

      if (error) throw error;

      setErrorLogs([]);
      toast.success('Error logs cleared successfully');
      await logSystemActivity('info', 'Error logs cleared', 'SystemHealth');

    } catch (err) {
      console.error('Error clearing logs:', err);
      toast.error('Failed to clear error logs');
    }
  };

  const overallHealth = useMemo(() => {
    const metrics = Object.keys(systemMetrics);
    const criticalCount = metrics.filter(metric => 
      getMetricStatus(metric, systemMetrics[metric]) === 'critical'
    ).length;
    const warningCount = metrics.filter(metric => 
      getMetricStatus(metric, systemMetrics[metric]) === 'warning'
    ).length;

    if (criticalCount > 0) return 'critical';
    if (warningCount > 0) return 'warning';
    return 'healthy';
  }, [systemMetrics]);

  if (loading && performanceData.length === 0) {
    return (
      <div className="system-health glass-card">
        <div className="manager-header">
          <h3><FaServer /> System Health Monitor</h3>
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <span>Loading system health data...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="system-health glass-card">
      <div className="manager-header">
        <div className="header-main">
          <h3><FaServer /> System Health Monitor</h3>
          <p className="header-subtitle">Real-time system performance and health metrics</p>
        </div>
        <div className="header-actions">
          <button 
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`secondary-button ${autoRefresh ? 'active' : ''}`}
          >
            <FaSync /> Auto-refresh: {autoRefresh ? 'ON' : 'OFF'}
          </button>
          <button 
            onClick={generateHealthReport}
            className="primary-button"
          >
            <FaDownload /> Generate Report
          </button>
        </div>
      </div>

      {/* Overall Health Status */}
      <div className="health-status-overview">
        <div className={`status-card ${overallHealth}`}>
          <div className="status-icon-large">
            {getStatusIcon(overallHealth)}
          </div>
          <div className="status-content">
            <h4>Overall System Health</h4>
            <p className="status-message">
              {overallHealth === 'healthy' ? 'All systems operational' :
               overallHealth === 'warning' ? 'Some systems require attention' :
               'Critical issues detected'}
            </p>
          </div>
          <div className="status-actions">
            <button 
              onClick={fetchSystemHealth}
              className="refresh-btn"
            >
              <FaSync /> Refresh
            </button>
          </div>
        </div>
      </div>

      {/* System Metrics Grid */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-header">
            <FaMicrochip className="metric-icon" />
            <span className="metric-title">CPU Usage</span>
          </div>
          <div className="metric-value">
            {systemMetrics.cpu.toFixed(1)}%
          </div>
          <div className="metric-progress">
            <div 
              className="progress-fill"
              style={{ 
                width: `${systemMetrics.cpu}%`,
                backgroundColor: getStatusColor(getMetricStatus('cpu', systemMetrics.cpu))
              }}
            ></div>
          </div>
          <div className="metric-status">
            {getStatusIcon(getMetricStatus('cpu', systemMetrics.cpu))}
            <span>{getMetricStatus('cpu', systemMetrics.cpu).toUpperCase()}</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <FaMemory className="metric-icon" />
            <span className="metric-title">Memory Usage</span>
          </div>
          <div className="metric-value">
            {systemMetrics.memory.toFixed(1)}%
          </div>
          <div className="metric-progress">
            <div 
              className="progress-fill"
              style={{ 
                width: `${systemMetrics.memory}%`,
                backgroundColor: getStatusColor(getMetricStatus('memory', systemMetrics.memory))
              }}
            ></div>
          </div>
          <div className="metric-status">
            {getStatusIcon(getMetricStatus('memory', systemMetrics.memory))}
            <span>{getMetricStatus('memory', systemMetrics.memory).toUpperCase()}</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <FaHdd className="metric-icon" />
            <span className="metric-title">Disk Usage</span>
          </div>
          <div className="metric-value">
            {systemMetrics.disk.toFixed(1)}%
          </div>
          <div className="metric-progress">
            <div 
              className="progress-fill"
              style={{ 
                width: `${systemMetrics.disk}%`,
                backgroundColor: getStatusColor(getMetricStatus('disk', systemMetrics.disk))
              }}
            ></div>
          </div>
          <div className="metric-status">
            {getStatusIcon(getMetricStatus('disk', systemMetrics.disk))}
            <span>{getMetricStatus('disk', systemMetrics.disk).toUpperCase()}</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <FaDatabase className="metric-icon" />
            <span className="metric-title">Database</span>
          </div>
          <div className="metric-value">
            {systemMetrics.database.toFixed(1)}%
          </div>
          <div className="metric-progress">
            <div 
              className="progress-fill"
              style={{ 
                width: `${systemMetrics.database}%`,
                backgroundColor: getStatusColor(getMetricStatus('database', systemMetrics.database))
              }}
            ></div>
          </div>
          <div className="metric-status">
            {getStatusIcon(getMetricStatus('database', systemMetrics.database))}
            <span>{getMetricStatus('database', systemMetrics.database).toUpperCase()}</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <FaExchangeAlt className="metric-icon" />
            <span className="metric-title">API Response</span>
          </div>
          <div className="metric-value">
            {systemMetrics.api.toFixed(1)}ms
          </div>
          <div className="metric-progress">
            <div 
              className="progress-fill"
              style={{ 
                width: `${Math.min(100, systemMetrics.api / 10)}%`,
                backgroundColor: getStatusColor(getMetricStatus('api', systemMetrics.api))
              }}
            ></div>
          </div>
          <div className="metric-status">
            {getStatusIcon(getMetricStatus('api', systemMetrics.api))}
            <span>{getMetricStatus('api', systemMetrics.api).toUpperCase()}</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <FaNetworkWired className="metric-icon" />
            <span className="metric-title">Network</span>
          </div>
          <div className="metric-value">
            {systemMetrics.network.toFixed(1)}%
          </div>
          <div className="metric-progress">
            <div 
              className="progress-fill"
              style={{ 
                width: `${systemMetrics.network}%`,
                backgroundColor: systemMetrics.network > 80 ? '#F59E0B' : '#10B981'
              }}
            ></div>
          </div>
          <div className="metric-status">
            <FaCheckCircle className="status-icon healthy" />
            <span>HEALTHY</span>
          </div>
        </div>
      </div>

      {/* Performance Charts */}
      <div className="charts-section">
        <div className="chart-container">
          <h4>Performance Trends</h4>
          <div className="chart-actions">
            <select 
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option value="15m">Last 15 minutes</option>
              <option value="1h">Last hour</option>
              <option value="6h">Last 6 hours</option>
              <option value="24h">Last 24 hours</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceData.slice(-20)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="created_at" 
                tickFormatter={(value) => format(new Date(value), 'HH:mm')}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(value) => format(new Date(value), 'dd/MM/yyyy HH:mm:ss')}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="cpu_usage" 
                stroke="#FFD700" 
                strokeWidth={2}
                name="CPU Usage %"
                dot={false}
              />
              <Line 
                type="monotone" 
                dataKey="memory_usage" 
                stroke="#B8860B" 
                strokeWidth={2}
                name="Memory Usage %"
                dot={false}
              />
              <Line 
                type="monotone" 
                dataKey="api_response_time" 
                stroke="#DAA520" 
                strokeWidth={2}
                name="API Response (ms)"
                dot={false}
                yAxisId="right"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Error Logs and Active Incidents */}
      <div className="health-details-grid">
        {/* Error Logs */}
        <div className="detail-section">
          <div className="section-header">
            <h4><FaExclamationTriangle /> Recent Error Logs</h4>
            <div className="section-actions">
              <button 
                onClick={clearErrorLogs}
                className="secondary-button small"
                disabled={errorLogs.length === 0}
              >
                Clear All
              </button>
            </div>
          </div>
          <div className="error-logs">
            {errorLogs.slice(0, 10).map((log, index) => (
              <div key={log.id} className="error-log-item">
                <div className="log-level">
                  <span className={`level-badge ${log.level}`}>{log.level}</span>
                </div>
                <div className="log-message">
                  <strong>{log.component}:</strong> {log.message}
                </div>
                <div className="log-time">
                  {format(new Date(log.created_at), 'dd/MM/yyyy HH:mm')}
                </div>
              </div>
            ))}
            {errorLogs.length === 0 && (
              <div className="no-data">
                <FaCheckCircle className="no-data-icon" />
                <p>No error logs found</p>
              </div>
            )}
          </div>
        </div>

        {/* Active Incidents */}
        <div className="detail-section">
          <div className="section-header">
            <h4><FaTimesCircle /> Active Incidents</h4>
          </div>
          <div className="incidents-list">
            {activeIncidents.map(incident => (
              <div key={incident.id} className="incident-item critical">
                <div className="incident-header">
                  <h5>{incident.title}</h5>
                  <span className="incident-status">{incident.severity}</span>
                </div>
                <p className="incident-description">{incident.description}</p>
                <div className="incident-meta">
                  <span>Started: {format(new Date(incident.created_at), 'dd/MM/yyyy HH:mm')}</span>
                  <button 
                    className="resolve-btn"
                    onClick={() => restartService(incident.service_name)}
                  >
                    Resolve
                  </button>
                </div>
              </div>
            ))}
            {activeIncidents.length === 0 && (
              <div className="no-data">
                <FaCheckCircle className="no-data-icon" />
                <p>No active incidents</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* System Actions */}
      <div className="system-actions">
        <h4>System Maintenance</h4>
        <div className="action-buttons">
          <button 
            onClick={() => restartService('API Service')}
            className="secondary-button"
          >
            <FaRocket /> Restart API
          </button>
          <button 
            onClick={() => restartService('Database Service')}
            className="secondary-button"
          >
            <FaDatabase /> Restart Database
          </button>
          <button 
            onClick={() => restartService('Cache Service')}
            className="secondary-button"
          >
            <FaMemory /> Clear Cache
          </button>
          <button 
            onClick={() => restartService('All Services')}
            className="primary-button"
          >
            <FaSync /> Restart All Services
          </button>
        </div>
      </div>
    </div>
  );
};

export default SystemHealth;