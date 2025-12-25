// src/components/Layout/Sidebar.jsx
import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Sidebar.css";
import '../../styles/responsive.css';
import {
  FaTachometerAlt,
  FaBoxOpen,
  FaUsers,
  FaFileInvoice,
  FaShippingFast,
  FaChartLine,
  FaSignOutAlt,
  FaClock,
  FaAddressCard,
  FaCloudUploadAlt,
  FaAddressBook,
  FaBriefcase,
} from "react-icons/fa";

const Sidebar = () => {
  const { userRole, signOut, user, userProfile } = useAuth() || {};
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();
    const [formData, setFormData] = useState({
      first_name: '',
      last_name: '',
      phone: '',
      avatar_url: '',
      country: '',
      state: '',
    });
    const [error, setError] = useState('');

  // Role-based dashboard path: fallback to /dashboard
  const dashboardPath =
    userRole === "admin"
      ? "/admin/dashboard"
      : userRole === "client"
      ? "/client/dashboard"
      : userRole === "staff"
      ? "/staff/dashboard"
      : "/dashboard";

  // Centralized menu items (role property optional)
  const menuItems = [
    { to: dashboardPath, label: "Dashboard", icon: <FaTachometerAlt /> },
    // Export (admin)
    { to: "/Export/Exportdashboard", label: "Export Dashboard", icon: <FaBoxOpen />, roles: ["export","admin"] },
    // EmailMarketingDashboard
     { to: "/admin/email-marketing", label: "Email Marketing", icon: <FaFileInvoice />, roles: ["admin", "staff"] },
    

      // Admin area 
    { to: "/admin/Admin-Inventory", label: "Inventory", icon: <FaBoxOpen />, roles: ["admin"] },
    { to: "/AutomationDashboard", label: "AutoDashboard", icon: <FaBoxOpen />, roles: ["admin"] },

    { to: "/admin/ExportOrderDetailsPage", label: "Export Orders Details", icon: <FaBoxOpen />, roles: ["admin"] },
    { to: "/admin/FinanceDashboardPage", label: "Finance Dashboard", icon: <FaBoxOpen />, roles: ["admin"] },     
    { to: "/admin/CompanyExpensesPage", label: "Company Expense", icon: <FaBoxOpen />, roles: ["admin"] },        
    { to: "/admin/orders", label: "Order-Management", icon: <FaBoxOpen />, roles: ["admin"] }, 
    { to: "/admin/complianceTracker", label: "compliance Tracker", icon: <FaBriefcase />, roles: ["admin", "staff"] },
    //added for testing
 //    { to: "testing", label: "Testing", icon: <FaBriefcase />, roles: ["admin", "staff", "client"] },


   // { to: "/admin/Admin-profiles", label: "Admin Profiles", icon: <FaUsers />, roles: ["admin"] },
    { to: "/admin/admin", label: "Admin", icon: <FaAddressCard />, roles: ["admin", "staff"] },
    { to: "/Client-Info-Dashboard", label: "Client Comm Dashboard", icon: <FaBriefcase />, roles: ["admin", "staff"] },
    { to: "/Follow-Up-Dashboard", label: "Follow-Up Dashboard", icon: <FaClock />, roles: ["admin", "staff"] },
    { to: "/Profile", label: "Profile", icon: <FaAddressBook />, roles: ["admin", "staff", "client"] },
    { to: "/admin/Admin-Analytics", label: "Admin Analytics", icon: <FaBriefcase />, roles: ["admin", "staff"] },
    { to: "/admin/suppliers", label: "Suppliers List", icon: <FaBriefcase />, roles: ["admin", "staff"] },
    { to: "/admin/compliance-documents", label: "compliance-documents", icon: <FaBriefcase />, roles: ["admin", "staff"] },
    // Common admin tools
    { to: "/admin/AutomationManualSend", label: "Testing_Function", icon: <FaFileInvoice />, roles: ["admin", "staff"] }, // must Refine codes to work
    
    { to: "/admin/Admin-expense", label: "Admin-expense", icon: <FaChartLine />, roles: ["admin"] },
   
    { to: "/admin/SubscribeFrom", label: "SubscribeFrom", icon: <FaChartLine />, roles: ["admin"] },
    { to: "/admin/AIDraftInbox", label: "AIDraftInbox", icon: <FaChartLine />, roles: ["admin"] },
    { to: "/admin/CampaignList", label: "CampaignList", icon: <FaChartLine />, roles: ["admin"] },
    { to: "/admin/CampaignBuilder", label: "CampaignBuilder", icon: <FaChartLine />, roles: ["admin"] },

   
    { to: "/admin/InventoryHistory", label: "Invoice-History", icon: <FaChartLine />, roles: ["admin"] },
    { to: "/admin/ShipmentsPage", label: "Shipments", icon: <FaShippingFast />, roles: ["admin"] },
    { to: "/admin/Advance-analytics", label: "Advance Analytics", icon: <FaChartLine />, roles: ["admin"] },

    // Client-specific pages
    { to: "/client/business-summary", label: "Business Summary", icon: <FaChartLine />, roles: ["client"] },
    { to: "/client/invoice-history", label: "Invoice History", icon: <FaFileInvoice />, roles: ["client"] },
   
    { to: "/client/analytics", label: "Analytics", icon: <FaChartLine />, roles: ["client"] },
    { to: "/client/shipment-timeline", label: "shipment-timeline", icon: <FaFileInvoice />, roles: ["client"] },
    { to: "/client/orders", label: "orders", icon: <FaChartLine />, roles: ["client"] },

    { to: "/client/order-history", label: "order-history", icon: <FaFileInvoice />, roles: ["client"] },
  ]; 
  const handleSignOut = async () => {
    try {
      const ok = window.confirm("Sign out of the application?");
      if (!ok) return;
      await signOut();
      navigate("/login");
    } catch (err) {
      console.error("Sign out failed:", err);
      navigate("/login");
    }
  };

  return (
    <aside className={`sidebar ${isOpen ? "open" : "collapsed"}`} aria-label="Main navigation">
      <div className="sidebar-header">
        <div className="brand">
          <div className="brand-title">Saffron Emporial</div>
        </div>

        <button
          aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
          className="toggle-btn"
          onClick={() => setIsOpen(prev => !prev)}
        >
          {isOpen ? "«" : "»"}
        </button>
      </div>

      {/* Scrollable menu */}
      <nav className="sidebar-menu" role="navigation" aria-label="Primary" style={{ overflowY: "auto", flexGrow: 1 }}>
        {menuItems
          .filter(item => !item.roles || item.roles.includes(userRole))
          .map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `menu-item ${isActive ? "active" : ""}`}
              title={item.label}
            >
              <span className="icon" aria-hidden>{item.icon}</span>
              {isOpen && <span className="text">{item.label}</span>}
            </NavLink>
          ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-block">
          {/* Profile Picture */}
          {userProfile?.avatar_url ? (
            <img
              src={userProfile.avatar_url}
              alt="Profile"
              className="profile-picture"
              style={{
                width: "50px",
                height: "50px",
                borderRadius: "50%",
                objectFit: "cover",
                marginRight: isOpen ? "10px" : "0"
              }}
            />
          ) : (
            <div
              className="profile-placeholder"
              style={{
                width: "50px",
                height: "50px",
                borderRadius: "50%",
                backgroundColor: "#ccc",
                marginRight: isOpen ? "10px" : "0"
              }}
            />
          )}

          {isOpen && (
            <div className="user-meta">
              <div className="user-name">{user?.user_metadata?.full_name || user?.email || "Guest"}</div>
              <div className="user-role">{userRole || "—"}</div>
            </div>
          )}
        </div>

        <div className="footer-actions">
          <button className="logout-btn" onClick={handleSignOut} aria-label="Sign out">
            <FaSignOutAlt />
            {isOpen && <span className="logout-text">Logout</span>}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
