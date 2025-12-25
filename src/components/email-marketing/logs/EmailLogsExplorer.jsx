// src/components/email-marketing/logs/EmailLogsExplorer.jsx

import { useEffect, useState } from "react";
import { supabase } from "../../../supabaseClient";
import "../styles/emailMarketing.css";
import "./emailLogsExplorer.css";

const PAGE_SIZE = 50;

export default function EmailLogsExplorer() {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState("all");
  const [emailFilter, setEmailFilter] = useState("");
  const [expandedLog, setExpandedLog] = useState(null);

  /* -------------------------------------------------------
     LOAD EMAIL LOGS
  -------------------------------------------------------- */
  useEffect(() => {
    let mounted = true;

    const loadLogs = async () => {
      setLoading(true);
      setError(null);

      try {
        let query = supabase
          .from("email_logs")
          .select(`
            id,
            status,
            provider,
            provider_response,
            sent_at,
            opened_at,
            clicked_at,
            failed_at,
            failure_reason,
            subscribers ( email ),
            email_campaigns ( name )
          `)
          .order("sent_at", { ascending: false })
          .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

        if (statusFilter !== "all") {
          query = query.eq("status", statusFilter);
        }

        if (emailFilter.trim()) {
          query = query.ilike("subscribers.email", `%${emailFilter}%`);
        }

        const { data, error } = await query;
        if (error) throw error;

        if (!mounted) return;
        setLogs(data || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load email logs");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadLogs();
    return () => (mounted = false);
  }, [page, statusFilter, emailFilter]);

  if (error) {
    return <div className="em-card em-badge-danger">{error}</div>;
  }

  return (
    <div className="em-fade-up email-logs-root">

      {/* ================= HEADER ================= */}
      <div className="email-logs-header">
        <h2>Email Logs Explorer</h2>
        <span className="em-muted">
          Delivery, engagement & failure diagnostics
        </span>
      </div>

      {/* ================= FILTER BAR ================= */}
      <div className="em-card email-logs-filters">
        <input
          placeholder="Filter by subscriber email"
          value={emailFilter}
          onChange={(e) => {
            setPage(0);
            setEmailFilter(e.target.value);
          }}
        />

        <select
          value={statusFilter}
          onChange={(e) => {
            setPage(0);
            setStatusFilter(e.target.value);
          }}
        >
          <option value="all">All Statuses</option>
          <option value="queued">Queued</option>
          <option value="sent">Sent</option>
          <option value="delivered">Delivered</option>
          <option value="opened">Opened</option>
          <option value="clicked">Clicked</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {/* ================= TABLE ================= */}
      <div className="em-card email-logs-table-wrap">
        <table className="em-table email-logs-table">
          <thead>
            <tr>
              <th>Subscriber</th>
              <th>Campaign</th>
              <th>Status</th>
              <th>Provider</th>
              <th>Sent At</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan="5">Loading logs…</td>
              </tr>
            )}

            {!loading &&
              logs.map((log) => (
                <tr
                  key={log.id}
                  className={`log-row status-${log.status}`}
                  onClick={() =>
                    setExpandedLog(
                      expandedLog === log.id ? null : log.id
                    )
                  }
                >
                  <td>{log.subscribers?.email}</td>
                  <td>{log.email_campaigns?.name}</td>
                  <td>
                    <span
                      className={`em-badge em-badge-${
                        log.status === "failed"
                          ? "danger"
                          : log.status === "clicked"
                          ? "success"
                          : "warning"
                      }`}
                    >
                      {log.status}
                    </span>
                  </td>
                  <td>{log.provider}</td>
                  <td>
                    {log.sent_at
                      ? new Date(log.sent_at).toLocaleString()
                      : "—"}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* ================= EXPANDED DETAILS ================= */}
      {expandedLog && (
        <div className="em-card log-details">
          {logs
            .filter((l) => l.id === expandedLog)
            .map((l) => (
              <div key={l.id}>
                <h3>Log Details</h3>

                <p>
                  <strong>Status:</strong> {l.status}
                </p>

                {l.failure_reason && (
                  <p className="em-badge-danger">
                    Failure: {l.failure_reason}
                  </p>
                )}

                {l.provider_response && (
                  <>
                    <strong>Provider Response</strong>
                    <pre className="provider-response">
                      {JSON.stringify(l.provider_response, null, 2)}
                    </pre>
                  </>
                )}
              </div>
            ))}
        </div>
      )}

      {/* ================= PAGINATION ================= */}
      <div className="email-logs-pagination">
        <button
          disabled={page === 0}
          onClick={() => setPage((p) => Math.max(0, p - 1))}
        >
          ← Prev
        </button>

        <span>Page {page + 1}</span>

        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={logs.length < PAGE_SIZE}
        >
          Next →
        </button>
      </div>

    </div>
  );
}
