// src/components/email-marketing/navigation/EmailSidebar.jsx

import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import "./emailSidebar.css";

export default function EmailSidebar({
  collapsed = false,
  pendingApprovals = 0,
  failedCampaigns = 0
}) {
  const [activePath, setActivePath] = useState("");

  useEffect(() => {
    setActivePath(window.location.pathname);
  }, []);

  const navSections = [
    {
      title: "Core",
      items: [
        { label: "Overview", to: "/admin/email-marketing" },
        { label: "Subscribers", to: "/admin/email-marketing/subscribers" }
      ]
    },
    {
      title: "Campaigns",
      items: [
        { label: "Campaigns", to: "/admin/email-marketing/campaigns" },
        { label: "Templates", to: "/admin/email-marketing/templates" },
        { label: "AI Drafts", to: "/admin/email-marketing/ai" },
        { label: "Scheduling", to: "/admin/email-marketing/schedule" }
      ]
    },
       {
      title: "Subscribers",
      items: [
        { to: "/admin/email-marketing/subscribers", label: "Dashboard" },
        { to: "/admin/email-marketing/subscribers/list", label: "List" },
        { to: "/admin/email-marketing/subscribers/import", label: "Import" },
        { to: "/admin/email-marketing/subscribers/import", label: "Import", badge: "NEW" }
      ]
    },
    {
      title: "Insights",
      items: [
        { label: "Analytics", to: "/admin/email-marketing/analytics" },
        {
          label: "Approvals",
          to: "/admin/email-marketing/approvals",
          badge: pendingApprovals
        }
      ]
    },
    {
      title: "System",
      items: [
        { label: "Settings", to: "/admin/email-marketing/settings" }
      ]
    }
  ];

  return (
    <aside className={`em-sidebar-wrap ${collapsed ? "collapsed" : ""}`}>
      {navSections.map((section) => (
        <div className="em-nav-section" key={section.title}>
          {!collapsed && (
            <div className="em-nav-section-title">
              {section.title}
            </div>
          )}

          {section.items.map((item) => {
            const isActive = activePath === item.to;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`em-nav-link ${isActive ? "active" : ""}`}
              >
                <span className="em-nav-active-bar" />
                <span className="em-nav-label">
                  {item.label}
                </span>

                {item.badge > 0 && (
                  <span className="em-nav-badge">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
          {/* Subscribers Section */}
           <NavGroup title="Subscribers" icon="users">
           <NavItem
              to="/admin/email-marketing/subscribers"
               label="Dashboard"
               />
              <NavItem
                to="/admin/email-marketing/subscribers/list"
               label="List"
               />

             {/* 🔽 ADD THIS BLOCK */}
            <NavItem
           to="/admin/email-marketing/subscribers/import"
           label="Import"
           badge="NEW"
             />
            </NavGroup>
        </div>
      ))}

      {!collapsed && failedCampaigns > 0 && (
        <div className="em-sidebar-alert">
          ⚠ {failedCampaigns} Campaigns Failed
        </div>
      )}
    </aside>
  );
}
