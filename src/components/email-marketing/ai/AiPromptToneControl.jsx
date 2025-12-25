import { useEffect, useState } from "react";
import { supabase } from "../../../supabaseClient";
import "../styles/emailMarketing.css";
import "./aiPromptToneControl.css";

export default function AiPromptToneControl() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [settings, setSettings] = useState({
    formality: 3,
    salesIntensity: 2,
    emotionalTone: 2,
    complianceStrictness: 4,
    audience: "export_buyers",
    systemPrompt: "",
    userPromptTemplate: "",
    locked: false
  });

  /* -------------------------------------------------------
     LOAD AI PROMPT SETTINGS
  -------------------------------------------------------- */
  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const { data } = await supabase
          .from("ai_prompt_settings")
          .select("*")
          .single();

        if (mounted && data) setSettings(data);
      } catch {
        setError("Failed to load AI prompt settings");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => (mounted = false);
  }, []);

  /* -------------------------------------------------------
     SAVE SETTINGS
  -------------------------------------------------------- */
  const save = async () => {
    setSaving(true);
    setError(null);

    try {
      await supabase
        .from("ai_prompt_settings")
        .update(settings)
        .eq("id", settings.id);
    } catch {
      setError("Failed to save AI prompt settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="em-card">Loading AI controls…</div>;
  if (error) return <div className="em-card em-badge-danger">{error}</div>;

  return (
    <div className="em-fade-up ai-tone-root">

      {/* HEADER */}
      <div className="ai-tone-header">
        <h2>AI Prompt & Tone Control</h2>
        <span className="em-muted">
          Govern AI language, risk & brand voice
        </span>
      </div>

      {/* TONE CONTROLS */}
      <div className="tone-grid">

        <ToneSlider
          label="Formality"
          value={settings.formality}
          onChange={(v) => setSettings({ ...settings, formality: v })}
          disabled={settings.locked}
        />

        <ToneSlider
          label="Sales Intensity"
          value={settings.salesIntensity}
          onChange={(v) => setSettings({ ...settings, salesIntensity: v })}
          disabled={settings.locked}
        />

        <ToneSlider
          label="Emotional Tone"
          value={settings.emotionalTone}
          onChange={(v) => setSettings({ ...settings, emotionalTone: v })}
          disabled={settings.locked}
        />

        <ToneSlider
          label="Compliance Strictness"
          value={settings.complianceStrictness}
          onChange={(v) =>
            setSettings({ ...settings, complianceStrictness: v })
          }
          disabled={settings.locked}
        />

      </div>

      {/* AUDIENCE */}
      <div className="em-card">
        <label>Primary Audience</label>
        <select
          value={settings.audience}
          onChange={(e) =>
            setSettings({ ...settings, audience: e.target.value })
          }
          disabled={settings.locked}
        >
          <option value="export_buyers">Export Buyers</option>
          <option value="importers">Importers</option>
          <option value="distributors">Distributors</option>
          <option value="retail">Retail Customers</option>
          <option value="general">General Subscribers</option>
        </select>
      </div>

      {/* PROMPTS */}
      <div className="em-card">
        <label>System Prompt (Admin Only)</label>
        <textarea
          value={settings.systemPrompt}
          disabled={settings.locked}
          onChange={(e) =>
            setSettings({ ...settings, systemPrompt: e.target.value })
          }
        />
      </div>

      <div className="em-card">
        <label>User Prompt Template</label>
        <textarea
          value={settings.userPromptTemplate}
          disabled={settings.locked}
          onChange={(e) =>
            setSettings({ ...settings, userPromptTemplate: e.target.value })
          }
        />
        <p className="em-muted">
          Variables: {"{company_name}, {product}, {country}, {cta}"}
        </p>
      </div>

      {/* FOOTER */}
      <div className="ai-tone-footer">
        <button
          className="em-btn-primary"
          disabled={saving || settings.locked}
          onClick={save}
        >
          {saving ? "Saving…" : "Save AI Settings"}
        </button>
      </div>

    </div>
  );
}

/* ---------------- INTERNAL COMPONENT ---------------- */

function ToneSlider({ label, value, onChange, disabled }) {
  return (
    <div className="em-card tone-slider">
      <span>{label}</span>
      <input
        type="range"
        min="1"
        max="5"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <strong>{value}/5</strong>
    </div>
  );
}
