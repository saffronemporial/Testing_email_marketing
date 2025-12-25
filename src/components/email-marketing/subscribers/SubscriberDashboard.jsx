// src/components/email-marketing/subscribers/SubscriberDashboard.jsx

import { useEffect, useState } from "react";
import { supabase } from "../../../supabaseClient";
import "../styles/emailMarketing.css";
import "./subscriberDashboard.css";

export default function SubscriberDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [subscribers, setSubscribers] = useState([]);
  const [selected, setSelected] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");

  const [metrics, setMetrics] = useState({
    total: 0,
    active: 0,
    unsubscribed: 0,
    new7Days: 0
  });

  /* -------------------------------------------------------
     LOAD SUBSCRIBERS & METRICS
  -------------------------------------------------------- */
  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        /* -------- METRICS -------- */
        const [
          total,
          active,
          unsubscribed,
          new7
        ] = await Promise.all([
          supabase.from("subscribers").select("id", { count: "exact", head: true }),
          supabase.from("subscribers")
            .select("id", { count: "exact", head: true })
            .eq("status", "active"),
          supabase.from("subscribers")
            .select("id", { count: "exact", head: true })
            .eq("status", "unsubscribed"),
          supabase.from("subscribers")
            .select("id", { count: "exact", head: true })
            .gte(
              "created_at",
              new Date(Date.now() - 7 * 86400000).toISOString()
            )
        ]);

        /* -------- LIST -------- */
        let query = supabase
          .from("subscribers")
          .select("id, email, status, created_at")
          .order("created_at", { ascending: false })
          .limit(200);

        if (filterStatus !== "all") {
          query = query.eq("status", filterStatus);
        }

        const { data, error: listError } = await query;
        if (listError) throw listError;

        if (!mounted) return;

        setMetrics({
          total: total.count || 0,
          active: active.count || 0,
          unsubscribed: unsubscribed.count || 0,
          new7Days: new7.count || 0
        });

        setSubscribers(data || []);
      } catch (err) {
        console.error("SubscriberDashboard error:", err);
        setError("Failed to load subscribers");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadData();
    return () => (mounted = false);
  }, [filterStatus]);

  /* -------------------------------------------------------
     BULK ACTIONS
  -------------------------------------------------------- */
  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  const bulkUnsubscribe = async () => {
    if (!selected.length) return;

    await supabase
      .from("subscribers")
      .update({ status: "unsubscribed" })
      .in("id", selected);

    setSelected([]);
    setFilterStatus("all");
  };

  /* -------------------------------------------------------
     RENDER
  -------------------------------------------------------- */
  if (loading) {
    return (
      <div className="em-card">
        Loading subscribers…
      </div>
    );
  }

  if (error) {
    return (
      <div className="em-card em-badge-danger">
        {error}
      </div>
    );
  }

  return (
    <div className="em-fade-up">

      {/* ================= METRICS ================= */}
      <div className="em-grid-4">
        <Metric title="Total Subscribers" value={metrics.total} />
        <Metric title="Active" value={metrics.active} />
        <Metric title="Unsubscribed" value={metrics.unsubscribed} />
        <Metric title="New (7 Days)" value={metrics.new7Days} />
      </div>

      {/* ================= ACTION BAR ================= */}
      <div className="subscriber-actions">
        <div className="subscriber-filters">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="unsubscribed">Unsubscribed</option>
          </select>
        </div>

        {selected.length > 0 && (
          <button
            className="em-btn-primary"
            onClick={bulkUnsubscribe}
          >
            Unsubscribe Selected ({selected.length})
          </button>
        )}
      </div>

      {/* ================= TABLE ================= */}
      <div className="em-card mt-3">
        <table className="em-table subscriber-table">
          <thead>
            <tr>
              <th />
              <th>Email</th>
              <th>Status</th>
              <th>Subscribed On</th>
            </tr>
          </thead>
          <tbody>
            {subscribers.map((s) => (
              <tr key={s.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selected.includes(s.id)}
                    onChange={() => toggleSelect(s.id)}
                  />
                </td>
                <td>{s.email}</td>
                <td>
                  <span className={`em-badge em-badge-${s.status === "active" ? "success" : "warning"}`}>
                    {s.status}
                  </span>
                </td>
                <td>
                  {new Date(s.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}

/* -------------------------------------------------------
   SMALL COMPONENTS
-------------------------------------------------------- */

function Metric({ title, value }) {
  return (
    <div className="em-card">
      <span className="em-muted">{title}</span>
      <h2 className="em-gold">{value}</h2>
    </div>
  );
}
