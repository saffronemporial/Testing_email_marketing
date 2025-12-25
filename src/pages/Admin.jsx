// src/Pages/Admin.jsx
import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// Import Admin Components
import AdminDashboard from '../components/Dashboard/AdminDashboard.jsx';
import AdminOrders from '../components/Admin/AdminOrders.jsx';
import AdminShipments from '../components/Admin/AdminShipments.jsx';
import AdminInvoices from '../components/Admin/AdminInvoices.jsx';
import AdminAnalyticsDashboard from '../components/Dashboard/AdminAnalyticsDashboard.jsx';
import SupplierList from '../components/Suppliers/SupplierList.jsx';
import SupplierPerformance from '../components/Suppliers/SupplierPerformance.jsx';
import ExportDocuments from '../components/Compliance/ExportDocuments.jsx';
import ComplianceChecklist from '../components/Compliance/ComplianceChecklist.jsx';
import CustomsManager from '../components/Compliance/CustomsManager.jsx';
import StaffDirectory from '../components/Staff/StaffDirectory.jsx';
import TaskAssign from '../components/Staff/TaskAssign.jsx';
import Attendance from '../components/Staff/Attendance.jsx';
import Payroll from '../components/Staff/Payroll.jsx';
import AttendancePayroll from '../components/Staff/AttendancePayroll.jsx';
import InventoryStatus from '../components/Products/InventoryStatus.jsx';
import ProductForm from '../components/Products/ProductForm.jsx';
import ProductList from '../components/Products/ProductList.jsx';
import QualityControl from '../components/Products/QualityControl.jsx';
import ExpenseManager from '../components/Expenses/ExpenseManager.jsx';
import FinancialDashboard from '../components/Expenses/FinancialDashboard.jsx';
import Alerts from '../components/Notifications/Alerts.jsx';
import Reports from '../components/Notifications/Reports.jsx';
import CompanySettings from '../components/Settings/CompanySettings.jsx';
import ComplianceTracker from '../components/Settings/ComplianceTracker.jsx';
import DocumentVault from '../components/Settings/DocumentVault.jsx';
import AdminProducts from './AdminProducts.jsx';
import './Admin.css';

const Admin = () => {
  const { user, isAdmin, } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  // If user is not admin, redirect to unauthorized page
  if (!isAdmin) {
    return <Navigate to="/unauthorized" replace />;
  }

  return (
    <div className="admin-container">
      {/* Admin Header */}
      <div className="admin-header">
        <h1>Admin Portal</h1>
        <p>Welcome back, {user?.email}</p>
        
        {/* Quick Stats Overview */}
        <div className="quick-stats">
          <div className="stat-item">
            <span className="stat-number">24</span>
            <span className="stat-label">Pending Orders</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">12</span>
            <span className="stat-label">Active Shipments</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">8</span>
            <span className="stat-label">New Clients</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">₹ 4.2L</span>
            <span className="stat-label">Today's Revenue</span>
          </div>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="admin-tabs">
        <button 
          className={activeTab === 'dashboard' ? 'tab-active' : ''}
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </button>
        <button 
          className={activeTab === 'orders' ? 'tab-active' : ''}
          onClick={() => setActiveTab('orders')}
        >
          Orders
        </button>
        <button 
          className={activeTab === 'shipments' ? 'tab-active' : ''}
          onClick={() => setActiveTab('shipments')}
        >
          Shipments
        </button>
        <button 
          className={activeTab === 'products' ? 'tab-active' : ''}
          onClick={() => setActiveTab('products')}
        >
          Products
        </button>
        <button 
          className={activeTab === 'suppliers' ? 'tab-active' : ''}
          onClick={() => setActiveTab('suppliers')}
        >
          Suppliers
        </button>
        <button 
          className={activeTab === 'compliance' ? 'tab-active' : ''}
          onClick={() => setActiveTab('compliance')}
        >
          Compliance
        </button>
        <button 
          className={activeTab === 'staff' ? 'tab-active' : ''}
          onClick={() => setActiveTab('staff')}
        >
          Staff
        </button>
        <button 
          className={activeTab === 'analytics' ? 'tab-active' : ''}
          onClick={() => setActiveTab('analytics')}
        >
          Analytics
        </button>
        <button 
          className={activeTab === 'settings' ? 'tab-active' : ''}
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </button>
      </div>

      {/* Admin Content Area */}
      <div className="admin-content">
        <Routes>
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="shipments" element={<AdminShipments />} />
          <Route path="invoices" element={<AdminInvoices />} />
          <Route path="analytics" element={<AdminAnalyticsDashboard />} />
          <Route path="suppliers" element={<SupplierList />} />
          <Route path="supplier-performance" element={<SupplierPerformance />} />
          <Route path="compliance-documents" element={<ExportDocuments />} />
          <Route path="compliance-checklist" element={<ComplianceChecklist />} />
          <Route path="customs-manager" element={<CustomsManager />} />
          <Route path="staff-directory" element={<StaffDirectory />} />
          <Route path="task-assign" element={<TaskAssign />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="payroll" element={<Payroll />} />
          <Route path="attendance-payroll" element={<AttendancePayroll />} />
          <Route path="inventory" element={<InventoryStatus />} />
          <Route path="product-form" element={<ProductForm />} />
          <Route path="product-list" element={<ProductList />} />
          <Route path="quality-control" element={<QualityControl />} />
          <Route path="expense-manager" element={<ExpenseManager />} />
          <Route path="financial-dashboard" element={<FinancialDashboard />} />
          <Route path="alerts" element={<Alerts />} />
          <Route path="reports" element={<Reports />} />
          <Route path="company-settings" element={<CompanySettings />} />
          <Route path="compliance-tracker" element={<ComplianceTracker />} />
          <Route path="document-vault" element={<DocumentVault />} />
        </Routes>

        {/* Fallback content based on active tab for simplicity */}
        {activeTab === 'dashboard' && <AdminDashboard />}
        {activeTab === 'orders' && <AdminOrders />}
        {activeTab === 'shipments' && <AdminShipments />}
        {activeTab === 'products' && <AdminProducts />}
        {activeTab === 'suppliers' && <SupplierList />}
        {activeTab === 'compliance' && <ExportDocuments />}
        {activeTab === 'staff' && <StaffDirectory />}
        {activeTab === 'analytics' && <AdminAnalyticsDashboard />}
        {activeTab === 'settings' && <CompanySettings />}
      </div>
    </div>
  );
};

export default Admin;