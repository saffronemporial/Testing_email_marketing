// src/components/Compliance/ComplianceTracker.jsx
import React, { useEffect, useState, useMemo } from 'react';
import {
  FaFileContract, FaCheckCircle, FaClock, FaTimesCircle,
  FaSearch, FaPlus, FaUpload, FaDownload, FaEye, FaExclamationTriangle
} from 'react-icons/fa';
import { format, parseISO, isBefore, addDays, differenceInDays, subMonths } from 'date-fns';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import supabase from '../../../supabaseClient';
import { toast } from 'react-hot-toast';
import './ComplianceTracker.css';

const ComplianceTracker = () => {
  const [documents, setDocuments] = useState([]);
  const [exportOrders, setExportOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedDocuments, setSelectedDocuments] = useState(new Set());
  const [bulkAction, setBulkAction] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const documentTypes = useMemo(() => [
    'sales_invoice', 'packing_list', 'commercial_invoice', 'certificate_of_origin', 'bill_of_lading', 'export_declaration'
  ], []);

  const documentStatuses = useMemo(() => [
    'draft', 'final', 'submitted', 'approved', 'rejected'
  ], []);

  useEffect(() => {
    fetchComplianceData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const safeQuery = async (q) => {
    try {
      const res = await q;
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

  const logSystemActivity = async (level, message, component = 'ComplianceTracker', metadata = {}) => {
    try {
      const userRes = await supabase.auth.getUser();
      const userId = userRes?.data?.user?.id ?? null;
      await supabase.from('system_logs').insert([{
        level, message, component, user_id: userId, metadata, created_at: new Date().toISOString()
      }]);
    } catch (err) {
      console.error('Logging error:', err);
    }
  };

  const fetchComplianceData = async () => {
    setLoading(true);
    try {
      // Fetch documents (avoid deep embedding that may not exist)
      const docs = await safeQuery(
        supabase.from('export_documents').select('id, export_order_id, document_type, document_name, document_number, file_url, status, submitted_date, approved_date, notes, created_at, updated_at, generated_data, created_by')
          .order('created_at', { ascending: false })
          .limit(500)
      );

      // Fetch export orders separately (lightweight)
      const orders = await safeQuery(
        supabase.from('export_orders').select('id, export_reference, status, current_phase, port_of_loading, port_of_discharge').order('created_at', { ascending: false }).limit(500)
      );

      // Build a map for quick lookup
      const ordersMap = (orders || []).reduce((m, o) => { m[o.id] = o; return m; }, {});

      // Attach order summary to documents where possible
      const docsWithOrders = (docs || []).map(d => ({
        ...d,
        export_order: ordersMap[d.export_order_id] || null
      }));

      setDocuments(docsWithOrders);
      setExportOrders(orders || []);
      await logSystemActivity('info', 'Compliance documents loaded', 'ComplianceTracker', { documentsCount: docsWithOrders.length, ordersCount: (orders || []).length });
    } catch (err) {
      console.error('Error fetching compliance data:', err);
      toast.error('Failed to load compliance documents');
      await logSystemActivity('error', `Compliance data fetch failed: ${String(err?.message || err)}`, 'ComplianceTracker');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e, uploadData) => {
    e?.preventDefault?.();
    try {
      setUploading(true);
      if (!uploadData?.file) {
        toast.error('Please select a file to upload');
        return;
      }

      const documentNumber = `DOC-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
      const fileExt = uploadData.file.name.split('.').pop();
      const fileName = `${uploadData.document_type}/${documentNumber}.${fileExt}`;

      const { error: uploadError } = await supabase.storage.from('export-documents').upload(fileName, uploadData.file);
      if (uploadError) throw uploadError;

      const { data: publicData } = supabase.storage.from('export-documents').getPublicUrl(fileName);
      const publicUrl = publicData?.publicUrl || null;

      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id ?? null;

      const { error: docError } = await supabase.from('export_documents').insert([{
        export_order_id: uploadData.export_order_id || null,
        document_type: uploadData.document_type,
        document_name: uploadData.document_name,
        document_number: documentNumber,
        file_url: publicUrl,
        status: 'draft',
        notes: uploadData.notes || null,
        created_by: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }]);

      if (docError) throw docError;

      toast.success('Document uploaded successfully');
      setShowUploadModal(false);
      fetchComplianceData();
      await logSystemActivity('info', 'Document uploaded', 'ComplianceTracker', { documentNumber, fileSize: uploadData.file.size });
    } catch (err) {
      console.error('Error uploading document:', err);
      toast.error('Failed to upload document');
      await logSystemActivity('error', `Document upload failed: ${String(err?.message || err)}`, 'ComplianceTracker');
    } finally {
      setUploading(false);
    }
  };

  const updateDocumentStatus = async (documentId, newStatus, bulk = false) => {
    try {
      const updateData = { status: newStatus, updated_at: new Date().toISOString() };
      if (newStatus === 'submitted') { updateData.submitted_at = new Date().toISOString(); updateData.submitted_date = new Date().toISOString(); }
      if (newStatus === 'approved') { updateData.approved_at = new Date().toISOString(); updateData.approved_date = new Date().toISOString(); }
      if (newStatus === 'rejected') { updateData.submitted_at = null; updateData.submitted_date = null; }

      const { error } = await supabase.from('export_documents').update(updateData).eq('id', documentId);
      if (error) throw error;

      if (!bulk) toast.success(`Document status updated to ${newStatus}`);
      fetchComplianceData();
      await logSystemActivity('info', 'Document status updated', 'ComplianceTracker', { documentId, newStatus, bulk });
    } catch (err) {
      console.error('Error updating document status:', err);
      toast.error('Failed to update document status');
      await logSystemActivity('error', `Document status update failed: ${String(err?.message || err)}`, 'ComplianceTracker');
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedDocuments.size === 0) { toast.error('Please select documents and an action'); return; }
    try {
      const ids = Array.from(selectedDocuments);
      const updateData = { status: bulkAction, updated_at: new Date().toISOString() };
      if (bulkAction === 'submitted') { updateData.submitted_at = new Date().toISOString(); updateData.submitted_date = new Date().toISOString(); }
      if (bulkAction === 'approved') { updateData.approved_at = new Date().toISOString(); updateData.approved_date = new Date().toISOString(); }

      const { error } = await supabase.from('export_documents').update(updateData).in('id', ids);
      if (error) throw error;

      toast.success(`${ids.length} documents updated`);
      setSelectedDocuments(new Set());
      setBulkAction('');
      fetchComplianceData();
      await logSystemActivity('info', 'Bulk document status update', 'ComplianceTracker', { documentCount: ids.length, newStatus: bulkAction });
    } catch (err) {
      console.error('Error in bulk action:', err);
      toast.error('Failed to perform bulk action');
    }
  };

  const generateDocumentPDF = async (document) => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text(document.document_name || 'EXPORT DOCUMENT', 14, 20);
      doc.setFontSize(11);
      doc.text(`Document Number: ${document.document_number || '—'}`, 14, 30);
      doc.text(`Type: ${document.document_type || '—'}`, 14, 36);
      doc.text(`Status: ${document.status || '—'}`, 14, 42);
      if (document.export_order) {
        doc.text(`Order Ref: ${document.export_order.export_reference || '—'}`, 14, 50);
        doc.text(`Port of Loading: ${document.export_order.port_of_loading || '—'}`, 14, 56);
      }
      if (document.generated_data?.content) {
        let y = 70;
        Object.entries(document.generated_data.content).forEach(([k, v]) => {
          if (y > 270) { doc.addPage(); y = 20; }
          doc.text(`${k.replace('_', ' ').toUpperCase()}: ${String(v)}`, 14, y);
          y += 8;
        });
      }
      doc.save(`${document.document_number || 'document'}.pdf`);
      toast.success('PDF generated');
      await logSystemActivity('info', 'Document PDF generated', 'ComplianceTracker', { documentId: document.id });
    } catch (err) {
      console.error('Error generating PDF:', err);
      toast.error('Failed to generate PDF');
    }
  };

  const downloadDocument = async (document) => {
    try {
      if (document.file_url) window.open(document.file_url, '_blank');
      else await generateDocumentPDF(document);
      await logSystemActivity('info', 'Document downloaded', 'ComplianceTracker', { documentId: document.id });
    } catch (err) {
      console.error('Error downloading document:', err);
      toast.error('Failed to download document');
    }
  };

  const deleteDocument = async (documentId) => {
    if (!window.confirm('Delete this document? This cannot be undone.')) return;
    try {
      const { error } = await supabase.from('export_documents').delete().eq('id', documentId);
      if (error) throw error;
      toast.success('Document deleted');
      fetchComplianceData();
      await logSystemActivity('warning', 'Document deleted', 'ComplianceTracker', { documentId });
    } catch (err) {
      console.error('Error deleting document:', err);
      toast.error('Failed to delete document');
    }
  };

  const calculateComplianceStats = () => {
    const total = documents.length;
    const approved = documents.filter(d => d.status === 'approved').length;
    const pending = documents.filter(d => d.status === 'submitted').length;
    const draft = documents.filter(d => d.status === 'draft').length;
    const rejected = documents.filter(d => d.status === 'rejected').length;
    const expired = documents.filter(d => d.approved_date && isBefore(parseISO(d.approved_date), subMonths(new Date(), 12))).length;
    const complianceRate = total > 0 ? ((approved / total) * 100).toFixed(1) : 0;
    return { total, approved, pending, draft, rejected, expired, complianceRate };
  };

  const getExpiringDocuments = () => documents.filter(doc => doc.approved_date && differenceInDays(parseISO(doc.approved_date), new Date()) < 30 && differenceInDays(parseISO(doc.approved_date), new Date()) > 0);
  const getUrgentDocuments = () => documents.filter(doc => doc.status === 'submitted' && differenceInDays(new Date(), parseISO(doc.submitted_date || doc.created_at)) > 7);

  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
      const q = searchTerm.trim().toLowerCase();
      const matchesSearch = !q || (
        (doc.document_number || '').toLowerCase().includes(q) ||
        (doc.document_name || '').toLowerCase().includes(q) ||
        (doc.export_order?.export_reference || '').toLowerCase().includes(q)
      );
      const matchesStatus = filterStatus === 'all' || doc.status === filterStatus;
      const matchesType = filterType === 'all' || doc.document_type === filterType;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [documents, searchTerm, filterStatus, filterType]);

  const paginatedDocuments = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredDocuments.slice(start, start + itemsPerPage);
  }, [filteredDocuments, currentPage, itemsPerPage]);

  const totalPages = Math.max(1, Math.ceil(filteredDocuments.length / itemsPerPage));
  const stats = calculateComplianceStats();
  const expiringDocs = getExpiringDocuments();
  const urgentDocs = getUrgentDocuments();

  const toggleDocumentSelection = (id) => {
    const s = new Set(selectedDocuments);
    if (s.has(id)) s.delete(id); else s.add(id);
    setSelectedDocuments(s);
  };

  const selectAllDocuments = () => {
    if (selectedDocuments.size === paginatedDocuments.length) setSelectedDocuments(new Set());
    else setSelectedDocuments(new Set(paginatedDocuments.map(d => d.id)));
  };

  if (loading) {
    return (
      <div className="compliance-tracker glass-card">
        <div className="manager-header">
          <h3><FaFileContract /> Compliance Document Tracker</h3>
          <div className="loading-state">Loading compliance documents...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="compliance-tracker glass-card">
      <div className="manager-header">
        <div className="header-main">
          <h3><FaFileContract /> Compliance Document Tracker</h3>
          <p className="header-subtitle">Manage export documentation and compliance requirements</p>
        </div>
        <div className="header-actions">
          <button onClick={() => setShowUploadModal(true)} className="primary-button"><FaUpload /> Upload Document</button>
          <button onClick={fetchComplianceData} className="secondary-button"><FaSync /> Refresh</button>
        </div>
      </div>

      <div className="compliance-stats">
        <div className="stat-card"><div className="stat-icon"><FaFileContract /></div><div className="stat-content"><h4>{stats.total}</h4><p>Total Documents</p></div></div>
        <div className="stat-card"><div className="stat-icon"><FaCheckCircle /></div><div className="stat-content"><h4>{stats.approved}</h4><p>Approved</p></div></div>
        <div className="stat-card"><div className="stat-icon"><FaClock /></div><div className="stat-content"><h4>{stats.pending}</h4><p>Pending Review</p></div></div>
        <div className="stat-card"><div className="stat-icon"><FaFileContract /></div><div className="stat-content"><h4>{stats.complianceRate}%</h4><p>Compliance Rate</p></div></div>
      </div>

      <div className="filters-section">
        <div className="search-box"><FaSearch /><input placeholder="Search by document number, name, or order reference..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
        <div className="filter-group">
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}><option value="all">All Status</option>{documentStatuses.map(s => <option key={s} value={s}>{s}</option>)}</select>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}><option value="all">All Types</option>{documentTypes.map(t => <option key={t} value={t}>{t.replace('_', ' ').toUpperCase()}</option>)}</select>
          <button className="clear-filters-btn" onClick={() => { setSearchTerm(''); setFilterStatus('all'); setFilterType('all'); }}>Clear Filters</button>
        </div>
      </div>

      {selectedDocuments.size > 0 && (
        <div className="bulk-actions-bar">
          <div className="bulk-info"><strong>{selectedDocuments.size}</strong> documents selected</div>
          <div className="bulk-controls">
            <select value={bulkAction} onChange={(e) => setBulkAction(e.target.value)}><option value="">Choose action...</option><option value="submitted">Mark as Submitted</option><option value="approved">Mark as Approved</option><option value="rejected">Mark as Rejected</option><option value="draft">Mark as Draft</option></select>
            <button onClick={handleBulkAction} disabled={!bulkAction} className="bulk-action-btn">Apply</button>
            <button onClick={() => setSelectedDocuments(new Set())} className="bulk-clear-btn">Clear</button>
          </div>
        </div>
      )}

      <div className="documents-table-container">
        <table className="documents-table">
          <thead>
            <tr>
              <th width="30"><input type="checkbox" checked={selectedDocuments.size === paginatedDocuments.length && paginatedDocuments.length > 0} onChange={selectAllDocuments} /></th>
              <th>Document</th>
              <th>Order Ref</th>
              <th>Type</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedDocuments.map(doc => (
              <tr key={doc.id}>
                <td><input type="checkbox" checked={selectedDocuments.has(doc.id)} onChange={() => toggleDocumentSelection(doc.id)} /></td>
                <td><div className="doc-title">{doc.document_name || doc.document_number || '—'}<div className="muted small">{doc.document_number || '—'}</div></div></td>
                <td>{doc.export_order?.export_reference || '—'}</td>
                <td>{doc.document_type}</td>
                <td><span className={`status-badge ${doc.status}`}>{doc.status}</span></td>
                <td>{doc.created_at ? format(new Date(doc.created_at), 'dd MMM yyyy') : '—'}</td>
                <td>
                  <div className="action-buttons">
                    <button onClick={() => downloadDocument(doc)} title="Download"><FaDownload /></button>
                    <button onClick={() => setSelectedDocument(doc)} title="View"><FaEye /></button>
                    <button onClick={() => updateDocumentStatus(doc.id, 'submitted')} title="Submit"><FaUpload /></button>
                    <button onClick={() => deleteDocument(doc.id)} title="Delete"><FaTimesCircle /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Prev</button>
        <span>Page {currentPage} / {totalPages}</span>
        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next</button>
      </div>

      {/* Upload modal placeholder */}
      {showUploadModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header"><h3>Upload Document</h3><button className="close-button" onClick={() => setShowUploadModal(false)}>×</button></div>
            <div className="create-operation-form">
              <p className="muted">Use your upload UI to call <code>handleFileUpload(e, uploadData)</code> with a File object and metadata.</p>
              <div className="form-actions"><button className="secondary-button" onClick={() => setShowUploadModal(false)}>Close</button></div>
            </div>
          </div>
        </div>
      )}

      {/* Document details modal */}
      {selectedDocument && (
        <div className="modal-overlay">
          <div className="modal-content large">
            <div className="modal-header"><h3>Document - {selectedDocument.document_name || selectedDocument.document_number}</h3><button className="close-button" onClick={() => setSelectedDocument(null)}>×</button></div>
            <div className="operation-details">
              <div className="detail-section">
                <h4>Details</h4>
                <div className="detail-grid">
                  <div className="detail-item"><span className="label">Document Number</span><span className="value">{selectedDocument.document_number}</span></div>
                  <div className="detail-item"><span className="label">Type</span><span className="value">{selectedDocument.document_type}</span></div>
                  <div className="detail-item"><span className="label">Status</span><span className="value">{selectedDocument.status}</span></div>
                  <div className="detail-item"><span className="label">Order Ref</span><span className="value">{selectedDocument.export_order?.export_reference || '—'}</span></div>
                </div>
              </div>

              <div className="modal-actions">
                <button className="secondary-button" onClick={() => generateDocumentPDF(selectedDocument)}>Generate PDF</button>
                <button className="primary-button" onClick={() => setSelectedDocument(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplianceTracker;
