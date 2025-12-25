import { useEffect, useState } from "react";
import { supabase } from "../../../supabaseClient";
import "../styles/emailMarketing.css";
import "./systemErrorIncidentCenter.css";

export default function SystemErrorIncidentCenter() {
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState([]);
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  /* -------------------------------------------------------
     LOAD ERROR LOGS
  -------------------------------------------------------- */
  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        let query = supabase
          .from("system_error_logs")
          .select(`
            id,
            severity,
            source,
            message,
            payload,
            status,
            created_at,
            acknowledged_at,
            resolved_at
          `)
          .order("created_at", { ascending: false });

        if (filter !== "all") {
          query = query.eq("severity", filter);
        }

        const { data, error } = await query;
        if (error) throw error;

        if (mounted) setErrors(data || []);
      } catch {
        setErrorMsg("Failed to load system incidents");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => (mounted = false);
  }, [filter]);

  /* -------------------------------------------------------
     INCIDENT ACTIONS
  -------------------------------------------------------- */
  const acknowledge = async (id) => {
    await supabase
      .from("system_error_logs")
      .update({ status: "acknowledged", acknowledged_at: new Date().toISOString() })
      .eq("id", id);

    setErrors((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status: "acknowledged" } : e))
    );
  };

  const resolve = async (id) => {
    await supabase
      .from("system_error_logs")
      .update({ status: "resolved", resolved_at: new Date().toISOString() })
      .eq("id", id);

    setErrors((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status: "resolved" } : e))
    );
  };

  if (loading) return <div className="em-card">Loading incidents…</div>;
  if (errorMsg) return <div className="em-card em-badge-danger">{errorMsg}</div>;

  return (
    <div className="em-fade-up incident-root">

      {/* HEADER */}
      <div className="incident-header">
        <h2>System Error & Incident Center</h2>
        <span className="em-muted">
          Operational incidents & root-cause visibility
        </span>
      </div>

      {/* FILTER BAR */}
      <div className="em-card incident-filters">
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All Severities</option>
          <option value="info">Info</option>
          <option value="warning">Warning</option>
          <option value="critical">Critical</option>
        </select>
      </div>

      {/* INCIDENT LIST */}
      <div className="incident-list">
        {errors.length === 0 && (
          <div className="em-card muted">No incidents found</div>
        )}

        {errors.map((err) => (
          <div
            key={err.id}
            className={`em-card incident-card ${err.severity}`}
            onClick={() =>
              setExpanded(expanded === err.id ? null : err.id)
            }
          >
            <div className="incident-card-header">
              <strong>{err.source}</strong>
              <span className={`em-badge ${err.severity}`}>
                {err.severity.toUpperCase()}
              </span>
            </div>

            <p>{err.message}</p>

            <small className="em-muted">
              {new Date(err.created_at).toLocaleString()}
            </small>

            {/* EXPANDED */}
            {expanded === err.id && (
              <div className="incident-details">
                <p>
                  <strong>Status:</strong> {err.status}
                </p>

                {err.payload && (
                  <>
                    <strong>Payload</strong>
                    <pre>
                      {JSON.stringify(err.payload, null, 2)}
                    </pre>
                  </>
                )}

                <div className="incident-actions">
                  {err.status === "new" && (
                    <button
                      className="em-btn-ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        acknowledge(err.id);
                      }}
                    >
                      Acknowledge
                    </button>
                  )}

                  {err.status !== "resolved" && (
                    <button
                      className="em-btn-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        resolve(err.id);
                      }}
                    >
                      Mark Resolved
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

    </div>
  );
}
