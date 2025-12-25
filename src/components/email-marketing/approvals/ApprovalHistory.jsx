// src/components/email-marketing/approvals/ApprovalHistory.jsx

import { useEffect, useState } from "react";
import { supabase } from "../../../supabaseClient";
import "../styles/emailMarketing.css";
import "./approvalHistory.css";

export default function ApprovalHistory() {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState(null);

  const [entityFilter, setEntityFilter] = useState("all");
  const [actionFilter, setActionFilter] = useState("all");

  /* -------------------------------------------------------
     LOAD AUDIT LOGS
  -------------------------------------------------------- */
  useEffect(() => {
    let mounted = true;

    const loadLogs = async () => {
      setLoading(true);
      setError(null);

      try {
        let query = supabase
          .from("email_audit_logs")
          .select(`
            id,
            entity_type,
            entity_id,
            action,
            severity,
            performed_by,
            metadata,
            created_at
          `)
          .order("created_at", { ascending: false });

        if (entityFilter !== "all") {
          query = query.eq("entity_type", entityFilter);
        }

        if (actionFilter !== "all") {
          query = query.eq("action", actionFilter);
        }

        const { data, error } = await query;
        if (error) throw error;

        if (mounted) setLogs(data || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load approval history");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadLogs();
    return () => (mounted = false);
  }, [entityFilter, actionFilter]);

  if (loading) {
    return <div className="em-card">Loading audit logs…</div>;
  }

  if (error) {
    return <div className="em-card em-badge-danger">{error}</div>;
  }

  return (
    <div className="em-fade-up approval-history-root">

      {/* ================= HEADER ================= */}
      <div className="approval-history-header">
        <h2>Approval & Audit History</h2>
        <span className="em-muted">
          Immutable system audit trail
        </span>
      </div>

      {/* ================= FILTER BAR ================= */}
      <div className="em-card audit-filters">
        <select
          value={entityFilter}
          onChange={(e) => setEntityFilter(e.target.value)}
        >
          <option value="all">All Entities</option>
          <option value="ai_draft">AI Draft</option>
          <option value="campaign">Campaign</option>
          <option value="schedule">Schedule</option>
          <option value="system">System</option>
        </select>

        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
        >
          <option value="all">All Actions</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="scheduled">Scheduled</option>
          <option value="sent">Sent</option>
          <option value="paused">Paused</option>
        </select>
      </div>

      {/* ================= AUDIT LIST ================= */}
      <div className="audit-log-list">
        {logs.length === 0 && (
          <div className="em-card muted">
            No audit entries found
          </div>
        )}

        {logs.map((log) => (
          <AuditCard key={log.id} log={log} />
        ))}
      </div>

    </div>
  );
}

/* -------------------------------------------------------
   INTERNAL COMPONENTS
-------------------------------------------------------- */

function AuditCard({ log }) {
  return (
    <div className={`em-card audit-card severity-${log.severity}`}>
      <div className="audit-card-header">
        <strong>
          {log.entity_type.toUpperCase()} — {log.action}
        </strong>

        <span className="em-muted">
          {new Date(log.created_at).toLocaleString()}
        </span>
      </div>

      <div className="audit-card-body">
        <p>
          <strong>Performed by:</strong>{" "}
          {log.performed_by || "System"}
        </p>

        {log.metadata && (
          <pre className="audit-metadata">
            {JSON.stringify(log.metadata, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}
