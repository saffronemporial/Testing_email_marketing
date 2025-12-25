// src/components/Layout/Header.jsx
import React, { useEffect, useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Logout from '../Auth/Logout';
import './Header.css';
import { 
  Menu, 
  X, 
  Sun, 
  Moon, 
  Bell, 
  ChevronDown,
  Home,
  Package,
  DollarSign,
  Truck,
  Users,
  Folder,
  BarChart3,
  Image,
  Brain,
  TrendingUp,
  Settings
} from 'lucide-react';

const Header = ({ onMenuToggle, isSidebarOpen }) => {
  const { userRole, signOut, user, userProfile } = useAuth() || {};
  const [darkMode, setDarkMode] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  
  const notificationsRef = useRef(null);
  const profileRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  const closeMobileMenu = () => {
    setShowMobileMenu(false);
    setMobileNavOpen(false);
  };

  const toggleMobileNav = () => {
    setMobileNavOpen(!mobileNavOpen);
  };

  
  const navLinks = [
    { to: "/ResetPasswordPage", label: "Password Reset", icon: <DollarSign size={18} /> },
    { to: "/Admin/Profile", label: "Profile", icon: <Home size={18} /> },
 { to: "/admin/Admin-Inventory", label: "Inventory", icon: <BarChart3 size={18} />, roles: ["admin"] },
    { to: "/Admin/CompanyExpensesPage", label: "Company Expense", icon: <DollarSign size={18} />, roles: ["admin"]  },
    { to: "/admin/orders", label: "Orders", icon: <Package size={18} />, roles: ["admin"] },
    { to: "/admin/FinanceDashboardPage", label: "Finance Dashboard", icon: <BarChart3 size={18} />, roles: ["admin"] },
    { to: "/admin/ShipmentsPage", label: "Shipments", icon: <Truck size={18} /> },
    { to: "/admin/ExportOrderDetailsPage", label: "Order Details", icon: <Folder size={18} />, roles: ["admin"] },
    { to: "/admin/ClientInfoDashboard", label: "Client Info", icon: <Users size={18} />, roles: ["admin"] },
    { to: "/admin/InventoryDashboard", label: "Inventory", icon: <Package size={18} />, roles: ["admin", "staff"] },
    { to: "/admin/Admin-Inventory", label: "Inventory History", icon: <BarChart3 size={18} />, roles: ["admin", "staff"] },
    { to: "/admin/ImageManager", label: "Image Manager", icon: <Image size={18} /> , roles: ["admin", "staff"] },
    { to: "/admin/ai-recommendations", label: "AI Recommendations", icon: <Brain size={18} />, roles: ["admin", "staff"] },
    { to: "/admin/Advance-analytics", label: "Advance Analytics", icon: <TrendingUp size={18} />, roles: ["admin", "staff"] },
    { to: "/admin/Admin-products", label: "Admin Products", icon: <Package size={18} />, roles: ["admin", "staff"] },
    { to: "/admin/notifications", label: "Notifications", icon: <Bell size={18} /> },
    { to: "/admin/analytics-page", label: "Analytics Page", icon: <BarChart3 size={18} /> },
    { to: "/admin/analytics", label: "Analytics", icon: <TrendingUp size={18} />, roles: ["admin", "staff"] },
    { to: "/admin/AdminDashboard", label: "Admin Dashboard", icon: <Home size={18} />, roles: ["admin", "staff"] },
    { to: "/admin/Admin-expense", label: "Admin Expense", icon: <DollarSign size={18} />, roles: ["admin", "staff"] },
  ];

  const isActiveLink = (path) => {
    return location.pathname === path;
  };

  return (
    <header className="header-container">
      {/* Mobile Overlay */}
      {mobileNavOpen && (
        <div className="mobile-nav-overlay" onClick={() => setMobileNavOpen(false)} />
      )}

      <div className="header-left-section">
        {/* Mobile Menu Toggle */}
        <button
          className="header-menu-toggle mobile-only"
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
          aria-expanded={showMobileMenu}
        >
          {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Logo and Title */}
        <div className="header-brand">
          <Link to="/admin/Dashboard" className="header-logo-link">
            <div className="header-logo">
              <img 
                src="https://nylqihwnftbmkxuysgko.supabase.co/storage/v1/object/public/Saffron_Emporial/logo/logo%202.png" 
                alt="Saffron Emporial Logo"
              />
            </div>
            <h1 className="header-title desktop-only">Saffron Emporial</h1>
            <span className="header-title-mobile mobile-only">Saffron</span>
          </Link>
        </div>

        {/* Desktop Menu Toggle */}
        <button
          className="header-sidebar-toggle desktop-only"
          onClick={onMenuToggle}
          aria-label="Toggle sidebar"
        >
          {isSidebarOpen ? <ChevronLeft /> : <ChevronRight />}
        </button>

        {/* Mobile Navigation Menu */}
        {showMobileMenu && (
          <div className="header-mobile-menu">
            <div className="mobile-menu-header">
              <h3>Navigation</h3>
              <button 
                className="mobile-menu-close"
                onClick={closeMobileMenu}
                aria-label="Close menu"
              >
                <X size={24} />
              </button>
            </div>
            <nav className="header-mobile-nav">
              <ul className="header-mobile-list">
                {navLinks.map((link) => (
                  <li key={link.to}>
                    <Link 
                      to={link.to} 
                      className={`header-mobile-link ${isActiveLink(link.to) ? 'active' : ''}`}
                      onClick={closeMobileMenu}
                    >
                      <span className="mobile-link-icon">{link.icon}</span>
                      <span>{link.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="mobile-menu-footer">
              <div className="mobile-user-info">
                <div className="mobile-user-avatar">
                  {userProfile?.avatar_url ? (
                    <img 
                      src={userProfile.avatar_url} 
                      alt={userProfile?.full_name || user?.email}
                    />
                  ) : (
                    <div className="mobile-avatar-placeholder">
                      {userProfile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                    </div>
                  )}
                </div>
                <div>
                  <p className="mobile-user-name">
                    {userProfile?.full_name || user?.email || 'User'}
                  </p>
                  <p className="mobile-user-role">
                    {userProfile?.role || 'Admin'}
                  </p>
                </div>
              </div>
              <div className="mobile-actions">
                <button 
                  className="mobile-action-btn"
                  onClick={() => setDarkMode(!darkMode)}
                >
                  {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                  {darkMode ? 'Light Mode' : 'Dark Mode'}
                </button>
                <Logout mobile />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right Section - User Actions */}
      <div className="header-right-section">
        {/* Dark Mode Toggle */}
        <button
          className="header-darkmode-toggle desktop-only"
          onClick={() => setDarkMode(!darkMode)}
          aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Mobile Nav Toggle */}
        <button
          className="header-mobile-nav-toggle mobile-only"
          onClick={toggleMobileNav}
          aria-label="Open navigation"
        >
          <Menu size={24} />
        </button>

        {/* Mobile Navigation Panel */}
        <div className={`mobile-nav-panel ${mobileNavOpen ? 'open' : ''}`}>
          <div className="mobile-nav-header">
            <h3>Quick Navigation</h3>
            <button 
              className="mobile-nav-close"
              onClick={() => setMobileNavOpen(false)}
              aria-label="Close navigation"
            >
              <X size={24} />
            </button>
          </div>
          <div className="mobile-nav-content">
            <div className="mobile-nav-links">
              {navLinks.slice(0, 8).map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`mobile-nav-link ${isActiveLink(link.to) ? 'active' : ''}`}
                  onClick={() => setMobileNavOpen(false)}
                >
                  <span className="mobile-nav-icon">{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="header-notifications" ref={notificationsRef}>
          <button
            className="header-notifications-button"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            aria-label="Notifications"
          >
            <Bell size={20} />
            <span className="header-notifications-badge">3</span>
          </button>
          {notificationsOpen && (
            <div className="header-notifications-dropdown">
              <div className="header-notifications-header">
                <h3>Notifications</h3>
                <button 
                  className="header-notifications-close"
                  onClick={() => setNotificationsOpen(false)}
                  aria-label="Close notifications"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="header-notifications-list">
                <div className="header-notification-item unread">
                  <div className="header-notification-icon">
                    <Package size={16} />
                  </div>
                  <div className="header-notification-content">
                    <p className="header-notification-title">New order received</p>
                    <p className="header-notification-desc">Order #ORD-1234 from John Smith</p>
                    <p className="header-notification-time">2 minutes ago</p>
                  </div>
                </div>
                <div className="header-notification-item unread">
                  <div className="header-notification-icon">
                    <div className="warning-icon">⚠️</div>
                  </div>
                  <div className="header-notification-content">
                    <p className="header-notification-title">Low inventory alert</p>
                    <p className="header-notification-desc">Saffron Premium is running low (5 units left)</p>
                    <p className="header-notification-time">1 hour ago</p>
                  </div>
                </div>
                <div className="header-notification-item">
                  <div className="header-notification-icon">
                    <Truck size={16} />
                  </div>
                  <div className="header-notification-content">
                    <p className="header-notification-title">Shipment delivered</p>
                    <p className="header-notification-desc">Shipment #SHP-5678 to Dubai completed</p>
                    <p className="header-notification-time">3 hours ago</p>
                  </div>
                </div>
              </div>
              <div className="header-notifications-footer">
                <button className="header-notifications-view-all">
                  View All Notifications
                </button>
                <button className="header-notifications-mark-read">
                  Mark all as read
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="header-user-profile" ref={profileRef}>
          <button
            className="header-profile-trigger"
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            aria-label="User profile"
            aria-expanded={profileDropdownOpen}
          >
            <div className="header-profile-avatar">
              {userProfile?.avatar_url ? (
                <img 
                  src={userProfile.avatar_url} 
                  alt={userProfile?.full_name || user?.email}
                />
              ) : (
                <div className="header-profile-placeholder">
                  {userProfile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </div>
              )}
            </div>
            <div className="header-user-info desktop-only">
              <span className="header-user-name">
                {userProfile?.full_name || user?.email || 'User'}
              </span>
              <span className="header-user-role">
                {userProfile?.role || 'Admin'}
              </span>
            </div>
            <ChevronDown size={16} className="desktop-only" />
          </button>
          
          {profileDropdownOpen && (
            <div className="header-profile-dropdown">
              <div className="profile-dropdown-header">
                <div className="dropdown-avatar">
                  {userProfile?.avatar_url ? (
                    <img 
                      src={userProfile.avatar_url} 
                      alt={userProfile?.full_name || user?.email}
                    />
                  ) : (
                    <div className="dropdown-avatar-placeholder">
                      {userProfile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                    </div>
                  )}
                </div>
                <div className="dropdown-user-info">
                  <p className="dropdown-user-name">
                    {userProfile?.full_name || user?.email || 'User'}
                  </p>
                  <p className="dropdown-user-email">{user?.email}</p>
                  <p className="dropdown-user-role">{userProfile?.role || 'Admin'}</p>
                </div>
              </div>
              <div className="profile-dropdown-menu">
                <Link 
                  to="/Admin/Profile" 
                  className="dropdown-menu-item"
                  onClick={() => setProfileDropdownOpen(false)}
                >
                  <Settings size={16} />
                  <span>Profile Settings</span>
                </Link>
                <Link 
                  to="/admin/notifications" 
                  className="dropdown-menu-item"
                  onClick={() => setProfileDropdownOpen(false)}
                >
                  <Bell size={16} />
                  <span>Notifications</span>
                </Link>
                <div className="dropdown-divider" />
                <button 
                  className="dropdown-menu-item"
                  onClick={() => {
                    setDarkMode(!darkMode);
                    setProfileDropdownOpen(false);
                  }}
                >
                  {darkMode ? <Sun size={16} /> : <Moon size={16} />}
                  <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
                </button>
                <div className="dropdown-divider" />
                <Logout className="dropdown-logout" />
              </div>
            </div>
          )}
        </div>

        {/* Desktop Logout */}
        <div className="header-logout-container desktop-only">
          <Logout />
        </div>
      </div>
    </header>
  );
};

// Chevron Icon Components
const ChevronLeft = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

const ChevronRight = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 18l6-6-6-6" />
  </svg>
);

export default Header;