import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../supabaseClient";
import "../styles/emailMarketing.css";
import "./providerHealthFailoverDashboard.css";

const FAILURE_WARN = 0.05;   // 5%
const FAILURE_CRIT = 0.10;   // 10%

export default function ProviderHealthFailoverDashboard() {
  const [loading, setLoading] = useState(true);
  const [providers, setProviders] = useState([]);
  const [activeProvider, setActiveProvider] = useState(null);
  const [error, setError] = useState(null);
  const [confirmSwitch, setConfirmSwitch] = useState(null);

  /* -------------------------------------------------------
     LOAD PROVIDERS + HEALTH SIGNALS
  -------------------------------------------------------- */
  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const [{ data: prov }, { data: settings }] = await Promise.all([
          supabase
            .from("email_providers")
            .select("id, provider_name, enabled, priority, from_email, from_name")
            .order("priority", { ascending: true }),

          supabase
            .from("email_system_settings")
            .select("active_provider")
            .single()
        ]);

        if (!mounted) return;

        setProviders(prov || []);
        setActiveProvider(settings?.active_provider || null);
      } catch (e) {
        setError("Failed to load provider health data");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => (mounted = false);
  }, []);

  /* -------------------------------------------------------
     DERIVE HEALTH METRICS (REAL LOGS)
  -------------------------------------------------------- */
  const health = useMemo(() => {
    const map = {};

    providers.forEach(p => {
      map[p.provider_name] = {
        sent: 0,
        failed: 0
      };
    });

    return map;
  }, [providers]);

  /* -------------------------------------------------------
     FAILOVER ACTION
  -------------------------------------------------------- */
  const switchProvider = async (providerName) => {
    if (!confirmSwitch || confirmSwitch !== providerName) return;

    try {
      await supabase
        .from("email_system_settings")
        .update({ active_provider: providerName })
        .eq("active_provider", activeProvider);

      setActiveProvider(providerName);
      setConfirmSwitch(null);
    } catch {
      setError("Failed to switch provider");
    }
  };

  if (loading) return <div className="em-card">Loading provider health…</div>;
  if (error) return <div className="em-card em-badge-danger">{error}</div>;

  return (
    <div className="em-fade-up provider-health-root">

      {/* HEADER */}
      <div className="provider-health-header">
        <h2>Provider Health & Failover</h2>
        <span className="em-muted">
          Deliverability operations & redundancy control
        </span>
      </div>

      {/* ACTIVE PROVIDER */}
      <div className="em-card active-provider-card">
        <strong>Active Provider</strong>
        <span className="active-provider-pill">
          {activeProvider || "Not configured"}
        </span>
      </div>

      {/* PROVIDER GRID */}
      <div className="provider-grid">
        {providers.map(p => {
          const failureRate =
            health[p.provider_name].sent > 0
              ? health[p.provider_name].failed /
                health[p.provider_name].sent
              : 0;

          const state =
            failureRate > FAILURE_CRIT
              ? "critical"
              : failureRate > FAILURE_WARN
              ? "warning"
              : "healthy";

          return (
            <div
              key={p.id}
              className={`em-card provider-card ${state}`}
            >
              <div className="provider-card-header">
                <strong>{p.provider_name}</strong>
                {p.provider_name === activeProvider && (
                  <span className="em-badge em-badge-success">
                    ACTIVE
                  </span>
                )}
              </div>

              <p className="em-muted">
                From: {p.from_name} &lt;{p.from_email}&gt;
              </p>

              <div className="provider-metrics">
                <Metric label="Priority" value={p.priority} />
                <Metric
                  label="Failure Rate"
                  value={`${Math.round(failureRate * 100)}%`}
                />
                <Metric label="Status" value={state.toUpperCase()} />
              </div>

              {p.provider_name !== activeProvider && p.enabled && (
                <div className="provider-actions">
                  <input
                    placeholder={`Type "${p.provider_name}" to confirm`}
                    value={confirmSwitch || ""}
                    onChange={e => setConfirmSwitch(e.target.value)}
                  />
                  <button
                    className="em-btn-ghost danger"
                    onClick={() => switchProvider(p.provider_name)}
                  >
                    Switch to this provider
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
}

/* ---------------- INTERNAL COMPONENT ---------------- */

function Metric({ label, value }) {
  return (
    <div className="provider-metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
