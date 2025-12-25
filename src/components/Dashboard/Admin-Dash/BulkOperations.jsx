// src/components/Operations/BulkOperations.jsx
import React, { useEffect, useState, useMemo } from 'react';
import {
  FaTasks, FaUpload, FaDownload, FaCheckCircle,
  FaTimesCircle, FaClock, FaPlay, FaStop, FaSync, FaEye
} from 'react-icons/fa';
import { format, differenceInMinutes } from 'date-fns';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import supabase from '../../../supabaseClient';
import { toast } from 'react-hot-toast';
import './BulkOperations.css';

const BulkOperations = () => {
  const [operations, setOperations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOperation, setSelectedOperation] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [progress, setProgress] = useState(0);

  const operationTypes = useMemo(() => [
    { value: 'inventory_update', label: 'Inventory Update', table: 'inventory' },
    { value: 'price_adjustment', label: 'Price Adjustment', table: 'products' },
    { value: 'order_status_update', label: 'Order Status Update', table: 'orders' },
    { value: 'supplier_data_import', label: 'Supplier Data Import', table: 'suppliers' },
    { value: 'customer_notification', label: 'Customer Notification', table: 'clients' },
    { value: 'data_cleanup', label: 'Data Cleanup', table: 'system_logs' }
  ], []);

  useEffect(() => {
    fetchBulkOperations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const safeQuery = async (queryPromise) => {
    try {
      const res = await queryPromise;
      if (res?.error) {
        console.warn('Supabase query error', res.error);
        return [];
      }
      return res?.data ?? [];
    } catch (err) {
      console.error('safeQuery exception', err);
      return [];
    }
  };

  const logSystemActivity = async (level, message, component = 'BulkOperations', metadata = {}) => {
    try {
      await supabase.from('system_logs').insert([{
        level, message, component, metadata, created_at: new Date().toISOString()
      }]);
    } catch (err) {
      console.error('[logSystemActivity] failed', err?.message ?? err);
    }
  };

  const fetchBulkOperations = async () => {
    setLoading(true);
    try {
      // Avoid embedding relationships that may not exist in schema
      const data = await safeQuery(
        supabase
          .from('bulk_operations')
          .select('id, operation_type, description, target_table, total_records, processed_records, successful_records, failed_records, status, created_by, started_at, completed_at, parameters, error_log, created_at, updated_at')
          .order('created_at', { ascending: false })
          .limit(100)
      );

      // If you want user info, fetch separately for the created_by ids
      const userIds = Array.from(new Set((data || []).map(d => d.created_by).filter(Boolean)));
      let usersMap = {};
      if (userIds.length) {
        const users = await safeQuery(supabase.from('profiles').select('id, full_name, email').in('id', userIds));
        usersMap = (users || []).reduce((m, u) => { m[u.id] = u; return m; }, {});
      }

      const withUsers = (data || []).map(op => ({ ...op, created_by_user: usersMap[op.created_by] || null }));
      setOperations(withUsers);
      await logSystemActivity('info', 'Bulk operations loaded', 'BulkOperations', { operationsCount: withUsers.length });
    } catch (err) {
      console.error('Error fetching bulk operations:', err);
      toast.error('Failed to load bulk operations');
      await logSystemActivity('error', `Bulk operations fetch failed: ${String(err?.message || err)}`, 'BulkOperations');
    } finally {
      setLoading(false);
    }
  };

  const createBulkOperation = async (operationData) => {
    try {
      const userRes = await supabase.auth.getUser();
      const userId = userRes?.data?.user?.id ?? null;

      const { data, error } = await supabase
        .from('bulk_operations')
        .insert([{
          operation_type: operationData.type,
          description: operationData.description,
          target_table: operationData.table,
          total_records: operationData.records?.length || 0,
          status: 'pending',
          parameters: operationData.parameters || {},
          created_by: userId,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      toast.success('Bulk operation created');
      fetchBulkOperations();
      await logSystemActivity('info', 'Bulk operation created', 'BulkOperations', { operationId: data?.id, type: operationData.type });
      return data;
    } catch (err) {
      console.error('Error creating bulk operation:', err);
      toast.error('Failed to create bulk operation');
      throw err;
    }
  };

  const executeBulkOperation = async (operationId) => {
    try {
      setExecuting(true);
      setProgress(0);

      await supabase.from('bulk_operations').update({
        status: 'running',
        started_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }).eq('id', operationId);

      const { data: operation, error: fetchError } = await supabase.from('bulk_operations').select('*').eq('id', operationId).single();
      if (fetchError) throw fetchError;

      let successCount = 0;
      let failCount = 0;
      const errors = [];
      const totalRecords = operation.total_records || 100;

      for (let i = 0; i < totalRecords; i++) {
        // Replace this simulation with real processing logic for your operation type
        await new Promise(resolve => setTimeout(resolve, 40));
        const currentProgress = Math.round((i + 1) / totalRecords * 100);
        setProgress(currentProgress);

        const success = Math.random() > 0.08;
        if (success) successCount++; else { failCount++; errors.push(`Record ${i + 1}: failed`); }

        if ((i + 1) % 20 === 0 || i === totalRecords - 1) {
          await supabase.from('bulk_operations').update({
            processed_records: i + 1,
            successful_records: successCount,
            failed_records: failCount,
            updated_at: new Date().toISOString()
          }).eq('id', operationId);
        }
      }

      const finalStatus = failCount === 0 ? 'completed' : 'completed_with_errors';
      await supabase.from('bulk_operations').update({
        status: finalStatus,
        processed_records: totalRecords,
        successful_records: successCount,
        failed_records: failCount,
        error_log: errors.length ? errors.join('\n') : null,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }).eq('id', operationId);

      toast.success(`Bulk operation ${finalStatus.replace('_', ' ')}`);
      fetchBulkOperations();
      await logSystemActivity('info', 'Bulk operation executed', 'BulkOperations', { operationId, successCount, failCount, finalStatus });
    } catch (err) {
      console.error('Error executing bulk operation:', err);
      await supabase.from('bulk_operations').update({
        status: 'failed',
        error_log: String(err?.message || err),
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }).eq('id', operationId);
      toast.error('Bulk operation failed');
      await logSystemActivity('error', `Bulk operation failed: ${String(err?.message || err)}`, 'BulkOperations', { operationId });
    } finally {
      setExecuting(false);
      setProgress(0);
    }
  };

  const cancelBulkOperation = async (operationId) => {
    try {
      const { error } = await supabase.from('bulk_operations').update({
        status: 'cancelled',
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }).eq('id', operationId);

      if (error) throw error;
      toast.success('Bulk operation cancelled');
      fetchBulkOperations();
      await logSystemActivity('info', 'Bulk operation cancelled', 'BulkOperations', { operationId });
    } catch (err) {
      console.error('Error cancelling bulk operation:', err);
      toast.error('Failed to cancel bulk operation');
    }
  };

  const retryBulkOperation = async (operationId) => {
    try {
      const { error } = await supabase.from('bulk_operations').update({
        status: 'pending',
        processed_records: 0,
        successful_records: 0,
        failed_records: 0,
        error_log: null,
        started_at: null,
        completed_at: null,
        updated_at: new Date().toISOString()
      }).eq('id', operationId);

      if (error) throw error;
      toast.success('Bulk operation queued for retry');
      fetchBulkOperations();
      await logSystemActivity('info', 'Bulk operation queued for retry', 'BulkOperations', { operationId });
    } catch (err) {
      console.error('Error retrying bulk operation:', err);
      toast.error('Failed to retry bulk operation');
    }
  };

  const generateOperationReport = async (operation) => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text('Bulk Operation Report', 14, 20);
      doc.setFontSize(11);
      doc.text(`Operation ID: ${operation.id}`, 14, 30);
      doc.text(`Type: ${operation.operation_type}`, 14, 36);
      doc.text(`Description: ${operation.description || '—'}`, 14, 42);
      doc.autoTable({
        startY: 56,
        head: [['Metric', 'Value']],
        body: [
          ['Total Records', operation.total_records || 0],
          ['Processed', operation.processed_records || 0],
          ['Successful', operation.successful_records || 0],
          ['Failed', operation.failed_records || 0],
          ['Status', operation.status || '—'],
          ['Created At', operation.created_at ? format(new Date(operation.created_at), 'dd/MM/yyyy HH:mm') : '—'],
          ['Started At', operation.started_at ? format(new Date(operation.started_at), 'dd/MM/yyyy HH:mm') : '—'],
          ['Completed At', operation.completed_at ? format(new Date(operation.completed_at), 'dd/MM/yyyy HH:mm') : '—']
        ],
        theme: 'grid',
        headStyles: { fillColor: [212, 175, 55] }
      });

      if (operation.error_log) {
        doc.addPage();
        doc.setFontSize(14);
        doc.text('Error Log (first 200 lines)', 14, 20);
        const lines = (operation.error_log || '').split('\n').slice(0, 200);
        doc.setFontSize(9);
        doc.text(lines.join('\n'), 14, 30);
      }

      doc.save(`bulk-operation-${operation.id}.pdf`);
      toast.success('Report generated');
      await logSystemActivity('info', 'Bulk operation report generated', 'BulkOperations', { operationId: operation.id });
    } catch (err) {
      console.error('Error generating operation report:', err);
      toast.error('Failed to generate report');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'status-completed';
      case 'running': return 'status-running';
      case 'pending': return 'status-pending';
      case 'cancelled': return 'status-cancelled';
      case 'failed': return 'status-failed';
      case 'completed_with_errors': return 'status-warning';
      default: return 'status-unknown';
    }
  };

  const getOperationStats = () => {
    const total = operations.length;
    const completed = operations.filter(op => op.status === 'completed').length;
    const running = operations.filter(op => op.status === 'running').length;
    const failed = operations.filter(op => op.status === 'failed').length;
    const totalRecords = operations.reduce((s, op) => s + (op.total_records || 0), 0);
    const processedRecords = operations.reduce((s, op) => s + (op.processed_records || 0), 0);
    return { total, completed, running, failed, totalRecords, processedRecords };
  };

  const stats = getOperationStats();

  if (loading) {
    return (
      <div className="bulk-operations glass-card">
        <div className="manager-header">
          <h3><FaTasks /> Bulk Operations Manager</h3>
          <div className="loading-state">Loading bulk operations...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bulk-operations glass-card">
      <div className="manager-header">
        <div className="header-main">
          <h3><FaTasks /> Bulk Operations Manager</h3>
          <p className="header-subtitle">Manage and execute batch operations across the system</p>
        </div>
        <div className="header-actions">
          <button onClick={() => setShowCreateModal(true)} className="primary-button" disabled={executing}><FaUpload /> New Operation</button>
          <button onClick={fetchBulkOperations} className="secondary-button"><FaSync /> Refresh</button>
        </div>
      </div>

      <div className="operation-stats">
        <div className="stat-card">
          <div className="stat-icon"><FaTasks /></div>
          <div className="stat-content"><h4>{stats.total}</h4><p>Total Operations</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><FaCheckCircle /></div>
          <div className="stat-content"><h4>{stats.completed}</h4><p>Completed</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><FaClock /></div>
          <div className="stat-content"><h4>{stats.running}</h4><p>Running</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><FaTimesCircle /></div>
          <div className="stat-content"><h4>{stats.failed}</h4><p>Failed</p></div>
        </div>
      </div>

      {executing && (
        <div className="execution-progress">
          <div className="progress-header"><h4>Executing Bulk Operation</h4><span>{progress}%</span></div>
          <div className="progress-bar"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
        </div>
      )}

      <div className="operations-table-container">
        <table className="operations-table">
          <thead>
            <tr>
              <th>Operation ID</th>
              <th>Type</th>
              <th>Description</th>
              <th>Target Table</th>
              <th>Progress</th>
              <th>Status</th>
              <th>Created</th>
              <th>Duration</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {operations.map(operation => (
              <tr key={operation.id}>
                <td><strong>OP-{String(operation.id).slice(-8)}</strong></td>
                <td>{operationTypes.find(t => t.value === operation.operation_type)?.label || operation.operation_type}</td>
                <td>
                  <div className="operation-description">{operation.description || '—'}
                    <div className="operation-meta">{operation.created_by_user ? `${operation.created_by_user.full_name || operation.created_by_user.email}` : '—'}</div>
                  </div>
                </td>
                <td><code className="table-name">{operation.target_table}</code></td>
                <td>
                  <div className="progress-indicator">
                    <div className="progress-text">{operation.processed_records || 0} / {operation.total_records || 0}</div>
                    <div className="progress-bar small"><div className="progress-fill" style={{ width: `${operation.total_records ? Math.round((operation.processed_records || 0) / operation.total_records * 100) : 0}%` }} /></div>
                  </div>
                </td>
                <td><span className={`status-badge ${getStatusColor(operation.status)}`}>{(operation.status || '—').replace('_', ' ').toUpperCase()}</span></td>
                <td>{operation.created_at ? format(new Date(operation.created_at), 'dd MMM yyyy') : '—'}</td>
                <td>
                  {operation.started_at && operation.completed_at ? `${differenceInMinutes(new Date(operation.completed_at), new Date(operation.started_at))}m` : operation.started_at ? 'Running...' : 'Not started'}
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-view" onClick={() => setSelectedOperation(operation)} title="View"><FaEye /></button>
                    <button className="btn-report" onClick={() => generateOperationReport(operation)} title="Report"><FaDownload /></button>
                    {operation.status === 'pending' && <button className="btn-execute" onClick={() => executeBulkOperation(operation.id)} disabled={executing} title="Execute"><FaPlay /></button>}
                    {operation.status === 'running' && <button className="btn-cancel" onClick={() => cancelBulkOperation(operation.id)} title="Cancel"><FaStop /></button>}
                    {(operation.status === 'failed' || operation.status === 'completed_with_errors') && <button className="btn-retry" onClick={() => retryBulkOperation(operation.id)} title="Retry"><FaSync /></button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create modal (lightweight) */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Create New Bulk Operation</h3>
              <button className="close-button" onClick={() => setShowCreateModal(false)}>×</button>
            </div>
            <div className="create-operation-form">
              <p className="muted">Use the UI to create a real operation. This modal is a placeholder for your real creation flow.</p>
              <div className="form-actions">
                <button className="secondary-button" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button className="primary-button" onClick={() => { toast.info('Implement creation flow'); setShowCreateModal(false); }}>Create Operation</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Details modal */}
      {selectedOperation && (
        <div className="modal-overlay">
          <div className="modal-content large">
            <div className="modal-header">
              <h3>Operation Details - OP-{String(selectedOperation.id).slice(-8)}</h3>
              <button className="close-button" onClick={() => setSelectedOperation(null)}>×</button>
            </div>
            <div className="operation-details">
              <div className="detail-section">
                <h4>Basic Information</h4>
                <div className="detail-grid">
                  <div className="detail-item"><span className="label">Operation ID:</span><span className="value">{selectedOperation.id}</span></div>
                  <div className="detail-item"><span className="label">Type:</span><span className="value">{selectedOperation.operation_type}</span></div>
                  <div className="detail-item"><span className="label">Description:</span><span className="value">{selectedOperation.description}</span></div>
                  <div className="detail-item"><span className="label">Target Table:</span><span className="value">{selectedOperation.target_table}</span></div>
                  <div className="detail-item"><span className="label">Created By:</span><span className="value">{selectedOperation.created_by_user ? `${selectedOperation.created_by_user.full_name || selectedOperation.created_by_user.email}` : selectedOperation.created_by}</span></div>
                </div>
              </div>

              <div className="detail-section">
                <h4>Execution Details</h4>
                <div className="detail-grid">
                  <div className="detail-item"><span className="label">Status:</span><span className={`status-badge ${getStatusColor(selectedOperation.status)}`}>{selectedOperation.status}</span></div>
                  <div className="detail-item"><span className="label">Total Records:</span><span className="value">{selectedOperation.total_records || 0}</span></div>
                  <div className="detail-item"><span className="label">Processed:</span><span className="value">{selectedOperation.processed_records || 0}</span></div>
                  <div className="detail-item"><span className="label">Successful:</span><span className="value success">{selectedOperation.successful_records || 0}</span></div>
                  <div className="detail-item"><span className="label">Failed:</span><span className="value error">{selectedOperation.failed_records || 0}</span></div>
                </div>
              </div>

              {selectedOperation.error_log && (
                <div className="detail-section">
                  <h4>Error Log</h4>
                  <div className="error-log"><pre>{selectedOperation.error_log}</pre></div>
                </div>
              )}

              <div className="modal-actions">
                <button className="secondary-button" onClick={() => generateOperationReport(selectedOperation)}>Generate Report</button>
                <button className="primary-button" onClick={() => setSelectedOperation(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkOperations;
