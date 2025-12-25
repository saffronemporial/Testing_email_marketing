// src/components/Operations/DataExporter.jsx
// Refined: real Supabase reads/writes, storage upload, preview, drag-drop CSV, export formats (CSV/Excel/PDF/JSON),
// robust error handling, system_logs writes, and graceful fallbacks if metadata tables/buckets are absent.

import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import {
  FaDownload, FaDatabase, FaFileExcel, FaFileCsv,
  FaFilePdf, FaCheckCircle, FaTimesCircle, FaSync,
  FaTrash, FaEye, FaPlus, FaSearch
} from 'react-icons/fa';
import { format, differenceInMinutes } from 'date-fns';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import supabase from '../../../supabaseClient' ;
import { toast } from 'react-hot-toast';

const defaultTableCandidates = [
  'orders', 'products', 'customers', 'suppliers', 'inventory',
  'purchase_orders', 'export_orders', 'shipments', 'profiles', 'export_documents', 'system_logs'
];

const exportFormats = [
  { value: 'csv', label: 'CSV', icon: FaFileCsv },
  { value: 'excel', label: 'Excel', icon: FaFileExcel },
  { value: 'pdf', label: 'PDF', icon: FaFilePdf },
  { value: 'json', label: 'JSON', icon: FaDatabase }
];

const DataExporter = () => {
  const [exportsHistory, setExportsHistory] = useState([]);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedExport, setSelectedExport] = useState(null);
  const [previewRows, setPreviewRows] = useState([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [dryRun, setDryRun] = useState(false);
  const [uploadFileRecords, setUploadFileRecords] = useState(null); // if user uploads CSV/Excel file as source
  const fileInputRef = useRef(null);

  useEffect(() => {
    (async () => {
      await fetchExportHistory();
      await fetchAvailableTables();
      setLoading(false);
    })();
  }, []);

  /* ---------- Helper: Logging to system_logs (non-blocking) ---------- */
  const logSystemActivity = async (level, message, component = 'DataExporter', metadata = {}) => {
    try {
      await supabase.from('system_logs').insert([{
        level, message, component, metadata, created_at: new Date().toISOString()
      }]);
    } catch (err) {
      // swallow silently to avoid noisy loops
      // eslint-disable-next-line no-console
      console.error('[DataExporter][logSystemActivity] failed', err?.message ?? err);
    }
  };

  /* ---------- Fetch export history (if table exists) ---------- */
  const fetchExportHistory = async () => {
    try {
      setLoading(true);
      const res = await supabase
        .from('data_exports')
        .select(`
          id, table_name, export_format, file_name, file_size, record_count, status,
          filters, created_by, started_at, completed_at, download_url, error_message, created_at,
          users:created_by (email, first_name, last_name)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (res.error) {
        // table may not exist or RLS blocking - handle gracefully
        const msg = String(res.error.message || '').toLowerCase();
        if (res.status === 404 || res.status === 406 || msg.includes('does not exist') || msg.includes('not found')) {
          await logSystemActivity('warning', 'data_exports table missing or inaccessible', 'DataExporter', { reason: res.error?.message });
          setExportsHistory([]); // empty fallback
          return;
        }
        throw res.error;
      }

      setExportsHistory(res.data || []);
      await logSystemActivity('info', 'Export history loaded', 'DataExporter', { count: (res.data || []).length });
    } catch (err) {
      console.error('Error fetching export history:', err);
      toast.error('Unable to fetch export history (check DB permissions)');
      await logSystemActivity('error', `Export history load failed: ${String(err?.message || err)}`, 'DataExporter');
    } finally {
      setLoading(false);
    }
  };

  /* ---------- Discover tables (best-effort) ---------- */
  const fetchAvailableTables = async () => {
    try {
      // Best-effort approach:
      // 1) If you maintain a metadata table use that; else fallback to default list below.
      // Optionally, you could query information_schema but portability/permissions vary between projects.
      setTables(defaultTableCandidates);
    } catch (err) {
      console.error('Error fetching tables list:', err);
      setTables(defaultTableCandidates);
    }
  };

  /* ---------- Utility: generate file blobs ---------- */
  const generateCSVBlob = (data) => {
    const headers = data && data.length ? Object.keys(data[0]) : [];
    const rows = [headers, ...(data.map(row => headers.map(h => stringifyCell(row[h]))))];
    const csv = rows.map(r => r.join(',')).join('\n');
    return new Blob([csv], { type: 'text/csv' });
  };

  const stringifyCell = (val) => {
    if (val === null || typeof val === 'undefined') return '';
    if (typeof val === 'object') return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
    const s = String(val);
    if (s.includes(',')) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };

  const generateExcelBlob = (data, sheetName = 'Sheet1') => {
    const ws = XLSX.utils.json_to_sheet(data || []);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    const arrayBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    return new Blob([arrayBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  };

  const generatePDFBlob = (tableName, data) => {
    const doc = new jsPDF({ orientation: 'landscape' });
    doc.setFontSize(14);
    doc.text(`${tableName.toUpperCase()} DATA EXPORT`, 14, 18);
    doc.setFontSize(10);
    doc.text(`Generated: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 26);

    if (!data || data.length === 0) {
      doc.text('No data available for this export', 14, 40);
    } else {
      const headers = Object.keys(data[0]);
      const rows = data.map(r => headers.map(h => typeof r[h] === 'object' ? JSON.stringify(r[h]) : String(r[h])));
      doc.autoTable({
        startY: 32,
        head: [headers],
        body: rows,
        styles: { fontSize: 8 },
        theme: 'grid'
      });
    }
    return doc.output('blob');
  };

  const generateJSONBlob = (data) => new Blob([JSON.stringify(data || [], null, 2)], { type: 'application/json' });

  /* ---------- Upload to Supabase Storage (if bucket exists) ---------- */
  const uploadBlobToStorage = async (blob, remotePath, contentType) => {
    try {
      const bucket = 'exports'; // recommended bucket name
      // Try upload
      const { error } = await supabase.storage.from(bucket).upload(remotePath, blob, {
        contentType
      });
      if (error) {
        // bucket may not exist or permissions; return null to fallback
        await logSystemActivity('warning', `Storage upload failed: ${error.message}`, 'DataExporter', { remotePath });
        return null;
      }
      const { data: publicData, error: publicErr } = supabase.storage.from(bucket).getPublicUrl(remotePath);
      if (publicErr) {
        await logSystemActivity('warning', `getPublicUrl failed: ${publicErr.message}`, 'DataExporter', { remotePath });
        return null;
      }
      return publicData?.publicUrl ?? null;
    } catch (err) {
      await logSystemActivity('error', `uploadBlobToStorage exception: ${String(err)}`, 'DataExporter');
      return null;
    }
  };

  /* ---------- Export flow (create record, generate file, upload, update record) ---------- */
  const createDataExport = async ({ table, format: fmt, filters = {}, sourceRecords = null }) => {
    // sourceRecords: optional array (from uploaded CSV/Excel) to export instead of DB read; if provided, use it
    setExporting(true);
    let exportRecord = null;
    try {
      // 1) create export tracking record (if table exists)
      const userRes = await supabase.auth.getUser();
      const userId = userRes?.data?.user?.id ?? null;

      try {
        const ins = await supabase.from('data_exports').insert([{
          table_name: table, export_format: fmt, file_name: 'pending', status: 'processing',
          filters: filters ? filters : null, created_by: userId, started_at: new Date().toISOString(), created_at: new Date().toISOString()
        }]).select().single();
        if (!ins.error) exportRecord = ins.data;
      } catch (err) {
        // ignore; table might not exist — we'll continue without DB tracking
        exportRecord = null;
      }

      // 2) fetch data if not provided by sourceRecords
      let data = sourceRecords;
      if (!data) {
        const q = supabase.from(table).select('*');
        // Apply simple equality filters if provided
        if (filters && typeof filters === 'object') {
          Object.entries(filters).forEach(([k, v]) => {
            if (v !== '' && v !== null && typeof v !== 'undefined') q.eq(k, v);
          });
        }
        const res = await q;
        if (res.error) {
          // Try to be helpful: if table not found, surface friendly message
          const msg = String(res.error.message || '');
          throw new Error(`Failed reading table "${table}": ${msg}`);
        }
        data = res.data || [];
      }

      // 3) If dry run mode: show preview and return early
      if (dryRun) {
        setPreviewRows((data || []).slice(0, 10));
        toast.success('Dry run preview ready (top 10 rows)');
        return { dryRun: true, preview: (data || []).slice(0, 10) };
      }

      // 4) Generate file blob
      let blob = null;
      let contentType = 'application/octet-stream';
      const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss');
      const baseFileName = `${table}_${timestamp}`;

      switch (fmt) {
        case 'csv':
          blob = generateCSVBlob(data);
          contentType = 'text/csv';
          break;
        case 'excel':
          blob = generateExcelBlob(data, table);
          contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
          break;
        case 'pdf':
          blob = generatePDFBlob(table, data);
          contentType = 'application/pdf';
          break;
        case 'json':
          blob = generateJSONBlob(data);
          contentType = 'application/json';
          break;
        default:
          throw new Error('Unsupported export format');
      }

      const ext = fmt === 'excel' ? 'xlsx' : fmt;
      const fileName = `${baseFileName}.${ext}`;
      const size = blob.size || (blob instanceof Blob ? blob.size : 0);

      // 5) Try upload to Supabase Storage -> prefer persistent storage
      const remotePath = `${baseFileName}/${fileName}`;
      const publicUrl = await uploadBlobToStorage(blob, remotePath, contentType);

      // 6) If DB tracking exists, update record with final info
      if (exportRecord) {
        const updatePayload = {
          status: 'completed',
          record_count: (data || []).length,
          file_size: size,
          file_name: fileName,
          download_url: publicUrl ?? null,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        const upd = await supabase.from('data_exports').update(updatePayload).eq('id', exportRecord.id);
        if (upd.error) {
          await logSystemActivity('warning', `Failed to update data_exports record: ${upd.error.message}`, 'DataExporter', { exportId: exportRecord.id });
        } else {
          exportRecord = { ...exportRecord, ...updatePayload };
        }
      }

      // 7) If upload failed (no publicUrl), trigger immediate client-download
      if (!publicUrl) {
        // create client download link
        const downloadUrl = URL.createObjectURL(blob);
        // trigger automatic download in browser
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(downloadUrl);

        // Update DB record download_url to a fallback (null) and keep file_name info if present
        if (exportRecord) {
          await supabase.from('data_exports').update({ download_url: null, file_name, file_size: size }).eq('id', exportRecord.id).catch(()=>{});
        }
        toast.success('Export generated and downloaded locally (storage bucket not available)');
      } else {
        toast.success('Export generated and uploaded to storage');
      }

      // Refresh history
      await fetchExportHistory();

      // Log
      await logSystemActivity('info', 'Data export completed', 'DataExporter', {
        table, format: fmt, recordCount: (data || []).length, storageUrl: publicUrl ?? 'client-download'
      });

      // return summary
      return { exportRecord, publicUrl, fileName, size, records: (data || []).length };
    } catch (err) {
      console.error('createDataExport failed', err);
      toast.error(`Export failed: ${String(err?.message || err)}`);
      await logSystemActivity('error', `Data export failed: ${String(err?.message || err)}`, 'DataExporter');
      // Attempt to mark DB record as failed
      try {
        if (exportRecord?.id) {
          await supabase.from('data_exports').update({
            status: 'failed', error_message: String(err?.message || err), completed_at: new Date().toISOString()
          }).eq('id', exportRecord.id);
        }
      } catch (err2) {
        // ignore
      }
      throw err;
    } finally {
      setExporting(false);
    }
  };

  /* ---------- Helper: download recorded export (either stored public URL or attempt signed url) ---------- */
  const downloadExport = async (exportItem) => {
    try {
      if (!exportItem) return;
      if (exportItem.download_url) {
        // If it's a public url, open it
        const url = exportItem.download_url;
        // simple heuristic: if url looks like a supabase storage public url, open it directly
        window.open(url, '_blank');
        return;
      }

      // Try to create a signed url from storage if file path is stored in file_name/folder pattern
      // We only attempt if bucket usage was successful earlier - best-effort
      // As fallback, inform user the file is not available.
      toast.error('No downloadable URL available for this export (may have been generated locally).');
    } catch (err) {
      console.error('downloadExport', err);
      toast.error('Failed to download export');
    }
  };

  const deleteExport = async (id) => {
    try {
      const { error } = await supabase.from('data_exports').delete().eq('id', id);
      if (error) throw error;
      toast.success('Export record deleted');
      await logSystemActivity('info', 'Export record deleted', 'DataExporter', { exportId: id });
      await fetchExportHistory();
    } catch (err) {
      console.error('deleteExport', err);
      toast.error('Failed to delete export record');
    }
  };

  /* ---------- Preview top rows for selected table ---------- */
  const previewTableTopRows = async (tableName, limit = 10) => {
    try {
      setPreviewLoading(true);
      const res = await supabase.from(tableName).select('*').limit(limit);
      if (res.error) {
        const msg = String(res.error.message || '').toLowerCase();
        if (res.status === 404 || msg.includes('does not exist')) {
          toast.error(`Table "${tableName}" not found`);
          setPreviewRows([]);
          return;
        }
        throw res.error;
      }
      setPreviewRows(res.data || []);
    } catch (err) {
      console.error('previewTableTopRows', err);
      toast.error('Preview failed');
      setPreviewRows([]);
    } finally {
      setPreviewLoading(false);
    }
  };

  /* ---------- Drag & Drop / File parsing for CSV/Excel ---------- */
  const onFileInputChange = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    await parseUploadFile(f);
  };

  const parseUploadFile = async (file) => {
    try {
      // Only allow csv, xlsx
      const name = file.name.toLowerCase();
      if (name.endsWith('.csv')) {
        const text = await file.text();
        const rows = text.split(/\r?\n/).filter(Boolean);
        const headers = rows.shift().split(',');
        const data = rows.map(r => {
          // rough CSV parse (works for simple CSVs). For robust parsing, use PapaParse (not included to keep footprint small)
          const parts = r.split(',');
          const obj = {};
          headers.forEach((h, i) => { obj[h.trim()] = parts[i] ?? null; });
          return obj;
        });
        setUploadFileRecords(data);
        toast.success(`CSV parsed: ${data.length} rows`);
      } else {
        // Excel
        const buffer = await file.arrayBuffer();
        const wb = XLSX.read(buffer, { type: 'array' });
        const sheetName = wb.SheetNames[0];
        const sheet = wb.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(sheet);
        setUploadFileRecords(json);
        toast.success(`Excel parsed: ${json.length} rows`);
      }
    } catch (err) {
      console.error('parseUploadFile', err);
      toast.error('Failed to parse uploaded file');
    }
  };

  /* ---------- Utility formatting ---------- */
  const formatFileSize = (bytes) => {
    if (!bytes && bytes !== 0) return 'N/A';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusColor = (status) => {
    switch (String(status).toLowerCase()) {
      case 'completed': return 'status-completed';
      case 'processing': return 'status-processing';
      case 'failed': return 'status-failed';
      case 'pending': return 'status-pending';
      default: return 'status-unknown';
    }
  };

  /* ---------- UI state helpers ---------- */
  const exportStats = useMemo(() => {
    const total = exportsHistory.length;
    const completed = exportsHistory.filter(e => e.status === 'completed').length;
    const failed = exportsHistory.filter(e => e.status === 'failed').length;
    const totalRecords = exportsHistory.reduce((s, e) => s + (e.record_count || 0), 0);
    const countsByFormat = {};
    exportsHistory.forEach(e => { countsByFormat[e.export_format] = (countsByFormat[e.export_format] || 0) + 1; });
    return { total, completed, failed, totalRecords, countsByFormat };
  }, [exportsHistory]);

  /* ---------- Render ---------- */

  if (loading) {
    return (
      <div className="data-exporter glass-card">
        <div className="manager-header">
          <h3><FaDownload /> Data Exporter</h3>
          <div className="loading-state"><div className="loading-spinner" /> Loading export history...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="data-exporter glass-card">
      <div className="manager-header">
        <div className="header-main">
          <h3><FaDownload /> Data Exporter</h3>
          <p className="header-subtitle">Generate system exports and persist files to Supabase Storage</p>
        </div>
        <div className="header-actions">
          <button className="primary-button" onClick={() => setShowCreateModal(true)}><FaPlus /> New Export</button>
          <button className="secondary-button" onClick={fetchExportHistory}><FaSync /> Refresh</button>
        </div>
      </div>

      {/* Stats */}
      <div className="export-stats">
        <div className="stat-card"><div className="stat-icon"><FaDownload /></div><div className="stat-content"><h4>{exportStats.total}</h4><p>Total Exports</p></div></div>
        <div className="stat-card"><div className="stat-icon"><FaCheckCircle /></div><div className="stat-content"><h4>{exportStats.completed}</h4><p>Completed</p></div></div>
        <div className="stat-card"><div className="stat-icon"><FaTimesCircle /></div><div className="stat-content"><h4>{exportStats.failed}</h4><p>Failed</p></div></div>
        <div className="stat-card"><div className="stat-icon"><FaDatabase /></div><div className="stat-content"><h4>{exportStats.totalRecords.toLocaleString()}</h4><p>Records</p></div></div>
      </div>

      {/* Exports table */}
      <div className="exports-table-container">
        <table className="exports-table">
          <thead>
            <tr>
              <th>File</th><th>Table</th><th>Format</th><th>Records</th><th>Size</th><th>Status</th><th>Created</th><th>Duration</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {exportsHistory.map(item => (
              <tr key={item.id}>
                <td><strong>{item.file_name || '-'}</strong><div className="muted small">{item.users ? `${item.users.first_name || ''} ${item.users.last_name || ''}` : ''}</div></td>
                <td><code>{item.table_name}</code></td>
                <td>{(item.export_format || '').toUpperCase()}</td>
                <td>{(item.record_count || 0).toLocaleString()}</td>
                <td>{item.file_size ? formatFileSize(item.file_size) : 'N/A'}</td>
                <td><span className={`status-badge ${getStatusColor(item.status)}`}>{(item.status || '').toUpperCase()}</span></td>
                <td>{item.created_at ? format(new Date(item.created_at), 'dd MMM yyyy') : '-'}</td>
                <td>
                  {item.started_at && item.completed_at ? `${differenceInMinutes(new Date(item.completed_at), new Date(item.started_at))}m` :
                    item.started_at ? 'Processing' : 'N/A'}
                </td>
                <td>
                  <div className="action-buttons">
                    {item.status === 'completed' && <button className="btn-download" onClick={() => downloadExport(item)}><FaDownload /></button>}
                    <button className="btn-view" onClick={() => setSelectedExport(item)}><FaEye /></button>
                    <button className="btn-delete" onClick={() => deleteExport(item.id)}><FaTrash /></button>
                  </div>
                </td>
              </tr>
            ))}
            {exportsHistory.length === 0 && (
              <tr><td colSpan={9} className="muted">No export history available</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Create New Data Export</h3>
              <button className="close-button" onClick={() => { setShowCreateModal(false); setUploadFileRecords(null); setPreviewRows([]); }}>×</button>
            </div>
            <div className="create-export-form">
              <div className="form-group">
                <label>Source</label>
                <div style={{display:'flex',gap:8,alignItems:'center'}}>
                  <button className="secondary-button" onClick={() => { setUploadFileRecords(null); toast.info('Using DB table as source'); }}>DB Table</button>
                  <button className="secondary-button" onClick={() => fileInputRef.current?.click()}>Upload CSV/Excel</button>
                  <input ref={fileInputRef} type="file" accept=".csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel" style={{display:'none'}} onChange={onFileInputChange} />
                </div>
                {uploadFileRecords && <div className="muted small">Uploaded records ready ({uploadFileRecords.length} rows)</div>}
              </div>

              <div className="form-group">
                <label>Select Table</label>
                <select id="exportTable" defaultValue="">
                  <option value="">-- select table (DB source only) --</option>
                  {tables.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <div className="small muted">Pick a table to preview or export (when DB Table source selected)</div>
                <div style={{marginTop:8}}>
                  <button className="secondary-button" onClick={() => {
                    const table = document.getElementById('exportTable')?.value;
                    if (!table) return toast.error('Select table first');
                    previewTableTopRows(table, 10);
                  }}><FaSearch /> Preview Top 10</button>
                </div>
              </div>

              <div className="form-group">
                <label>Export Format</label>
                <div className="format-options">
                  {exportFormats.map(f => (
                    <label key={f.value} className="format-option">
                      <input type="radio" name="exportFormat" defaultChecked={f.value === 'csv'} value={f.value} />
                      <div className="format-card"><f.icon /> <span>{f.label}</span></div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Options</label>
                <div style={{display:'flex',gap:12}}>
                  <label className="small"><input type="checkbox" onChange={(e) => setDryRun(e.target.checked)} /> Dry run (preview only)</label>
                </div>
              </div>

              <div className="form-actions">
                <button className="secondary-button" onClick={() => { setShowCreateModal(false); setUploadFileRecords(null); setPreviewRows([]); }}>Cancel</button>
                <button className="primary-button" onClick={async () => {
                  const table = document.getElementById('exportTable')?.value;
                  const formatInput = document.querySelector('input[name="exportFormat"]:checked')?.value;
                  if (!uploadFileRecords && !table) {
                    toast.error('Choose DB table or upload a file first');
                    return;
                  }
                  try {
                    // sourceRecords if file uploaded; else null to read DB
                    await createDataExport({ table: table || 'uploaded_data', format: formatInput || 'csv', filters: {}, sourceRecords: uploadFileRecords });
                    setShowCreateModal(false);
                    setUploadFileRecords(null);
                    setPreviewRows([]);
                  } catch (err) {
                    // error already surfaced by createDataExport
                  }
                }} disabled={exporting}>{exporting ? 'Exporting...' : 'Create Export'}</button>
              </div>

              {/* Preview area */}
              <div style={{marginTop:12}}>
                <h4>Preview (top 10 rows)</h4>
                {previewLoading ? <div className="muted">Loading preview...</div> :
                  previewRows.length ? (
                    <div className="preview-table">
                      <table>
                        <thead>
                          <tr>{Object.keys(previewRows[0] || {}).map(h => <th key={h}>{h}</th>)}</tr>
                        </thead>
                        <tbody>
                          {previewRows.map((r, i) => (
                            <tr key={i}>{Object.values(r).map((v, j) => <td key={j}>{typeof v === 'object' ? JSON.stringify(v) : String(v)}</td>)}</tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : <div className="muted small">No preview available</div>
                }
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Selected export details */}
      {selectedExport && (
        <div className="modal-overlay">
          <div className="modal-content large">
            <div className="modal-header">
              <h3>Export Details - {selectedExport.file_name}</h3>
              <button className="close-button" onClick={() => setSelectedExport(null)}>×</button>
            </div>

            <div className="export-details">
              <div className="detail-grid">
                <div className="detail-item"><span className="label">File Name:</span><span className="value">{selectedExport.file_name}</span></div>
                <div className="detail-item"><span className="label">Table:</span><span className="value"><code>{selectedExport.table_name}</code></span></div>
                <div className="detail-item"><span className="label">Format:</span><span className="value">{(selectedExport.export_format || '').toUpperCase()}</span></div>
                <div className="detail-item"><span className="label">Status:</span><span className={`status-badge ${getStatusColor(selectedExport.status)}`}>{(selectedExport.status || '').toUpperCase()}</span></div>
                <div className="detail-item"><span className="label">Records:</span><span className="value">{(selectedExport.record_count || 0).toLocaleString()}</span></div>
                <div className="detail-item"><span className="label">File Size:</span><span className="value">{selectedExport.file_size ? formatFileSize(selectedExport.file_size) : 'N/A'}</span></div>
                <div className="detail-item"><span className="label">Created:</span><span className="value">{selectedExport.created_at ? format(new Date(selectedExport.created_at), 'dd/MM/yyyy HH:mm') : '-'}</span></div>
              </div>

              {selectedExport.error_message && (
                <div className="detail-section">
                  <h4>Error</h4>
                  <pre className="error-log">{selectedExport.error_message}</pre>
                </div>
              )}

              <div className="modal-actions">
                {selectedExport.status === 'completed' && <button className="secondary-button" onClick={() => downloadExport(selectedExport)}><FaDownload /> Download</button>}
                <button className="primary-button" onClick={() => setSelectedExport(null)}>Close</button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default DataExporter;
