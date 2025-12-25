import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../supabaseClient";
import "../styles/emailMarketing.css";
import "./campaignAudienceSelector.css";

/**
 * props:
 *  - campaignId
 *  - segmentId
 */
export default function CampaignAudienceSelector({ campaignId, segmentId }) {
  const [segment, setSegment] = useState(null);
  const [system, setSystem] = useState(null);

  const [excludeCountries, setExcludeCountries] = useState([]);
  const [excludeDays, setExcludeDays] = useState(0);
  const [manualExclude, setManualExclude] = useState("");
  const [maxRecipients, setMaxRecipients] = useState(null);

  const [estimate, setEstimate] = useState(null);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  /* -------------------------------------------------------
     LOAD BASE DATA
  -------------------------------------------------------- */
  useEffect(() => {
    const load = async () => {
      const [{ data: seg }, { data: sys }] = await Promise.all([
        supabase
          .from("recipient_segments")
          .select("id, name, estimated_count")
          .eq("id", segmentId)
          .single(),
        supabase
          .from("email_system_settings")
          .select("daily_limit")
          .single()
      ]);

      setSegment(seg);
      setSystem(sys);
    };

    load();
  }, [segmentId]);

  /* -------------------------------------------------------
     ESTIMATE FINAL AUDIENCE
  -------------------------------------------------------- */
  const estimateAudience = async () => {
    setError(null);

    try {
      const { data, error } = await supabase.rpc(
        "estimate_campaign_audience",
        {
          segment_id: segmentId,
          exclude_countries: excludeCountries,
          exclude_last_days: excludeDays,
          manual_excludes: manualExclude
            .split(",")
            .map((e) => e.trim().toLowerCase())
            .filter(Boolean),
          max_limit: maxRecipients
        }
      );

      if (error) throw error;
      setEstimate(data);
    } catch {
      setError("Failed to estimate audience");
    }
  };

  /* -------------------------------------------------------
     SAVE OVERRIDES
  -------------------------------------------------------- */
  const saveOverrides = async () => {
    setSaving(true);
    setError(null);

    try {
      await supabase
        .from("email_campaigns")
        .update({
          audience_overrides: {
            excludeCountries,
            excludeDays,
            manualExclude,
            maxRecipients
          }
        })
        .eq("id", campaignId);
    } catch {
      setError("Failed to save audience overrides");
    } finally {
      setSaving(false);
    }
  };

  const risk =
    estimate &&
    (estimate.final_count === 0 ||
      (system?.daily_limit &&
        estimate.final_count > system.daily_limit));

  if (!segment) return <div className="em-card">Loading audience…</div>;

  return (
    <div className="em-fade-up audience-root">

      {/* HEADER */}
      <div className="audience-header">
        <h3>Audience Control</h3>
        <span className="em-muted">
          Fine-tune who receives this campaign
        </span>
      </div>

      {/* BASE SEGMENT */}
      <div className="em-card locked-segment">
        <strong>Base Segment</strong>
        <span>{segment.name}</span>
        <small className="em-muted">
          Estimated: {segment.estimated_count}
        </small>
      </div>

      {/* EXCLUSIONS */}
      <div className="em-card">
        <label>Exclude Countries (comma-separated)</label>
        <input
          placeholder="e.g. Iran, North Korea"
          value={excludeCountries.join(", ")}
          onChange={(e) =>
            setExcludeCountries(
              e.target.value
                .split(",")
                .map((c) => c.trim())
                .filter(Boolean)
            )
          }
        />

        <label>Exclude Recently Emailed (days)</label>
        <input
          type="number"
          min="0"
          value={excludeDays}
          onChange={(e) => setExcludeDays(Number(e.target.value))}
        />

        <label>Manual Email Exclusions</label>
        <textarea
          placeholder="email1@example.com, email2@example.com"
          value={manualExclude}
          onChange={(e) => setManualExclude(e.target.value)}
        />

        <label>Max Recipients (optional)</label>
        <input
          type="number"
          min="0"
          value={maxRecipients || ""}
          onChange={(e) =>
            setMaxRecipients(
              e.target.value ? Number(e.target.value) : null
            )
          }
        />
      </div>

      {/* ESTIMATE */}
      <div className="em-card estimation-card">
        <button className="em-btn-ghost" onClick={estimateAudience}>
          Estimate Final Audience
        </button>

        {estimate && (
          <div className={`estimate-result ${risk ? "risk" : ""}`}>
            <strong>{estimate.final_count}</strong> final recipients
            <p className="em-muted">
              Excluded: {estimate.excluded_count}
            </p>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className="audience-footer">
        <button
          className="em-btn-primary"
          disabled={saving}
          onClick={saveOverrides}
        >
          {saving ? "Saving…" : "Save Audience Rules"}
        </button>
      </div>

      {error && <div className="em-card em-badge-danger">{error}</div>}
    </div>
  );
}
