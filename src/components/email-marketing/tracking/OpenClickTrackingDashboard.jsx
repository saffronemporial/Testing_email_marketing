// src/components/email-marketing/tracking/OpenClickTrackingDashboard.jsx

import { useEffect, useState } from "react";
import { supabase } from "../../../supabaseClient";
import "../styles/emailMarketing.css";
import "./openClickTrackingDashboard.css";

export default function OpenClickTrackingDashboard() {
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState([]);
  const [summary, setSummary] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [error, setError] = useState(null);

  /* -------------------------------------------------------
     LOAD OPEN & CLICK DATA
  -------------------------------------------------------- */
  useEffect(() => {
    let mounted = true;

    const loadTracking = async () => {
      try {
        const { data, error } = await supabase
          .from("email_campaign_stats")
          .select(`
            campaign_id,
            emails_delivered,
            emails_opened,
            emails_clicked,
            link_clicks,
            email_campaigns (
              name,
              status
            )
          `)
          .order("emails_delivered", { ascending: false });

        if (error) throw error;
        if (!mounted) return;

        setCampaigns(data || []);

        /* -------- SUMMARY DERIVATION -------- */
        const delivered = data.reduce((a, b) => a + (b.emails_delivered || 0), 0);
        const opened = data.reduce((a, b) => a + (b.emails_opened || 0), 0);
        const clicked = data.reduce((a, b) => a + (b.emails_clicked || 0), 0);

        setSummary({
          delivered,
          opened,
          clicked,
          openRate: delivered ? Math.round((opened / delivered) * 100) : 0,
          ctr: delivered ? Math.round((clicked / delivered) * 100) : 0,
          ctor: opened ? Math.round((clicked / opened) * 100) : 0
        });

      } catch (err) {
        console.error(err);
        setError("Failed to load open & click tracking data");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadTracking();
    return () => (mounted = false);
  }, []);

  if (loading) {
    return <div className="em-card">Loading engagement analytics…</div>;
  }

  if (error) {
    return <div className="em-card em-badge-danger">{error}</div>;
  }

  return (
    <div className="em-fade-up tracking-root">

      {/* ================= HEADER ================= */}
      <div className="tracking-header">
        <h2>Open & Click Tracking</h2>
        <span className="em-muted">
          Engagement & behavior intelligence
        </span>
      </div>

      {/* ================= KPI SUMMARY ================= */}
      <div className="tracking-kpi-grid">
        <KPI label="Delivered" value={summary.delivered} />
        <KPI label="Opened" value={summary.opened} />
        <KPI label="Clicked" value={summary.clicked} />
        <KPI label="Open Rate" value={`${summary.openRate}%`} />
        <KPI label="CTR" value={`${summary.ctr}%`} />
        <KPI label="CTOR" value={`${summary.ctor}%`} />
      </div>

      {/* ================= CAMPAIGN BREAKDOWN ================= */}
      <div className="tracking-campaign-grid">
        {campaigns.map((c) => {
          const openRate =
            c.emails_delivered > 0
              ? Math.round((c.emails_opened / c.emails_delivered) * 100)
              : 0;

          const clickRate =
            c.emails_delivered > 0
              ? Math.round((c.emails_clicked / c.emails_delivered) * 100)
              : 0;

          return (
            <div key={c.campaign_id} className="em-card tracking-card">
              <div className="tracking-card-header">
                <strong>{c.email_campaigns?.name}</strong>
                <span
                  className={`em-badge em-badge-${
                    openRate > 30 ? "success" : openRate > 15 ? "warning" : "danger"
                  }`}
                >
                  {openRate}% Open
                </span>
              </div>

              <div className="tracking-metrics">
                <Metric label="Delivered" value={c.emails_delivered} />
                <Metric label="Opened" value={c.emails_opened} />
                <Metric label="Clicked" value={c.emails_clicked} />
                <Metric label="Click Rate" value={`${clickRate}%`} />
              </div>

              {c.link_clicks && (
                <button
                  className="em-btn-ghost"
                  onClick={() =>
                    setExpanded(expanded === c.campaign_id ? null : c.campaign_id)
                  }
                >
                  {expanded === c.campaign_id ? "Hide" : "View"} Link Clicks
                </button>
              )}

              {expanded === c.campaign_id && c.link_clicks && (
                <div className="link-clicks">
                  {Object.entries(c.link_clicks).map(([url, count]) => (
                    <div key={url} className="link-row">
                      <span className="link-url">{url}</span>
                      <strong>{count}</strong>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
}

/* -------------------------------------------------------
   INTERNAL COMPONENTS
-------------------------------------------------------- */

function KPI({ label, value }) {
  return (
    <div className="em-card tracking-kpi">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
