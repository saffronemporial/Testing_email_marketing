import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../supabaseClient";
import "../styles/emailMarketing.css";
import "./emailOverviewDashboard.css";

export default function EmailOverviewDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [stats, setStats] = useState([]);
  const [system, setSystem] = useState(null);
  const [suppressionCount, setSuppressionCount] = useState(0);
  const [scheduledNext, setScheduledNext] = useState(null);

  /* -------------------------------------------------------
     LOAD CORE DATA (REAL)
  -------------------------------------------------------- */
  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const [
          { data: campaignStats },
          { data: settings },
          { count: suppressed },
          { data: nextScheduled }
        ] = await Promise.all([
          supabase.from("email_campaign_stats")
            .select("campaign_id, emails_sent, emails_delivered, emails_opened, emails_clicked, snapshot_date"),
          supabase.from("email_system_settings").select("*").single(),
          supabase.from("email_suppressions").select("*", { count: "exact", head: true }),
          supabase.from("email_campaigns")
            .select("name, scheduled_at")
            .eq("status", "scheduled")
            .order("scheduled_at", { ascending: true })
            .limit(1)
        ]);

        if (!mounted) return;

        setStats(campaignStats || []);
        setSystem(settings || null);
        setSuppressionCount(suppressed || 0);
        setScheduledNext(nextScheduled?.[0] || null);
      } catch (e) {
        setError("Failed to load overview intelligence");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => (mounted = false);
  }, []);

  /* -------------------------------------------------------
     DERIVED CORRELATIONS (TRANSPARENT)
  -------------------------------------------------------- */
  const correlations = useMemo(() => {
    const sent = stats.reduce((a, b) => a + (b.emails_sent || 0), 0);
    const delivered = stats.reduce((a, b) => a + (b.emails_delivered || 0), 0);
    const opened = stats.reduce((a, b) => a + (b.emails_opened || 0), 0);
    const clicked = stats.reduce((a, b) => a + (b.emails_clicked || 0), 0);

    const deliveryRate = sent ? Math.round((delivered / sent) * 100) : 0;
    const openRate = delivered ? Math.round((opened / delivered) * 100) : 0;
    const ctr = delivered ? Math.round((clicked / delivered) * 100) : 0;
    const ctor = opened ? Math.round((clicked / opened) * 100) : 0;

    const rateLimitRisk =
      system?.daily_limit && delivered > system.daily_limit * 0.8;

    return {
      sent, delivered, opened, clicked,
      deliveryRate, openRate, ctr, ctor,
      rateLimitRisk
    };
  }, [stats, system]);

  /* -------------------------------------------------------
     ACTIONABLE INSIGHTS (RULE-BASED)
  -------------------------------------------------------- */
  const insights = useMemo(() => {
    const list = [];

    if (correlations.deliveryRate < 90) {
      list.push({
        level: "warning",
        text: "Delivery rate below threshold. Review suppressions and provider health."
      });
    }

    if (correlations.openRate < 20) {
      list.push({
        level: "danger",
        text: "Low open rate detected. Subject lines or sender reputation may need optimization."
      });
    }

    if (correlations.ctor > 25) {
      list.push({
        level: "success",
        text: "Strong click-to-open performance. Template CTAs are effective."
      });
    }

    if (correlations.rateLimitRisk) {
      list.push({
        level: "warning",
        text: "Approaching daily send limit. Consider staggering schedules."
      });
    }

    if (suppressionCount > correlations.delivered * 0.2) {
      list.push({
        level: "danger",
        text: "High suppression volume relative to sends. Compliance pressure elevated."
      });
    }

    return list;
  }, [correlations, suppressionCount]);

  if (loading) return <div className="em-card">Loading executive insights…</div>;
  if (error) return <div className="em-card em-badge-danger">{error}</div>;

  return (
    <div className="em-fade-up overview-root">

      {/* ================= HEADER ================= */}
      <div className="overview-header">
        <h2>Email Overview</h2>
        <span className="em-muted">Correlated performance & risk intelligence</span>
      </div>

      {/* ================= KPI CORRELATIONS ================= */}
      <div className="overview-kpi-grid">
        <KPI label="Sent" value={correlations.sent} />
        <KPI label="Delivered" value={correlations.delivered} />
        <KPI label="Delivery Rate" value={`${correlations.deliveryRate}%`} />
        <KPI label="Open Rate" value={`${correlations.openRate}%`} />
        <KPI label="CTR" value={`${correlations.ctr}%`} />
        <KPI label="CTOR" value={`${correlations.ctor}%`} />
      </div>

      {/* ================= SIGNAL STRIP ================= */}
      <div className="overview-signal-strip">
        <Signal label="System" value={system?.global_email_enabled ? "Enabled" : "Paused"} />
        <Signal label="Suppressed Emails" value={suppressionCount} />
        <Signal
          label="Next Send"
          value={scheduledNext ? new Date(scheduledNext.scheduled_at).toLocaleString() : "—"}
        />
      </div>

      {/* ================= INSIGHTS ================= */}
      <div className="overview-insights">
        {insights.length === 0 && (
          <div className="em-card success-glow">
            All systems operating within optimal thresholds.
          </div>
        )}

        {insights.map((i, idx) => (
          <div key={idx} className={`em-card insight-card ${i.level}`}>
            {i.text}
          </div>
        ))}
      </div>

    </div>
  );
}

/* ---------------- INTERNAL COMPONENTS ---------------- */

function KPI({ label, value }) {
  return (
    <div className="em-card kpi-glass">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Signal({ label, value }) {
  return (
    <div className="signal-pill">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}