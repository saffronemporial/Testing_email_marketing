// src/components/email-marketing/scheduling/ScheduleDashboard.jsx

import { useEffect, useState } from "react";
import { supabase } from "../../../supabaseClient";
import "../styles/emailMarketing.css";
import "./scheduleDashboard.css";

export default function ScheduleDashboard() {
  const [loading, setLoading] = useState(true);
  const [scheduled, setScheduled] = useState([]);
  const [systemEnabled, setSystemEnabled] = useState(true);
  const [error, setError] = useState(null);

  /* -------------------------------------------------------
     LOAD SCHEDULE QUEUE + SYSTEM STATUS
  -------------------------------------------------------- */
  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [{ data: campaigns }, { data: settings }] =
          await Promise.all([
            supabase
              .from("email_campaigns")
              .select("id, name, status, scheduled_at")
              .eq("status", "scheduled")
              .order("scheduled_at", { ascending: true }),

            supabase
              .from("email_system_settings")
              .select("global_email_enabled")
              .single()
          ]);

        if (!mounted) return;

        setScheduled(campaigns || []);
        setSystemEnabled(settings?.global_email_enabled ?? true);
      } catch (err) {
        console.error(err);
        setError("Failed to load schedule dashboard");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadData();
    return () => (mounted = false);
  }, []);

  /* -------------------------------------------------------
     ACTIONS
  -------------------------------------------------------- */
  const cancelSchedule = async (id) => {
    await supabase
      .from("email_campaigns")
      .update({ status: "cancelled", scheduled_at: null })
      .eq("id", id);

    setScheduled((prev) => prev.filter((c) => c.id !== id));
  };

  /* -------------------------------------------------------
     DERIVED HELPERS
  -------------------------------------------------------- */
  const getCountdown = (date) => {
    const diff = new Date(date) - new Date();
    if (diff <= 0) return "Sending imminently";

    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins} min`;
    const hrs = Math.floor(mins / 60);
    return `${hrs} hr ${mins % 60} min`;
  };

  if (loading) {
    return <div className="em-card">Loading schedule…</div>;
  }

  if (error) {
    return <div className="em-card em-badge-danger">{error}</div>;
  }

  return (
    <div className="em-fade-up schedule-dashboard-root">

      {/* ================= HEADER ================= */}
      <div className="schedule-header">
        <h2>Scheduled Campaigns</h2>

        <span
          className={`em-badge em-badge-${
            systemEnabled ? "success" : "danger"
          }`}
        >
          System {systemEnabled ? "Enabled" : "Paused"}
        </span>
      </div>

      {/* ================= SUMMARY BAR ================= */}
      <div className="schedule-summary em-card">
        <SummaryStat
          label="Total Scheduled"
          value={scheduled.length}
        />
        <SummaryStat
          label="Next Send In"
          value={
            scheduled[0]
              ? getCountdown(scheduled[0].scheduled_at)
              : "—"
          }
        />
        <SummaryStat
          label="Queue Health"
          value={systemEnabled ? "Healthy" : "Blocked"}
        />
      </div>

      {/* ================= QUEUE ================= */}
      <div className="schedule-grid">
        {scheduled.length === 0 && (
          <div className="em-card muted">
            No campaigns scheduled
          </div>
        )}

        {scheduled.map((c) => {
          const urgent =
            new Date(c.scheduled_at) - new Date() <
            30 * 60000;

          return (
            <div
              key={c.id}
              className={`em-card schedule-card ${
                urgent ? "urgent" : ""
              }`}
            >
              <div className="schedule-card-header">
                <strong>{c.name}</strong>
                <span className="em-badge em-badge-warning">
                  Scheduled
                </span>
              </div>

              <p>
                Scheduled At:{" "}
                <strong>
                  {new Date(c.scheduled_at).toLocaleString()}
                </strong>
              </p>

              <p className="countdown">
                {getCountdown(c.scheduled_at)}
              </p>

              <div className="schedule-actions">
                <button
                  className="em-btn-ghost danger"
                  onClick={() => cancelSchedule(c.id)}
                >
                  Cancel
                </button>
              </div>
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

function SummaryStat({ label, value }) {
  return (
    <div className="summary-stat">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
