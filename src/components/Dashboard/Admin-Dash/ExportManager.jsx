// src/components/Export/ExportManager.jsx
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  FaFileExport, FaPlus, FaEdit, FaTrash, FaSearch, FaFilter,
  FaDownload, FaUpload, FaEye, FaCheckCircle, FaTimesCircle,
  FaClock, FaRupeeSign, FaBox, FaShippingFast, FaGlobeAmericas,
  FaFilePdf, FaFileExcel, FaPrint, FaCopy, FaHistory
} from 'react-icons/fa';
import { format, parseISO, isBefore, isAfter, addDays } from 'date-fns';
import supabase from '../../../supabaseClient';
import { toast } from 'react-hot-toast';

const ExportManager = () => {
  const [exportOrders, setExportOrders] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCountry, setFilterCountry] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [formData, setFormData] = useState({
    order_number: '',
    client_id: '',
    destination_country: '',
    incoterms: 'FOB',
    transport_mode: 'sea',
    total_value: '',
    currency: 'INR',
    shipment_date: '',
    estimated_arrival: '',
    notes: ''
  });

  // Countries for dropdown
  const countries = useMemo(() => [
    'United Arab Emirates', 'Saudi Arabia', 'Qatar', 'Oman', 'Kuwait',
    'Bahrain', 'Singapore', 'Hong Kong', 'Malaysia', 'United Kingdom',
    'United States', 'Germany', 'France', 'Australia', 'Japan'
  ], []);

  const incoterms = useMemo(() => [
    'EXW', 'FCA', 'FAS', 'FOB', 'CFR', 'CIF', 'CPT', 'CIP',
    'DPU', 'DAP', 'DDP'
  ], []);

  useEffect(() => {
    fetchExportData();
  }, []);

  const fetchExportData = async () => {
    try {
      setLoading(true);

      // Fetch export orders with client and item details
      const { data: orders, error: ordersError } = await supabase
        .from('export_orders')
        .select(`
          id,
          order_number,
          status,
          total_value,
          currency,
          destination_country,
          incoterms,
          transport_mode,
          shipment_date,
          estimated_arrival,
          actual_arrival,
          created_at,
          updated_at,
          clients (
            id,
            company_name,
            contact_name,
            email,
            phone
          ),
          export_items (
            id,
            product_name,
            product_category,
            quantity,
            unit_price,
            total_price,
            hs_code
          )
        `)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Fetch export documents
      const { data: docs, error: docsError } = await supabase
        .from('export_documents')
        .select(`
          id,
          export_order_id,
          document_type,
          document_name,
          document_number,
          status,
          file_url,
          submitted_at,
          approved_at,
          created_at,
          template_type,
          generated_data
        `)
        .order('created_at', { ascending: false });

      if (docsError) throw docsError;

      setExportOrders(orders || []);
      setDocuments(docs || []);

      await logSystemActivity('info', 'Export data loaded successfully', 'ExportManager', {
        ordersCount: orders?.length || 0,
        documentsCount: docs?.length || 0
      });

    } catch (err) {
      console.error('Error fetching export data:', err);
      toast.error('Failed to load export data');
      
      await logSystemActivity('error', `Export data fetch failed: ${err.message}`, 'ExportManager');
    } finally {
      setLoading(false);
    }
  };

  const logSystemActivity = async (level, message, component, metadata = {}) => {
    try {
      await supabase
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
    } catch (error) {
      console.error('Logging error:', error);
    }
  };

  const handleCreateExport = async (e) => {
    e.preventDefault();
    try {
      // Generate order number
      const orderNumber = `EXP-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`.toUpperCase();
      
      const { data, error } = await supabase
        .from('export_orders')
        .insert([
          {
            ...formData,
            order_number: orderNumber,
            status: 'draft',
            created_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (error) throw error;

      toast.success('Export order created successfully');
      setShowCreateForm(false);
      setFormData({
        order_number: '',
        client_id: '',
        destination_country: '',
        incoterms: 'FOB',
        transport_mode: 'sea',
        total_value: '',
        currency: 'INR',
        shipment_date: '',
        estimated_arrival: '',
        notes: ''
      });

      await logSystemActivity('info', 'New export order created', 'ExportManager', {
        orderId: data.id,
        orderNumber: orderNumber
      });

      fetchExportData();

    } catch (err) {
      console.error('Error creating export:', err);
      toast.error('Failed to create export order');
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const { error } = await supabase
        .from('export_orders')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) throw error;

      toast.success(`Order status updated to ${newStatus}`);
      fetchExportData();

      await logSystemActivity('info', 'Export order status updated', 'ExportManager', {
        orderId,
        newStatus
      });

    } catch (err) {
      console.error('Error updating order status:', err);
      toast.error('Failed to update order status');
    }
  };

  const generateDocument = async (orderId, documentType) => {
    try {
      const order = exportOrders.find(o => o.id === orderId);
      if (!order) throw new Error('Order not found');

      const documentNumber = `${documentType.toUpperCase().substr(0, 3)}-${order.order_number}-${Date.now().toString().slice(-6)}`;
      
      const { error } = await supabase
        .from('export_documents')
        .insert([
          {
            export_order_id: orderId,
            document_type: documentType,
            document_name: `${documentType.replace('_', ' ').toUpperCase()} - ${order.order_number}`,
            document_number: documentNumber,
            status: 'draft',
            template_type: 'standard',
            generated_data: {
              order: order,
              generated_at: new Date().toISOString(),
              document_type: documentType
            },
            created_at: new Date().toISOString()
          }
        ]);

      if (error) throw error;

      toast.success(`${documentType} document generated successfully`);
      fetchExportData();

      await logSystemActivity('info', 'Export document generated', 'ExportManager', {
        orderId,
        documentType,
        documentNumber
      });

    } catch (err) {
      console.error('Error generating document:', err);
      toast.error('Failed to generate document');
    }
  };

  const downloadDocument = (document) => {
    if (document.file_url) {
      window.open(document.file_url, '_blank');
    } else {
      // Generate PDF on the fly
      generatePDF(document);
    }
  };

  const generatePDF = (document) => {
    // This would integrate with a PDF generation service
    toast.info('PDF generation would be implemented here with your PDF service');
  };

  const exportToExcel = () => {
    const data = filteredOrders.map(order => ({
      'Order Number': order.order_number,
      'Client': order.clients?.company_name,
      'Destination': order.destination_country,
      'Total Value': order.total_value,
      'Currency': order.currency,
      'Status': order.status,
      'Shipment Date': order.shipment_date,
      'ETA': order.estimated_arrival
    }));

    // This would integrate with Excel export functionality
    toast.info('Excel export would be implemented here');
  };

  // Filter and search logic
  const filteredOrders = useMemo(() => {
    return exportOrders.filter(order => {
      const matchesSearch = 
        order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.clients?.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.destination_country.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
      const matchesCountry = filterCountry === 'all' || order.destination_country === filterCountry;
      
      return matchesSearch && matchesStatus && matchesCountry;
    });
  }, [exportOrders, searchTerm, filterStatus, filterCountry]);

  const getOrderDocuments = (orderId) => {
    return documents.filter(doc => doc.export_order_id === orderId);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_transit': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateExportStats = () => {
    const total = exportOrders.length;
    const completed = exportOrders.filter(o => o.status === 'completed').length;
    const inTransit = exportOrders.filter(o => o.status === 'in_transit').length;
    const pending = exportOrders.filter(o => o.status === 'pending').length;
    const totalValue = exportOrders.reduce((sum, order) => sum + (order.total_value || 0), 0);
    
    return { total, completed, inTransit, pending, totalValue };
  };

  const stats = calculateExportStats();

  if (loading) {
    return (
      <div className="export-manager glass-card">
        <div className="manager-header">
          <h3><FaFileExport /> Export Order Management</h3>
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <span>Loading export data...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="export-manager glass-card">
      <div className="manager-header">
        <div className="header-main">
          <h3><FaFileExport /> Export Order Management</h3>
          <p className="header-subtitle">Manage international shipments and documentation</p>
        </div>
        <div className="header-actions">
          <button 
            onClick={() => setShowCreateForm(true)}
            className="primary-button"
          >
            <FaPlus /> New Export Order
          </button>
          <button 
            onClick={exportToExcel}
            className="secondary-button"
          >
            <FaFileExcel /> Export to Excel
          </button>
        </div>
      </div>

      {/* Export Statistics */}
      <div className="export-stats">
        <div className="stat-card">
          <div className="stat-icon">
            <FaFileExport />
          </div>
          <div className="stat-content">
            <h4>{stats.total}</h4>
            <p>Total Orders</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <FaCheckCircle />
          </div>
          <div className="stat-content">
            <h4>{stats.completed}</h4>
            <p>Completed</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <FaShippingFast />
          </div>
          <div className="stat-content">
            <h4>{stats.inTransit}</h4>
            <p>In Transit</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <FaRupeeSign />
          </div>
          <div className="stat-content">
            <h4>₹{stats.totalValue.toLocaleString('en-IN')}</h4>
            <p>Total Value</p>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="filters-section">
        <div className="search-box">
          <FaSearch />
          <input
            type="text"
            placeholder="Search by order number, client, or destination..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="in_transit">In Transit</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select 
            value={filterCountry} 
            onChange={(e) => setFilterCountry(e.target.value)}
          >
            <option value="all">All Countries</option>
            {countries.map(country => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Export Orders Table */}
      <div className="orders-table-container">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order Number</th>
              <th>Client</th>
              <th>Destination</th>
              <th>Total Value</th>
              <th>Incoterms</th>
              <th>Status</th>
              <th>Shipment Date</th>
              <th>ETA</th>
              <th>Documents</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map(order => (
              <tr key={order.id}>
                <td>
                  <div className="order-number">
                    <strong>{order.order_number}</strong>
                  </div>
                </td>
                <td>
                  <div className="client-info">
                    <div className="client-name">{order.clients?.company_name}</div>
                    <div className="client-contact">{order.clients?.contact_name}</div>
                  </div>
                </td>
                <td>
                  <div className="destination">
                    <FaGlobeAmericas className="icon" />
                    {order.destination_country}
                  </div>
                </td>
                <td>
                  <div className="value">
                    <FaRupeeSign className="icon" />
                    {order.total_value?.toLocaleString('en-IN')}
                    <span className="currency">({order.currency})</span>
                  </div>
                </td>
                <td>
                  <span className="incoterms-tag">{order.incoterms}</span>
                </td>
                <td>
                  <span className={`status-badge ${getStatusColor(order.status)}`}>
                    {order.status.replace('_', ' ')}
                  </span>
                </td>
                <td>
                  {order.shipment_date ? format(parseISO(order.shipment_date), 'dd MMM yyyy') : 'Not set'}
                </td>
                <td>
                  {order.estimated_arrival ? format(parseISO(order.estimated_arrival), 'dd MMM yyyy') : 'Not set'}
                </td>
                <td>
                  <div className="documents-list">
                    {getOrderDocuments(order.id).map(doc => (
                      <span 
                        key={doc.id}
                        className="document-tag"
                        onClick={() => {
                          setSelectedDocument(doc);
                          setShowDocumentModal(true);
                        }}
                      >
                        {doc.document_type}
                      </span>
                    ))}
                    <button 
                      className="add-document"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <FaPlus />
                    </button>
                  </div>
                </td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="btn-view"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <FaEye />
                    </button>
                    <button 
                      className="btn-edit"
                      onClick={() => {/* Edit functionality */}}
                    >
                      <FaEdit />
                    </button>
                    <button 
                      className="btn-documents"
                      onClick={() => generateDocument(order.id, 'commercial_invoice')}
                    >
                      <FaFilePdf />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredOrders.length === 0 && (
          <div className="empty-state">
            <FaFileExport className="empty-icon" />
            <h4>No export orders found</h4>
            <p>Create your first export order to get started</p>
            <button 
              onClick={() => setShowCreateForm(true)}
              className="primary-button"
            >
              <FaPlus /> Create Export Order
            </button>
          </div>
        )}
      </div>

      {/* Create Export Order Modal */}
      {showCreateForm && (
        <div className="modal-overlay">
          <div className="modal-content large">
            <div className="modal-header">
              <h3>Create New Export Order</h3>
              <button 
                className="close-button"
                onClick={() => setShowCreateForm(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleCreateExport}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Destination Country *</label>
                  <select
                    value={formData.destination_country}
                    onChange={(e) => setFormData({...formData, destination_country: e.target.value})}
                    required
                  >
                    <option value="">Select Country</option>
                    {countries.map(country => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Incoterms *</label>
                  <select
                    value={formData.incoterms}
                    onChange={(e) => setFormData({...formData, incoterms: e.target.value})}
                    required
                  >
                    {incoterms.map(term => (
                      <option key={term} value={term}>{term}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Transport Mode *</label>
                  <select
                    value={formData.transport_mode}
                    onChange={(e) => setFormData({...formData, transport_mode: e.target.value})}
                    required
                  >
                    <option value="sea">Sea Freight</option>
                    <option value="air">Air Freight</option>
                    <option value="land">Land Transport</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Total Value (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.total_value}
                    onChange={(e) => setFormData({...formData, total_value: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Shipment Date</label>
                  <input
                    type="date"
                    value={formData.shipment_date}
                    onChange={(e) => setFormData({...formData, shipment_date: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Estimated Arrival</label>
                  <input
                    type="date"
                    value={formData.estimated_arrival}
                    onChange={(e) => setFormData({...formData, estimated_arrival: e.target.value})}
                  />
                </div>
                <div className="form-group full-width">
                  <label>Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    rows="3"
                    placeholder="Additional notes or special instructions..."
                  />
                </div>
              </div>
              <div className="form-actions">
                <button 
                  type="button" 
                  className="secondary-button"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="primary-button"
                >
                  <FaPlus /> Create Export Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Document Modal */}
      {showDocumentModal && selectedDocument && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Document Details</h3>
              <button 
                className="close-button"
                onClick={() => setShowDocumentModal(false)}
              >
                ×
              </button>
            </div>
            <div className="document-details">
              <div className="detail-row">
                <span className="label">Document Type:</span>
                <span className="value">{selectedDocument.document_type}</span>
              </div>
              <div className="detail-row">
                <span className="label">Document Number:</span>
                <span className="value">{selectedDocument.document_number}</span>
              </div>
              <div className="detail-row">
                <span className="label">Status:</span>
                <span className={`status-badge ${getStatusColor(selectedDocument.status)}`}>
                  {selectedDocument.status}
                </span>
              </div>
              <div className="detail-row">
                <span className="label">Created:</span>
                <span className="value">
                  {format(parseISO(selectedDocument.created_at), 'dd MMM yyyy HH:mm')}
                </span>
              </div>
              {selectedDocument.submitted_at && (
                <div className="detail-row">
                  <span className="label">Submitted:</span>
                  <span className="value">
                    {format(parseISO(selectedDocument.submitted_at), 'dd MMM yyyy HH:mm')}
                  </span>
                </div>
              )}
            </div>
            <div className="modal-actions">
              <button 
                className="secondary-button"
                onClick={() => downloadDocument(selectedDocument)}
              >
                <FaDownload /> Download
              </button>
              <button 
                className="primary-button"
                onClick={() => {/* Print functionality */}}
              >
                <FaPrint /> Print
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportManager;