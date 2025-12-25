// src/components/email-marketing/EmailMarketingLayout.jsx

import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import ProtectedRoute from "../Auth/ProtectedRoute";
import "./styles/emailMarketingLayout.css";

export default function EmailMarketingLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  /* ---------------- RESPONSIVE HANDLER ---------------- */
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 900);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /* ---------------- NAV ITEMS ---------------- */
  const navItems = [
    { label: "Overview", to: "/admin/email-marketing" },
    { label: "Subscribers", to: "/admin/email-marketing/subscribers" },
    { label: "Campaigns", to: "/admin/email-marketing/campaigns" },
    { label: "Templates", to: "/admin/email-marketing/templates" },
    { label: "AI Drafts", to: "/admin/email-marketing/ai" },
    { label: "Scheduling", to: "/admin/email-marketing/schedule" },
    { label: "Approvals", to: "/admin/email-marketing/approvals" },
    { label: "Analytics", to: "/admin/email-marketing/analytics" },
    { label: "Settings", to: "/admin/email-marketing/settings" }
  ];

  return (
    <ProtectedRoute allowedRoles={["admin", "staff"]}>
      <div className="em-root">
        <div className="em-layout">

          {/* ================= SIDEBAR ================= */}
          <aside
            className={`em-sidebar ${
              sidebarCollapsed ? "collapsed" : ""
            } ${isMobile ? "mobile" : ""}`}
          >
            <div className="em-sidebar-header">
              <div className="em-logo">
                <span className="gold">Saffron</span> Emporial
              </div>
              {!isMobile && (
                <button
                  className="em-collapse-btn"
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                >
                  {sidebarCollapsed ? "→" : "←"}
                </button>
              )}
            </div>

            <nav className="em-nav">
              {navItems.map((item) => {
                const active = location.pathname === item.to;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={`em-nav-item ${active ? "active" : ""}`}
                  >
                    <span className="em-nav-indicator" />
                    <span className="em-nav-text">{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>

            <div className="em-sidebar-footer">
              <button
                className="em-back-btn"
                onClick={() => navigate("/admin/dashboard")}
              >
                ← Back to Main App
              </button>
            </div>
          </aside>

          {/* ================= MAIN ================= */}
          <div className="em-main">

            {/* -------- HEADER -------- */}
            <header className="em-header">
              <div className="em-header-left">
                {isMobile && (
                  <button
                    className="em-mobile-menu"
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  >
                    ☰
                  </button>
                )}
                <h1>Email Marketing</h1>
              </div>

              <div className="em-header-right">
                <div className="em-role-badge">Admin</div>
                <button className="em-primary-btn">
                  + New Campaign
                </button>
              </div>
            </header>

            {/* -------- CONTENT -------- */}
            <main className="em-content">
              <div className="em-page-animate">
                <Outlet />
              </div>
            </main>

          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
