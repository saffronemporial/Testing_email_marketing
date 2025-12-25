// src/components/email-marketing/settings/EmailSystemSettings.jsx

import { useEffect, useState } from "react";
import { supabase } from "../../../supabaseClient";
import EmailProviderManager from "./EmailProviderManager";
import ComplianceAndLimits from "./ComplianceAndLimits";
import "../styles/emailMarketing.css";
import "./emailSystemSettings.css";

export default function EmailSystemSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [settings, setSettings] = useState(null);

  /* -------------------------------------------------------
     LOAD SYSTEM SETTINGS
  -------------------------------------------------------- */
  useEffect(() => {
    let mounted = true;

    const loadSettings = async () => {
      try {
        const { data, error } = await supabase
          .from("email_system_settings")
          .select(`
             id,
            global_email_enabled,
            daily_limit,
            hourly_limit,
            max_recipients_per_campaign,
            active_provider,
            created_at,
            updated_by
          `)
          .single();

        if (error) throw error;
        if (!mounted) return;

        setSettings(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load email system settings");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadSettings();
    return () => (mounted = false);
  }, []);

  /* -------------------------------------------------------
     UPDATE SETTINGS
  -------------------------------------------------------- */
  const updateSettings = async (patch) => {
    setSaving(true);
    setError(null);

    try {
      await supabase
        .from("email_system_settings")
        .update(patch)
        .eq("id", settings.id);

      setSettings({ ...settings, ...patch });
    } catch (err) {
      console.error(err);
      setError("Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="em-card">Loading system settings…</div>;
  if (error) return <div className="em-card em-badge-danger">{error}</div>;

  return (
    <div className="em-fade-up email-settings-root">

      {/* ================= HEADER ================= */}
      <div className="settings-header">
        <h2>Email System Settings</h2>
        <span className="em-muted">
          Global governance & risk controls
        </span>
      </div>

      {/* ================= GLOBAL SWITCH ================= */}
      <div className="em-card settings-section">
        <div className="settings-row">
          <div>
            <strong>Global Email Sending</strong>
            <p className="em-muted">
              Immediately pauses or resumes all outgoing emails
            </p>
          </div>

          <button
            className={`toggle-btn ${
              settings.global_email_enabled ? "on" : "off"
            }`}
            disabled={saving}
            onClick={() =>
              updateSettings({
                global_email_enabled:
                  !settings.global_email_enabled
              })
            }
          >
            {settings.global_email_enabled ? "ENABLED" : "PAUSED"}
          </button>
        </div>
      </div>

      {/* ================= LIMITS ================= */}
      <div className="settings-grid">
        <SettingField
          label="Hourly Send Limit"
          value={settings.hourly_limit}
          onSave={(v) =>
            updateSettings({ hourly_limit: Number(v) })
          }
        />

        <SettingField
          label="Daily Send Limit"
          value={settings.daily_limit}
          onSave={(v) =>
            updateSettings({ daily_limit: Number(v) })
          }
        />

        <SettingField
          label="Max Recipients / Campaign"
          value={settings.max_recipients_per_campaign}
          onSave={(v) =>
            updateSettings({
              max_recipients_per_campaign: Number(v)
            })
          }
        />
      </div>
            {/* PROVIDERS */}
      <EmailProviderManager />

      {/* COMPLIANCE */}
      <ComplianceAndLimits />

      {/* ================= PROVIDER ================= */}
      <div className="em-card settings-section">
        <strong>Active Email Provider</strong>
        <p className="provider-pill">
          {settings.active_provider || "Not configured"}
        </p>
      </div>

      {/* ================= AUDIT ================= */}
      <div className="em-card settings-section">
        <strong>Audit Information</strong>
        <p className="em-muted">
          Last updated:{" "}
          {new Date(settings.updated_at).toLocaleString()}
        </p>
        <p className="em-muted">
          Updated by: {settings.updated_by || "System"}
        </p>
      </div>

      {/* ================= DANGER ZONE ================= */}
      <div className="em-card danger-zone">
        <strong>Danger Zone</strong>
        <p className="em-muted">
          These actions affect all campaigns immediately
        </p>

        <button
          className="em-btn-ghost danger"
          disabled={saving}
          onClick={() =>
            updateSettings({ global_email_enabled: false })
          }
        >
          Emergency Pause All Emails
        </button>
      </div>

    </div>
  );
}

/* -------------------------------------------------------
   INTERNAL COMPONENTS
-------------------------------------------------------- */

function SettingField({ label, value, onSave }) {
  const [editValue, setEditValue] = useState(value);

  return (
    <div className="em-card setting-field">
      <span>{label}</span>
      <input
        type="number"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
      />
      <button
        className="em-btn-ghost"
        onClick={() => onSave(editValue)}
      >
        Save
      </button>
    </div>
  );
}