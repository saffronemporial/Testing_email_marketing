// src/components/email-marketing/ai/AIDraftDashboard.jsx

import { useEffect, useState } from "react";
import { supabase } from "../../../supabaseClient";
import "../styles/emailMarketing.css";
import "./aiDraftDashboard.css";
import AIDraftGenerator from "./AIDraftGenerator";
import AIGenerationHistory from "./AIGenerationHistory";

export default function AIDraftDashboard() {
  const [loading, setLoading] = useState(true);
  const [drafts, setDrafts] = useState([]);
  const [selectedDraft, setSelectedDraft] = useState(null);
  const [filterStatus, setFilterStatus] = useState("generated");
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  /* -------------------------------------------------------
     LOAD AI DRAFTS
  -------------------------------------------------------- */
  useEffect(() => {
    let mounted = true;

    const loadDrafts = async () => {
      setLoading(true);
      setError(null);

      try {
        let query = supabase
          .from("ai_email_drafts")
          .select(`
            id,
            subject,
            html_content,
            status,
            purpose,
            ai_model,
            created_at
          `)
          .order("created_at", { ascending: false });

        if (filterStatus !== "all") {
          query = query.eq("status", filterStatus);
        }

        const { data, error } = await query;
        if (error) throw error;

        if (mounted) setDrafts(data || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load AI drafts");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadDrafts();
    return () => (mounted = false);
  }, [filterStatus]);

  /* -------------------------------------------------------
     ACTIONS
  -------------------------------------------------------- */
  const approveDraft = async (draftId) => {
    setActionLoading(true);
    try {
      await supabase.functions.invoke("approve-ai-draft", {
        body: { draft_id: draftId }
      });
      setSelectedDraft(null);
      setFilterStatus("generated");
    } catch (err) {
      alert("Approval failed");
    } finally {
      setActionLoading(false);
    }
  };

  const rejectDraft = async (draftId) => {
    setActionLoading(true);
    try {
      await supabase
        .from("ai_email_drafts")
        .update({ status: "rejected" })
        .eq("id", draftId);

      setSelectedDraft(null);
    } catch (err) {
      alert("Rejection failed");
    } finally {
      setActionLoading(false);
    }
  };

  /* -------------------------------------------------------
     RENDER
  -------------------------------------------------------- */
  return (
    <div className="em-fade-up ai-dashboard-root">

      {/* ================= HEADER ================= */}
      <div className="ai-header">
        <h2>AI Draft Control Center</h2>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="generated">Pending Review</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="all">All</option>
        </select>
      </div>

      {/* ================= STATE CARDS ================= */}
      <div className="ai-state-grid">
        <StateCard label="Pending" count={drafts.filter(d => d.status === "generated").length} />
        <StateCard label="Approved" count={drafts.filter(d => d.status === "approved").length} />
        <StateCard label="Rejected" count={drafts.filter(d => d.status === "rejected").length} />
      </div>

      {/* ================= MAIN GRID ================= */}
      <div className="ai-main-grid">

        {/* LIST */}
        <div className="ai-draft-list">
          {loading && <div className="em-card">Loading drafts…</div>}

          {!loading && drafts.map(d => (
            <div
              key={d.id}
              className={`ai-draft-item ${selectedDraft?.id === d.id ? "active" : ""}`}
              onClick={() => setSelectedDraft(d)}
            >
              <strong>{d.subject}</strong>
              <span className={`em-badge em-badge-${d.status === "approved" ? "success" : d.status === "rejected" ? "danger" : "warning"}`}>
                {d.status}
              </span>
              <small>{d.purpose} • {new Date(d.created_at).toLocaleDateString()}</small>
            </div>
          ))}
        </div>

            <div className="space-y-6">
            <h1 className="text-2xl font-semibold text-[#d4af37]">
             AI Email Drafts
            </h1>

             <div className="email-card p-5 text-sm text-gray-300">
              Generate AI-powered email drafts. Drafts require admin approval
              before they can be sent or converted into campaigns.
              </div>

              <AIDraftGenerator />
               <AIGenerationHistory />
               </div>

        {/* PREVIEW */}
        <div className="ai-draft-preview">
          {!selectedDraft && (
            <div className="em-card muted">
              Select a draft to preview
            </div>
          )}

          {selectedDraft && (
            <div className="em-card preview-card">
              <h3>{selectedDraft.subject}</h3>

              <div
                className="email-preview"
                dangerouslySetInnerHTML={{ __html: selectedDraft.html_content }}
              />

              <div className="ai-preview-actions">
                {selectedDraft.status === "generated" && (
                  <>
                    <button
                      className="em-btn-primary"
                      disabled={actionLoading}
                      onClick={() => approveDraft(selectedDraft.id)}
                    >
                      Approve & Convert
                    </button>
                    <button
                      className="em-btn-ghost danger"
                      disabled={actionLoading}
                      onClick={() => rejectDraft(selectedDraft.id)}
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

      </div>

      {error && <div className="em-card em-badge-danger">{error}</div>}
    </div>
  );
}

/* -------------------------------------------------------
   INTERNAL COMPONENTS
-------------------------------------------------------- */

function StateCard({ label, count }) {
  return (
    <div className="em-card ai-state-card">
      <span>{label}</span>
      <strong>{count}</strong>
    </div>
  );
}
