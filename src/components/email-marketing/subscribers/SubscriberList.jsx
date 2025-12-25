// src/components/email-marketing/subscribers/SubscriberList.jsx

import { useEffect, useState } from "react";
import { supabase } from "../../../supabaseClient";
import "../styles/emailMarketing.css";
import "./subscriberList.css";

const PAGE_SIZE = 50;

export default function SubscriberList() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [subscribers, setSubscribers] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");

  /* -------------------------------------------------------
     FETCH DATA
  -------------------------------------------------------- */
  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        let query = supabase
          .from("subscribers")
          .select("id, email, status, created_at")
          .order("created_at", { ascending: false })
          .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

        if (status !== "all") {
          query = query.eq("status", status);
        }

        if (search.trim()) {
          query = query.ilike("email", `%${search}%`);
        }

        const { data, error } = await query;
        if (error) throw error;

        if (!mounted) return;

        setSubscribers(data || []);
        setHasMore((data || []).length === PAGE_SIZE);
      } catch (err) {
        console.error("SubscriberList error:", err);
        setError("Failed to load subscriber list");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => (mounted = false);
  }, [page, status, search]);

  /* -------------------------------------------------------
     RENDER
  -------------------------------------------------------- */
  if (error) {
    return <div className="em-card em-badge-danger">{error}</div>;
  }

  return (
    <div className="em-card subscriber-list-wrap">

      {/* FILTER BAR */}
      <div className="subscriber-list-filters">
        <input
          placeholder="Search email…"
          value={search}
          onChange={(e) => {
            setPage(0);
            setSearch(e.target.value);
          }}
        />

        <select
          value={status}
          onChange={(e) => {
            setPage(0);
            setStatus(e.target.value);
          }}
        >
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="unsubscribed">Unsubscribed</option>
          <option value="bounced">Bounced</option>
        </select>
      </div>

      {/* TABLE */}
      <table className="em-table subscriber-list-table">
        <thead>
          <tr>
            <th>Email</th>
            <th>Status</th>
            <th>Subscribed On</th>
          </tr>
        </thead>
        <tbody>
          {loading &&
            [...Array(6)].map((_, i) => (
              <tr key={i} className="skeleton-row">
                <td colSpan={3} />
              </tr>
            ))}

          {!loading &&
            subscribers.map((s) => (
              <tr key={s.id}>
                <td>{s.email}</td>
                <td>
                  <span
                    className={`em-badge em-badge-${
                      s.status === "active"
                        ? "success"
                        : s.status === "bounced"
                        ? "danger"
                        : "warning"
                    }`}
                  >
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

      {/* PAGINATION */}
      <div className="subscriber-pagination">
        <button
          disabled={page === 0}
          onClick={() => setPage((p) => Math.max(0, p - 1))}
        >
          ← Prev
        </button>

        <span>Page {page + 1}</span>

        <button
          disabled={!hasMore}
          onClick={() => setPage((p) => p + 1)}
        >
          Next →
        </button>
      </div>
    </div>
  );
}
