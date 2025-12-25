// src/components/email-marketing/navigation/EmailHeader.jsx

import { useNavigate } from "react-router-dom";
import "./emailHeader.css";

export default function EmailHeader({
  stats = {},
  role = "Admin"
}) {
  const navigate = useNavigate();

  return (
    <header className="em-header-wrap">
      <div className="em-header-left">
        <h1>Email Marketing</h1>

        <div className="em-header-kpis">
          <Kpi label="Subscribers" value={stats.subscribers} />
          <Kpi label="Campaigns" value={stats.campaigns} />
          <Kpi label="Scheduled" value={stats.scheduled} />
        </div>
      </div>

      <div className="em-header-right">
        <input
          className="em-header-search"
          placeholder="Search campaigns, subscribers..."
        />

        <button
          className="em-header-btn ghost"
          onClick={() =>
            navigate("/admin/email-marketing/ai")
          }
        >
          AI Draft
        </button>

        <button
          className="em-header-btn primary"
          onClick={() =>
            navigate("/admin/email-marketing/campaigns")
          }
        >
          + New Campaign
        </button>

        <div className="em-role-pill">
          {role}
        </div>
      </div>
    </header>
  );
}

function Kpi({ label, value }) {
  return (
    <div className="em-kpi-card">
      <span>{label}</span>
      <strong>{value ?? "—"}</strong>
    </div>
  );
}
