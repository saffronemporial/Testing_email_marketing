import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../supabaseClient";
import "../styles/emailMarketing.css";
import "./recipientSegmentationEngine.css";

const RULE_TYPES = [
  { key: "country", label: "Country" },
  { key: "status", label: "Subscription Status" },
  { key: "engaged", label: "Engagement (Opened/Clicked)" }
];

export default function RecipientSegmentationEngine() {
  const [rules, setRules] = useState([]);
  const [segmentName, setSegmentName] = useState("");
  const [description, setDescription] = useState("");
  const [estimate, setEstimate] = useState(null);
  const [system, setSystem] = useState(null);
  const [error, setError] = useState(null);

  /* -------------------------------------------------------
     LOAD SYSTEM LIMITS
  -------------------------------------------------------- */
  useEffect(() => {
    supabase
      .from("email_system_settings")
      .select("daily_limit")
      .single()
      .then(({ data }) => setSystem(data));
  }, []);

  /* -------------------------------------------------------
     ADD / REMOVE RULES
  -------------------------------------------------------- */
  const addRule = () => {
    setRules([
      ...rules,
      { id: crypto.randomUUID(), type: "", value: "" }
    ]);
  };

  const updateRule = (id, patch) => {
    setRules(rules.map(r => (r.id === id ? { ...r, ...patch } : r)));
  };

  const removeRule = (id) => {
    setRules(rules.filter(r => r.id !== id));
  };

  /* -------------------------------------------------------
     ESTIMATE RECIPIENTS (REAL QUERY)
  -------------------------------------------------------- */
  const estimateRecipients = async () => {
    setError(null);

    if (!rules.length) {
      setError("At least one rule is required");
      return;
    }

    let query = supabase.from("subscribers").select("id", { count: "exact", head: true });

    rules.forEach(rule => {
      if (rule.type === "country") {
        query = query.eq("country", rule.value);
      }
      if (rule.type === "status") {
        query = query.eq("status", rule.value);
      }
      if (rule.type === "engaged") {
        query = query.eq("engaged", rule.value === "yes");
      }
    });

    const { count } = await query;
    setEstimate({
      total: count || 0,
      exceedsLimit: system?.daily_limit && count > system.daily_limit
    });
  };

  /* -------------------------------------------------------
     SAVE SEGMENT
  -------------------------------------------------------- */
  const saveSegment = async () => {
    if (!segmentName.trim()) {
      setError("Segment name is required");
      return;
    }

    await supabase.from("recipient_segments").insert({
      name: segmentName,
      description,
      rules
    });

    setRules([]);
    setSegmentName("");
    setDescription("");
    setEstimate(null);
  };

  return (
    <div className="em-fade-up segment-root">

      {/* HEADER */}
      <div className="segment-header">
        <h2>Recipient Segmentation Engine</h2>
        <span className="em-muted">
          Build precise, compliant recipient groups
        </span>
      </div>

      {/* META */}
      <div className="em-card">
        <label>Segment Name</label>
        <input value={segmentName} onChange={e => setSegmentName(e.target.value)} />

        <label>Description</label>
        <textarea value={description} onChange={e => setDescription(e.target.value)} />
      </div>

      {/* RULE BUILDER */}
      <div className="rules-list">
        {rules.map(rule => (
          <div key={rule.id} className="em-card rule-card">
            <select
              value={rule.type}
              onChange={e => updateRule(rule.id, { type: e.target.value })}
            >
              <option value="">Select rule</option>
              {RULE_TYPES.map(r => (
                <option key={r.key} value={r.key}>{r.label}</option>
              ))}
            </select>

            <input
              placeholder="Value"
              value={rule.value}
              onChange={e => updateRule(rule.id, { value: e.target.value })}
            />

            <button className="em-btn-ghost danger" onClick={() => removeRule(rule.id)}>
              ✕
            </button>
          </div>
        ))}
      </div>

      <button className="em-btn-ghost" onClick={addRule}>
        + Add Rule (AND)
      </button>

      {/* ESTIMATION */}
      <div className="em-card estimation-bar">
        <button className="em-btn-primary" onClick={estimateRecipients}>
          Estimate Recipients
        </button>

        {estimate && (
          <div>
            <strong>{estimate.total}</strong> deliverable recipients
            {estimate.exceedsLimit && (
              <p className="em-muted em-badge-warning">
                Exceeds daily sending limit
              </p>
            )}
          </div>
        )}
      </div>

      {/* ACTIONS */}
      <div className="segment-footer">
        <button className="em-btn-primary" onClick={saveSegment}>
          Save Segment
        </button>
      </div>

      {error && <div className="em-card em-badge-danger">{error}</div>}
    </div>
  );
}
