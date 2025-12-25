// src/components/Layout/MainLayout.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import './MainLayout.css';
import '../../styles/responsive.css';

const MainLayout = () => {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile && sidebarOpen) setSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarOpen]);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        isMobile &&
        sidebarOpen &&
        !e.target.closest('.sidebar') &&
        !e.target.closest('.menu-toggle')
      ) {
        setSidebarOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile, sidebarOpen]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-b from-yellow-400 to-orange-500">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="mt-4">Loading application...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-gradient-to-b from-yellow-400 to-orange-500 min-h-screen flex items-center justify-center text-white">
        Please log in to continue.
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-b from-yellow-50 to-orange-50">
      {/* Sidebar */}
      <div
        className={`sidebar-container transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-0'
        } ${isMobile ? 'fixed z-50 h-full' : 'relative'}`}
      >
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="mainLayout">
        {/* Header */}
        <Header onMenuToggle={toggleSidebar} isSidebarOpen={sidebarOpen} />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4">
          <div className="bg-white shadow-lg rounded-lg p-6 min-h-full">
            <Outlet /> {/* This renders the matched route's component */}
          </div>
        </main>
      </div>

      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default MainLayout;
