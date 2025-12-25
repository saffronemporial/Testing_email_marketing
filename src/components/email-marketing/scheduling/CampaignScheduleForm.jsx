// src/components/email-marketing/scheduling/CampaignScheduleForm.jsx

import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../../supabaseClient";
import "../styles/emailMarketing.css";
import "./campaignScheduleForm.css";

export default function CampaignScheduleForm() {
  const { campaignId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [campaign, setCampaign] = useState(null);
  const [settings, setSettings] = useState(null);

  const [scheduledAt, setScheduledAt] = useState("");
  const [confirmChecked, setConfirmChecked] = useState(false);

  /* -------------------------------------------------------
     LOAD CAMPAIGN + SYSTEM SETTINGS
  -------------------------------------------------------- */
  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const [{ data: c, error: cErr }, { data: s, error: sErr }] =
          await Promise.all([
            supabase
              .from("email_campaigns")
              .select("id, name, status, scheduled_at, created_at")
              .eq("id", campaignId)
              .single(),
            supabase
              .from("email_system_settings")
              .select("global_email_enabled, hourly_limit, daily_limit")
              .single()
          ]);

        if (cErr) throw cErr;
        if (sErr) throw sErr;

        if (!mounted) return;

        setCampaign(c);
        setSettings(s);
        setScheduledAt(c.scheduled_at || "");
      } catch (err) {
        console.error(err);
        setError("Failed to load scheduling data");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => (mounted = false);
  }, [campaignId]);

  /* -------------------------------------------------------
     DERIVED HELPERS
  -------------------------------------------------------- */
  const now = new Date();
  const selectedDate = scheduledAt ? new Date(scheduledAt) : null;

  const isPast =
    selectedDate && selectedDate.getTime() <= now.getTime();

  const isLocked =
    campaign &&
    (campaign.status === "sending" ||
      campaign.status === "sent");

  const systemPaused =
    settings && !settings.global_email_enabled;

  const countdownText = useMemo(() => {
    if (!selectedDate) return "—";
    const diff = selectedDate - now;
    if (diff <= 0) return "Invalid (past time)";
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins} minutes from now`;
    const hrs = Math.floor(mins / 60);
    return `${hrs}h ${mins % 60}m from now`;
  }, [scheduledAt]);

  /* -------------------------------------------------------
     SAVE / CANCEL
  -------------------------------------------------------- */
  const saveSchedule = async () => {
    if (!scheduledAt) {
      setError("Please select a schedule time");
      return;
    }
    if (isPast) {
      setError("Schedule time must be in the future");
      return;
    }
    if (!confirmChecked) {
      setError("Please confirm before scheduling");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await supabase
        .from("email_campaigns")
        .update({
          status: "scheduled",
          scheduled_at: scheduledAt
        })
        .eq("id", campaignId);

      navigate("/admin/email-marketing/scheduling");
    } catch (err) {
      console.error(err);
      setError("Failed to save schedule");
    } finally {
      setSaving(false);
    }
  };

  const cancelSchedule = async () => {
    setSaving(true);
    try {
      await supabase
        .from("email_campaigns")
        .update({
          status: "approved",
          scheduled_at: null
        })
        .eq("id", campaignId);

      navigate("/admin/email-marketing/scheduling");
    } catch (err) {
      setError("Failed to cancel schedule");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="em-card">Loading scheduler…</div>;
  if (error) return <div className="em-card em-badge-danger">{error}</div>;

  return (
    <div className="em-fade-up schedule-form-root">

      {/* ================= HEADER ================= */}
      <div className="schedule-form-header">
        <h2>Schedule Campaign</h2>
        <span className="em-muted">{campaign.name}</span>
      </div>

      {/* ================= WARNINGS ================= */}
      {systemPaused && (
        <div className="em-card em-badge-danger">
          Global email sending is currently PAUSED.
          Scheduling is allowed but sending will not occur until enabled.
        </div>
      )}

      {isLocked && (
        <div className="em-card em-badge-warning">
          This campaign is already sending or sent. Scheduling is locked.
        </div>
      )}

      {/* ================= FORM ================= */}
      <div className="em-card schedule-form-card">
        <label>Schedule Date & Time (Local)</label>
        <input
          type="datetime-local"
          value={scheduledAt ? scheduledAt.slice(0, 16) : ""}
          onChange={(e) =>
            setScheduledAt(
              e.target.value
                ? new Date(e.target.value).toISOString()
                : ""
            )
          }
          disabled={isLocked}
        />

        <div className="schedule-preview">
          <span>Will send:</span>
          <strong>{countdownText}</strong>
        </div>

        <label className="confirm-row">
          <input
            type="checkbox"
            checked={confirmChecked}
            onChange={(e) => setConfirmChecked(e.target.checked)}
            disabled={isLocked}
          />
          I confirm this schedule is correct
        </label>
      </div>

      {/* ================= FOOTER ACTIONS ================= */}
      <div className="schedule-footer">
        {campaign.scheduled_at && !isLocked && (
          <button
            className="em-btn-ghost danger"
            onClick={cancelSchedule}
            disabled={saving}
          >
            Cancel Schedule
          </button>
        )}

        <button
          className="em-btn-primary"
          onClick={saveSchedule}
          disabled={saving || isLocked}
        >
          {saving ? "Saving…" : "Save Schedule"}
        </button>
      </div>

    </div>
  );
}
