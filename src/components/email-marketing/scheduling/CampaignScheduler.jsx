import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../supabaseClient";
import "../styles/emailMarketing.css";
import "./campaignScheduler.css";

/**
 * props:
 *  - campaignId
 */
export default function CampaignScheduler({ campaignId }) {
  const [campaign, setCampaign] = useState(null);
  const [system, setSystem] = useState(null);
  const [mode, setMode] = useState("later"); // now | later | staggered
  const [scheduledAt, setScheduledAt] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  /* -------------------------------------------------------
     LOAD DATA
  -------------------------------------------------------- */
  useEffect(() => {
    const load = async () => {
      const [{ data: camp }, { data: sys }] = await Promise.all([
        supabase
          .from("email_campaigns")
          .select("*")
          .eq("id", campaignId)
          .single(),
        supabase
          .from("email_system_settings")
          .select("daily_limit, hourly_limit, timezone")
          .single()
      ]);

      setCampaign(camp);
      setSystem(sys);
    };

    load();
  }, [campaignId]);

  /* -------------------------------------------------------
     DERIVED RISK
  -------------------------------------------------------- */
  const risk = useMemo(() => {
    if (!campaign || !system) return null;

    const audience =
      campaign.final_audience_count ||
      campaign.estimated_audience_count ||
      0;

    const hoursNeeded =
      system.hourly_limit > 0
        ? Math.ceil(audience / system.hourly_limit)
        : null;

    return {
      audience,
      exceedsDaily:
        system.daily_limit &&
        audience > system.daily_limit,
      hoursNeeded
    };
  }, [campaign, system]);

  /* -------------------------------------------------------
     SAVE SCHEDULE
  -------------------------------------------------------- */
  const saveSchedule = async () => {
    setSaving(true);
    setError(null);

    try {
      await supabase
        .from("email_campaigns")
        .update({
          schedule_mode: mode,
          scheduled_at: mode === "now" ? new Date().toISOString() : scheduledAt
        })
        .eq("id", campaignId);
    } catch {
      setError("Failed to save schedule");
    } finally {
      setSaving(false);
    }
  };

  if (!campaign || !system) {
    return <div className="em-card">Loading scheduler…</div>;
  }

  if (campaign.status === "sending" || campaign.status === "completed") {
    return (
      <div className="em-card em-badge-warning">
        Scheduling is locked for this campaign.
      </div>
    );
  }

  return (
    <div className="em-fade-up scheduler-root">

      {/* HEADER */}
      <div className="scheduler-header">
        <h3>Schedule Campaign</h3>
        <span className="em-muted">
          Timezone: {system.timezone || "UTC"}
        </span>
      </div>

      {/* MODE */}
      <div className="em-card mode-selector">
        <label>
          <input
            type="radio"
            checked={mode === "now"}
            onChange={() => setMode("now")}
          />
          Send Now
        </label>

        <label>
          <input
            type="radio"
            checked={mode === "later"}
            onChange={() => setMode("later")}
          />
          Schedule for Later
        </label>

        <label>
          <input
            type="radio"
            checked={mode === "staggered"}
            onChange={() => setMode("staggered")}
          />
          Staggered Send
        </label>
      </div>

      {/* TIME PICKER */}
      {mode !== "now" && (
        <div className="em-card">
          <label>Scheduled Date & Time</label>
          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
          />
        </div>
      )}

      {/* RISK SUMMARY */}
      {risk && (
        <div className={`em-card risk-summary ${risk.exceedsDaily ? "risk" : ""}`}>
          <strong>Audience:</strong> {risk.audience}
          {risk.exceedsDaily && (
            <p className="em-muted">
              ⚠ Exceeds daily limit — use staggered mode
            </p>
          )}
          {risk.hoursNeeded && (
            <p className="em-muted">
              Estimated hours required: {risk.hoursNeeded}
            </p>
          )}
        </div>
      )}

      {/* FOOTER */}
      <div className="scheduler-footer">
        <button
          className="em-btn-primary"
          disabled={saving || (mode !== "now" && !scheduledAt)}
          onClick={saveSchedule}
        >
          {saving ? "Saving…" : "Save Schedule"}
        </button>
      </div>

      {error && <div className="em-card em-badge-danger">{error}</div>}
    </div>
  );
}
