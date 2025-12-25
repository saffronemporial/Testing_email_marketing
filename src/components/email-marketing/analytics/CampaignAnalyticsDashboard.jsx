// src/components/email-marketing/analytics/CampaignAnalyticsDashboard.jsx

import { useEffect, useState } from "react";
import { supabase } from "../../../supabaseClient";
import OpenRateChart from "./OpenRateChart";
import ClickRateChart from "./ClickRateChart";
import DeliveryStats from "./DeliveryStats";
import ProviderPerformance from "./ProviderPerformance";
import logs from "../logs/EmailLogsExplorer";
import "../styles/emailMarketing.css";
import "./campaignAnalyticsDashboard.css";

export default function CampaignAnalyticsDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([]);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);

  /* -------------------------------------------------------
     LOAD ANALYTICS DATA
  -------------------------------------------------------- */
  useEffect(() => {
    let mounted = true;

    const loadAnalytics = async () => {
      try {
        const { data, error } = await supabase
          .from("email_campaign_stats")
          .select(`
            campaign_id,
            emails_sent,
            emails_delivered,
            emails_opened,
            emails_clicked,
            emails_failed,
            email_campaigns (
              name,
              status,
              created_at
            )
          `)
          .order("emails_sent", { ascending: false });

        if (error) throw error;
        if (!mounted) return;

        setStats(data || []);

        /* -------- SUMMARY DERIVATION -------- */
        const totalSent = data.reduce((a, b) => a + (b.emails_sent || 0), 0);
        const totalDelivered = data.reduce((a, b) => a + (b.emails_delivered || 0), 0);
        const totalOpened = data.reduce((a, b) => a + (b.emails_opened || 0), 0);
        const totalClicked = data.reduce((a, b) => a + (b.emails_clicked || 0), 0);

        setSummary({
          campaigns: data.length,
          sent: totalSent,
          deliveryRate: totalSent ? Math.round((totalDelivered / totalSent) * 100) : 0,
          openRate: totalDelivered ? Math.round((totalOpened / totalDelivered) * 100) : 0,
          clickRate: totalOpened ? Math.round((totalClicked / totalOpened) * 100) : 0
        });

      } catch (err) {
        console.error(err);
        setError("Failed to load campaign analytics");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadAnalytics();
    return () => (mounted = false);
  }, []);

  if (loading) {
    return <div className="em-card">Loading analytics…</div>;
  }

  if (error) {
    return <div className="em-card em-badge-danger">{error}</div>;
  }

  return (
    <div className="em-fade-up analytics-root">

      {/* ================= HEADER ================= */}
      <div className="analytics-header">
        <h2>Campaign Analytics</h2>
        <span className="em-muted">
          Real-time performance intelligence
        </span>
      </div>

      {/* ================= KPI SUMMARY ================= */}
      <div className="analytics-summary-grid">
        <KPI label="Total Campaigns" value={summary.campaigns} />
        <KPI label="Emails Sent" value={summary.sent} />
        <KPI label="Delivery Rate" value={`${summary.deliveryRate}%`} />
        <KPI label="Open Rate" value={`${summary.openRate}%`} />
        <KPI label="Click Rate" value={`${summary.clickRate}%`} />
      </div>

      {/* ================= CAMPAIGN BREAKDOWN ================= */}
      <div className="analytics-campaign-grid">
        {stats.map((c) => {
          const performanceScore =
            c.emails_delivered === 0
              ? 0
              : Math.round(
                  ((c.emails_opened + c.emails_clicked * 2) /
                    (c.emails_delivered * 3)) *
                    100
                );

          return (
            <div key={c.campaign_id} className="em-card analytics-card">
              <div className="analytics-card-header">
                <strong>{c.email_campaigns?.name}</strong>
                <span
                  className={`em-badge em-badge-${
                    performanceScore > 60
                      ? "success"
                      : performanceScore > 30
                      ? "warning"
                      : "danger"
                  }`}
                >
                  Score {performanceScore}
                </span>
              </div>

              <div className="analytics-metrics">
                <Metric label="Sent" value={c.emails_sent} />
                <Metric label="Delivered" value={c.emails_delivered} />
                <Metric label="Opened" value={c.emails_opened} />
                <Metric label="Clicked" value={c.emails_clicked} />
                <Metric label="Failed" value={c.emails_failed} />
              </div>

              <small className="em-muted">
                Status: {c.email_campaigns?.status}
              </small>
            </div>
          );
        })}
      </div>
       <div className="grid xl:grid-cols-2 gap-6">
        <OpenRateChart logs={logs} />
        <ClickRateChart logs={logs} />
      </div>

      <DeliveryStats logs={logs} />
      <ProviderPerformance providers={providers} />
     </div>
   );
}

/* -------------------------------------------------------
   INTERNAL COMPONENTS
-------------------------------------------------------- */

function KPI({ label, value }) {
  return (
    <div className="em-card kpi-card">
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