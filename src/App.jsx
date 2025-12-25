// src/App.jsx
import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import DefaultDashboardRedirect from './components/Dashboard/DefaultDashboardRedirect';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import { ExportProvider } from './context/ExportContext.jsx';
import MainLayout from './components/Layout/MainLayout';
import ErrorBoundary from './pages/ErrorBoundary.jsx';
import ExportRoute from './components/Auth/ExportRoute.jsx';
import { SettingsProvider } from './context/SettingsContext.jsx';

// Import Pages
import AdminExpensePage from './pages/AdminExpensePage';
import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import Admin from './pages/Admin.jsx';
import Client from './pages/Client.jsx';
import AdminProducts from './pages/AdminProducts.jsx';
import AdminShipmentsPage from './pages/AdminShipmentsPage.jsx';
import ClientShipment from './pages/ClientShipments.jsx';
import NotificationPage from './pages/NotificationsPage.jsx';
import OrderInvoicePage from './pages/OrderInvoicePage.jsx';
import AnalyticsPage from './pages/AnalyticsPage.jsx';
import Staff from './pages/Staff.jsx';
import Unauthorized from './pages/Unauthorized.jsx';
import ResetPasswordPage from './pages/ResetPasswordPage' ;

// Import Dashboard Components
import AdminDashboard from './components/Dashboard/Admin-Dash/AdminDashboard.jsx';
import ClientDashboard from './components/Dashboard/ClientDashboard.jsx';
import StaffDashboard from './components/Dashboard/StaffDashboard';
import AdminAnalyticsDashboard from './components/Dashboard/AdminAnalyticsDashboard';
import ClientAnalyticsDashboard from './components/Dashboard/ClientAnalyticsDashboard';

// Import Export Components
import ExportDashboard from './components/Export/ExportDashboard.jsx';
import ExportWizard from './components/Export/Core/ExportWizard.jsx';
import PhaseManager from './components/Export/Core/PhaseManager.jsx';
import VendorForm from './components/Export/Procurement/VendorManager/VendorForm.jsx';
import ExportDetailPage from './pages/ExportDetailPage.jsx';

// Import Admin Components
import AdminProfiles from './components/Admin/AdminProfiles';
import AdminOrders from './components/Admin/AdminOrders.jsx';
import AdminInvoices from './components/Admin/AdminInvoices';
import AdminInventory from './components/Admin/AdminInventory.jsx';
import InventoryDashboard from './components/Admin/InventoryDashboard.jsx';
import InventoryHistory from './components/Admin/InventoryHistory.jsx';

// Import Analytics Components
import AdvancedAnalyticsDashboard from './components/Analytics/AdvancedAnalyticsDashboard.jsx';

// Import Client Components
import BusinessSummary from './components/Client/BusinessSummary';
import OrderPlacement from './components/Client/OrderPlacement';
import ShipmentTimeline from './components/Client/ShipmentTimeline';
import InvoiceHistory from './components/Client/InvoiceHistory';

// Import AI Components
import SalesPrediction from './components/AI/SalesPrediction.jsx';
import DemandPrediction from './components/AI/DemandPrediction.jsx';
import ExpenseAnomaly from './components/AI/ExpenseAnomaly';
import SmartRecommendations from './components/AI/SmartRecommendations';
import Chatbot from './components/AI/Chatbot';
import OCR from './components/AI/OCR';

// Import Notification Components
import Alerts from './components/Notifications/Alerts.jsx';
import Reports from './components/Notifications/Reports.jsx';

// Import Order Components
import OrderForm from './components/Orders/OrderForm';
import OrderHistory from './components/Orders/OrderHistory';
import OrderDetails from './components/Orders/OrderDetails';
import OrderConfirmButton from './components/Orders/OrderConfirmButton';
import OrderDetailsWithSave from './components/Orders/OrderDetailsWithSave';

// Import Product Components
import InventoryStatus from './components/Products/InventoryStatus';
import ProductForm from './components/Products/ProductForm';
import ProductList from './components/Products/ProductList';
import QualityControl from './components/Products/QualityControl';

// Import Settings Components
import CompanySettings from './components/Settings/CompanySettings';
import ComplianceTracker from './components/Settings/ComplianceTracker';
import DocumentVault from './components/Settings/DocumentVault';

// Import Shipment Components
import ShipmentsTable from './components/Shipments/ShipmentsTable.jsx';
import ShipmentMap from './components/Shipments/ShipmentMap';
import DocumentUpload from './components/Shipments/DocumentUpload';

// Import Expense Components
import ExpenseManager from './components/Expenses/ExpenseManager';
import FinancialDashboard from './components/Expenses/FinancialDashboard';

// Import Staff Components
import Attendance from './components/Staff/Attendance';
import AttendancePayroll from './components/Staff/AttendancePayroll';
import Payroll from './components/Staff/Payroll';
import StaffDirectory from './components/Staff/StaffDirectory';
import TaskAssign from './components/Staff/TaskAssign';

// Import Supplier Components
import SupplierList from './components/Suppliers/SupplierList.jsx';
import SupplierPerformance from './components/Suppliers/SupplierPerformance';

// Import Compliance Components
import ExportDocuments from './components/Compliance/ExportDocuments';
import ComplianceChecklist from './components/Compliance/ComplianceChecklist';
import CustomsManager from './components/Compliance/CustomsManager';

//others
import CalculatorDashboard from './components/CalculatorSystem/CalculatorDashboard.jsx';
import ClientInfoDashboard from './components/ClientManagement/ClientCommDashboard.jsx';
import ProfileManager from "./components/ClientManagement/ProfileManager/ProfileManager";
import FollowUpDashboard from "./components/ClientManagement/FollowUps/FollowUpDashboard.jsx";
import AutomationDashboard from "./automation/copilot/MainAutomationDashboard.jsx";

//Automation 
import AutoDashboard from "./automation/old/AutoDashboard.jsx" ;
import AutomationManualSend from "./automation/copilot/AutomationManualSend.jsx";;
import CommunicationLogs from "./automation/CommunicationLogs.jsx" ;
import AutomationDashboardSeg from './components/ClientManagement/FollowUps/Segmentation/AutomationDashboardSeg.jsx';

// Other imports
import Profile from './components/Auth/Profile.jsx';
import LiveFarmAi from './pages/landing/LiveFarmAI.jsx' ;
import { FinanceProvider } from "./context/FinanceContext";
import ShipmentsPage from './components/ExportFinance/pages/ShipmentsPage.jsx';
import ExportOrderDetailsPage from './components/ExportFinance/pages/ExportOrderDetailsPage.jsx';
import FinanceDashboardPage from './components/ExportFinance/pages/FinanceDashboardPage.jsx';
import CompanyExpensesPage from './components/ExportFinance/pages/CompanyExpensesPage.jsx';
import CostAnalyticsReport from './components/ExportFinance/Reports/CostAnalyticsReport.jsx';

import PurchaseOrdersPage from "./components/ExportFinance/pages/Finance/PurchaseOrdersPage";
import FinancialReportsPage from "./components/ExportFinance/pages/Finance/FinancialReportsPage";

import AIDraftInbox from "./components/Subscribe/EmailMarketing/AIDraftInbox.jsx" ;
import CampaignBuilder from "./components/Subscribe/EmailMarketing/CampaignBuilder.jsx" ;
import CampaignList from "./components/Subscribe/EmailMarketing/CampaignList.jsx" ;


{/* import EmailMarketingDashboard from './components/Subscribe/EmailMarketing/pages/EmailMarketingDashboard.jsx';
import DraftsPage from './components/Subscribe/EmailMarketing/pages/DraftsPage.jsx';
import CampaignsPage from'./components/Subscribe/EmailMarketing/pages/CampaignsPage.jsx';
import SchedulePage from'./components/Subscribe/EmailMarketing/pages/SchedulePage.jsx';
import LogsPage from'./components/Subscribe/EmailMarketing/pages/LogsPage.jsx';

import EmailDashboard from './pages/EmailDashboard.jsx';
import EmailMarketing from './pages/EmailMarketing.jsx';
import Subscribers from './pages/Subscribers';
import EmailTemplates from './pages/EmailTemplates';
import TemplateEditorPage from './pages/TemplateEditorPage';
import AIEmailGeneratorPage from './pages/AIEmailGeneratorPage';

import EmailMarketingLayout from "./components/email-marketing/EmailMarketingLayout.jsx" ;
import EmailOverviewDashboard from './components/email-marketing/dashboards/EmailOverviewDashboard.jsx';

*/}

import EmailMarketingRoutes from "./components/email-marketing/EmailMarketingRoutes.jsx";

import ProductShowcaseLive from './components/Products/productshowcase/ProductShowcaseLive.jsx';

import { CartProvider } from './context/CartContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { ToastContainer, useToast } from './components/Products/Cart/Toast.jsx';
import CartPage from './components/Products/Cart/CartPage.jsx';
import FavoritesPage from './components/Products/Cart/FavoritesPage.jsx';
// import InquiryForm from './components/Products/productshowcase/InquiryForm.jsx';


//searchBar 
import SearchBar from './components/Search/SearchBar.jsx';
import SearchResults from './components/Search/SearchResults.jsx';

// Selected client context provider
import { SelectedClientProvider } from "./context/SelectedClientContext";

function App() {
  const { toasts, removeToast } = useToast();
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="App">
      <CartProvider>
        <FavoritesProvider />
           <ToastContainer toasts={toasts} removeToast={removeToast} />
        <Routes>
      <Route path="ProductShowcaseLive" element={<ProductShowcaseLive />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/favorites" element={<FavoritesPage Products={ProductShowcaseLive} />} />
     {/* <Route path="/inquiry" element={<InquiryForm />} /> */}

            {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/pages/Client" element={<Client />} />
        <Route path="/LiveFarmAi" element={<LiveFarmAi />} />
        <Route path="./ResetPasswordPage" element={<ResetPasswordPage />} />
        <Route path="AutomationDashboard" element={<AutomationDashboard/>} />  
        <Route path="Profile" element={<Profile />} />
        
           {/* 
           <Route path="/email-marketing" element={<EmailMarketing />}>
             <Route index element={<EmailDashboard />} />
             <Route path="dashboard" element={<EmailDashboard />} />
             <Route path="subscribers" element={<Subscribers />} />
             <Route path="templates" element={<EmailTemplates />} />
             <Route path="templates/new" element={<TemplateEditorPage />} />
             <Route path="templates/edit/:id" element={<TemplateEditorPage />} />
             <Route path="ai-generator" element={<AIEmailGeneratorPage />} />
            Add more routes as we create components 
           </Route>
           // testing <Route path="Email-marketing" element={<EmailMarketingRoutes />} />
                */}

        {/* Routes that require SelectedClient context - wrap only these routes */}
        <Route
          path="/profile-manager"
          element={
            <SelectedClientProvider>
              <ProfileManager />
            </SelectedClientProvider>
          }
        />
        <Route
          path="/Client-Info-Dashboard"
          element={
            <SelectedClientProvider>
              <ClientInfoDashboard />
              
              <AutomationDashboardSeg />
            </SelectedClientProvider>
          }
        />
        <Route
          path="/Follow-Up-Dashboard"
          element={
            <SelectedClientProvider>
              <FollowUpDashboard />
            </SelectedClientProvider>
          }
        />

        {/* Export routes - kept under /export, wrapped with ProtectedRoute + ExportRoute */}
        <Route
          path="/export/*"
          element={
            <ProtectedRoute>
               <FinanceProvider>
              <ExportRoute>
                <ExportProvider>
                  <MainLayout />
                </ExportProvider>
              </ExportRoute>
              </FinanceProvider>
            </ProtectedRoute>
          }
        >
          <Route path="Exportdashboard" element={<ExportDashboard />} />
          <Route path="create" element={<ExportWizard />} />
          <Route path=":exportId" element={<ExportDetailPage />} />
          <Route path=":exportId/phases" element={<PhaseManager />} />
          <Route path=":exportId/vendors" element={<VendorForm />} />
          <Route path=":exportId/documents" element={<DocumentUpload />} />
          <Route path=":exportId/notifications" element={<NotificationPage />} />
        </Route>

        {/* Protected Admin routes */}
        <Route
          path="/admin/*"
          element={
            <SettingsProvider>
               <FinanceProvider>
            <ProtectedRoute requiredRole="admin">
              <MainLayout />
            </ProtectedRoute>
             </FinanceProvider>
              </SettingsProvider>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />

          {/* Admin sub-routes */}
          <Route path="AutoDashboard" element={<AutoDashboard />} />
          <Route path="AutomationManualSend" element={<AutomationManualSend />} />
          <Route path="CommunicationLogs" element={<CommunicationLogs />} />
          <Route path="ShipmentsPage" element={<ShipmentsPage />} />
          <Route path="ExportOrderDetailsPage" element={<ExportOrderDetailsPage />} />
          <Route path="CompanyExpensesPage" element={<CompanyExpensesPage />} />
          <Route path="InventoryDashboard" element={<InventoryDashboard />} />
          <Route path="InventoryHistory" element={<InventoryHistory />} />
          <Route path="FinancialReportsPage" element={<FinancialReportsPage />} />
          <Route path="PurchaseOrdersPage" element={<PurchaseOrdersPage />} />
          <Route path="CostAnalyticsReport" element={<CostAnalyticsReport />} />
                      
          <Route path="FinanceDashboardPage" element={<FinanceDashboardPage />} />
          <Route path="AutomationDashboardSeg" element={<AutomationDashboardSeg />} />
        
          <Route path="AIDraftInbox" element={<AIDraftInbox />} />
              
          <Route path="CampaignBuilder" element={<CampaignBuilder />} />  
          <Route path="CampaignList" element={<CampaignList />} />  
 


          <Route path="SearchBar" element={<SearchBar />} />
          <Route path="SearchResult" element={<SearchResults />} />
          
          <Route path="Admin-Analytics" element={<AdminAnalyticsDashboard />} />
          <Route path="ExportDetailPage" element={<ExportDetailPage />} />
          <Route path="Admin-Inventory" element={<AdminInventory />} />
          <Route path="Admin-profiles" element={<AdminProfiles />} />
          <Route path="Admin" element={<Admin />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="invoices" element={<AdminInvoices />} />
          <Route path="Admin-expense" element={<AdminExpensePage />} />
          <Route path="Admin-products" element={<AdminProducts />} />
          <Route path="Admin-shipments" element={<AdminShipmentsPage />} />
           {/* used for Role */}
          <Route path="client-management" element={<Client />} />
          
          <Route path="notifications" element={<NotificationPage />} />
          <Route path="analytics-page" element={<AnalyticsPage />} />
          <Route path="admin" element={<Admin />} />
          <Route path="Advance-analytics" element={<AdvancedAnalyticsDashboard />} />
          <Route path="Calculator-Dashboard" element={<CalculatorDashboard />} />
          <Route path ="AutomationDashboard" element={<AutomationDashboard />} />
          <Route path="order-placement" element={<OrderPlacement />} />
          <Route path="Staff" element={<Staff />} />

          {/* Supplier routes */}
          <Route path="suppliers" element={<SupplierList />} />
          <Route path="supplier-performance" element={<SupplierPerformance />} />

          {/* Compliance routes */}
          <Route path="compliance-documents" element={<ExportDocuments />} />
          <Route path="compliance-checklist" element={<ComplianceChecklist />} />
          <Route path="customs-manager" element={<CustomsManager />} />

          {/* AI routes */}
          <Route path="ai-sales-prediction" element={<SalesPrediction />} />
          <Route path="ai-demand-prediction" element={<DemandPrediction />} />
          <Route path="ai-expense-anomaly" element={<ExpenseAnomaly />} />
          <Route path="ai-recommendations" element={<SmartRecommendations />} />
          <Route path="ai-chatbot" element={<Chatbot />} />
          <Route path="ai-ocr" element={<OCR />} />

          {/* Notification routes */}
          <Route path="notificationsPage" element={<NotificationPage />} />
          <Route path="alerts" element={<Alerts />} />
          <Route path="reports" element={<Reports />} />

          {/* Product routes */}
          <Route path="inventory" element={<InventoryStatus />} />
          <Route path="product-form" element={<ProductForm />} />
          <Route path="product-list" element={<ProductList />} />
          <Route path="quality-control" element={<QualityControl />} />

          {/* Settings routes */}
          <Route path="company-settings" element={<CompanySettings />} />
          <Route path="complianceTracker" element={<ComplianceTracker />} />
          <Route path="document-vault" element={<DocumentVault />} />

          {/* Shipment routes */}
          <Route path="shipments-table" element={<ShipmentsTable />} />
          <Route path="shipment-map" element={<ShipmentMap />} />
          <Route path="document-upload" element={<DocumentUpload />} />
          <Route path="shipment-timeline" element={<ShipmentTimeline />} />

          {/* Expense routes */}
          <Route path="expense-manager" element={<ExpenseManager />} />
          <Route path="financial-dashboard" element={<FinancialDashboard />} />

          {/* Staff routes */}
          <Route path="staff-attendance" element={<Attendance />} />
          <Route path="attendance-payroll" element={<AttendancePayroll />} />
          <Route path="payroll" element={<Payroll />} />
          <Route path="staff-directory" element={<StaffDirectory />} />
          <Route path="task-assign" element={<TaskAssign />} />
             {/* EMAIL MARKETING — SAFE INSERT */}
          {EmailMarketingRoutes}
        </Route>

        {/* Protected Client routes */}
        <Route
          path="/client/*"
          element={
            <ProtectedRoute requiredRole="client">
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<ClientDashboard />} />
          <Route path="analytics" element={<ClientAnalyticsDashboard />} />
          <Route path="business-summary" element={<BusinessSummary />} />
          <Route path="order-placement" element={<OrderPlacement />} />
          <Route path="shipment-timeline" element={<ShipmentTimeline />} />
          <Route path="invoice-history" element={<InvoiceHistory />} />
          <Route path="shipments" element={<ClientShipment />} />
          <Route path="orders" element={<OrderInvoicePage />} />
          <Route path="order-form" element={<OrderForm />} />
          <Route path="order-history" element={<OrderHistory />} />
          <Route path="order-details" element={<OrderDetails />} />
          <Route path="order-confirm" element={<OrderConfirmButton />} />
          <Route path="order-details-save" element={<OrderDetailsWithSave />} />
          
        </Route>

        {/* Protected Staff routes */}
        <Route
          path="/staff/*"
          element={
            <ProtectedRoute requiredRole="staff">
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<StaffDashboard />} />
          <Route path="notifications" element={<NotificationPage />} />
          <Route path="staff-management" element={<Staff />} />
        </Route>

        {/* Misc / utility */}
        <Route path="/dashboard" element={<DefaultDashboardRedirect />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
            </CartProvider>
        <FavoritesProvider />
    </div>
  );
}

// Simple 404 component
function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold">404</h1>
        <p className="text-xl">Page not found — check the route path.</p>
      </div>
    </div>
  );
}

// Root composition: do NOT wrap the entire app with SelectedClientProvider here
function Root() {
  return (
    <ErrorBoundary>
      <CartProvider>
        <FavoritesProvider>
          <App />
        </FavoritesProvider>
      </CartProvider>
    </ErrorBoundary>
  );
}

export default Root;
