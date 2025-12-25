import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../supabaseClient";
import "../styles/emailMarketing.css";
import "./rateLimitMonitor.css";

export default function RateLimitMonitor() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [limits, setLimits] = useState(null);
  const [usage, setUsage] = useState({
    dailyUsed: 0,
    hourlyUsed: 0,
    inflight: 0,
    lastHourSlope: 0
  });

  /* -------------------------------------------------------
     LOAD LIMITS + LIVE USAGE
  -------------------------------------------------------- */
  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const [{ data: settings }, { data: stats }] = await Promise.all([
          supabase
            .from("email_system_settings")
            .select("daily_limit, hourly_limit, global_email_enabled")
            .single(),
          supabase
            .from("email_rate_stats")
            .select("daily_used, hourly_used, inflight, last_hour_slope")
            .single()
        ]);

        if (!mounted) return;

        setLimits(settings);
        setUsage({
          dailyUsed: stats?.daily_used || 0,
          hourlyUsed: stats?.hourly_used || 0,
          inflight: stats?.inflight || 0,
          lastHourSlope: stats?.last_hour_slope || 0
        });
      } catch {
        setError("Failed to load rate limit data");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    const interval = setInterval(load, 30000); // refresh every 30s
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  /* -------------------------------------------------------
     DERIVED METRICS
  -------------------------------------------------------- */
  const derived = useMemo(() => {
    if (!limits) return null;

    const dailyRemaining = Math.max(
      0,
      limits.daily_limit - usage.dailyUsed
    );
    const hourlyRemaining = Math.max(
      0,
      limits.hourly_limit - usage.hourlyUsed
    );

    const burnRate = usage.lastHourSlope; // emails/hour
    const hoursToBreach =
      burnRate > 0 ? Math.floor(dailyRemaining / burnRate) : null;

    const severity =
      dailyRemaining <= 0 || hourlyRemaining <= 0
        ? "critical"
        : dailyRemaining < limits.daily_limit * 0.15 ||
          hourlyRemaining < limits.hourly_limit * 0.15
        ? "warning"
        : "healthy";

    return {
      dailyRemaining,
      hourlyRemaining,
      burnRate,
      hoursToBreach,
      severity
    };
  }, [limits, usage]);

  if (loading) return <div className="em-card">Loading rate limits…</div>;
  if (error) return <div className="em-card em-badge-danger">{error}</div>;
  if (!derived) return null;

  return (
    <div className="em-fade-up rate-limit-root">

      {/* HEADER */}
      <div className="rate-limit-header">
        <h2>Rate-Limit Monitor</h2>
        <span className="em-muted">
          Live throughput & breach prevention
        </span>
      </div>

      {/* ALERT RIBBON */}
      {derived.severity !== "healthy" && (
        <div className={`em-card alert-ribbon ${derived.severity}`}>
          {derived.severity === "critical"
            ? "Sending halted or limit breached. Immediate action required."
            : "Approaching rate limits. Consider throttling or rescheduling."}
        </div>
      )}

      {/* METRIC GRID */}
      <div className="rate-metric-grid">

        <MetricRing
          label="Daily Usage"
          used={usage.dailyUsed}
          limit={limits.daily_limit}
          severity={derived.severity}
        />

        <MetricRing
          label="Hourly Usage"
          used={usage.hourlyUsed}
          limit={limits.hourly_limit}
          severity={derived.severity}
        />

        <MetricCard
          label="In-Flight Queue"
          value={usage.inflight}
        />

        <MetricCard
          label="Burn Rate (emails/hr)"
          value={derived.burnRate || "—"}
        />

        <MetricCard
          label="ETA to Breach"
          value={
            derived.hoursToBreach !== null
              ? `${derived.hoursToBreach} hrs`
              : "—"
          }
        />

        <MetricCard
          label="System Status"
          value={
            limits.global_email_enabled ? "Enabled" : "Paused"
          }
        />

      </div>

    </div>
  );
}

/* ---------------- INTERNAL COMPONENTS ---------------- */

function MetricRing({ label, used, limit, severity }) {
  const percent = limit ? Math.min(100, Math.round((used / limit) * 100)) : 0;

  return (
    <div className={`em-card ring-card ${severity}`}>
      <span>{label}</span>
      <div className="ring">
        <strong>{percent}%</strong>
      </div>
      <small>{used} / {limit}</small>
    </div>
  );
}

function MetricCard({ label, value }) {
  return (
    <div className="em-card metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
