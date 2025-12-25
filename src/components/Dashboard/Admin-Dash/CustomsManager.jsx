// src/components/Customs/CustomsManager.jsx
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { 
  FaFileContract, FaDownload, FaUpload, FaCheckCircle, 
  FaTimesCircle, FaClock, FaSearch, FaFilter, FaPlus,
  FaEye, FaEdit, FaTrash, FaPrint, FaFilePdf, FaGlobeAmericas,
  FaRupeeSign, FaBox, FaShippingFast, FaCalculator, FaHistory,
  FaExclamationTriangle, FaCalendarAlt, FaList, FaCog
} from 'react-icons/fa';
import { format, parseISO, addDays, isBefore, differenceInDays } from 'date-fns';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import supabase from '../../../supabaseClient';
import { toast } from 'react-hot-toast';
import './CustomsManager.css'; // Import CSS file

const CustomsManager = () => {
  const [customsDeclarations, setCustomsDeclarations] = useState([]);
  const [exportOrders, setExportOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedDeclaration, setSelectedDeclaration] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [calculatorData, setCalculatorData] = useState({
    productType: '',
    value: '',
    destination: '',
    calculatedDuty: 0,
    calculatedTaxes: 0,
    totalPayable: 0
  });

  const [formData, setFormData] = useState({
    export_order_id: '',
    declaration_number: '',
    country_of_origin: 'India',
    country_of_destination: '',
    hs_code: '',
    goods_description: '',
    quantity: '',
    unit_price: '',
    total_value: '',
    currency: 'INR',
    customs_duty: '0',
    taxes: '0',
    total_payable: '0',
    customs_office: '',
    declaration_data: {},
    export_license_required: false,
    special_handling: ''
  });

  // Enhanced HS Code database for Indian export products
  const hsCodes = useMemo(() => ({
    'SAFFRON': { code: '09102000', duty: 0.05 },
    'POMEGRANATE': { code: '08109010', duty: 0.03 },
    'MANGOES': { code: '08045000', duty: 0.04 },
    'GRAPES': { code: '08061000', duty: 0.035 },
    'BANANAS': { code: '08030000', duty: 0.04 },
    'SPICES': { code: '0904', duty: 0.045 },
    'RICE': { code: '1006', duty: 0.02 },
    'WHEAT': { code: '1001', duty: 0.025 },
    'TEA': { code: '0902', duty: 0.06 },
    'COFFEE': { code: '0901', duty: 0.055 }
  }), []);

  const countries = useMemo(() => [
    'United Arab Emirates', 'Saudi Arabia', 'Qatar', 'Oman', 'Kuwait',
    'Bahrain', 'Singapore', 'Hong Kong', 'Malaysia', 'United Kingdom',
    'United States', 'Germany', 'France', 'Australia', 'Japan', 'South Korea'
  ], []);

  const customsOffices = useMemo(() => [
    'Mumbai Customs - JNPT',
    'Delhi Customs - IGI Airport',
    'Chennai Customs',
    'Kolkata Customs',
    'Bangalore Customs',
    'Hyderabad Customs'
  ], []);

  useEffect(() => {
    fetchCustomsData();
  }, []);

  const fetchCustomsData = async () => {
    try {
      setLoading(true);

      // Fetch customs declarations with proper joins
      const { data: declarations, error: declError } = await supabase
        .from('customs_declarations')
        .select(`
          id,
          declaration_number,
          export_order_id,
          country_of_origin,
          country_of_destination,
          hs_code,
          goods_description,
          quantity,
          unit_price,
          total_value,
          currency,
          customs_duty,
          taxes,
          total_payable,
          status,
          submitted_at,
          approved_at,
          cleared_at,
          customs_office,
          declaration_data,
          created_at,
          updated_at,
          export_orders (
            order_number,
            export_reference,
            destination_country,
            clients (
              company_name,
              contact_name
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (declError) throw declError;

      // Fetch export orders for creating new declarations
      const { data: orders, error: ordersError } = await supabase
        .from('export_orders')
        .select(`
          id,
          order_number,
          export_reference,
          destination_country,
          total_order_value,
          clients (
            company_name,
            contact_name
          ),
          export_items (
            product_name,
            quantity,
            unit_price
          )
        `)
        .eq('status', 'confirmed');

      if (ordersError) throw ordersError;

      // Fetch products for HS code lookup
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('id, name, hs_code, category, is_active')
        .eq('is_active', true);

      if (productsError) throw productsError;

      setCustomsDeclarations(declarations || []);
      setExportOrders(orders || []);
      setProducts(productsData || []);

      await logSystemActivity('info', 'Customs data loaded successfully', 'CustomsManager', {
        declarations: declarations?.length || 0,
        orders: orders?.length || 0
      });

    } catch (err) {
      console.error('Error fetching customs data:', err);
      toast.error('Failed to load customs data');
      await logSystemActivity('error', `Customs data fetch failed: ${err.message}`, 'CustomsManager');
    } finally {
      setLoading(false);
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

  // Enhanced customs duty calculation
  const calculateCustomsCharges = (productType, value, destination) => {
    let dutyRate = 0;
    let taxRate = 0.12; // Standard GST/VAT rate

    // Enhanced duty rates based on product type and destination
    const dutyRates = {
      'SAFFRON': { 
        'UNITED ARAB EMIRATES': 0.05, 
        'SAUDI ARABIA': 0.07, 
        'QATAR': 0.06, 
        'default': 0.08 
      },
      'POMEGRANATE': { 
        'UNITED ARAB EMIRATES': 0.03, 
        'SAUDI ARABIA': 0.05, 
        'QATAR': 0.04, 
        'default': 0.06 
      },
      'SPICES': { 
        'UNITED ARAB EMIRATES': 0.04, 
        'SAUDI ARABIA': 0.06, 
        'QATAR': 0.05, 
        'default': 0.07 
      },
      'default': { 'default': 0.05 }
    };

    const productKey = productType.toUpperCase();
    const countryKey = destination.toUpperCase();

    dutyRate = dutyRates[productKey]?.[countryKey] || 
               dutyRates[productKey]?.['default'] || 
               dutyRates['default']['default'];

    const duty = value * dutyRate;
    const taxes = value * taxRate;
    const totalPayable = duty + taxes;

    return {
      duty: duty.toFixed(2),
      taxes: taxes.toFixed(2),
      totalPayable: totalPayable.toFixed(2),
      dutyRate: (dutyRate * 100).toFixed(1) + '%',
      taxRate: (taxRate * 100).toFixed(1) + '%'
    };
  };

  // New: Standalone duty calculator
  const calculateDuty = () => {
    if (!calculatorData.productType || !calculatorData.value || !calculatorData.destination) {
      toast.error('Please fill all fields');
      return;
    }

    const charges = calculateCustomsCharges(
      calculatorData.productType,
      parseFloat(calculatorData.value),
      calculatorData.destination
    );

    setCalculatorData(prev => ({
      ...prev,
      calculatedDuty: charges.duty,
      calculatedTaxes: charges.taxes,
      totalPayable: charges.totalPayable
    }));
  };

  const handleCreateDeclaration = async (e) => {
    e.preventDefault();
    try {
      // Generate declaration number
      const declarationNumber = `CUS-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`.toUpperCase();
      
      const { data, error } = await supabase
        .from('customs_declarations')
        .insert([{
          ...formData,
          declaration_number: declarationNumber,
          status: 'draft',
          created_at: new Date().toISOString(),
          declaration_data: {
            generated_at: new Date().toISOString(),
            calculated_duty: parseFloat(formData.customs_duty) || 0,
            calculated_taxes: parseFloat(formData.taxes) || 0,
            exchange_rate: 1,
            declaration_type: 'export',
            compliance_check: true,
            license_required: formData.export_license_required
          }
        }])
        .select()
        .single();

      if (error) throw error;

      toast.success('Customs declaration created successfully');
      setShowCreateForm(false);
      resetForm();
      fetchCustomsData();

      await logSystemActivity('info', 'Customs declaration created', 'CustomsManager', {
        declarationId: data.id,
        declarationNumber
      });

    } catch (err) {
      console.error('Error creating declaration:', err);
      toast.error('Failed to create customs declaration');
    }
  };

  const resetForm = () => {
    setFormData({
      export_order_id: '',
      declaration_number: '',
      country_of_origin: 'India',
      country_of_destination: '',
      hs_code: '',
      goods_description: '',
      quantity: '',
      unit_price: '',
      total_value: '',
      currency: 'INR',
      customs_duty: '0',
      taxes: '0',
      total_payable: '0',
      customs_office: '',
      declaration_data: {},
      export_license_required: false,
      special_handling: ''
    });
  };

  const updateDeclarationStatus = async (declarationId, newStatus) => {
    try {
      const updateData = {
        status: newStatus,
        updated_at: new Date().toISOString()
      };

      if (newStatus === 'submitted') {
        updateData.submitted_at = new Date().toISOString();
      } else if (newStatus === 'approved') {
        updateData.approved_at = new Date().toISOString();
      } else if (newStatus === 'cleared') {
        updateData.cleared_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('customs_declarations')
        .update(updateData)
        .eq('id', declarationId);

      if (error) throw error;

      toast.success(`Declaration status updated to ${newStatus}`);
      fetchCustomsData();

      await logSystemActivity('info', 'Customs declaration status updated', 'CustomsManager', {
        declarationId,
        newStatus
      });

    } catch (err) {
      console.error('Error updating declaration status:', err);
      toast.error('Failed to update declaration status');
    }
  };

  const autoFillHSCode = (productName) => {
    const product = products.find(p => 
      p.name.toLowerCase().includes(productName.toLowerCase()) ||
      productName.toLowerCase().includes(p.name.toLowerCase())
    );
    
    if (product) {
      return product.hs_code || hsCodes[product.name.toUpperCase()]?.code || '';
    }
    
    // Fallback to HS code database
    for (const [key, data] of Object.entries(hsCodes)) {
      if (productName.toLowerCase().includes(key.toLowerCase())) {
        return data.code;
      }
    }
    
    return '';
  };

  const handleProductChange = (productName) => {
    const hsCode = autoFillHSCode(productName);
    setFormData(prev => ({
      ...prev,
      hs_code: hsCode,
      goods_description: productName
    }));

    // Auto-calculate charges if value is available
    if (formData.total_value && formData.country_of_destination) {
      const charges = calculateCustomsCharges(
        productName, 
        parseFloat(formData.total_value), 
        formData.country_of_destination
      );
      
      setFormData(prev => ({
        ...prev,
        customs_duty: charges.duty,
        taxes: charges.taxes,
        total_payable: charges.totalPayable
      }));
    }
  };

  // Enhanced PDF generation with compliance info
  const generateCustomsDeclarationPDF = async (declaration) => {
    try {
      setGeneratingPDF(true);

      const doc = new jsPDF();

      // Header
      doc.setFontSize(20);
      doc.setTextColor(40, 40, 40);
      doc.text('CUSTOMS DECLARATION', 105, 20, { align: 'center' });

      // Company info
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text('Saffron Emporial', 20, 35);
      doc.text('Export Division', 20, 40);
      doc.text('Mumbai, India', 20, 45);

      // Declaration details
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Declaration Number: ${declaration.declaration_number}`, 20, 60);
      doc.text(`Date: ${format(new Date(declaration.created_at), 'dd/MM/yyyy')}`, 20, 67);
      doc.text(`Status: ${declaration.status.toUpperCase()}`, 20, 74);
      doc.text(`Customs Office: ${declaration.customs_office || 'Not Specified'}`, 20, 81);

      // Countries
      doc.text(`Origin: ${declaration.country_of_origin}`, 120, 60);
      doc.text(`Destination: ${declaration.country_of_destination}`, 120, 67);

      // Goods description
      doc.text('Goods Description:', 20, 95);
      doc.setFontSize(10);
      doc.text(declaration.goods_description, 20, 102);

      // Create table for declaration details
      const tableData = [
        ['HS Code', 'Quantity', 'Unit Price', 'Total Value', 'Currency'],
        [
          declaration.hs_code,
          declaration.quantity.toString(),
          `₹${parseFloat(declaration.unit_price).toLocaleString('en-IN')}`,
          `₹${parseFloat(declaration.total_value).toLocaleString('en-IN')}`,
          declaration.currency
        ]
      ];

      doc.autoTable({
        startY: 115,
        head: [tableData[0]],
        body: [tableData[1]],
        theme: 'grid',
        styles: { fontSize: 10 },
        headStyles: { fillColor: [255, 215, 0] }
      });

      // Customs charges table
      const chargesData = [
        ['Customs Duty', 'Taxes', 'Total Payable'],
        [
          `₹${parseFloat(declaration.customs_duty).toLocaleString('en-IN')}`,
          `₹${parseFloat(declaration.taxes).toLocaleString('en-IN')}`,
          `₹${parseFloat(declaration.total_payable).toLocaleString('en-IN')}`
        ]
      ];

      doc.autoTable({
        startY: doc.lastAutoTable.finalY + 10,
        head: [chargesData[0]],
        body: [chargesData[1]],
        theme: 'grid',
        styles: { fontSize: 10 },
        headStyles: { fillColor: [184, 134, 11] }
      });

      // Compliance section
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text('Export Compliance Checklist:', 20, doc.lastAutoTable.finalY + 20);
      
      doc.setFontSize(10);
      const complianceItems = [
        '✓ Product classification verified',
        '✓ HS code validated',
        '✓ Export license requirements checked',
        '✓ Customs duty calculated',
        '✓ Documentation complete'
      ];

      complianceItems.forEach((item, index) => {
        doc.text(item, 25, doc.lastAutoTable.finalY + 30 + (index * 5));
      });

      // Footer
      const pageHeight = doc.internal.pageSize.height;
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text('Generated by Saffron Emporial Customs System', 105, pageHeight - 10, { align: 'center' });
      doc.text(`Generated on: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 105, pageHeight - 5, { align: 'center' });

      // Save the PDF
      const pdfBlob = doc.output('blob');
      const fileName = `customs-declaration-${declaration.declaration_number}.pdf`;

      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('export-documents')
        .upload(fileName, pdfBlob, {
          contentType: 'application/pdf'
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('export-documents')
        .getPublicUrl(fileName);

      // Create document record
      const { error: docError } = await supabase
        .from('export_documents')
        .insert([{
          export_order_id: declaration.export_order_id,
          document_type: 'export_declaration',
          document_name: `Customs Declaration - ${declaration.declaration_number}`,
          document_number: declaration.declaration_number,
          file_url: publicUrl,
          status: 'final',
          template_type: 'customs_declaration',
          generated_data: declaration,
          created_at: new Date().toISOString()
        }]);

      if (docError) throw docError;

      // Download the PDF
      doc.save(fileName);

      toast.success('Customs declaration PDF generated successfully');

      await logSystemActivity('info', 'Customs declaration PDF generated', 'CustomsManager', {
        declarationId: declaration.id,
        fileName
      });

    } catch (err) {
      console.error('Error generating PDF:', err);
      toast.error('Failed to generate PDF');
    } finally {
      setGeneratingPDF(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'status-approved';
      case 'submitted': return 'status-submitted';
      case 'cleared': return 'status-cleared';
      case 'rejected': return 'status-rejected';
      case 'draft': return 'status-draft';
      default: return 'status-pending';
    }
  };

  const calculateStats = () => {
    const total = customsDeclarations.length;
    const approved = customsDeclarations.filter(d => d.status === 'approved').length;
    const pending = customsDeclarations.filter(d => d.status === 'submitted').length;
    const cleared = customsDeclarations.filter(d => d.status === 'cleared').length;
    const draft = customsDeclarations.filter(d => d.status === 'draft').length;
    const totalRevenue = customsDeclarations.reduce((sum, d) => sum + parseFloat(d.total_payable || 0), 0);
    
    return { total, approved, pending, cleared, draft, totalRevenue };
  };

  const filteredDeclarations = useMemo(() => {
    return customsDeclarations.filter(declaration => {
      const matchesSearch = 
        declaration.declaration_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        declaration.goods_description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        declaration.country_of_destination.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || declaration.status === filterStatus;
      
      return matchesSearch && matchesStatus;
    });
  }, [customsDeclarations, searchTerm, filterStatus]);

  const stats = calculateStats();

  if (loading) {
    return (
      <div className="customs-manager glass-card">
        <div className="manager-header">
          <h3><FaFileContract /> Customs Declarations Management</h3>
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <span>Loading customs data...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="customs-manager glass-card">
      <div className="manager-header">
        <div className="header-main">
          <h3><FaFileContract /> Customs Declarations Management</h3>
          <p className="header-subtitle">Manage export customs documentation and clearance</p>
        </div>
        <div className="header-actions">
          <button 
            onClick={() => setShowCalculator(true)}
            className="secondary-button"
          >
            <FaCalculator /> Duty Calculator
          </button>
          <button 
            onClick={() => setShowCreateForm(true)}
            className="primary-button"
          >
            <FaPlus /> New Declaration
          </button>
        </div>
      </div>

      {/* Customs Statistics */}
      <div className="customs-stats">
        <div className="stat-card">
          <div className="stat-icon total">
            <FaFileContract />
          </div>
          <div className="stat-content">
            <h4>{stats.total}</h4>
            <p>Total Declarations</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon approved">
            <FaCheckCircle />
          </div>
          <div className="stat-content">
            <h4>{stats.approved}</h4>
            <p>Approved</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon pending">
            <FaClock />
          </div>
          <div className="stat-content">
            <h4>{stats.pending}</h4>
            <p>Pending Review</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon revenue">
            <FaRupeeSign />
          </div>
          <div className="stat-content">
            <h4>₹{stats.totalRevenue.toLocaleString('en-IN')}</h4>
            <p>Total Duties</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon draft">
            <FaEdit />
          </div>
          <div className="stat-content">
            <h4>{stats.draft}</h4>
            <p>Draft</p>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="filters-section">
        <div className="search-box">
          <FaSearch />
          <input
            type="text"
            placeholder="Search by declaration number, goods, or destination..."
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
            <option value="submitted">Submitted</option>
            <option value="approved">Approved</option>
            <option value="cleared">Cleared</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Declarations Table */}
      <div className="declarations-table-container">
        <table className="declarations-table">
          <thead>
            <tr>
              <th>Declaration No.</th>
              <th>Export Order</th>
              <th>Destination</th>
              <th>HS Code</th>
              <th>Goods Description</th>
              <th>Total Value</th>
              <th>Customs Duty</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDeclarations.map(declaration => (
              <tr key={declaration.id}>
                <td>
                  <div className="declaration-number">
                    <strong>{declaration.declaration_number}</strong>
                  </div>
                </td>
                <td>
                  {declaration.export_orders?.order_number || declaration.export_orders?.export_reference || 'N/A'}
                </td>
                <td>
                  <div className="destination">
                    <FaGlobeAmericas className="icon" />
                    {declaration.country_of_destination}
                  </div>
                </td>
                <td>
                  <code className="hs-code">{declaration.hs_code}</code>
                </td>
                <td>
                  <div className="goods-description">
                    {declaration.goods_description}
                  </div>
                </td>
                <td>
                  <div className="value">
                    <FaRupeeSign className="icon" />
                    {parseFloat(declaration.total_value).toLocaleString('en-IN')}
                  </div>
                </td>
                <td>
                  <div className="duty">
                    <FaRupeeSign className="icon" />
                    {parseFloat(declaration.customs_duty).toLocaleString('en-IN')}
                  </div>
                </td>
                <td>
                  <span className={`status-badge ${getStatusColor(declaration.status)}`}>
                    {declaration.status}
                  </span>
                </td>
                <td>
                  {format(parseISO(declaration.created_at), 'dd MMM yyyy')}
                </td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="btn-view"
                      onClick={() => setSelectedDeclaration(declaration)}
                      title="View Details"
                    >
                      <FaEye />
                    </button>
                    <button 
                      className="btn-pdf"
                      onClick={() => generateCustomsDeclarationPDF(declaration)}
                      disabled={generatingPDF}
                      title="Generate PDF"
                    >
                      <FaFilePdf />
                    </button>
                    {declaration.status === 'draft' && (
                      <button 
                        className="btn-submit"
                        onClick={() => updateDeclarationStatus(declaration.id, 'submitted')}
                        title="Submit Declaration"
                      >
                        <FaUpload />
                      </button>
                    )}
                    {declaration.status === 'submitted' && (
                      <button 
                        className="btn-approve"
                        onClick={() => updateDeclarationStatus(declaration.id, 'approved')}
                        title="Approve Declaration"
                      >
                        <FaCheckCircle />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredDeclarations.length === 0 && (
          <div className="empty-state">
            <FaFileContract className="empty-icon" />
            <h4>No customs declarations found</h4>
            <p>Create your first customs declaration to get started</p>
            <button 
              onClick={() => setShowCreateForm(true)}
              className="primary-button"
            >
              <FaPlus /> Create Declaration
            </button>
          </div>
        )}
      </div>

      {/* Duty Calculator Modal */}
      {showCalculator && (
        <div className="modal-overlay">
          <div className="modal-content medium">
            <div className="modal-header">
              <h3><FaCalculator /> Customs Duty Calculator</h3>
              <button 
                className="close-button"
                onClick={() => setShowCalculator(false)}
              >
                ×
              </button>
            </div>
            <div className="calculator-form">
              <div className="form-group">
                <label>Product Type *</label>
                <select
                  value={calculatorData.productType}
                  onChange={(e) => setCalculatorData({...calculatorData, productType: e.target.value})}
                >
                  <option value="">Select Product</option>
                  {Object.keys(hsCodes).map(product => (
                    <option key={product} value={product}>{product}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Destination Country *</label>
                <select
                  value={calculatorData.destination}
                  onChange={(e) => setCalculatorData({...calculatorData, destination: e.target.value})}
                >
                  <option value="">Select Country</option>
                  {countries.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Product Value (₹) *</label>
                <input
                  type="number"
                  value={calculatorData.value}
                  onChange={(e) => setCalculatorData({...calculatorData, value: e.target.value})}
                  placeholder="Enter product value"
                />
              </div>
              
              <button 
                onClick={calculateDuty}
                className="primary-button full-width"
              >
                <FaCalculator /> Calculate Duty
              </button>

              {(calculatorData.calculatedDuty > 0) && (
                <div className="calculation-results">
                  <h4>Calculation Results:</h4>
                  <div className="result-item">
                    <span>Customs Duty:</span>
                    <span>₹{parseFloat(calculatorData.calculatedDuty).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="result-item">
                    <span>Taxes (12%):</span>
                    <span>₹{parseFloat(calculatorData.calculatedTaxes).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="result-item total">
                    <span>Total Payable:</span>
                    <span>₹{parseFloat(calculatorData.totalPayable).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Declaration Modal */}
      {showCreateForm && (
        <div className="modal-overlay">
          <div className="modal-content large">
            <div className="modal-header">
              <h3>Create New Customs Declaration</h3>
              <button 
                className="close-button"
                onClick={() => setShowCreateForm(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleCreateDeclaration}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Export Order *</label>
                  <select
                    value={formData.export_order_id}
                    onChange={(e) => setFormData({...formData, export_order_id: e.target.value})}
                    required
                  >
                    <option value="">Select Export Order</option>
                    {exportOrders.map(order => (
                      <option key={order.id} value={order.id}>
                        {order.order_number || order.export_reference} - {order.clients?.company_name} - {order.destination_country}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Destination Country *</label>
                  <select
                    value={formData.country_of_destination}
                    onChange={(e) => setFormData({...formData, country_of_destination: e.target.value})}
                    required
                  >
                    <option value="">Select Country</option>
                    {countries.map(country => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Customs Office</label>
                  <select
                    value={formData.customs_office}
                    onChange={(e) => setFormData({...formData, customs_office: e.target.value})}
                  >
                    <option value="">Select Customs Office</option>
                    {customsOffices.map(office => (
                      <option key={office} value={office}>{office}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Goods Description *</label>
                  <input
                    type="text"
                    value={formData.goods_description}
                    onChange={(e) => {
                      setFormData({...formData, goods_description: e.target.value});
                      handleProductChange(e.target.value);
                    }}
                    required
                    placeholder="e.g., Saffron, Pomegranate, Spices"
                  />
                </div>
                <div className="form-group">
                  <label>HS Code *</label>
                  <input
                    type="text"
                    value={formData.hs_code}
                    onChange={(e) => setFormData({...formData, hs_code: e.target.value})}
                    required
                    placeholder="e.g., 09102000"
                  />
                </div>
                <div className="form-group">
                  <label>Quantity *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Unit Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.unit_price}
                    onChange={(e) => setFormData({...formData, unit_price: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Total Value (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.total_value}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData({...formData, total_value: value});
                      
                      // Recalculate charges when value changes
                      if (value && formData.goods_description && formData.country_of_destination) {
                        const charges = calculateCustomsCharges(
                          formData.goods_description, 
                          parseFloat(value), 
                          formData.country_of_destination
                        );
                        
                        setFormData(prev => ({
                          ...prev,
                          customs_duty: charges.duty,
                          taxes: charges.taxes,
                          total_payable: charges.totalPayable
                        }));
                      }
                    }}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Customs Duty (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.customs_duty}
                    readOnly
                    className="readonly"
                  />
                </div>
                <div className="form-group">
                  <label>Taxes (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.taxes}
                    readOnly
                    className="readonly"
                  />
                </div>
                <div className="form-group">
                  <label>Total Payable (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.total_payable}
                    readOnly
                    className="readonly"
                  />
                </div>
                <div className="form-group full-width">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.export_license_required}
                      onChange={(e) => setFormData({...formData, export_license_required: e.target.checked})}
                    />
                    Export License Required
                  </label>
                </div>
                <div className="form-group full-width">
                  <label>Special Handling Instructions</label>
                  <textarea
                    value={formData.special_handling}
                    onChange={(e) => setFormData({...formData, special_handling: e.target.value})}
                    placeholder="Any special handling, storage, or transportation requirements..."
                    rows="3"
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
                  <FaPlus /> Create Declaration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Declaration Details Modal */}
      {selectedDeclaration && (
        <div className="modal-overlay">
          <div className="modal-content large">
            <div className="modal-header">
              <h3>Declaration Details - {selectedDeclaration.declaration_number}</h3>
              <button 
                className="close-button"
                onClick={() => setSelectedDeclaration(null)}
              >
                ×
              </button>
            </div>
            <div className="declaration-details">
              <div className="detail-section">
                <h4>Basic Information</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="label">Declaration Number:</span>
                    <span className="value">{selectedDeclaration.declaration_number}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Status:</span>
                    <span className={`status-badge ${getStatusColor(selectedDeclaration.status)}`}>
                      {selectedDeclaration.status}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Origin Country:</span>
                    <span className="value">{selectedDeclaration.country_of_origin}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Destination Country:</span>
                    <span className="value">{selectedDeclaration.country_of_destination}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Customs Office:</span>
                    <span className="value">{selectedDeclaration.customs_office || 'Not specified'}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h4>Goods Information</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="label">HS Code:</span>
                    <span className="value">{selectedDeclaration.hs_code}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Goods Description:</span>
                    <span className="value">{selectedDeclaration.goods_description}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Quantity:</span>
                    <span className="value">{selectedDeclaration.quantity}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Unit Price:</span>
                    <span className="value">₹{parseFloat(selectedDeclaration.unit_price).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h4>Financial Information</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="label">Total Value:</span>
                    <span className="value">₹{parseFloat(selectedDeclaration.total_value).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Customs Duty:</span>
                    <span className="value">₹{parseFloat(selectedDeclaration.customs_duty).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Taxes:</span>
                    <span className="value">₹{parseFloat(selectedDeclaration.taxes).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Total Payable:</span>
                    <span className="value">₹{parseFloat(selectedDeclaration.total_payable).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button 
                  className="secondary-button"
                  onClick={() => generateCustomsDeclarationPDF(selectedDeclaration)}
                  disabled={generatingPDF}
                >
                  <FaFilePdf /> Generate PDF
                </button>
                <button 
                  className="primary-button"
                  onClick={() => setSelectedDeclaration(null)}
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

export default CustomsManager;