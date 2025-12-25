// src/components/Inventory/InventoryAlerts.jsx
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  FaBox, FaExclamationTriangle, FaCheckCircle, FaClock,
  FaSearch, FaFilter, FaPlus, FaEdit, FaTrash, FaDownload,
  FaRupeeSign, FaChartLine, FaWarehouse, FaTruck, FaHistory
} from 'react-icons/fa';
import { format, parseISO, isBefore, addDays, differenceInDays } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import supabase from '../../../supabaseClient';
import { toast } from 'react-hot-toast';

const InventoryAlerts = () => {
  const [inventory, setInventory] = useState([]);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState({
    product_id: '',
    product_name: '',
    product_category: '',
    current_stock: '',
    minimum_stock: '',
    unit_price: '',
    warehouse_location: '',
    supplier_id: '',
    shelf_life_days: '',
    batch_number: '',
    expiry_date: '',
    notes: ''
  });

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const fetchInventoryData = async () => {
    try {
      setLoading(true);

      // Fetch inventory with product and supplier details
      const { data: inventoryData, error: inventoryError } = await supabase
        .from('inventory')
        .select(`
          id,
          product_id,
          product_name,
          product_category,
          current_stock,
          minimum_stock,
          unit_price,
          total_value,
          status,
          warehouse_location,
          supplier_id,
          last_restocked,
          next_restock_date,
          shelf_life_days,
          batch_number,
          expiry_date,
          notes,
          created_at,
          updated_at,
          products (
            name,
            sku,
            description,
            category
          ),
          suppliers (
            name,
            contact_person,
            phone
          )
        `)
        .order('current_stock', { ascending: true });

      if (inventoryError) throw inventoryError;

      // Fetch products for dropdown
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('id, name, sku, category, current_stock, minimum_stock')
        .eq('status', 'active');

      if (productsError) throw productsError;

      // Fetch suppliers
      const { data: suppliersData, error: suppliersError } = await supabase
        .from('suppliers')
        .select('id, name, contact_person, phone, email')
        .eq('status', 'active');

      if (suppliersError) throw suppliersError;

      setInventory(inventoryData || []);
      setProducts(productsData || []);
      setSuppliers(suppliersData || []);

      await logSystemActivity('info', 'Inventory data loaded', 'InventoryAlerts', {
        totalItems: inventoryData?.length || 0,
        lowStock: inventoryData?.filter(item => item.status === 'low_stock').length || 0
      });

    } catch (err) {
      console.error('Error fetching inventory data:', err);
      toast.error('Failed to load inventory data');
      await logSystemActivity('error', `Inventory data fetch failed: ${err.message}`, 'InventoryAlerts');
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

  const calculateInventoryStatus = (currentStock, minimumStock) => {
    const ratio = currentStock / minimumStock;
    if (currentStock <= 0) return 'out_of_stock';
    if (ratio <= 0.5) return 'critical';
    if (ratio <= 1) return 'low_stock';
    if (ratio <= 2) return 'adequate';
    return 'overstock';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'out_of_stock': return 'bg-red-100 text-red-800';
      case 'critical': return 'bg-red-100 text-red-800';
      case 'low_stock': return 'bg-yellow-100 text-yellow-800';
      case 'adequate': return 'bg-green-100 text-green-800';
      case 'overstock': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'out_of_stock':
      case 'critical':
        return <FaExclamationTriangle className="text-red-500" />;
      case 'low_stock':
        return <FaClock className="text-yellow-500" />;
      case 'adequate':
      case 'overstock':
        return <FaCheckCircle className="text-green-500" />;
      default:
        return <FaBox className="text-gray-500" />;
    }
  };

  const handleAddInventory = async (e) => {
    e.preventDefault();
    try {
      const status = calculateInventoryStatus(
        parseFloat(formData.current_stock),
        parseFloat(formData.minimum_stock)
      );

      const { error } = await supabase
        .from('inventory')
        .insert([{
          ...formData,
          status,
          total_value: parseFloat(formData.current_stock) * parseFloat(formData.unit_price),
          last_restocked: new Date().toISOString(),
          next_restock_date: formData.expiry_date ? addDays(new Date(formData.expiry_date), -30).toISOString() : null,
          created_at: new Date().toISOString()
        }]);

      if (error) throw error;

      toast.success('Inventory item added successfully');
      setShowAddForm(false);
      resetForm();
      fetchInventoryData();

      await logSystemActivity('info', 'Inventory item added', 'InventoryAlerts', {
        productName: formData.product_name,
        status
      });

    } catch (err) {
      console.error('Error adding inventory:', err);
      toast.error('Failed to add inventory item');
    }
  };

  const resetForm = () => {
    setFormData({
      product_id: '',
      product_name: '',
      product_category: '',
      current_stock: '',
      minimum_stock: '',
      unit_price: '',
      warehouse_location: '',
      supplier_id: '',
      shelf_life_days: '',
      batch_number: '',
      expiry_date: '',
      notes: ''
    });
  };

  const updateStockLevel = async (inventoryId, newStock) => {
    try {
      const item = inventory.find(item => item.id === inventoryId);
      if (!item) throw new Error('Inventory item not found');

      const status = calculateInventoryStatus(newStock, item.minimum_stock);

      const { error } = await supabase
        .from('inventory')
        .update({
          current_stock: newStock,
          status,
          total_value: newStock * item.unit_price,
          updated_at: new Date().toISOString()
        })
        .eq('id', inventoryId);

      if (error) throw error;

      toast.success('Stock level updated successfully');
      fetchInventoryData();

      await logSystemActivity('info', 'Stock level updated', 'InventoryAlerts', {
        inventoryId,
        newStock,
        status
      });

    } catch (err) {
      console.error('Error updating stock:', err);
      toast.error('Failed to update stock level');
    }
  };

  const calculateInventoryMetrics = () => {
    const totalItems = inventory.length;
    const lowStockItems = inventory.filter(item => 
      item.status === 'low_stock' || item.status === 'critical'
    ).length;
    const outOfStockItems = inventory.filter(item => item.status === 'out_of_stock').length;
    const totalValue = inventory.reduce((sum, item) => sum + (item.total_value || 0), 0);
    const expiringSoon = inventory.filter(item => 
      item.expiry_date && isBefore(new Date(item.expiry_date), addDays(new Date(), 30))
    ).length;

    return { totalItems, lowStockItems, outOfStockItems, totalValue, expiringSoon };
  };

  const generateInventoryReport = async () => {
    try {
      const doc = new jsPDF();

      // Header
      doc.setFontSize(20);
      doc.text('INVENTORY STATUS REPORT', 105, 20, { align: 'center' });

      // Summary
      doc.setFontSize(12);
      const metrics = calculateInventoryMetrics();
      doc.text(`Total Items: ${metrics.totalItems}`, 20, 40);
      doc.text(`Low Stock Items: ${metrics.lowStockItems}`, 20, 48);
      doc.text(`Out of Stock: ${metrics.outOfStockItems}`, 20, 56);
      doc.text(`Total Value: ₹${metrics.totalValue.toLocaleString('en-IN')}`, 20, 64);
      doc.text(`Expiring Soon: ${metrics.expiringSoon}`, 20, 72);

      // Low stock alert table
      const lowStockData = inventory
        .filter(item => item.status === 'low_stock' || item.status === 'critical')
        .map(item => [
          item.product_name,
          item.current_stock.toString(),
          item.minimum_stock.toString(),
          `₹${(item.unit_price || 0).toLocaleString('en-IN')}`,
          item.warehouse_location || 'N/A'
        ]);

      if (lowStockData.length > 0) {
        doc.text('LOW STOCK ALERTS', 20, 90);
        doc.autoTable({
          startY: 95,
          head: [['Product', 'Current Stock', 'Min Stock', 'Unit Price', 'Location']],
          body: lowStockData,
          theme: 'grid',
          headStyles: { fillColor: [255, 193, 7] }
        });
      }

      // Expiring soon table
      const expiringData = inventory
        .filter(item => item.expiry_date && isBefore(new Date(item.expiry_date), addDays(new Date(), 30)))
        .map(item => [
          item.product_name,
          item.batch_number || 'N/A',
          format(new Date(item.expiry_date), 'dd/MM/yyyy'),
          `${differenceInDays(new Date(item.expiry_date), new Date())} days`,
          item.warehouse_location || 'N/A'
        ]);

      if (expiringData.length > 0) {
        doc.text('EXPIRING SOON', 20, doc.lastAutoTable.finalY + 15);
        doc.autoTable({
          startY: doc.lastAutoTable.finalY + 20,
          head: [['Product', 'Batch', 'Expiry Date', 'Days Left', 'Location']],
          body: expiringData,
          theme: 'grid',
          headStyles: { fillColor: [244, 67, 54] }
        });
      }

      // Save PDF
      doc.save(`inventory-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`);

      toast.success('Inventory report generated successfully');

      await logSystemActivity('info', 'Inventory report generated', 'InventoryAlerts');

    } catch (err) {
      console.error('Error generating report:', err);
      toast.error('Failed to generate inventory report');
    }
  };

  const inventoryChartData = useMemo(() => {
    const categories = {};
    inventory.forEach(item => {
      const category = item.product_category || 'Uncategorized';
      if (!categories[category]) {
        categories[category] = { category, stock: 0, value: 0, items: 0 };
      }
      categories[category].stock += item.current_stock;
      categories[category].value += item.total_value || 0;
      categories[category].items += 1;
    });
    return Object.values(categories);
  }, [inventory]);

  const metrics = calculateInventoryMetrics();
  const criticalItems = inventory.filter(item => 
    item.status === 'critical' || item.status === 'out_of_stock'
  );

  const filteredInventory = useMemo(() => {
    return inventory.filter(item => {
      const matchesSearch = 
        item.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.product_category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.warehouse_location?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
      
      return matchesSearch && matchesStatus;
    });
  }, [inventory, searchTerm, filterStatus]);

  if (loading) {
    return (
      <div className="inventory-alerts glass-card">
        <div className="manager-header">
          <h3><FaBox /> Inventory Management & Alerts</h3>
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <span>Loading inventory data...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="inventory-alerts glass-card">
      <div className="manager-header">
        <div className="header-main">
          <h3><FaBox /> Inventory Management & Alerts</h3>
          <p className="header-subtitle">Monitor stock levels and receive alerts</p>
        </div>
        <div className="header-actions">
          <button 
            onClick={() => setShowAddForm(true)}
            className="primary-button"
          >
            <FaPlus /> Add Item
          </button>
          <button 
            onClick={generateInventoryReport}
            className="secondary-button"
          >
            <FaDownload /> Generate Report
          </button>
        </div>
      </div>

      {/* Critical Alerts */}
      {criticalItems.length > 0 && (
        <div className="critical-alerts">
          <div className="alert-header">
            <FaExclamationTriangle className="alert-icon" />
            <h4>Critical Stock Alerts</h4>
            <span className="alert-count">{criticalItems.length}</span>
          </div>
          <div className="alerts-grid">
            {criticalItems.slice(0, 5).map(item => (
              <div key={item.id} className="critical-alert">
                <div className="alert-content">
                  <h5>{item.product_name}</h5>
                  <p>Current: {item.current_stock} | Minimum: {item.minimum_stock}</p>
                  <span className="alert-location">{item.warehouse_location}</span>
                </div>
                <div className="alert-actions">
                  <button 
                    className="btn-restock"
                    onClick={() => updateStockLevel(item.id, item.minimum_stock * 2)}
                  >
                    Restock
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inventory Metrics */}
      <div className="inventory-metrics">
        <div className="metric-card critical">
          <div className="metric-icon">
            <FaExclamationTriangle />
          </div>
          <div className="metric-content">
            <h4>{metrics.lowStockItems}</h4>
            <p>Low Stock Items</p>
          </div>
        </div>
        <div className="metric-card warning">
          <div className="metric-icon">
            <FaBox />
          </div>
          <div className="metric-content">
            <h4>{metrics.outOfStockItems}</h4>
            <p>Out of Stock</p>
          </div>
        </div>
        <div className="metric-card info">
          <div className="metric-icon">
            <FaRupeeSign />
          </div>
          <div className="metric-content">
            <h4>₹{metrics.totalValue.toLocaleString('en-IN')}</h4>
            <p>Total Inventory Value</p>
          </div>
        </div>
        <div className="metric-card danger">
          <div className="metric-icon">
            <FaClock />
          </div>
          <div className="metric-content">
            <h4>{metrics.expiringSoon}</h4>
            <p>Expiring Soon</p>
          </div>
        </div>
      </div>

      {/* Inventory Chart */}
      <div className="inventory-chart">
        <h4>Inventory by Category</h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={inventoryChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis />
            <Tooltip 
              formatter={(value, name) => {
                if (name === 'value') return [`₹${value.toLocaleString('en-IN')}`, 'Total Value'];
                return [value, name === 'stock' ? 'Stock Quantity' : 'Number of Items'];
              }}
            />
            <Legend />
            <Bar dataKey="stock" fill="#FFD700" name="Stock Quantity" />
            <Bar dataKey="items" fill="#B8860B" name="Number of Items" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Filters and Search */}
      <div className="filters-section">
        <div className="search-box">
          <FaSearch />
          <input
            type="text"
            placeholder="Search products, categories, or locations..."
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
            <option value="overstock">Overstock</option>
            <option value="adequate">Adequate</option>
            <option value="low_stock">Low Stock</option>
            <option value="critical">Critical</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="inventory-table-container">
        <table className="inventory-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Current Stock</th>
              <th>Minimum Stock</th>
              <th>Unit Price</th>
              <th>Total Value</th>
              <th>Status</th>
              <th>Location</th>
              <th>Last Restocked</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInventory.map(item => (
              <tr key={item.id}>
                <td>
                  <div className="product-info">
                    <strong>{item.product_name}</strong>
                    {item.batch_number && (
                      <small className="batch">Batch: {item.batch_number}</small>
                    )}
                  </div>
                </td>
                <td>{item.product_category}</td>
                <td>
                  <div className="stock-info">
                    <span className={`stock-level ${item.status}`}>
                      {item.current_stock}
                    </span>
                  </div>
                </td>
                <td>{item.minimum_stock}</td>
                <td>
                  <div className="price">
                    <FaRupeeSign className="icon" />
                    {parseFloat(item.unit_price).toLocaleString('en-IN')}
                  </div>
                </td>
                <td>
                  <div className="value">
                    <FaRupeeSign className="icon" />
                    {parseFloat(item.total_value).toLocaleString('en-IN')}
                  </div>
                </td>
                <td>
                  <span className={`status-badge ${getStatusColor(item.status)}`}>
                    {getStatusIcon(item.status)}
                    {item.status.replace('_', ' ')}
                  </span>
                </td>
                <td>{item.warehouse_location}</td>
                <td>
                  {item.last_restocked ? 
                    format(parseISO(item.last_restocked), 'dd MMM yyyy') : 
                    'Never'
                  }
                </td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="btn-edit"
                      onClick={() => setSelectedProduct(item)}
                    >
                      <FaEdit />
                    </button>
                    <button 
                      className="btn-restock"
                      onClick={() => updateStockLevel(item.id, item.current_stock + item.minimum_stock)}
                    >
                      <FaTruck />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Inventory Modal */}
      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal-content large">
            <div className="modal-header">
              <h3>Add Inventory Item</h3>
              <button 
                className="close-button"
                onClick={() => setShowAddForm(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleAddInventory}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Product Name *</label>
                  <select
                    value={formData.product_id}
                    onChange={(e) => {
                      const product = products.find(p => p.id === e.target.value);
                      setFormData({
                        ...formData,
                        product_id: e.target.value,
                        product_name: product?.name || '',
                        product_category: product?.category || '',
                        minimum_stock: product?.minimum_stock || '10'
                      });
                    }}
                    required
                  >
                    <option value="">Select Product</option>
                    {products.map(product => (
                      <option key={product.id} value={product.id}>
                        {product.name} ({product.sku})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Product Category</label>
                  <input
                    type="text"
                    value={formData.product_category}
                    onChange={(e) => setFormData({...formData, product_category: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Current Stock *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.current_stock}
                    onChange={(e) => setFormData({...formData, current_stock: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Minimum Stock *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.minimum_stock}
                    onChange={(e) => setFormData({...formData, minimum_stock: e.target.value})}
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
                  <label>Warehouse Location</label>
                  <input
                    type="text"
                    value={formData.warehouse_location}
                    onChange={(e) => setFormData({...formData, warehouse_location: e.target.value})}
                    placeholder="e.g., WH-A, Shelf-12"
                  />
                </div>
                <div className="form-group">
                  <label>Supplier</label>
                  <select
                    value={formData.supplier_id}
                    onChange={(e) => setFormData({...formData, supplier_id: e.target.value})}
                  >
                    <option value="">Select Supplier</option>
                    {suppliers.map(supplier => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Shelf Life (Days)</label>
                  <input
                    type="number"
                    value={formData.shelf_life_days}
                    onChange={(e) => setFormData({...formData, shelf_life_days: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Batch Number</label>
                  <input
                    type="text"
                    value={formData.batch_number}
                    onChange={(e) => setFormData({...formData, batch_number: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Expiry Date</label>
                  <input
                    type="date"
                    value={formData.expiry_date}
                    onChange={(e) => setFormData({...formData, expiry_date: e.target.value})}
                  />
                </div>
                <div className="form-group full-width">
                  <label>Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    rows="3"
                    placeholder="Additional notes..."
                  />
                </div>
              </div>
              <div className="form-actions">
                <button 
                  type="button" 
                  className="secondary-button"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="primary-button"
                >
                  <FaPlus /> Add Inventory Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryAlerts;