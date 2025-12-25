// src/components/email-marketing/campaigns/CampaignDashboard.jsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../supabaseClient";
import "../styles/emailMarketing.css";
import "./campaignDashboard.css";

export default function CampaignDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const loadCampaigns = async () => {
      try {
        const { data, error } = await supabase
          .from("email_campaigns")
          .select("id, name, status, created_at")
          .order("created_at", { ascending: false });

        if (error) throw error;
        if (mounted) setCampaigns(data || []);
      } catch (err) {
        console.error("CampaignDashboard error:", err);
        setError("Failed to load campaigns");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadCampaigns();
    return () => (mounted = false);
  }, []);

  if (error) {
    return <div className="em-card em-badge-danger">{error}</div>;
  }

  return (
    <div className="em-fade-up">

      <div className="campaign-dashboard-header">
        <h2>Campaigns</h2>
        <button
          className="em-btn-primary"
          onClick={() =>
            navigate("/admin/email-marketing/campaigns/create")
          }
        >
          + New Campaign
        </button>
      </div>

      <div className="campaign-grid">
        {loading &&
          [...Array(4)].map((_, i) => (
            <div key={i} className="em-card skeleton" />
          ))}

        {!loading &&
          campaigns.map((c) => (
            <div key={c.id} className="em-card campaign-card">
              <h3>{c.name}</h3>

              <span
                className={`em-badge em-badge-${
                  c.status === "sent"
                    ? "success"
                    : c.status === "failed"
                    ? "danger"
                    : "warning"
                }`}
              >
                {c.status}
              </span>

              <small>
                Created{" "}
                {new Date(c.created_at).toLocaleDateString()}
              </small>

              <button
                className="em-btn-ghost"
                onClick={() =>
                  navigate(
                    `/admin/email-marketing/campaigns/${c.id}`
                  )
                }
              >
                View Details
              </button>
            </div>
          ))}
      </div>
    </div>
  );
}
