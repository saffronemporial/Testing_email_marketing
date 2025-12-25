// src/components/email-marketing/compliance/ComplianceSuppressionManager.jsx

import { useEffect, useState } from "react";
import { supabase } from "../../../supabaseClient";
import "../styles/emailMarketing.css";
import "./complianceSuppressionManager.css";

export default function ComplianceSuppressionManager() {
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState([]);
  const [error, setError] = useState(null);

  const [typeFilter, setTypeFilter] = useState("all");
  const [emailSearch, setEmailSearch] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");

  /* -------------------------------------------------------
     LOAD SUPPRESSION LIST
  -------------------------------------------------------- */
  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        let query = supabase
          .from("email_suppressions")
          .select(`
            id,
            email,
            suppression_type,
            reason,
            created_at,
            released_at
          `)
          .order("created_at", { ascending: false });

        if (typeFilter !== "all") {
          query = query.eq("suppression_type", typeFilter);
        }

        if (emailSearch.trim()) {
          query = query.ilike("email", `%${emailSearch}%`);
        }

        const { data, error } = await query;
        if (error) throw error;

        if (mounted) setList(data || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load suppression list");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => (mounted = false);
  }, [typeFilter, emailSearch]);

  /* -------------------------------------------------------
     ACTIONS
  -------------------------------------------------------- */
  const releaseSuppression = async (id, email) => {
    if (confirmEmail !== email) {
      alert("Type the exact email to confirm release");
      return;
    }

    await supabase
      .from("email_suppressions")
      .update({ released_at: new Date().toISOString() })
      .eq("id", id);

    setList((prev) => prev.filter((s) => s.id !== id));
    setConfirmEmail("");
  };

  if (loading) return <div className="em-card">Loading compliance data…</div>;
  if (error) return <div className="em-card em-badge-danger">{error}</div>;

  return (
    <div className="em-fade-up compliance-root">

      {/* ================= HEADER ================= */}
      <div className="compliance-header">
        <h2>Compliance & Suppression Manager</h2>
        <span className="em-muted">
          Legally enforced email exclusions
        </span>
      </div>

      {/* ================= NOTICE ================= */}
      <div className="em-card em-badge-warning">
        Suppressed emails will NEVER receive campaigns until explicitly released
        by an admin. All actions are audit logged.
      </div>

      {/* ================= FILTERS ================= */}
      <div className="em-card compliance-filters">
        <input
          placeholder="Search email"
          value={emailSearch}
          onChange={(e) => setEmailSearch(e.target.value)}
        />

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="all">All Types</option>
          <option value="unsubscribe">Unsubscribed</option>
          <option value="hard_bounce">Hard Bounce</option>
          <option value="complaint">Complaint</option>
          <option value="manual">Manual</option>
        </select>
      </div>

      {/* ================= LIST ================= */}
      <div className="compliance-list">
        {list.length === 0 && (
          <div className="em-card muted">
            No suppressed emails found
          </div>
        )}

        {list.map((s) => (
          <div key={s.id} className="em-card compliance-card">
            <div className="compliance-card-header">
              <strong>{s.email}</strong>
              <span className="em-badge em-badge-danger">
                {s.suppression_type}
              </span>
            </div>

            <p className="em-muted">{s.reason || "No reason provided"}</p>

            <p className="em-muted">
              Suppressed on:{" "}
              {new Date(s.created_at).toLocaleDateString()}
            </p>

            <div className="release-box">
              <input
                placeholder="Type email to confirm release"
                value={confirmEmail}
                onChange={(e) => setConfirmEmail(e.target.value)}
              />

              <button
                className="em-btn-ghost danger"
                onClick={() => releaseSuppression(s.id, s.email)}
              >
                Release
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
